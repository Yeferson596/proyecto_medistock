import { createId } from '../../shared/utils';
import * as repo from './orders.repository';
import * as productRepo from '../products/products.repository';
import type { Order, OrderItem } from '../../shared/types';

const mapOrderRow = (row: any): Order => ({
  id: row.id,
  customerId: row.customer_id,
  items: row.items,
  status: row.status,
  total: Number(row.total),
  createdAt: new Date(row.created_at).toISOString(),
  type: row.type,
  metadata: row.metadata ?? undefined
});

export const listOrders = async () => {
  const r = await repo.getAllOrders();
  return r.rows.map(mapOrderRow);
};

export const getOrder = async (id: string) => {
  const r = await repo.getOrderById(id);
  if (r.rowCount === 0) return null;
  return mapOrderRow(r.rows[0]);
};

export const createNewOrder = async (payload: Partial<Order>) => {
  if (!payload.customerId || !Array.isArray(payload.items) || payload.items.length === 0) throw new Error('customerId e items son obligatorios');

  const productIds = payload.items.map((i: OrderItem) => i.productId);
  const productResult = await productRepo.getProductsByIds(productIds);
  const priceMap = new Map(productResult.rows.map((p: any) => [p.id, Number(p.price)]));

  const items = (payload.items as OrderItem[]).map((item) => ({
    productId: item.productId,
    quantity: Number(item.quantity ?? 1),
    price: priceMap.get(item.productId) ?? Number(item.price ?? 0)
  }));

  const total = items.reduce((s, it) => s + it.price * it.quantity, 0);
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

  const r = await repo.createOrder(order);
  return mapOrderRow(r.rows[0]);
};

export const updateExistingOrder = async (id: string, payload: Partial<Order>) => {
  const existing = await getOrder(id);
  if (!existing) return null;

  const updated = {
    ...existing,
    ...payload,
    items: payload.items ?? existing.items,
    total: payload.total ?? existing.total,
    metadata: payload.metadata ?? existing.metadata
  } as Order;

  const r = await repo.updateOrder(id, updated);
  return mapOrderRow(r.rows[0]);
};

export const removeOrder = async (id: string) => {
  const r = await repo.deleteOrder(id);
  if (r.rowCount === 0) return null;
  return mapOrderRow(r.rows[0]);
};
