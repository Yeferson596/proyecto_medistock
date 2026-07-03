import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../app';

vi.mock('./auth.service', () => ({
  registerUser: vi.fn(async (payload: any) => ({ id: 'u001', ...payload })),
  loginUser: vi.fn(async (email: string, password: string) => {
    if (email !== 'admin@medistock.com' || password !== 'secret') throw new Error('Credenciales inválidas');
    return { token: 'token123', user: { id: 'u001', email, role: 'admin' } };
  })
}));

describe('Auth routes', () => {
  it('POST /auth/register crea un usuario', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'User', email: 'user@test.com', password: 'secret', role: 'customer' });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe('user@test.com');
  });

  it('POST /auth/login retorna token con credenciales válidas', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@medistock.com', password: 'secret' });

    expect(response.status).toBe(200);
    expect(response.body.token).toBe('token123');
    expect(response.body.user.role).toBe('admin');
  });

  it('POST /auth/login retorna 401 con credenciales inválidas', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@medistock.com', password: 'wrong' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Credenciales inválidas');
  });
});