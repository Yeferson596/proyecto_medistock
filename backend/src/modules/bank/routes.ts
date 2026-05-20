import { Router } from 'express';
import { bankService } from './service';

export const bankRouter = Router();

bankRouter.post('/process-payment', (req, res) => {
  const { accountId, amount, description } = req.body;
  const result = bankService.processPayment(accountId, amount, description);
  
  if (!result) {
    return res.status(400).json({
      success: false,
      message: "Fondos insuficientes",
      availableBalance: bankService.getBalance(accountId)
    });
  }

  res.json({
    success: true,
    message: "Pago procesado exitosamente",
    ...result
  });
});

bankRouter.get('/balance/:accountId', (req, res) => {
  const { accountId } = req.params;
  res.json({
    success: true,
    accountId,
    balance: bankService.getBalance(accountId),
    currency: "USD"
  });
});

bankRouter.get('/transactions/:accountId', (req, res) => {
  const { accountId } = req.params;
  const limit = parseInt(req.query.limit as string) || 50;
  const txs = bankService.getTransactions(accountId, limit);
  res.json({ success: true, transactions: txs, total: txs.length });
});

bankRouter.post('/deposit', (req, res) => {
  const { accountId, amount } = req.body;
  const result = bankService.deposit(accountId, amount);
  res.json({ success: true, message: "Depósito exitoso", ...result });
});