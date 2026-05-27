import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ordersService } from '@/src/services/orders.service';
import { productsService } from '@/src/services/products.service';
import { usersService } from '@/src/services/users.service';

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  minStock: number;
  image: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'b2b_client' | 'customer';
  institution?: string;
}

export interface Order {
  id: string;
  customerId: string;
  items: { productId: string; quantity: number; price: number }[];
  status: 'pending' | 'paid' | 'processing' | 'preparing' | 'shipped' | 'delivered';
  total: number;
  createdAt: string;
  type: 'B2C' | 'B2B';
  metadata?: {
    paymentMethod?: string;
    transactionId?: string;
    paidAt?: string;
  };
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  cart: { productId: string; quantity: number }[];
  addToCart: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  products: Product[];
  setProducts: (products: Product[]) => void;
  orders: Order[];
  users: User[];
  isLoading: boolean;
  apiError: string | null;
  fetchProducts: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  createOrder: (payload: Omit<Order, 'id' | 'total' | 'createdAt'>) => Promise<void>;
  createProduct: (payload: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, payload: Partial<Omit<Product, 'id'>>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearNotification: () => void;
}

const fallbackProducts: Product[] = [
  {
    id: '1',
    name: 'Mascarilla Quirúrgica 3 Pliegues',
    sku: 'MSK-001',
    description: 'Caja de 50 unidades, alta filtración bacteriana.',
    price: 4990,
    category: 'Insumos Clínicos',
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
    category: 'Insumos Clínicos',
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
    category: 'Equipamiento Médico',
    stock: 8,
    minStock: 2,
    image: 'https://picsum.photos/seed/monitor/400/400'
  },
  {
    id: '4',
    name: 'Alcohol Gel 1L',
    sku: 'CLN-010',
    description: '70% alcohol, con dosificador.',
    price: 3500,
    category: 'Insumos Clínicos',
    stock: 150,
    minStock: 30,
    image: 'https://picsum.photos/seed/gel/400/400'
  }
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  cart: [],
  notification: null,
  notify: (message, type = 'success') => {
    set({ notification: { message, type } });
    setTimeout(() => set({ notification: null }), 3000);
  },
  clearNotification: () => set({ notification: null }),
  addToCart: (productId, quantity) => 
    set((state) => {
      const existing = state.cart.find(i => i.productId === productId);
      if (existing) {
        return {
          cart: state.cart.map(i => i.productId === productId ? { ...i, quantity: i.quantity + Math.max(-i.quantity, quantity) } : i)
        };
      }
      return { cart: [...state.cart, { productId, quantity }] };
    }),
  removeFromCart: (productId) => 
    set((state) => ({ cart: state.cart.filter(i => i.productId !== productId) })),
  clearCart: () => set({ cart: [] }),
  products: fallbackProducts,
  orders: [],
  users: [],
  isLoading: false,
  apiError: null,
  setProducts: (products) => set({ products }),
  fetchProducts: async () => {
    set({ isLoading: true, apiError: null });
    try {
      const products = await productsService.getAll();
      set({ products, isLoading: false });
    } catch (error) {
      set({
        products: fallbackProducts,
        isLoading: false,
        apiError: error instanceof Error ? error.message : 'No se pudo cargar productos'
      });
    }
  },
  fetchOrders: async () => {
    set({ isLoading: true, apiError: null });
    try {
      const orders = await ordersService.getAll();
      set({ orders, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        apiError: error instanceof Error ? error.message : 'No se pudo cargar pedidos'
      });
    }
  },
  fetchUsers: async () => {
    set({ isLoading: true, apiError: null });
    try {
      const users = await usersService.getAll();
      set({ users, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        apiError: error instanceof Error ? error.message : 'No se pudo cargar usuarios'
      });
    }
  },
  createOrder: async (payload) => {
    const created = await ordersService.create(payload);
    set((state) => ({ orders: [created, ...state.orders], cart: [] }));
  },
  createProduct: async (payload) => {
    const created = await productsService.create(payload);
    set((state) => ({ products: [created, ...state.products] }));
  },
  updateProduct: async (id, payload) => {
    const updated = await productsService.update(id, payload);
    set((state) => ({
      products: state.products.map((product) => (product.id === id ? updated : product))
    }));
  },
  deleteProduct: async (id) => {
    await productsService.remove(id);
    set((state) => ({ products: state.products.filter((product) => product.id !== id) }));
  }
    }),
    { name: 'medistock-storage' }
  )
);
