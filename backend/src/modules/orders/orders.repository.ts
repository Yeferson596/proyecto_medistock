import { dbResult, getCollection } from '../../shared/db';
import { enqueueOracleSync } from '../../shared/oracle-sync';
import type { Order } from '../../shared/types';

const orders = () => getCollection<Order>('orders');

export const getAllOrders = async () => {
  const rows = await orders().find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
  return dbResult(rows);
};

export const getOrderById = async (id: string) => {
  const order = await orders().findOne({ id }, { projection: { _id: 0 } });
  return dbResult(order ? [order] : []);
};

export const createOrder = async (order: Order) => {
  await orders().insertOne(order);
  await enqueueOracleSync('orders', order.id);
  return dbResult([order]);
};

export const updateOrder = async (id: string, order: Partial<Order>) => {
  const fields = Object.fromEntries(
    Object.entries(order).filter(([, value]) => value !== undefined)
  );
  const updated = await orders().findOneAndUpdate(
    { id },
    { $set: fields },
    { returnDocument: 'after', projection: { _id: 0 } }
  );
  if (updated) await enqueueOracleSync('orders', id);
  return dbResult(updated ? [updated] : []);
};

export const deleteOrder = async (id: string) => {
  const deleted = await orders().findOneAndDelete({ id }, { projection: { _id: 0 } });
  if (deleted) await enqueueOracleSync('orders', id);
  return dbResult(deleted ? [deleted] : []);
};
