import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app';

vi.mock('node-fetch', () => ({
  default: vi.fn()
}));

import fetch from 'node-fetch';

const mockedFetch = vi.mocked(fetch);

describe('Exchange Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/v1/exchange/convert retorna datos de tipo de cambio', async () => {
    mockedFetch.mockResolvedValue({ ok: true, json: async () => ({ result: 952.34 }) } as any);

    const response = await request(app).get('/api/v1/exchange/convert?from=USD&to=CLP&amount=1');

    expect(response.status).toBe(200);
    expect(response.body.result).toBe(952.34);
    expect(mockedFetch).toHaveBeenCalled();
  });

  it('GET /api/v1/exchange/convert retorna 502 si la API externa falla', async () => {
    mockedFetch.mockResolvedValue({ ok: false, json: async () => ({}) } as any);

    const response = await request(app).get('/api/v1/exchange/convert?from=USD&to=CLP&amount=1');

    expect(response.status).toBe(502);
    expect(response.body.message).toBe('Error al consultar la API externa');
  });
});