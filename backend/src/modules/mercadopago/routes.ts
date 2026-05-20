import { Router } from 'express';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import 'dotenv/config';

// Inicializa el cliente con la variable de entorno
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

export const mercadoPagoRouter = Router();

const APP_FRONTEND_URL = process.env.APP_URL || 'http://localhost:3000';
const DEFAULT_CURRENCY = process.env.MP_CURRENCY || 'CLP';

interface MPItem {
  title: string;
  unit_price: number;
  quantity: number;
  currency_id?: string;
}

mercadoPagoRouter.post('/create-preference', async (req, res) => {
  try {
    const { items, external_reference }: { items: MPItem[], external_reference: string } = req.body;

    if (!process.env.MP_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN === "Tu_Clave_De_Acceso_De_Mercado_Pago") {
      console.error('[MercadoPago] ERROR: No se ha configurado un Access Token válido en el archivo .env');
      return res.status(500).json({ message: 'Configuración de pago incompleta' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      console.error('[MercadoPago] ERROR: No se recibieron items válidos en la solicitud');
      return res.status(400).json({ message: 'No se recibieron items de pago', detail: 'items needed' });
    }

    const normalizedItems = items
      .map((item) => ({
        title: String(item.title || 'Producto Médico'),
        unit_price: Number(item.unit_price),
        quantity: Number(item.quantity),
        currency_id: item.currency_id || DEFAULT_CURRENCY,
      }))
      .filter((item) => item.title && item.unit_price > 0 && item.quantity > 0);

    if (normalizedItems.length === 0) {
      console.error('[MercadoPago] ERROR: Los items recibidos no son válidos', items);
      return res.status(400).json({ message: 'Los items de pago no son válidos', detail: 'invalid_items' });
    }

    const preference = new Preference(client);
    
    const backUrls = {
      success: `${APP_FRONTEND_URL}/cart?status=approved`,
      failure: `${APP_FRONTEND_URL}/cart?status=failure`,
      pending: `${APP_FRONTEND_URL}/cart?status=pending`,
    };

    const preferenceBody = {
      items: normalizedItems,
      back_urls: backUrls,
      external_reference: external_reference,
    } as any;

    if (APP_FRONTEND_URL.startsWith('https://')) {
      preferenceBody.auto_return = 'approved';
    }

    const response = await preference.create({ body: preferenceBody });

    res.json({
      id: response.id,
      init_point: response.init_point, // URL oficial de Mercado Pago (Sandbox o Producción)
    });
  } catch (error) {
    console.error('--- ERROR MERCADO PAGO ---');
    console.error(error);
    res.status(500).json({ 
      message: 'Error al conectar con Mercado Pago',
      detail: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});