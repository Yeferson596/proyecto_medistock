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

const buildOrderItems = async (items: OrderItem[], reservedQuantities = new Map<string, number>()) => {
  const productIds = items.map((item) => item.productId);
  const productResult = await productRepo.getProductsByIds(productIds);
  const productMap = new Map(
    productResult.rows.map((p: any) => [p.id, { price: Number(p.price), stock: Number(p.stock ?? 0) }])
  );

  return items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) throw new Error(`Producto ${item.productId} no encontrado`);

    const quantity = Number(item.quantity ?? 1);
    if (quantity <= 0) throw new Error(`Cantidad inválida para producto ${item.productId}`);

    const availableStock = product.stock + (reservedQuantities.get(item.productId) ?? 0);
    if (quantity > availableStock) throw new Error(`Stock insuficiente para producto ${item.productId}`);

    return {
      productId: item.productId,
      quantity,
      price: product.price
    };
  });
};

const adjustStockForUpdatedOrder = async (oldItems: OrderItem[], newItems: OrderItem[]) => {
  const oldMap = new Map(oldItems.map((item) => [item.productId, item.quantity]));
  const newMap = new Map(newItems.map((item) => [item.productId, item.quantity]));
  const productIds = Array.from(new Set([...oldMap.keys(), ...newMap.keys()]));

  for (const productId of productIds) {
    const oldQuantity = oldMap.get(productId) ?? 0;
    const newQuantity = newMap.get(productId) ?? 0;
    const diff = newQuantity - oldQuantity;

    if (diff > 0) {
      await productRepo.decreaseProductStock(productId, diff);
    } else if (diff < 0) {
      await productRepo.increaseProductStock(productId, Math.abs(diff));
    }
  }
};

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

  const items = await buildOrderItems(payload.items as OrderItem[]);
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

  await Promise.all(items.map((item) => productRepo.decreaseProductStock(item.productId, item.quantity)));

  const r = await repo.createOrder(order);
  return mapOrderRow(r.rows[0]);
};

export const updateExistingOrder = async (id: string, payload: Partial<Order>) => {
  const existing = await getOrder(id);
  if (!existing) return null;

  let items = existing.items;
  if (payload.items) {
    const reservedQuantities = new Map(existing.items.map((item) => [item.productId, item.quantity]));
    items = await buildOrderItems(payload.items as OrderItem[], reservedQuantities);
    await adjustStockForUpdatedOrder(existing.items, items);
  }

  const total = payload.total ?? items.reduce((s, it) => s + it.price * it.quantity, 0);

  const updated = {
    ...existing,
    ...payload,
    items,
    total,
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
