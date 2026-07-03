import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as repo from './auth.repository';
import * as service from './auth.service';

vi.mock('./auth.repository', () => ({
  getUserByEmail: vi.fn(),
  createUser: vi.fn()
}));

vi.mock('bcrypt', async () => ({
  __esModule: true,
  default: {
    hash: vi.fn(async (value: string) => `hashed-${value}`),
    compare: vi.fn(async (value: string, hash: string) => hash === `hashed-${value}`)
  }
}));

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registerUser requiere todos los campos', async () => {
    await expect(service.registerUser({ name: 'User' } as any)).rejects.toThrow('name, email, role y password son obligatorios');
  });

  it('registerUser falla si el email ya está registrado', async () => {
    vi.mocked(repo.getUserByEmail).mockResolvedValue({ rowCount: 1 } as any);

    await expect(service.registerUser({ name: 'User', email: 'u@u.com', role: 'customer', password: 'pass' } as any)).rejects.toThrow('Email ya registrado');
  });

  it('loginUser requiere email y password', async () => {
    await expect(service.loginUser('', '')).rejects.toThrow('email y password son obligatorios');
  });

  it('loginUser falla con credenciales inválidas', async () => {
    vi.mocked(repo.getUserByEmail).mockResolvedValue({ rowCount: 0, rows: [] } as any);

    await expect(service.loginUser('x@y.com', 'pass')).rejects.toThrow('Credenciales inválidas');
  });

  it('loginUser retorna token y usuario cuando las credenciales son válidas', async () => {
    const seq = { id: 'u001', name: 'Admin', email: 'admin@medistock.com', role: 'admin', password: 'hashed-secret' };
    vi.mocked(repo.getUserByEmail).mockResolvedValue({ rowCount: 1, rows: [seq] } as any);

    const result = await service.loginUser('admin@medistock.com', 'secret');

    expect(result.token).toBeTypeOf('string');
    expect(result.user.email).toBe('admin@medistock.com');
  });
});