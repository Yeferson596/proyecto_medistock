import { dbResult, getCollection } from '../../shared/db';
import { enqueueOracleSync } from '../../shared/oracle-sync';
import type { Product } from '../../shared/types';

const products = () => getCollection<Product>('products');

export const getAllProducts = async () => {
  const rows = await products().find({}, { projection: { _id: 0 } }).sort({ name: 1 }).toArray();
  return dbResult(rows);
};

export const getProductById = async (id: string) => {
  const product = await products().findOne({ id }, { projection: { _id: 0 } });
  return dbResult(product ? [product] : []);
};

export const getProductsByIds = async (ids: string[]) => {
  const rows = await products()
    .find({ id: { $in: ids } }, { projection: { _id: 0, id: 1, price: 1, stock: 1 } })
    .toArray();
  return dbResult(rows);
};

export const createProduct = async (product: Product) => {
  await products().insertOne(product);
  await enqueueOracleSync('products', product.id);
  return dbResult([product]);
};

export const updateProduct = async (id: string, product: Partial<Product>) => {
  const fields = Object.fromEntries(
    Object.entries(product).filter(([, value]) => value !== undefined)
  );
  const updated = await products().findOneAndUpdate(
    { id },
    { $set: fields },
    { returnDocument: 'after', projection: { _id: 0 } }
  );
  if (updated) await enqueueOracleSync('products', id);
  return dbResult(updated ? [updated] : []);
};

export const deleteProduct = async (id: string) => {
  const deleted = await products().findOneAndDelete({ id }, { projection: { _id: 0 } });
  if (deleted) await enqueueOracleSync('products', id);
  return dbResult(deleted ? [deleted] : []);
};
