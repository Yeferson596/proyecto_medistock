import { createId } from '../../shared/utils';
import * as repo from './orders.repository';
import * as productRepo from '../products/products.repository';
import type { Order, OrderItem } from '../../shared/types';

const mapOrderRow = (row: any): Order => ({
  id: row.id,
  customerId: row.customerId ?? row.customer_id,
  items: row.items,
  status: row.status,
  total: Number(row.total),
  createdAt: new Date(row.createdAt ?? row.created_at).toISOString(),
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

type NewOrderPayload = Partial<Omit<Order, 'items'>> & {
  items?: Array<Pick<OrderItem, 'productId' | 'quantity'> & Partial<Pick<OrderItem, 'price'>>>;
};

export const createNewOrder = async (payload: NewOrderPayload) => {
  if (!payload.customerId || !Array.isArray(payload.items) || payload.items.length === 0) throw new Error('customerId e items son obligatorios');

  const productIds = payload.items.map((item) => item.productId);
  const productResult = await productRepo.getProductsByIds(productIds);
  
  // Crear mapa de productos con stock
  const productMap = new Map(productResult.rows.map((p: any) => [p.id, { 
    price: Number(p.price),
    stock: Number(p.stock) 
  }]));

  // Validar stock disponible para cada producto
  const items: OrderItem[] = [];
  for (const item of payload.items) {
    const product = productMap.get(item.productId);
    if (!product) throw new Error(`Producto ${item.productId} no encontrado`);
    
    const quantity = Number(item.quantity ?? 1);
    if (quantity <= 0) throw new Error(`Cantidad debe ser mayor a 0 para ${item.productId}`);
    if (quantity > product.stock) {
      throw new Error(`Stock insuficiente para ${item.productId}. Disponible: ${product.stock}, Solicitado: ${quantity}`);
    }
    
    items.push({
      productId: item.productId,
      quantity,
      price: product.price
    });
  }

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
  
  // Actualizar stock de productos después de crear orden
  for (const item of items) {
    await productRepo.updateProduct(item.productId, {
      stock: (productMap.get(item.productId)?.stock ?? 0) - item.quantity
    } as any);
  }
  
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
