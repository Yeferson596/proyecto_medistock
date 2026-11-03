import { randomUUID } from 'node:crypto';
import oracledb from 'oracledb';
import type { Document } from 'mongodb';
import { getCollection } from './db';

const entities = [
  'products',
  'users',
  'orders',
  'bank_accounts',
  'bank_transactions',
  'stock_alerts'
] as const;

type SyncEntity = (typeof entities)[number];
type SyncEvent = {
  eventId: string;
  entity: SyncEntity;
  entityId: string;
  createdAt: Date;
};

const keyFields: Record<SyncEntity, string> = {
  products: 'id',
  users: 'id',
  orders: 'id',
  bank_accounts: 'accountId',
  bank_transactions: 'id',
  stock_alerts: 'productId'
};

const oracleSettings = () => {
  const user = process.env.ORACLE_USER;
  const password = process.env.ORACLE_PASSWORD;
  const connectString = process.env.ORACLE_CONNECT_STRING;
  const configured = [user, password, connectString].some(Boolean);

  if (!configured) return null;
  if (!user || !password || !connectString) {
    throw new Error(
      'Configura ORACLE_USER, ORACLE_PASSWORD y ORACLE_CONNECT_STRING para activar la sincronización Oracle.'
    );
  }

  return { user, password, connectString };
};

let pool: oracledb.Pool | undefined;
let drainInProgress = false;

const applyChange = async (
  connection: oracledb.Connection,
  entity: SyncEntity,
  action: 'UPSERT' | 'DELETE',
  document?: Document
) => {
  await connection.execute(
    'BEGIN MEDISTOCK_SINCRONIZACION.APLICAR_CAMBIO(:entity, :action, :payload); END;',
    {
      entity,
      action,
      payload: {
        val: document ? JSON.stringify(document) : '{}',
        type: oracledb.CLOB,
        dir: oracledb.BIND_IN
      }
    }
  );
};

const refreshOracleMirror = async () => {
  if (!pool) throw new Error('El pool Oracle no está inicializado.');

  const connection = await pool.getConnection();
  try {
    await connection.execute('DELETE FROM MED_ALERTAS_STOCK');
    await connection.execute('DELETE FROM MED_DETALLE_PEDIDOS');
    await connection.execute('DELETE FROM MED_PEDIDOS');
    await connection.execute('DELETE FROM MED_TRANSACCIONES_BANCARIAS');
    await connection.execute('DELETE FROM MED_CUENTAS_BANCARIAS');
    await connection.execute('DELETE FROM MED_USUARIOS');
    await connection.execute('DELETE FROM MED_PRODUCTOS');

    for (const entity of entities) {
      const cursor = getCollection<Document>(entity).find({}, { projection: { _id: 0 } });
      for await (const document of cursor) {
        await applyChange(connection, entity, 'UPSERT', document);
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.close();
  }
};

const drainOutbox = async () => {
  if (!pool || drainInProgress) return;
  drainInProgress = true;

  try {
    const events = await getCollection<SyncEvent>('oracle_sync_outbox')
      .find({})
      .sort({ createdAt: 1 })
      .limit(100)
      .toArray();

    for (const event of events) {
      const collection = getCollection<Document>(event.entity);
      const document = await collection.findOne(
        { [keyFields[event.entity]]: event.entityId },
        { projection: { _id: 0 } }
      );
      const connection = await pool.getConnection();
      try {
        const payload = document ?? { [keyFields[event.entity]]: event.entityId };
        await applyChange(connection, event.entity, document ? 'UPSERT' : 'DELETE', payload);
        await connection.commit();
        await getCollection<SyncEvent>('oracle_sync_outbox').deleteOne({ eventId: event.eventId });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        await connection.close();
      }
    }
  } finally {
    drainInProgress = false;
  }
};

export const enqueueOracleSync = async (entity: SyncEntity, entityId: string) => {
  if (!oracleSettings()) return;

  await getCollection<SyncEvent>('oracle_sync_outbox').insertOne({
    eventId: randomUUID(),
    entity,
    entityId,
    createdAt: new Date()
  });
};

export const connectToOracleSync = async () => {
  const settings = oracleSettings();
  if (!settings) return;

  pool = await oracledb.createPool({
    ...settings,
    poolMin: 1,
    poolMax: 4,
    poolIncrement: 1
  });

  try {
    await refreshOracleMirror();
  } catch (error) {
    const failedPool = pool;
    pool = undefined;
    await failedPool.close(0);
    throw error;
  }

  setInterval(() => {
    void drainOutbox().catch((error: unknown) => {
      console.error('No se pudo sincronizar el outbox con Oracle; se reintentará:', error);
    });
  }, 2000);
};
