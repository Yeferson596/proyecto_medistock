import { query } from '../../shared/db';
import type { User } from '../../shared/types';

export const getAllUsers = async () => {
  return query<User>('SELECT id, name, email, role, institution FROM users ORDER BY name');
};

export const getUserById = async (id: string) => {
  return query<User>('SELECT id, name, email, role, institution FROM users WHERE id = $1', [id]);
};

export const createUser = async (user: Partial<User> & { passwordHash?: string }) => {
  return query<User>(
    'INSERT INTO users (id, name, email, role, institution, password) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, name, email, role, institution',
    [user.id, user.name, user.email, user.role, user.institution ?? null, user.passwordHash ?? null]
  );
};

export const updateUser = async (id: string, u: Partial<User>) => {
  return query<User>('UPDATE users SET name = $1, email = $2, role = $3, institution = $4 WHERE id = $5 RETURNING id, name, email, role, institution', [u.name, u.email, u.role, u.institution, id]);
};

export const deleteUser = async (id: string) => {
  return query<User>('DELETE FROM users WHERE id = $1 RETURNING id, name, email, role, institution', [id]);
};
