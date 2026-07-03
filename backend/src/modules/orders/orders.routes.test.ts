import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../app';
import { signToken } from '../../shared/auth';

vi.mock('./orders.service', () => ({
  listOrders: vi.fn(async () => [{ id: 'o001', customerId: 'u001', items: [], status: 'pending', total: 100, createdAt: new Date().toISOString(), type: 'B2C' }]),
  getOrder: vi.fn(async (id: string) => (id === 'o001' ? { id: 'o001', customerId: 'u001', items: [], status: 'pending', total: 100, createdAt: new Date().toISOString(), type: 'B2C' } : null)),
  createNewOrder: vi.fn(async (payload: any) => ({ id: 'o002', ...payload })),
  updateExistingOrder: vi.fn(async (id: string, payload: any) => (id === 'o001' ? { id, ...payload } : null)),
  removeOrder: vi.fn(async (id: string) => (id === 'o001' ? { id: 'o001', customerId: 'u001', items: [], status: 'pending', total: 100, createdAt: new Date().toISOString(), type: 'B2C' } : null))
}));

describe('Orders routes', () => {
  const token = signToken({ id: 'u001', role: 'admin' });

  it('GET /orders sin token retorna 401', async () => {
    const response = await request(app).get('/api/v1/orders');
    expect(response.status).toBe(401);
  });

  it('GET /orders con token retorna 200', async () => {
    const response = await request(app)
      .get('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('POST /orders crea pedido con token', async () => {
    const response = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ customerId: 'u001', items: [{ productId: 'p001', quantity: 1, price: 100 }] });

    expect(response.status).toBe(201);
    expect(response.body.customerId).toBe('u001');
  });
});