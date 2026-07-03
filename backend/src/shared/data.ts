import type { Order, Product, User } from './types';

export const productsDb: Product[] = [
  {
    id: '1',
    name: 'Mascarilla Quirurgica 3 Pliegues',
    sku: 'MSK-001',
    description: 'Caja de 50 unidades, alta filtracion bacteriana.',
    price: 4990,
    category: 'Insumos Clinicos',
    stock: 500,
    minStock: 100,
    image: 'https://picsum.photos/seed/mask/400/400'
  },
  {
    id: '2',
    name: 'Guantes de Nitrilo S',
    sku: 'GLV-001',
    description: 'Sin polvo, color azul, caja 100 unidades.',
    price: 8500,
    category: 'Insumos Clinicos',
    stock: 20,
    minStock: 50,
    image: 'https://picsum.photos/seed/gloves/400/400'
  },
  {
    id: '3',
    name: 'Monitor de Signos Vitales',
    sku: 'EQP-005',
    description: 'Pantalla 12 pulgadas, incluye sensores.',
    price: 850000,
    category: 'Equipamiento Medico',
    stock: 8,
    minStock: 2,
    image: 'https://picsum.photos/seed/monitor/400/400'
  }
];

export const usersDb: User[] = [
  { id: 'u-1', name: 'Admin Demo', email: 'admin@medistock.cl', role: 'admin' },
  { id: 'u-2', name: 'Operador Demo', email: 'operador@medistock.cl', role: 'operator' },
  { id: 'u-3', name: 'Comprador B2B', email: 'compras@clinicaregional.cl', role: 'b2b_client', institution: 'Hospital Clinico Regional' }
];

export const ordersDb: Order[] = [
  {
    id: 'o-1',
    customerId: 'u-3',
    items: [{ productId: '1', quantity: 15, price: 4990 }],
    status: 'pending',
    total: 74850,
    createdAt: new Date().toISOString(),
    type: 'B2B'
  }
];
