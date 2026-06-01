import { Router } from 'express';
import * as authService from './auth.service';

export const authRouter = Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const payload = req.body as Partial<import('../../shared/types').User & { password?: string }>;
    const result = await authService.registerUser(payload);
    return res.status(201).json(result);
  } catch (error: any) {
    if (error.message) return res.status(400).json({ message: error.message });
    next(error);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    const result = await authService.loginUser(email ?? '', password ?? '');
    return res.json(result);
  } catch (error: any) {
    if (error.message === 'email y password son obligatorios') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(401).json({ message: error.message });
  }
});
