import { BankTransaction } from '../../shared/types';

// Simulación de base de datos en memoria
const accounts = new Map<string, number>([
  ['ACC-001', 5000],
  ['ACC-002', 3000],
  ['ACC-ADMIN', 10000]
]);

const transactions: BankTransaction[] = [];

export const bankService = {
  getBalance: (accountId: string) => {
    if (!accounts.has(accountId)) {
      accounts.set(accountId, 5000); // Saldo inicial por defecto
    }
    return accounts.get(accountId) || 0;
  },

  processPayment: (accountId: string, amount: number, description: string) => {
    const balance = bankService.getBalance(accountId);
    if (balance < amount) return null;

    const newBalance = balance - amount;
    accounts.set(accountId, newBalance);

    const transaction: BankTransaction = {
      id: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      accountId,
      type: 'debit',
      amount,
      description,
      timestamp: new Date().toISOString(),
      status: 'success'
    };

    transactions.unshift(transaction);
    return { transactionId: transaction.id, newBalance };
  },

  deposit: (accountId: string, amount: number) => {
    const balance = bankService.getBalance(accountId);
    const newBalance = balance + amount;
    accounts.set(accountId, newBalance);

    const transaction: BankTransaction = {
      id: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      accountId,
      type: 'credit',
      amount,
      description: 'Depósito de fondos',
      timestamp: new Date().toISOString(),
      status: 'success'
    };

    transactions.unshift(transaction);
    return { transactionId: transaction.id, newBalance };
  },

  getTransactions: (accountId: string, limit: number = 50) => {
    return transactions.filter(t => t.accountId === accountId).slice(0, limit);
  }
};