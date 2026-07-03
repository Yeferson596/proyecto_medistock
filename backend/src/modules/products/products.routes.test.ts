import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { signToken } from '../../shared/auth';

vi.mock('./products.service', () => ({
  listProducts: vi.fn(async () => [{
    id: 'p001',
    name: 'Producto Test',
    sku: 'TEST-001',
    description: 'Producto de prueba',
    price: 100,
    category: 'General',
    stock: 10,
    minStock: 0,
    image: 'https://picsum.photos/seed/test/400/400'
  }]),
  createNewProduct: vi.fn(async (payload: any) => ({ id: 'p002', ...payload })),
  getProduct: vi.fn(async () => null),
  updateExistingProduct: vi.fn(),
  removeProduct: vi.fn()
}));

import { app } from '../../app';

describe('Products Controller - Unit tests', () => {
  const token = signToken({ id: 'u001', role: 'admin' });

  it('CP-01 - GET /products retorna HTTP 200', async () => {
    const response = await request(app).get('/api/v1/products');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('CP-02 - GET /products/:id no existente retorna 404', async () => {
    const response = await request(app).get('/api/v1/products/p999');
    expect(response.status).toBe(404);
    expect(response.body.message).toContain('Producto no encontrado');
  });

  it('CP-03 - POST /products sin token retorna 401', async () => {
    const response = await request(app)
      .post('/api/v1/products')
      .send({ name: 'Test', sku: 'TEST', price: 100, stock: 10 });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No autorizado');
  });

  it('CP-04 - POST /products con token retorna 201', async () => {
    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test', sku: 'TEST', price: 100, stock: 10 });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Test');
  });
});