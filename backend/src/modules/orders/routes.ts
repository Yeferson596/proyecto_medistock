import { Router } from 'express';
import { query } from '../../shared/db';
import { createId } from '../../shared/utils';
import type { Order } from '../../shared/types';

const mapOrder = (row: any): Order => ({
  id: row.id,
  customerId: row.customer_id,
  items: row.items,
  status: row.status,
  total: Number(row.total),
  createdAt: new Date(row.created_at).toISOString(),
  type: row.type,
  metadata: row.metadata ?? undefined
});

export const ordersRouter = Router();

ordersRouter.get('/', async (_req, res, next) => {
  try {
    const result = await query<Order>('SELECT * FROM orders ORDER BY created_at DESC');
    return res.json(result.rows.map(mapOrder));
  } catch (error) {
    next(error);
  }
});

ordersRouter.get('/:id', async (req, res, next) => {
  try {
    const result = await query<Order>('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    return res.json(mapOrder(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

ordersRouter.post('/', async (req, res, next) => {
  try {
    const payload = req.body as Partial<Order>;
    if (!payload.customerId || !Array.isArray(payload.items) || payload.items.length === 0) {
      return res.status(400).json({ message: 'customerId e items son obligatorios' });
    }

    const productIds = payload.items.map((item) => item.productId);
    const productResult = await query<{ id: string; price: number }>('SELECT id, price FROM products WHERE id = ANY($1)', [productIds]);
    const productPriceMap = new Map(productResult.rows.map((product) => [product.id, Number(product.price)]));

    const items = payload.items.map((item) => ({
      productId: item.productId,
      quantity: Number(item.quantity ?? 1),
      price: productPriceMap.get(item.productId) ?? Number(item.price ?? 0)
    }));

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order: Order = {
      id: createId('o'),
      customerId: payload.customerId,
      items,
      status: payload.status ?? 'pending',
      total,
      createdAt: new Date().toISOString(),
      type: payload.type ?? 'B2C',
      metadata: payload.metadata
    };

    const result = await query<Order>(
      'INSERT INTO orders (id, customer_id, items, status, total, created_at, type, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [
        order.id,
        order.customerId,
        JSON.stringify(order.items),
        order.status,
        order.total,
        order.createdAt,
        order.type,
        order.metadata ? JSON.stringify(order.metadata) : null
      ]
    );

    return res.status(201).json(mapOrder(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

ordersRouter.put('/:id', async (req, res, next) => {
  try {
    const existingResult = await query<Order>('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    if (existingResult.rowCount === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const existing = mapOrder(existingResult.rows[0]);
    const payload = req.body as Partial<Order>;
    const updated = {
      ...existing,
      ...payload,
      items: payload.items ?? existing.items,
      total: payload.total ?? existing.total,
      metadata: payload.metadata ?? existing.metadata
    };

    const result = await query<Order>(
      'UPDATE orders SET items = $1, status = $2, total = $3, type = $4, metadata = $5 WHERE id = $6 RETURNING *',
      [
        JSON.stringify(updated.items),
        updated.status,
        updated.total,
        updated.type,
        updated.metadata ? JSON.stringify(updated.metadata) : null,
        req.params.id
      ]
    );

    return res.json(mapOrder(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

ordersRouter.delete('/:id', async (req, res, next) => {
  try {
    const result = await query<Order>('DELETE FROM orders WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    return res.json(mapOrder(result.rows[0]));
  } catch (error) {
    next(error);
  }
});
