import { Router } from 'express';
import fetch from 'node-fetch';

export const exchangeRouter = Router();

// GET /convert?from=USD&to=ARS&amount=100
exchangeRouter.get('/convert', async (req, res, next) => {
  try {
    const from = String(req.query.from ?? 'USD');
    const to = String(req.query.to ?? 'ARS');
    const amount = Number(req.query.amount ?? 1);

    const url = `https://api.exchangerate.host/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${encodeURIComponent(String(amount))}`;
    const r = await fetch(url);
    if (!r.ok) return res.status(502).json({ message: 'Error al consultar la API externa' });
    const data = await r.json();
    return res.json(data);
  } catch (error) {
    next(error);
  }
});
