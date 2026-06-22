import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './app';

describe('App routes', () => {
  it('GET /api-docs responde HTML', async () => {
    const response = await request(app).get('/api-docs/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('<html');
  });
});