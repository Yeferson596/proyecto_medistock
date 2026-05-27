import React, { useState } from 'react';
import { mercadoPagoService } from '@/src/services/mercadopago.service';
import { Button, Card } from '@/src/components/ui/Base';
import { Loader2, ExternalLink } from 'lucide-react';

interface MercadoPagoPaymentProps {
  items: Array<{
    product: {
      name: string;
      price: number;
    };
    quantity: number;
  }>;
  orderId: string;
  onOpen: () => void;
}

export const MercadoPagoPayment: React.FC<MercadoPagoPaymentProps> = ({ items, orderId, onOpen }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const preference = await mercadoPagoService.createPreference(items, orderId);
      if (preference && preference.init_point) {
        console.log('Redirigiendo a:', preference.init_point);
        window.location.href = preference.init_point;
        onOpen();
      } else {
        throw new Error('La respuesta del servidor no contiene una URL de pago válida');
      }
    } catch (error) {
      console.error('Error al procesar pago:', error);
      alert(`Error de conexión: ${error instanceof Error ? error.message : 'No se pudo contactar al servidor'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 border-2 border-[#009EE3] bg-[#009EE3]/5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="https://www.mercadopago.com/instore/merchant/bundle/assets/custom-checkout/mp-logo.png" 
            alt="Mercado Pago" 
            className="h-8"
          />
        </div>
        <span className="text-[10px] font-bold text-[#009EE3] uppercase tracking-widest">Pago Seguro</span>
      </div>
      
      <p className="text-sm text-slate-600">
        Paga con tarjetas de crédito, débito o dinero en tu cuenta de Mercado Pago de forma rápida y segura.
      </p>

      <Button 
        onClick={handlePayment} 
        disabled={isLoading}
        className="w-full bg-[#009EE3] hover:bg-[#0086C3] text-white font-bold h-12 gap-2"
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <>Pagar con Mercado Pago <ExternalLink size={18} /></>
        )}
      </Button>
    </Card>
  );
};