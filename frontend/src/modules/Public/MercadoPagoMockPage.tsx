import React, { useState } from 'react';
import { Card, Button } from '@/src/components/ui/Base';
import { CreditCard, ShieldCheck, Lock, ChevronRight } from 'lucide-react';

export const MercadoPagoMockPage = () => {
  const [step, setStep] = useState(1);
  const params = new URLSearchParams(window.location.search);
  const prefId = params.get('pref_id');

  const handleFinalize = () => {
    // Simulamos el retorno exitoso a la tienda usando el origen actual
    const origin = window.location.origin || 'http://localhost:3001';
    window.location.href = `${origin}/cart?status=approved&preference_id=${prefId}`;
  };

  const handleCancel = () => {
    // Simulamos cancelar el pago y retornar al carrito
    const origin = window.location.origin || 'http://localhost:3001';
    window.location.href = `${origin}/cart?status=cancelled&preference_id=${prefId}`;
  };

  return (
    <div className="min-h-screen bg-[#ebebeb] flex flex-col items-center py-12 px-4 font-sans">
      <div className="w-full max-w-[400px] space-y-4">
        {/* Header Simulado */}
        <div className="flex justify-between items-center px-2">
          <img src="https://www.mercadopago.com/instore/merchant/bundle/assets/custom-checkout/mp-logo.png" className="h-6" alt="MP" />
          <div className="text-[10px] text-gray-500 flex items-center gap-1">
            <ShieldCheck size={12} /> Compra Protegida
          </div>
        </div>

        <Card className="p-0 overflow-hidden border-none shadow-md">
          <div className="bg-white p-6 space-y-6">
            {step === 1 ? (
              <>
                <h2 className="text-lg font-semibold text-gray-800">¿Cómo quieres pagar?</h2>
                <div className="space-y-3">
                  <div onClick={() => setStep(2)} className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <CreditCard size={20} />
                      </div>
                      <span className="text-sm font-medium">Nueva tarjeta de crédito</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg opacity-50 grayscale italic">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                        <Lock size={20} />
                      </div>
                      <span className="text-sm font-medium">Efectivo (No disponible en mock)</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-gray-800">Ingresa los datos de tu tarjeta</h2>
                <div className="space-y-4">
                  <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 uppercase">Número de tarjeta</label>
                      <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-md text-lg tracking-widest" maxLength={16} />
                    </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 uppercase">Vencimiento</label>
                      <input type="text" placeholder="MM/AA" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 uppercase">Cód. Seguridad</label>
                      <input type="text" placeholder="123" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md" />
                    </div>
                  </div>
                  <Button onClick={handleFinalize} variant="primary" size="lg" className="w-full mt-6">
                    Pagar
                  </Button>
                  <div className="flex gap-2">
                    <Button onClick={() => setStep(1)} variant="ghost" size="md" className="flex-1">Volver</Button>
                    <Button onClick={handleCancel} variant="danger" size="md" className="flex-1">Cancelar</Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>

        <p className="text-[10px] text-gray-400 text-center px-4">
          Esta es una pantalla de simulación para el proyecto MediStock. No se realizará ningún cargo real ni se guardarán datos sensibles.
        </p>
      </div>
    </div>
  );
};