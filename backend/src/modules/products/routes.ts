import { Router } from 'express';
import * as service from './products.service';
import { requireAuth } from '../../shared/auth';

export const productsRouter = Router();

productsRouter.get('/', async (_req, res, next) => {
  try {
    const items = await service.listProducts();
    return res.json(items);
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/:id', async (req, res, next) => {
  try {
    const item = await service.getProduct(req.params.id);
    if (!item) return res.status(404).json({ message: 'Producto no encontrado' });
    return res.json(item);
  } catch (error) {
    next(error);
  }
});

productsRouter.post('/', requireAuth, async (req, res, next) => {
  try {
    const payload = req.body;
    const created = await service.createNewProduct(payload);
    return res.status(201).json(created);
  } catch (error: any) {
    if (error.message) return res.status(400).json({ message: error.message });
    next(error);
  }
});

productsRouter.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const updated = await service.updateExistingProduct(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Producto no encontrado' });
    return res.json(updated);
  } catch (error) {
    next(error);
  }
});

productsRouter.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const removed = await service.removeProduct(req.params.id);
    if (!removed) return res.status(404).json({ message: 'Producto no encontrado' });
    return res.json(removed);
  } catch (error) {
    next(error);
  }
});
