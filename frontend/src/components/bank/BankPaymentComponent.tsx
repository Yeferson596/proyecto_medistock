import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, CreditCard } from 'lucide-react';
import { bankService } from '@/src/services/bank.service';
import { Card, Button } from '@/src/components/ui/Base';

interface BankPaymentProps {
  amount: number;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
}

export const BankPaymentComponent: React.FC<BankPaymentProps> = ({ amount, onSuccess, onError }) => {
  const [accountId, setAccountId] = useState('ACC-001');
  const [isProcessing, setIsProcessing] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [showBalance, setShowBalance] = useState(false);

  const handleCheckBalance = async () => {
    try {
      setIsProcessing(true);
      const result = await bankService.getBalance(accountId);
      if (result.success) {
        setBalance(result.balance);
        setShowBalance(true);
      } else {
        onError('No se pudo obtener el saldo');
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Error consultando saldo');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessPayment = async () => {
    try {
      setIsProcessing(true);
      const result = await bankService.processPayment(
        accountId,
        amount,
        `Compra en MediStock`
      );

      if (result.success) {
        onSuccess(result.transactionId ?? '');
      } else {
        onError(result.message);
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Error procesando pago');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 border-2 border-primary bg-blue-50/50">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <CreditCard className="text-primary" />
            <div>
              <h3 className="font-bold">Pago con Cuenta Bancaria</h3>
              <p className="text-xs text-slate-500">API Mock para demostración</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                ID Cuenta Bancaria
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                disabled={isProcessing}
                className="w-full h-10 px-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-slate-50"
              >
                <option value="ACC-001">Cuenta 001 - $5,000</option>
                <option value="ACC-002">Cuenta 002 - $3,000</option>
                <option value="ACC-ADMIN">Cuenta Admin - $10,000</option>
              </select>
              <p className="text-xs text-slate-500">Selecciona una cuenta de prueba</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCheckBalance}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Consultando...
                </>
              ) : (
                'Consultar Saldo'
              )}
            </Button>

            {showBalance && balance !== null && (
              <Card className="p-4 bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Saldo Disponible</span>
                  <span className={`font-bold text-lg ${balance >= amount ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ${balance.toLocaleString()}
                  </span>
                </div>
                {balance < amount && (
                  <p className="text-xs text-rose-600 mt-2 flex items-center gap-2">
                    <AlertCircle size={14} />
                    Fondos insuficientes para esta compra
                  </p>
                )}
              </Card>
            )}
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>
              Esta es una API simulada para desarrollo. Los datos se reinician al reiniciar el servidor.
            </span>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handleProcessPayment}
            disabled={isProcessing || (balance !== null && balance < amount)}
          >
            {isProcessing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Pagar ${amount.toLocaleString()}
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};
