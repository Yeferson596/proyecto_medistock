import { Router } from 'express';
import * as service from './users.service';
import { requireAuth } from '../../shared/auth';

export const usersRouter = Router();

usersRouter.get('/', async (_req, res, next) => {
  try {
    const items = await service.listUsers();
    return res.json(items);
  } catch (error) {
    next(error);
  }
});

usersRouter.get('/:id', async (req, res, next) => {
  try {
    const item = await service.getUser(req.params.id);
    if (!item) return res.status(404).json({ message: 'Usuario no encontrado' });
    return res.json(item);
  } catch (error) {
    next(error);
  }
});

usersRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const payload = req.body as any;
    const created = await service.createNewUser(payload);
    return res.status(201).json(created);
  } catch (error: any) {
    if (error.message) return res.status(400).json({ message: error.message });
    next(error);
  }
});

usersRouter.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const updated = await service.updateExistingUser(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Usuario no encontrado' });
    return res.json(updated);
  } catch (error) {
    next(error);
  }
});

usersRouter.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const removed = await service.removeUser(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Usuario no encontrado' });
    return res.json(removed);
  } catch (error) {
    next(error);
  }
});
