import { query } from '../../shared/db';
import type { Order } from '../../shared/types';

export const getAllOrders = async () => {
  return query<Order>('SELECT * FROM orders ORDER BY created_at DESC');
};

export const getOrderById = async (id: string) => {
  return query<Order>('SELECT * FROM orders WHERE id = $1', [id]);
};

export const createOrder = async (order: Order) => {
  return query<Order>(
    'INSERT INTO orders (id, customer_id, items, status, total, created_at, type, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    [order.id, order.customerId, JSON.stringify(order.items), order.status, order.total, order.createdAt, order.type, order.metadata ? JSON.stringify(order.metadata) : null]
  );
};

export const updateOrder = async (id: string, order: Partial<Order>) => {
  return query<Order>(
    'UPDATE orders SET items = $1, status = $2, total = $3, type = $4, metadata = $5 WHERE id = $6 RETURNING *',
    [JSON.stringify(order.items), order.status, order.total, order.type, order.metadata ? JSON.stringify(order.metadata) : null, id]
  );
};

export const deleteOrder = async (id: string) => {
  return query<Order>('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
};
