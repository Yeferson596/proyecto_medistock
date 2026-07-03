import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock del repository ANTES de importar el servicio
vi.mock('../products/products.repository', () => ({
  getProductsByIds: vi.fn(),
  decreaseProductStock: vi.fn(),
  increaseProductStock: vi.fn()
}));

vi.mock('./orders.repository', () => ({
  createOrder: vi.fn(),
  getOrderById: vi.fn(),
  updateOrder: vi.fn()
}));

// Mock del módulo db para que no se ejecute
vi.mock('../../shared/db', () => ({
  query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  pool: { query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }) }
}));

// Ahora importamos el servicio
import { createNewOrder, updateExistingOrder } from './orders.service';
import * as productRepo from '../products/products.repository';
import * as orderRepo from './orders.repository';

describe('Orders Service - Unit tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('CP-02 - debe lanzar error si la cantidad supera el stock', async () => {
    vi.mocked(productRepo.getProductsByIds).mockResolvedValue({
      rows: [{ id: 'p001', price: 100, stock: 5 }],
      rowCount: 1
    } as any);

    const payload = {
      customerId: 'u001',
      items: [{ productId: 'p001', quantity: 10 }]
    };

    await expect(createNewOrder(payload)).rejects.toThrow('Stock insuficiente para producto p001');
  });

  it('CP-02b - debe crear pedido si stock es suficiente', async () => {
    vi.mocked(productRepo.getProductsByIds).mockResolvedValue({
      rows: [{ id: 'p001', price: 100, stock: 10 }],
      rowCount: 1
    } as any);

    vi.mocked(orderRepo.createOrder).mockResolvedValue({
      rows: [{
        id: 'o001',
        customer_id: 'u001',
        items: JSON.stringify([{ productId: 'p001', quantity: 2, price: 100 }]),
        status: 'pending',
        total: 200,
        created_at: new Date().toISOString(),
        type: 'B2C',
        metadata: null
      }],
      rowCount: 1
    } as any);

    const payload = {
      customerId: 'u001',
      items: [{ productId: 'p001', quantity: 2 }]
    };

    const result = await createNewOrder(payload);
    expect(result).toHaveProperty('id');
    expect(result.total).toBe(200);
    expect(productRepo.decreaseProductStock).toHaveBeenCalledWith('p001', 2);
  });

  it('CP-03 - debe lanzar error si falta customerId', async () => {
    const payload = {
      items: [{ productId: 'p001', quantity: 1 }]
    } as any;

    await expect(createNewOrder(payload)).rejects.toThrow('customerId e items son obligatorios');
  });

  it('CP-04 - debe lanzar error si la cantidad es inválida', async () => {
    vi.mocked(productRepo.getProductsByIds).mockResolvedValue({
      rows: [{ id: 'p001', price: 100, stock: 10 }],
      rowCount: 1
    } as any);

    const payload = {
      customerId: 'u001',
      items: [{ productId: 'p001', quantity: 0 }]
    };

    await expect(createNewOrder(payload)).rejects.toThrow('Cantidad inválida para producto p001');
  });

  it('CP-05 - updateExistingOrder actualiza stock cuando cambia la cantidad', async () => {
    const existingOrder = {
      id: 'o001',
      customerId: 'u001',
      items: [{ productId: 'p001', quantity: 2, price: 100 }],
      status: 'pending',
      total: 200,
      created_at: new Date().toISOString(),
      type: 'B2C'
    } as any;

    vi.mocked(orderRepo.getOrderById).mockResolvedValue({ rows: [existingOrder], rowCount: 1 } as any);
    vi.mocked(productRepo.getProductsByIds).mockResolvedValue({
      rows: [{ id: 'p001', price: 100, stock: 10 }],
      rowCount: 1
    } as any);
    vi.mocked(orderRepo.updateOrder).mockResolvedValue({ rows: [{ ...existingOrder, items: [{ productId: 'p001', quantity: 4, price: 100 }], total: 400 }], rowCount: 1 } as any);

    const result = await updateExistingOrder('o001', { items: [{ productId: 'p001', quantity: 4 }] });

    expect(productRepo.decreaseProductStock).toHaveBeenCalledWith('p001', 2);
    expect(result?.total).toBe(400);
  });

  it('CP-06 - updateExistingOrder retorna null si no existe pedido', async () => {
    vi.mocked(orderRepo.getOrderById).mockResolvedValue({ rows: [], rowCount: 0 } as any);

    const result = await updateExistingOrder('o999', { items: [{ productId: 'p001', quantity: 1 }] });

    expect(result).toBeNull();
  });
});