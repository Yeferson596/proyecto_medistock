import { Router } from 'express';
import { query } from '../../shared/db';
import { createId } from '../../shared/utils';
import type { User } from '../../shared/types';

const mapUser = (row: any): User => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  institution: row.institution ?? undefined
});

export const usersRouter = Router();

usersRouter.get('/', async (_req, res, next) => {
  try {
    const result = await query<User>('SELECT * FROM users ORDER BY name');
    return res.json(result.rows.map(mapUser));
  } catch (error) {
    next(error);
  }
});

usersRouter.get('/:id', async (req, res, next) => {
  try {
    const result = await query<User>('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json(mapUser(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

usersRouter.post('/', async (req, res, next) => {
  try {
    const payload = req.body as Partial<User>;
    if (!payload.name || !payload.email || !payload.role) {
      return res.status(400).json({ message: 'name, email y role son obligatorios' });
    }

    const user: User = {
      id: createId('u'),
      name: payload.name,
      email: payload.email,
      role: payload.role,
      institution: payload.institution
    };

    const result = await query<User>(
      'INSERT INTO users (id, name, email, role, institution) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user.id, user.name, user.email, user.role, user.institution]
    );

    return res.status(201).json(mapUser(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

usersRouter.put('/:id', async (req, res, next) => {
  try {
    const existingResult = await query<User>('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (existingResult.rowCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const existing = mapUser(existingResult.rows[0]);
    const payload = req.body as Partial<User>;
    const updated = {
      ...existing,
      ...payload
    };

    const result = await query<User>(
      'UPDATE users SET name = $1, email = $2, role = $3, institution = $4 WHERE id = $5 RETURNING *',
      [updated.name, updated.email, updated.role, updated.institution, req.params.id]
    );

    return res.json(mapUser(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

usersRouter.delete('/:id', async (req, res, next) => {
  try {
    const result = await query<User>('DELETE FROM users WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json(mapUser(result.rows[0]));
  } catch (error) {
    next(error);
  }
});
