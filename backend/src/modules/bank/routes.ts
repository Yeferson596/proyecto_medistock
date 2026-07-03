import { Router } from 'express';
import { bankService } from './service';
import { requireAuth } from '../../shared/auth';

export const bankRouter = Router();

bankRouter.post('/process-payment', requireAuth, async (req, res, next) => {
  try {
    const { accountId, amount, description } = req.body;
    const result = await bankService.processPayment(accountId, Number(amount), description);
    if (!result) {
      const available = await bankService.getBalance(accountId);
      return res.status(400).json({ success: false, message: 'Fondos insuficientes', availableBalance: available });
    }
    res.json({ success: true, message: 'Pago procesado exitosamente', ...result });
  } catch (error) {
    next(error);
  }
});

bankRouter.get('/balance/:accountId', requireAuth, async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const balance = await bankService.getBalance(accountId);
    res.json({ success: true, accountId, balance, currency: 'USD' });
  } catch (error) {
    next(error);
  }
});

bankRouter.get('/transactions/:accountId', requireAuth, async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const txs = await bankService.getTransactions(accountId, limit);
    res.json({ success: true, transactions: txs, total: txs.length });
  } catch (error) {
    next(error);
  }
});

bankRouter.post('/deposit', requireAuth, async (req, res, next) => {
  try {
    const { accountId, amount } = req.body;
    const result = await bankService.deposit(accountId, Number(amount));
    res.json({ success: true, message: 'Depósito exitoso', ...result });
  } catch (error) {
    next(error);
  }
});