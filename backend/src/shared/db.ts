import { Collection, Db, Document, MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017';
const databaseName = process.env.MONGODB_DB_NAME ?? 'medistock';

let database: Db | undefined;

export interface DbResult<T> {
  rows: T[];
  rowCount: number;
}

export async function connectToDatabase() {
  if (database) return;

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const connectedDatabase = client.db(databaseName);

    const requiredCollections = [
      'products',
      'users',
      'orders',
      'bank_accounts',
      'bank_transactions',
      'stock_alerts',
      'oracle_sync_outbox'
    ];
    for (const collectionName of requiredCollections) {
      const collection = await connectedDatabase
        .listCollections({ name: collectionName }, { nameOnly: false })
        .next();
      if (!collection?.options?.validator) {
        throw new Error(
          `Falta el validador MongoDB de "${collectionName}". Configura MONGODB_SCHEMA_URI y ejecuta npm run db:setup.`
        );
      }
    }

    await Promise.all([
      connectedDatabase.collection('products').createIndex({ id: 1 }, { unique: true }),
      connectedDatabase.collection('products').createIndex({ sku: 1 }, { unique: true }),
      connectedDatabase.collection('users').createIndex({ id: 1 }, { unique: true }),
      connectedDatabase.collection('users').createIndex({ email: 1 }, { unique: true }),
      connectedDatabase.collection('orders').createIndex({ id: 1 }, { unique: true }),
      connectedDatabase.collection('orders').createIndex({ customerId: 1, createdAt: -1 }),
      connectedDatabase.collection('bank_accounts').createIndex({ accountId: 1 }, { unique: true }),
      connectedDatabase.collection('bank_transactions').createIndex({ id: 1 }, { unique: true }),
      connectedDatabase.collection('bank_transactions').createIndex({ accountId: 1, timestamp: -1 }),
      connectedDatabase.collection('oracle_sync_outbox').createIndex({ eventId: 1 }, { unique: true }),
      connectedDatabase.collection('oracle_sync_outbox').createIndex({ createdAt: 1 }),
      connectedDatabase.collection('stock_alerts').createIndex(
        { productId: 1, status: 1 },
        { unique: true, partialFilterExpression: { status: 'open' } }
      )
    ]);

    database = connectedDatabase;
  } catch (error) {
    await client.close();
    throw error;
  }
}

export function getCollection<T extends Document = Document>(name: string): Collection<T> {
  if (!database) {
    throw new Error('MongoDB no está conectado. Llama a connectToDatabase() antes de acceder a los datos.');
  }

  return database.collection<T>(name);
}

export function dbResult<T>(rows: T[]): DbResult<T> {
  return { rows, rowCount: rows.length };
}
