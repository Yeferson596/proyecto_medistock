import type { Order } from '@/src/types/api';
import { http } from './http';

export const ordersService = {
  getAll: () => http.get<Order[]>('/orders'),
  getById: (id: string) => http.get<Order>(`/orders/${id}`),
  create: (payload: Omit<Order, 'id' | 'total' | 'createdAt'> & Partial<Pick<Order, 'total' | 'createdAt'>>) =>
    http.post<Order>('/orders', payload),
  update: (id: string, payload: Partial<Omit<Order, 'id'>>) => http.put<Order>(`/orders/${id}`, payload),
  remove: (id: string) => http.delete<Order>(`/orders/${id}`)
};
