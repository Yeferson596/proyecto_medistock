import bcrypt from 'bcrypt';
import { createId } from '../../shared/utils';
import { signToken } from '../../shared/auth';
import * as repo from './auth.repository';
import type { User } from '../../shared/types';

export const registerUser = async (payload: Partial<User> & { password?: string }) => {
  if (!payload.name || !payload.email || !payload.role || !payload.password) {
    throw new Error('name, email, role y password son obligatorios');
  }

  const existing = await repo.getUserByEmail(payload.email);
  if ((existing?.rowCount ?? 0) > 0) {
    throw new Error('Email ya registrado');
  }

  const hashed = await bcrypt.hash(payload.password, 10);
  const user: User = {
    id: createId('u'),
    name: payload.name,
    email: payload.email,
    role: payload.role,
    institution: payload.institution,
  };

  const result = await repo.createUser({ ...user, passwordHash: hashed });
  return result.rows[0];
};

export const loginUser = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error('email y password son obligatorios');
  }

  const result = await repo.getUserByEmail(email);
  if (result.rowCount === 0) {
    throw new Error('Credenciales inválidas');
  }

  const row = result.rows[0] as any;
  const hashed = row.password as string | undefined;
  if (!hashed) {
    throw new Error('Credenciales inválidas');
  }

  const ok = await bcrypt.compare(password, hashed);
  if (!ok) {
    throw new Error('Credenciales inválidas');
  }

  const user = { id: row.id, name: row.name, email: row.email, role: row.role };
  const token = signToken(user);
  return { token, user };
};
