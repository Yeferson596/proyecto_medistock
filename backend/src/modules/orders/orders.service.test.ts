import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock del repository ANTES de importar el servicio
vi.mock('../products/products.repository', () => ({
  getProductsByIds: vi.fn(),
  updateProduct: vi.fn()
}));

vi.mock('./orders.repository', () => ({
  createOrder: vi.fn()
}));

// Mock del módulo db para que no se ejecute
vi.mock('../../shared/db', () => ({
  query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  pool: { query: vi.fn().mockResolvedValue({ rows: [], rowCount: 0 }) }
}));

// Ahora importamos el servicio
import { createNewOrder } from './orders.service';
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

    await expect(createNewOrder(payload)).rejects.toThrow('Stock insuficiente');
  });

  it('CP-02b - debe crear pedido si stock es suficiente', async () => {
    vi.mocked(productRepo.getProductsByIds).mockResolvedValue({
      rows: [{ id: 'p001', price: 100, stock: 10 }],
      rowCount: 1
    } as any);

    vi.mocked(productRepo.updateProduct).mockResolvedValue({
      rows: [{ id: 'p001', stock: 8 }],
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
  });
});