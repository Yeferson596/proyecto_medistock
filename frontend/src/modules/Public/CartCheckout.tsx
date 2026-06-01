import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag,
  Truck,
  CreditCard,
  CheckCircle2,
  Trash2,
  Minus,
  Plus,
  ChevronRight,
  ArrowLeft,
  Store,
  ShieldCheck
} from 'lucide-react';
import { Card, Badge, Button } from '@/src/components/ui/Base';
import { useStore } from '@/src/store';
import { Link } from 'react-router-dom';
import { Navbar } from './LandingPage';
import { cn } from '@/src/lib/utils';
import { BankPaymentComponent } from '@/src/components/bank/BankPaymentComponent';
import { MercadoPagoPayment } from '@/src/services/MercadoPagoPayment';
import { exchangeService } from '@/src/services/exchange.service';

const steps = [
  { id: 'cart', label: 'Carrito', icon: <ShoppingBag size={18} /> },
  { id: 'shipping', label: 'Entrega', icon: <Truck size={18} /> },
  { id: 'payment', label: 'Pago', icon: <CreditCard size={18} /> },
  { id: 'confirmation', label: 'Confirmación', icon: <CheckCircle2 size={18} /> },
];

export const CartCheckout = () => {
  const { cart, products, removeFromCart, addToCart, notify, createOrder, user } = useStore();
  const [step, setStep] = useState('cart');
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'mercadopago'>('mercadopago');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exchangeCurrency, setExchangeCurrency] = useState<'USD' | 'EUR'>('USD');
  const [exchangeResult, setExchangeResult] = useState<{ amount: number; rate: number; date: string } | null>(null);
  const [exchangeError, setExchangeError] = useState<string | null>(null);

  // Generar un ID de orden temporal para la pasarela
  const tempOrderId = React.useMemo(() => `MS-${Math.floor(Math.random() * 90000) + 10000}`, []);

  const handleUpdateQuantity = (productId: string, delta: number) => {
    addToCart(productId, delta);
  };

  const handleRemove = (productId: string, name: string) => {
    removeFromCart(productId);
    notify(`Eliminado: ${name}`, 'info');
  };

  const cartItems = cart.map(item => ({
    ...item,
    product: products.find(p => p.id === item.productId)!
  }));

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.19;
  const total = subtotal + tax;

  useEffect(() => {
    const loadConversion = async () => {
      if (total <= 0) {
        setExchangeResult(null);
        setExchangeError(null);
        return;
      }

      try {
        setExchangeError(null);
        const response = await exchangeService.convert('CLP', exchangeCurrency, total);
        setExchangeResult({ amount: response.result, rate: response.info.rate, date: response.date });
      } catch (error: any) {
        setExchangeResult(null);
        setExchangeError(error instanceof Error ? error.message : 'No fue posible obtener la conversión');
      }
    };

    loadConversion();
  }, [exchangeCurrency, total]);

  const handleConfirmOrder = async (paymentData?: { transactionId: string, method: string }) => {
    if (cartItems.length === 0 || isSubmitting) {
      notify('No hay productos para comprar', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await createOrder({
        customerId: user?.id ?? 'guest-web',
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price
        })),
        status: paymentData ? 'processing' : 'pending',
        type: 'B2C',
        metadata: paymentData ? {
          paymentMethod: paymentData.method,
          transactionId: paymentData.transactionId,
          paidAt: new Date().toISOString()
        } : undefined
      });
      notify('Pedido creado correctamente', 'success');
      setStep('confirmation');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'No se pudo crear el pedido', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Detectar retorno de Mercado Pago Mock
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const txId = params.get('preference_id') ?? params.get('pref_id') ?? params.get('preference-id');

    if (status) {
      if (status === 'approved' && step !== 'confirmation') {
        handleConfirmOrder({
          transactionId: txId ?? 'mp-mock-ref',
          method: 'mercadopago_simulation'
        });
      } else if (status === 'failure' || status === 'cancelled' || status === 'cancel') {
        notify('Pago cancelado o fallido', 'error');
      } else if (status === 'pending') {
        notify('Pago pendiente. Verifica en tu cuenta Mercado Pago.', 'info');
      } else {
        notify(`Estado de pago: ${status}`, 'info');
      }

      // Limpiar la URL para que no procese doble si recarga
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [step]);

  if (step === 'confirmation') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-20 px-6 text-center space-y-8">
           <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex justify-center"
           >
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 size={48} />
              </div>
           </motion.div>
           <div className="space-y-4">
             <h1 className="text-4xl font-bold text-slate-900">¡Pedido Exitoso!</h1>
             <p className="text-slate-500">Tu orden <span className="font-bold text-slate-900">#{tempOrderId}</span> ha sido recibida y está siendo procesada.</p>
           </div>
           <Card className="max-w-md mx-auto p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Entrega Estimada</span>
                <span className="font-bold">22 Abr, 2024</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Método de Envío</span>
                <span className="font-bold">Prioritario (24h)</span>
              </div>
           </Card>
           <div className="flex flex-wrap justify-center gap-4">
             <Link to="/"><Button variant="outline" size="lg">Volver al Inicio</Button></Link>
             <Button size="lg" className="gap-2">Seguir Pedido <ChevronRight size={18} /></Button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-12 px-6">
        {/* Progress Tracker */}
        <div className="flex items-center justify-between max-w-2xl mx-auto mb-10 md:mb-16 overflow-x-auto pb-4 px-2 no-scrollbar">
           {steps.slice(0, -1).map((s, i) => (
             <React.Fragment key={s.id}>
               <div className="flex flex-col items-center shrink-0 gap-2">
                  <div className={cn(
                    "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300",
                    step === s.id ? "bg-primary text-white scale-110 shadow-lg" : "bg-white text-slate-400 border border-slate-200"
                  )}>
                    {s.icon}
                  </div>
                  <span className={cn("text-[10px] font-bold uppercase tracking-widest hidden sm:block", step === s.id ? "text-primary" : "text-slate-400")}>{s.label}</span>
               </div>
               {i < steps.length - 2 && (
                 <div className="flex-grow h-[2px] mx-2 md:mx-6 bg-slate-200 min-w-[30px]" />
               )}
             </React.Fragment>
           ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 'cart' && (
                <motion.div 
                  key="cart"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <ShoppingBag className="text-primary" />
                    Tu Carrito de Compras
                  </h2>
                  
                  {cartItems.length === 0 ? (
                    <Card className="py-20 text-center space-y-6">
                        <div className="flex justify-center text-slate-200">
                           <ShoppingBag size={64} />
                        </div>
                        <p className="text-slate-500 font-medium">No tienes productos en el carrito aún.</p>
                        <Link to="/catalog"><Button>Explorar Productos</Button></Link>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <Card key={item.productId} className="flex gap-6 p-4">
                           <img src={item.product.image} className="w-24 h-24 rounded-lg object-cover" alt="" />
                           <div className="flex-grow space-y-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-bold text-slate-900">{item.product.name}</h3>
                                  <p className="text-xs text-slate-500">SKU: {item.product.sku}</p>
                                </div>
                                <span className="font-bold text-lg">${(item.product.price * item.quantity).toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                                  <button onClick={() => handleUpdateQuantity(item.productId, -1)} className="px-3 py-1 hover:bg-slate-100 transition-colors"><Minus size={14} /></button>
                                  <span className="px-4 py-1 border-x border-slate-200 font-bold text-sm">{item.quantity}</span>
                                  <button onClick={() => handleUpdateQuantity(item.productId, 1)} className="px-3 py-1 hover:bg-slate-100 transition-colors"><Plus size={14} /></button>
                                </div>
                                <button onClick={() => handleRemove(item.productId, item.product.name)} className="text-rose-500 hover:text-rose-600 p-2"><Trash2 size={18} /></button>
                              </div>
                           </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {step === 'shipping' && (
                <motion.div 
                   key="shipping"
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 20 }}
                   className="space-y-12"
                >
                   <div className="space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <Truck className="text-primary" />
                      Datos de Entrega
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                       <Card className="border-2 border-primary bg-blue-50/50 p-6 flex items-start gap-4 cursor-pointer">
                          <div className="p-2 bg-primary text-white rounded-lg"><Truck size={20} /></div>
                          <div>
                            <p className="font-bold text-slate-900">Despacho a Domicilio</p>
                            <p className="text-xs text-slate-500 mt-1">Recibe en 12-24 horas en tu ubicación.</p>
                          </div>
                       </Card>
                       <Card className="border border-slate-200 p-6 flex items-start gap-4 cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                          <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><Store size={20} /></div>
                          <div>
                            <p className="font-bold text-slate-900">Retiro en Tienda</p>
                            <p className="text-xs text-slate-500 mt-1">Retiro inmediato en sucursales.</p>
                          </div>
                       </Card>
                    </div>
                    
                    <form className="space-y-4">
                       <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Nombre Completo</label>
                            <input type="text" className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 focus:ring-2 focus:ring-primary focus:outline-none" defaultValue="Roberto Gómez" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">RUT / ID Cliente</label>
                             <input type="text" className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 focus:ring-2 focus:ring-primary focus:outline-none" defaultValue="12.345.678-9" />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Dirección de Envío</label>
                          <input type="text" className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 focus:ring-2 focus:ring-primary focus:outline-none" placeholder="Calle, Número, Departamento" />
                       </div>
                    </form>
                   </div>
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div
                   key="payment"
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="space-y-6"
                >
                   <h2 className="text-2xl font-bold flex items-center gap-3">
                    <CreditCard className="text-primary" />
                    Método de Pago
                  </h2>
                  
                  <div className="grid sm:grid-cols-2 gap-4 mb-8">
                    <Card 
                      onClick={() => setPaymentMethod('mercadopago')}
                      className={cn(
                        "p-6 cursor-pointer transition-all border-2 flex flex-col items-center gap-4 text-center group",
                        paymentMethod === 'mercadopago' 
                          ? "border-[#009EE3] bg-[#009EE3]/5 ring-4 ring-blue-100" 
                          : "border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <img 
                        src="https://www.mercadopago.com/instore/merchant/bundle/assets/custom-checkout/mp-logo.png" 
                        className="h-8 group-hover:scale-110 transition-transform" 
                        alt="Mercado Pago" 
                      />
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900">Mercado Pago</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Pasarela Real</p>
                      </div>
                    </Card>

                    <Card 
                      onClick={() => setPaymentMethod('bank')}
                      className={cn(
                        "p-6 cursor-pointer transition-all border-2 flex flex-col items-center gap-4 text-center group",
                        paymentMethod === 'bank' 
                          ? "border-primary bg-primary/5 ring-4 ring-primary/10" 
                          : "border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                        paymentMethod === 'bank' ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                      )}>
                        <Store size={24} />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900">Simulador Bancario</p>
                        <p className="text-[10px] text-amber-600 uppercase tracking-widest font-bold">Modo Pruebas</p>
                      </div>
                    </Card>
                  </div>

                  {paymentMethod === 'bank' ? (
                    <BankPaymentComponent
                      amount={total}
                      onSuccess={async (transactionId) => {
                        await handleConfirmOrder({
                          transactionId,
                          method: 'bank_simulation'
                        });
                        notify(`Pago procesado exitosamente. Ref: ${transactionId}`, 'success');
                      }}
                      onError={(error) => {
                        notify(error, 'error');
                      }}
                    />
                  ) : (
                    <MercadoPagoPayment items={cartItems} orderId={tempOrderId} onOpen={() => {}} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Checkout Summary */}
          <div className="space-y-6">
            <Card className="p-8 sticky top-28 bg-white shadow-xl shadow-slate-200/50">
              <h3 className="font-bold text-slate-800 text-xl mb-6">Resumen</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-slate-600">
                  <span>Productos ({cart.length})</span>
                  <span className="font-medium">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Envío</span>
                  <Badge variant="success">GRATIS</Badge>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Impuestos (19%)</span>
                  <span className="font-medium">${tax.toLocaleString()}</span>
                </div>
                <div className="h-px bg-slate-100 my-2" />
                <div className="flex justify-between text-xl font-black text-slate-900">
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {exchangeResult ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <span className="font-semibold">Total aproximado</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className={cn(
                            'px-3 py-1 rounded-full text-xs transition',
                            exchangeCurrency === 'USD'
                              ? 'bg-primary text-white'
                              : 'bg-white text-slate-500 border border-slate-200'
                          )}
                          onClick={() => setExchangeCurrency('USD')}
                        >
                          USD
                        </button>
                        <button
                          type="button"
                          className={cn(
                            'px-3 py-1 rounded-full text-xs transition',
                            exchangeCurrency === 'EUR'
                              ? 'bg-primary text-white'
                              : 'bg-white text-slate-500 border border-slate-200'
                          )}
                          onClick={() => setExchangeCurrency('EUR')}
                        >
                          EUR
                        </button>
                      </div>
                    </div>
                    <p className="text-base font-bold text-slate-900">{exchangeResult.amount.toFixed(2)} {exchangeCurrency}</p>
                    <p className="text-xs text-slate-500">Tasa: 1 CLP = {exchangeResult.rate.toFixed(5)} {exchangeCurrency}</p>
                    <p className="text-xs text-slate-400">Actualizado: {new Date(exchangeResult.date).toLocaleDateString()}</p>
                  </div>
                ) : exchangeError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{exchangeError}</div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Obteniendo conversión de divisas...</div>
                )}

                {step === 'cart' && (
                  <Button size="lg" className="w-full gap-2" onClick={() => setStep('shipping')} disabled={cart.length === 0}>
                    Continuar Pedido <ChevronRight size={18} />
                  </Button>
                )}
                {step === 'shipping' && (
                  <div className="space-y-4">
                    <Button size="lg" className="w-full gap-2" onClick={() => setStep('payment')}>
                      Siguiente: Pago <ChevronRight size={18} />
                    </Button>
                    <button className="w-full text-xs font-bold text-slate-400 flex items-center justify-center gap-1" onClick={() => setStep('cart')}>
                      <ArrowLeft size={12} /> Volver al Carrito
                    </button>
                  </div>
                )}
                {step === 'payment' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500 text-center italic px-4 leading-relaxed">
                      {paymentMethod === 'bank' 
                        ? "Usa el simulador para procesar la transacción ficticia." 
                        : "Haz clic en el botón de Mercado Pago para pagar de forma real."}
                    </p>
                    <button className="w-full text-xs font-bold text-slate-400 flex items-center justify-center gap-1" onClick={() => setStep('shipping')}>
                      <ArrowLeft size={12} /> Editar Datos Envío
                    </button>
                  </div>
                )}
              </div>
              
              <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                 <div className="flex items-center gap-3 text-xs text-slate-500">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span>Transacción protegida con estándar bancario AES-256</span>
                 </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
