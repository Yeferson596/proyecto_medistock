import { query } from '../../shared/db';
import type { BankAccount, BankTransaction } from '../../shared/types';

export const getAccount = async (accountId: string) => {
  return query<BankAccount>('SELECT account_id, balance, currency FROM bank_accounts WHERE account_id = $1', [accountId]);
};

export const createAccount = async (accountId: string, balance: number, currency = 'USD') => {
  return query('INSERT INTO bank_accounts (account_id, balance, currency) VALUES ($1, $2, $3) RETURNING account_id, balance, currency', [accountId, balance, currency]);
};

export const updateBalance = async (accountId: string, newBalance: number) => {
  return query('UPDATE bank_accounts SET balance = $1 WHERE account_id = $2 RETURNING account_id, balance, currency', [newBalance, accountId]);
};

export const insertTransaction = async (tx: BankTransaction) => {
  return query('INSERT INTO bank_transactions (id, account_id, type, amount, description, timestamp, status) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *', [tx.id, tx.accountId, tx.type, tx.amount, tx.description, tx.timestamp, tx.status]);
};

export const getTransactions = async (accountId: string, limit = 50) => {
  return query<BankTransaction>('SELECT id, account_id, type, amount, description, timestamp, status FROM bank_transactions WHERE account_id = $1 ORDER BY timestamp DESC LIMIT $2', [accountId, limit]);
};
