import { createId } from '../../shared/utils';
import bcrypt from 'bcrypt';
import * as repo from './users.repository';
import type { User } from '../../shared/types';

export const listUsers = async () => {
  const r = await repo.getAllUsers();
  return r.rows;
};

export const getUser = async (id: string) => {
  const r = await repo.getUserById(id);
  if (r.rowCount === 0) return null;
  return r.rows[0];
};

export const createNewUser = async (payload: Partial<User> & { password?: string }) => {
  if (!payload.name || !payload.email || !payload.role) throw new Error('name, email y role son obligatorios');
  const id = createId('u');
  const passwordHash = payload.password ? await bcrypt.hash(payload.password, 10) : undefined;
  const r = await repo.createUser({ id, name: payload.name, email: payload.email, role: payload.role, institution: payload.institution, passwordHash });
  return r.rows[0];
};

export const updateExistingUser = async (id: string, payload: Partial<User>) => {
  const existing = await getUser(id);
  if (!existing) return null;
  const updated = { ...existing, ...payload } as Partial<User>;
  const r = await repo.updateUser(id, updated);
  return r.rows[0];
};

export const removeUser = async (id: string) => {
  const r = await repo.deleteUser(id);
  if (r.rowCount === 0) return null;
  return r.rows[0];
};
