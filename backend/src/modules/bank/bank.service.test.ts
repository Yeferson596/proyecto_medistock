import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as repo from './bank.repository';
import { bankService } from './service';

vi.mock('./bank.repository', () => ({
  getAccount: vi.fn(),
  createAccount: vi.fn(),
  updateBalance: vi.fn(),
  insertTransaction: vi.fn(),
  getTransactions: vi.fn()
}));

describe('Bank Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getBalance crea cuenta si no existe', async () => {
    vi.mocked(repo.getAccount).mockResolvedValue({ rowCount: 0, rows: [] } as any);
    vi.mocked(repo.createAccount).mockResolvedValue({ rows: [{ account_id: 'ACC001', balance: 5000, currency: 'USD' }], rowCount: 1 } as any);

    const balance = await bankService.getBalance('ACC001');

    expect(balance).toBe(5000);
    expect(repo.createAccount).toHaveBeenCalledWith('ACC001', 5000);
  });

  it('processPayment falla si monto es cero o negativo', async () => {
    await expect(bankService.processPayment('ACC001', 0, 'Pago')).rejects.toThrow('amount debe ser mayor a 0');
  });

  it('deposit falla si monto es cero o negativo', async () => {
    await expect(bankService.deposit('ACC001', 0)).rejects.toThrow('amount debe ser mayor a 0');
  });
});