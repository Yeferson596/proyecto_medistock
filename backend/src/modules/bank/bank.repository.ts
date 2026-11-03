import { dbResult, getCollection } from '../../shared/db';
import { enqueueOracleSync } from '../../shared/oracle-sync';
import type { BankAccount, BankTransaction } from '../../shared/types';

const accounts = () => getCollection<BankAccount>('bank_accounts');
const transactions = () => getCollection<BankTransaction>('bank_transactions');

export const getAccount = async (accountId: string) => {
  const account = await accounts().findOne({ accountId }, { projection: { _id: 0 } });
  return dbResult(account ? [account] : []);
};

export const createAccount = async (accountId: string, balance: number, currency = 'USD') => {
  const account = await accounts().findOneAndUpdate(
    { accountId },
    { $setOnInsert: { accountId, balance, currency } },
    { upsert: true, returnDocument: 'after', projection: { _id: 0 } }
  );
  if (account) await enqueueOracleSync('bank_accounts', accountId);
  return dbResult(account ? [account] : []);
};

export const updateBalance = async (accountId: string, newBalance: number) => {
  const account = await accounts().findOneAndUpdate(
    { accountId },
    { $set: { balance: newBalance } },
    { returnDocument: 'after', projection: { _id: 0 } }
  );
  if (account) await enqueueOracleSync('bank_accounts', accountId);
  return dbResult(account ? [account] : []);
};

export const insertTransaction = async (transaction: BankTransaction) => {
  await transactions().insertOne(transaction);
  await enqueueOracleSync('bank_transactions', transaction.id);
  return dbResult([transaction]);
};

export const getTransactions = async (accountId: string, limit = 50) => {
  const rows = await transactions()
    .find({ accountId }, { projection: { _id: 0 } })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
  return dbResult(rows);
};
