import { createId } from '../../shared/utils';
import type { Product } from '../../shared/types';
import * as repo from './products.repository';

const mapProductRow = (row: any): Product => ({
  id: row.id,
  name: row.name,
  sku: row.sku,
  description: row.description,
  price: Number(row.price),
  category: row.category,
  stock: Number(row.stock),
  minStock: Number(row.min_stock),
  image: row.image
});

export const listProducts = async () => {
  const r = await repo.getAllProducts();
  return r.rows.map(mapProductRow);
};

export const getProduct = async (id: string) => {
  const r = await repo.getProductById(id);
  if (r.rowCount === 0) return null;
  return mapProductRow(r.rows[0]);
};

export const createNewProduct = async (payload: Partial<Product>) => {
  if (!payload.name || !payload.sku) throw new Error('name y sku son obligatorios');
  const price = Number(payload.price ?? 0);
  if (price < 0) throw new Error('price debe ser >= 0');

  const product: Product = {
    id: createId('p'),
    name: payload.name,
    sku: payload.sku,
    description: payload.description ?? '',
    price,
    category: payload.category ?? 'General',
    stock: Number(payload.stock ?? 0),
    minStock: Number(payload.minStock ?? 0),
    image: payload.image ?? 'https://picsum.photos/seed/default-medistock/400/400'
  };

  const r = await repo.createProduct(product);
  return mapProductRow(r.rows[0]);
};

export const updateExistingProduct = async (id: string, payload: Partial<Product>) => {
  const existing = await getProduct(id);
  if (!existing) return null;

  const updated = {
    ...existing,
    ...payload,
    price: Number(payload.price ?? existing.price),
    stock: Number(payload.stock ?? existing.stock),
    minStock: Number(payload.minStock ?? existing.minStock)
  } as Product;

  const r = await repo.updateProduct(id, updated);
  return mapProductRow(r.rows[0]);
};

export const removeProduct = async (id: string) => {
  const r = await repo.deleteProduct(id);
  if (r.rowCount === 0) return null;
  return mapProductRow(r.rows[0]);
};
