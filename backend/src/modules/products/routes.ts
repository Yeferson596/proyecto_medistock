import { Router } from 'express';
import { query } from '../../shared/db';
import { createId } from '../../shared/utils';
import type { Product } from '../../shared/types';

const mapProduct = (row: any): Product => ({
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

export const productsRouter = Router();

productsRouter.get('/', async (_req, res, next) => {
  try {
    const result = await query<Product>('SELECT * FROM products ORDER BY name');
    return res.json(result.rows.map(mapProduct));
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/:id', async (req, res, next) => {
  try {
    const result = await query<Product>('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    return res.json(mapProduct(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

productsRouter.post('/', async (req, res, next) => {
  try {
    const payload = req.body as Partial<Product>;
    if (!payload.name || !payload.sku) {
      return res.status(400).json({ message: 'name y sku son obligatorios' });
    }

    const product: Product = {
      id: createId('p'),
      name: payload.name,
      sku: payload.sku,
      description: payload.description ?? '',
      price: Number(payload.price ?? 0),
      category: payload.category ?? 'General',
      stock: Number(payload.stock ?? 0),
      minStock: Number(payload.minStock ?? 0),
      image: payload.image ?? 'https://picsum.photos/seed/default-medistock/400/400'
    };

    const result = await query<Product>(
      'INSERT INTO products (id, name, sku, description, price, category, stock, min_stock, image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [product.id, product.name, product.sku, product.description, product.price, product.category, product.stock, product.minStock, product.image]
    );

    return res.status(201).json(mapProduct(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

productsRouter.put('/:id', async (req, res, next) => {
  try {
    const existingResult = await query<Product>('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (existingResult.rowCount === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const existing = mapProduct(existingResult.rows[0]);
    const payload = req.body as Partial<Product>;
    const updated = {
      ...existing,
      ...payload,
      price: Number(payload.price ?? existing.price),
      stock: Number(payload.stock ?? existing.stock),
      minStock: Number(payload.minStock ?? existing.minStock)
    };

    const result = await query<Product>(
      'UPDATE products SET name = $1, sku = $2, description = $3, price = $4, category = $5, stock = $6, min_stock = $7, image = $8 WHERE id = $9 RETURNING *',
      [updated.name, updated.sku, updated.description, updated.price, updated.category, updated.stock, updated.minStock, updated.image, req.params.id]
    );

    return res.json(mapProduct(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

productsRouter.delete('/:id', async (req, res, next) => {
  try {
    const result = await query<Product>('DELETE FROM products WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    return res.json(mapProduct(result.rows[0]));
  } catch (error) {
    next(error);
  }
});
