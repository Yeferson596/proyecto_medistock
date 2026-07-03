import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../app';
import { signToken } from '../../shared/auth';

vi.mock('./users.service', () => ({
  listUsers: vi.fn(async () => [{ id: 'u001', name: 'Admin', email: 'admin@medistock.com', role: 'admin' }]),
  getUser: vi.fn(async (id: string) => (id === 'u001' ? { id: 'u001', name: 'Admin', email: 'admin@medistock.com', role: 'admin' } : null)),
  createNewUser: vi.fn(async (payload: any) => ({ id: 'u002', ...payload })),
  updateExistingUser: vi.fn(async (id: string, payload: any) => (id === 'u001' ? { id, ...payload } : null)),
  removeUser: vi.fn(async (id: string) => (id === 'u001' ? { id, name: 'Admin', email: 'admin@medistock.com', role: 'admin' } : null))
}));

describe('Users routes', () => {
  const token = signToken({ id: 'u001', role: 'admin' });

  it('GET /users sin token retorna 401', async () => {
    const response = await request(app).get('/api/v1/users');
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No autorizado');
  });

  it('GET /users con token retorna 200', async () => {
    const response = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].email).toBe('admin@medistock.com');
  });

  it('GET /users/:id no existente retorna 404', async () => {
    const response = await request(app)
      .get('/api/v1/users/u999')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Usuario no encontrado');
  });

  it('POST /users con token crea usuario', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Nuevo', email: 'new@medistock.com', role: 'customer', password: 'pass123' });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe('new@medistock.com');
  });
});