import { Router } from 'express';
import * as service from './orders.service';
import { requireAuth } from '../../shared/auth';

export const ordersRouter = Router();

ordersRouter.get('/', requireAuth, async (_req, res, next) => {
  try {
    const items = await service.listOrders();
    return res.json(items);
  } catch (error) {
    next(error);
  }
});

ordersRouter.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const item = await service.getOrder(req.params.id);
    if (!item) return res.status(404).json({ message: 'Pedido no encontrado' });
    return res.json(item);
  } catch (error) {
    next(error);
  }
});

ordersRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const created = await service.createNewOrder(req.body);
    return res.status(201).json(created);
  } catch (error: any) {
    if (error.message) return res.status(400).json({ message: error.message });
    next(error);
  }
});

ordersRouter.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const updated = await service.updateExistingOrder(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Pedido no encontrado' });
    return res.json(updated);
  } catch (error) {
    next(error);
  }
});

ordersRouter.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const removed = await service.removeOrder(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Pedido no encontrado' });
    return res.json(removed);
  } catch (error) {
    next(error);
  }
});
