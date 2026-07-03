import { query } from '../../shared/db';
import type { User } from '../../shared/types';

export const getUserByEmail = async (email: string) => {
  return query<User>('SELECT * FROM users WHERE email = $1', [email]);
};

export const createUser = async (user: User & { passwordHash: string }) => {
  return query<User>(
    'INSERT INTO users (id, name, email, role, institution, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, institution',
    [user.id, user.name, user.email, user.role, user.institution ?? null, user.passwordHash]
  );
};
