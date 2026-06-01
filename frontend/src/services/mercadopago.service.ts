import { http } from './http';

interface PreferenceResponse {
  id: string; // ID de la preferencia para el Checkout Pro
  init_point: string; // URL para redirección
}

export const mercadoPagoService = {
  createPreference: async (items: any[], orderId: string) => {
    try {
      // Llamada a tu backend para generar la preferencia de MP
      const response = await http.post<PreferenceResponse>('/mercadopago/create-preference', {
        items: items
          .filter((i) => i.product)
          .map((item) => ({
            title: item.product?.name || 'Producto Médico',
            unit_price: Number(item.product?.price ?? 0),
            quantity: Number(item.quantity ?? 1),
            currency_id: 'CLP',
          })),
        external_reference: orderId,
      });
      return response as PreferenceResponse;
    } catch (error) {
      console.error('MercadoPago Service Error:', error);
      throw error;
    }
  }
};