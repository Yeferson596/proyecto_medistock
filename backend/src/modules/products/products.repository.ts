import { query } from '../../shared/db';
import type { Product } from '../../shared/types';

export const getAllProducts = async () => {
  return query<Product>('SELECT * FROM products ORDER BY name');
};

export const getProductById = async (id: string) => {
  return query<Product>('SELECT * FROM products WHERE id = $1', [id]);
};

export const getProductsByIds = async (ids: string[]) => {
  return query<Product>('SELECT id, price, stock FROM products WHERE id = ANY($1)', [ids]);
};

export const createProduct = async (product: Product) => {
  return query<Product>(
    'INSERT INTO products (id, name, sku, description, price, category, stock, min_stock, image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
    [product.id, product.name, product.sku, product.description, product.price, product.category, product.stock, product.minStock, product.image]
  );
};

export const updateProduct = async (id: string, p: Partial<Product>) => {
  return query<Product>(
    'UPDATE products SET name = $1, sku = $2, description = $3, price = $4, category = $5, stock = $6, min_stock = $7, image = $8 WHERE id = $9 RETURNING *',
    [p.name, p.sku, p.description, p.price, p.category, p.stock, p.minStock, p.image, id]
  );
};

export const deleteProduct = async (id: string) => {
  return query<Product>('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
};
