import type { User } from '@/src/types/api';
import { http } from './http';

export const usersService = {
  getAll: () => http.get<User[]>('/users'),
  getById: (id: string) => http.get<User>(`/users/${id}`),
  create: (payload: Omit<User, 'id'>) => http.post<User>('/users', payload),
  update: (id: string, payload: Partial<Omit<User, 'id'>>) => http.put<User>(`/users/${id}`, payload),
  remove: (id: string) => http.delete<User>(`/users/${id}`)
};
