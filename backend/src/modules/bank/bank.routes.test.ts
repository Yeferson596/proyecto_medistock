import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
// Mock the bank service before importing the app to avoid DB calls
vi.mock('./service', () => ({
  bankService: {
    getBalance: vi.fn(async () => 5000),
    getTransactions: vi.fn(async () => []),
    processPayment: vi.fn(),
    deposit: vi.fn()
  }
}));

import { app } from '../../app';
import { signToken } from '../../shared/auth';

describe('Bank Security - Unit tests', () => {
  it('CP-06 - POST /bank/process-payment sin token retorna 401', async () => {
    const response = await request(app)
      .post('/api/v1/bank/process-payment')
      .send({ accountId: 'ACC001', amount: 100, description: 'Pago' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No autorizado');
  });

  it('CP-07 - GET /bank/balance/:accountId sin token retorna 401', async () => {
    const response = await request(app).get('/api/v1/bank/balance/ACC001');
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No autorizado');
  });

  it('CP-08 - GET /bank/balance/:accountId con token retorna 200', async () => {
    const token = signToken({ id: 'u001', role: 'admin' });
    const response = await request(app)
      .get('/api/v1/bank/balance/ACC001')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('balance');
  });
});