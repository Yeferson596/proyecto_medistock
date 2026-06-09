import React, { useState, useEffect } from 'react';
import { Loader2, TrendingDown, TrendingUp, Plus, RefreshCw } from 'lucide-react';
import { bankService } from '@/src/services/bank.service';
import { Card, Button, Badge } from '@/src/components/ui/Base';
import { BankTransaction, BankAccount } from '@/src/types/api';

export const BankAdminPanel: React.FC = () => {
  const [accountId, setAccountId] = useState('ACC-ADMIN');
  const [account, setAccount] = useState<BankAccount | null>(null);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [depositAmount, setDepositAmount] = useState('1000');
  const [isDepositing, setIsDepositing] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [balanceResult, transactionsResult] = await Promise.all([
        bankService.getBalance(accountId),
        bankService.getTransactions(accountId, 20)
      ]);

      if (balanceResult.success) {
        setAccount({
          accountId: balanceResult.accountId,
          balance: balanceResult.balance,
          currency: balanceResult.currency
        });
      }

      if (transactionsResult.success) {
        setTransactions(transactionsResult.transactions);
      }
    } catch (error) {
      console.error('Error loading bank data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [accountId]);

  const handleDeposit = async () => {
    try {
      setIsDepositing(true);
      const amount = parseFloat(depositAmount);
      if (isNaN(amount) || amount <= 0) {
        alert('Ingresa un monto válido');
        return;
      }

      const result = await bankService.deposit(accountId, amount);
      if (result.success) {
        setDepositAmount('1000');
        await loadData();
      }
    } catch (error) {
      console.error('Error depositing:', error);
    } finally {
      setIsDepositing(false);
    }
  };

  const totalDebits = transactions
    .filter(t => t.type === 'debit' && t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCredits = transactions
    .filter(t => t.type === 'credit' && t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-8">
      {/* Account Selection and Refresh */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600">Seleccionar Cuenta</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              disabled={isLoading}
              className="w-full h-10 px-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-slate-50"
            >
              <option value="ACC-001">Cuenta 001</option>
              <option value="ACC-002">Cuenta 002</option>
              <option value="ACC-ADMIN">Cuenta Admin</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={loadData}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Actualizar
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Balance Card */}
      {account && (
        <Card className="p-8 bg-gradient-to-br from-primary to-blue-700 text-white">
          <div className="space-y-2">
            <p className="text-blue-100 text-sm">Saldo Disponible</p>
            <h2 className="text-4xl font-black">${account.balance.toLocaleString()}</h2>
            <p className="text-blue-100 text-xs mt-4">Cuenta: {account.accountId}</p>
          </div>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold">Total Ingresos</p>
              <p className="text-2xl font-black text-emerald-600">${totalCredits.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center">
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold">Total Egresos</p>
              <p className="text-2xl font-black text-rose-600">${totalDebits.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Deposit Section */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Plus size={20} className="text-primary" />
          Depositar Fondos
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600">Monto a Depositar</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                disabled={isDepositing}
                className="flex-1 h-10 px-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-slate-50"
                placeholder="1000"
                min="1"
              />
              <Button
                onClick={handleDeposit}
                disabled={isDepositing}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isDepositing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Plus size={16} />
                    Depositar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Transactions */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Historial de Transacciones (Últimas 20)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b-2 border-slate-200">
              <tr className="text-slate-600 text-xs uppercase font-bold">
                <th className="text-left py-3 px-2">ID Transacción</th>
                <th className="text-left py-3 px-2">Tipo</th>
                <th className="text-right py-3 px-2">Monto</th>
                <th className="text-left py-3 px-2">Descripción</th>
                <th className="text-left py-3 px-2">Fecha</th>
                <th className="text-left py-3 px-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Sin transacciones
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-2 font-mono text-xs text-slate-600">{tx.id.substring(0, 12)}...</td>
                    <td className="py-3 px-2">
                      <Badge
                        variant={tx.type === 'credit' ? 'success' : 'default'}
                        className="text-xs"
                      >
                        {tx.type === 'credit' ? 'Ingreso' : 'Egreso'}
                      </Badge>
                    </td>
                    <td className={`py-3 px-2 font-bold text-right ${
                      tx.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {tx.type === 'credit' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-slate-600">{tx.description}</td>
                    <td className="py-3 px-2 text-slate-500 text-xs">
                      {new Date(tx.timestamp).toLocaleDateString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-2">
                      <Badge
                        variant={tx.status === 'success' ? 'success' : 'danger'}
                        className="text-xs"
                      >
                        {tx.status === 'success' ? 'Exitosa' : 'Fallida'}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
