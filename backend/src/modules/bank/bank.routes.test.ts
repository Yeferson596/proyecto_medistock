import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../app';

describe('Bank Security - Unit tests', () => {
  it('CP-06 - POST /bank/process-payment sin token retorna 401', async () => {
    const response = await request(app)
      .post('/api/v1/bank/process-payment')
      .send({ accountId: 'ACC001', amount: 100, description: 'Pago' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('No autorizado');
  });
});