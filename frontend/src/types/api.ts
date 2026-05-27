export type Role = 'admin' | 'operator' | 'b2b_client' | 'customer';

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  minStock: number;
  image: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  institution?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  status: 'pending' | 'paid' | 'processing' | 'preparing' | 'shipped' | 'delivered';
  total: number;
  createdAt: string;
  type: 'B2C' | 'B2B';
  metadata?: {
    paymentMethod?: string;
    transactionId?: string;
    paidAt?: string;
  };
}

// Bank API Types
export interface BankTransaction {
  id: string;
  type: 'debit' | 'credit';
  amount: number;
  description: string;
  timestamp: string;
  status: 'success' | 'failed';
}

export interface BankAccount {
  accountId: string;
  balance: number;
  currency: string;
}

export interface PaymentResult {
  success: boolean;
  message: string;
  transactionId?: string;
  newBalance?: number;
  amount?: number;
  availableBalance?: number;
  requiredAmount?: number;
}

export interface TransactionHistory {
  accountId: string;
  transactions: BankTransaction[];
  total: number;
}

export interface ExchangeConversion {
  success: boolean;
  query: {
    from: string;
    to: string;
    amount: number;
  };
  info: {
    rate: number;
  };
  result: number;
  date: string;
}
