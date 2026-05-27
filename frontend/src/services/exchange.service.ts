import type { ExchangeConversion } from '@/src/types/api';
import { http } from './http';

export const exchangeService = {
  convert: (from: string, to: string, amount: number) =>
    http.get<ExchangeConversion>(
      `/exchange/convert?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&amount=${encodeURIComponent(String(amount))}`
    )
};
