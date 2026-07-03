import type { BankTransaction } from '../../shared/types';
import * as repo from './bank.repository';

const DEFAULT_INITIAL_BALANCE = 5000;

const makeId = () => `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export const bankService = {
  getBalance: async (accountId: string) => {
    const r = await repo.getAccount(accountId);
    if (r.rowCount === 0) {
      await repo.createAccount(accountId, DEFAULT_INITIAL_BALANCE);
      return DEFAULT_INITIAL_BALANCE;
    }
    return Number(r.rows[0].balance);
  },

  processPayment: async (accountId: string, amount: number, description: string) => {
    const balance = await bankService.getBalance(accountId);
    if (balance < amount) return null;

    const newBalance = balance - amount;
    await repo.updateBalance(accountId, newBalance);

    const transaction: BankTransaction = {
      id: makeId(),
      accountId,
      type: 'debit',
      amount,
      description,
      timestamp: new Date().toISOString(),
      status: 'success'
    };

    await repo.insertTransaction(transaction);
    return { transactionId: transaction.id, newBalance };
  },

  deposit: async (accountId: string, amount: number) => {
    const balance = await bankService.getBalance(accountId);
    const newBalance = balance + amount;
    await repo.updateBalance(accountId, newBalance);

    const transaction: BankTransaction = {
      id: makeId(),
      accountId,
      type: 'credit',
      amount,
      description: 'Depósito de fondos',
      timestamp: new Date().toISOString(),
      status: 'success'
    };

    await repo.insertTransaction(transaction);
    return { transactionId: transaction.id, newBalance };
  },

  getTransactions: async (accountId: string, limit: number = 50) => {
    const r = await repo.getTransactions(accountId, limit);
    return r.rows;
  }
};
