import type { Product } from '@/src/types/api';
import { http } from './http';

export const productsService = {
  getAll: () => http.get<Product[]>('/products'),
  getById: (id: string) => http.get<Product>(`/products/${id}`),
  create: (payload: Omit<Product, 'id'>) => http.post<Product>('/products', payload),
  update: (id: string, payload: Partial<Omit<Product, 'id'>>) => http.put<Product>(`/products/${id}`, payload),
  remove: (id: string) => http.delete<Product>(`/products/${id}`)
};
