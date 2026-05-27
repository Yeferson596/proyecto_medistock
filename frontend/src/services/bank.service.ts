import { http } from './http';

interface PaymentResult {
  success: boolean;
  message: string;
  transactionId?: string;
  newBalance?: number;
  amount?: number;
  availableBalance?: number;
  requiredAmount?: number;
}

interface BalanceResult {
  success: boolean;
  accountId: string;
  balance: number;
  currency: string;
}

interface Transaction {
  id: string;
  type: 'debit' | 'credit';
  amount: number;
  description: string;
  timestamp: string;
  status: 'success' | 'failed';
}

interface TransactionsResult {
  success: boolean;
  accountId: string;
  transactions: Transaction[];
  total: number;
}

interface DepositResult {
  success: boolean;
  message: string;
  transactionId?: string;
  newBalance?: number;
  amount?: number;
}

export const bankService = {
  // Procesar pago
  processPayment: async (accountId: string, amount: number, description?: string): Promise<PaymentResult> => {
    return http.post<PaymentResult>('/bank/process-payment', {
      accountId,
      amount,
      description
    });
  },

  // Consultar saldo
  getBalance: async (accountId: string): Promise<BalanceResult> => {
    return http.get<BalanceResult>(`/bank/balance/${accountId}`);
  },

  // Obtener historial de transacciones
  getTransactions: async (accountId: string, limit: number = 50): Promise<TransactionsResult> => {
    return http.get<TransactionsResult>(`/bank/transactions/${accountId}?limit=${limit}`);
  },

  // Depositar fondos (para testing/admin)
  deposit: async (accountId: string, amount: number): Promise<DepositResult> => {
    return http.post<DepositResult>('/bank/deposit', {
      accountId,
      amount
    });
  }
};
