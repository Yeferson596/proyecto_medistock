import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import * as repo from './users.repository';
import * as service from './users.service';

vi.mock('./users.repository', () => ({
  getAllUsers: vi.fn(),
  getUserById: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn()
}));

describe('Users Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('listUsers retorna listado de usuarios', async () => {
    vi.mocked(repo.getAllUsers).mockResolvedValue({ rows: [{ id: 'u001', name: 'Admin', email: 'admin@medistock.com', role: 'admin' }], rowCount: 1 } as any);

    const result = await service.listUsers();

    expect(result[0].email).toBe('admin@medistock.com');
  });

  it('getUser retorna null si no existe', async () => {
    vi.mocked(repo.getUserById).mockResolvedValue({ rows: [], rowCount: 0 } as any);

    const result = await service.getUser('u999');

    expect(result).toBeNull();
  });

  it('createNewUser crea usuario con password hash', async () => {
    vi.mocked(repo.getUserById).mockResolvedValue({ rowCount: 0 } as any);
    vi.mocked(repo.createUser).mockResolvedValue({ rows: [{ id: 'u002', name: 'Nuevo', email: 'new@medistock.com', role: 'customer' }], rowCount: 1 } as any);
    vi.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-pass');

    const result = await service.createNewUser({ name: 'Nuevo', email: 'new@medistock.com', role: 'customer', password: 'pass123' });

    expect(result.email).toBe('new@medistock.com');
    expect(bcrypt.hash).toHaveBeenCalledWith('pass123', 10);
  });

  it('updateExistingUser retorna null si no existe', async () => {
    vi.spyOn(service, 'getUser').mockResolvedValue(null as any);

    const result = await service.updateExistingUser('u999', { name: 'No existe' });

    expect(result).toBeNull();
  });
});