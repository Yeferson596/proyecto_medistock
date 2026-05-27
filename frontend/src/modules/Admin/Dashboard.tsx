import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Box,
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard,
  ClipboardList,
  UserCheck,
  DollarSign,
  Settings,
  ChevronLeft,
  Search,
  Bell,
  Menu,
  Filter,
  PlusCircle,
  Activity
} from 'lucide-react';
import { Card, Badge, Button } from '@/src/components/ui/Base';
import { cn } from '@/src/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Link } from 'react-router-dom';
import { useStore } from '@/src/store';
import { BankAdminPanel } from '@/src/components/bank/BankAdminPanel';

const data = [
  { name: 'Lun', sales: 4000, orders: 240 },
  { name: 'Mar', sales: 3000, orders: 198 },
  { name: 'Mie', sales: 2000, orders: 980 },
  { name: 'Jue', sales: 2780, orders: 390 },
  { name: 'Vie', sales: 1890, orders: 480 },
  { name: 'Sab', sales: 2390, orders: 380 },
  { name: 'Dom', sales: 3490, orders: 430 },
];

const StatCard = ({ title, value, trend, icon: Icon, color }: any) => (
  <Card hover className="relative overflow-hidden group">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold mt-1 text-slate-900">{value}</h3>
      </div>
      <div className={cn("p-2 rounded-lg text-white", color)}>
        <Icon size={20} />
      </div>
    </div>
    <div className="mt-4 flex items-center gap-1">
      {trend > 0 ? (
        <span className="text-emerald-500 flex items-center text-xs font-bold">
          <ArrowUpRight size={14} className="mr-1" />
          +{trend}%
        </span>
      ) : (
        <span className="text-rose-500 flex items-center text-xs font-bold">
          <ArrowDownRight size={14} className="mr-1" />
          {trend}%
        </span>
      )}
      <span className="text-slate-400 text-xs">vs. mes anterior</span>
    </div>
    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
       <motion.div 
        initial={{ width: 0 }}
        animate={{ width: '70%' }}
        className={cn("h-full", color.replace('bg-', 'bg-opacity-50 ')) } 
       />
    </div>
  </Card>
);

const Sidebar = () => (
  <aside className="w-64 bg-slate-900 h-screen sticky top-0 flex flex-col text-slate-400 p-4">
    <div className="flex items-center gap-2 text-white mb-10 px-2 py-4">
      <Package size={24} className="text-primary" />
      <span className="text-xl font-bold tracking-tighter">MEDISTOCK <span className="text-[10px] font-normal bg-primary/20 text-primary px-1.5 rounded">ADMIN</span></span>
    </div>

    <nav className="flex-grow space-y-1">
      <Link to="/admin" className="flex items-center gap-3 bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium">
        <LayoutDashboard size={18} />
        Dashboard
      </Link>
      <Link to="/admin/inventory" className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
        <Box size={18} />
        Inventario
      </Link>
      <Link to="/admin/orders" className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
        <ClipboardList size={18} />
        Pedidos
      </Link>
      <Link to="/admin/users" className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
        <UserCheck size={18} />
        Usuarios
      </Link>
      <Link to="/admin/finance" className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
        <DollarSign size={18} />
        Finanzas
      </Link>
    </nav>

    <div className="pt-4 border-t border-white/10 space-y-1">
      <button className="flex w-full items-center gap-3 px-4 py-2 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
        <Settings size={18} />
        Configuración
      </button>
      <Link to="/" className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
        <ChevronLeft size={18} />
        Volver a la tienda
      </Link>
    </div>
  </aside>
);

export const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'inventory' | 'orders' | 'users' | 'finance' | 'bank' | 'settings'>('dashboard');
  const {
    products,
    orders,
    users,
    fetchProducts,
    fetchOrders,
    fetchUsers,
    updateProduct,
    deleteProduct,
    notify
  } = useStore();

  React.useEffect(() => {
    void fetchProducts();
    void fetchOrders();
    void fetchUsers();
  }, [fetchOrders, fetchProducts, fetchUsers]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'inventory', label: 'Inventario', icon: <Box size={18} /> },
    { id: 'orders', label: 'Pedidos', icon: <ClipboardList size={18} /> },
    { id: 'users', label: 'Usuarios', icon: <UserCheck size={18} /> },
    { id: 'finance', label: 'Finanzas', icon: <DollarSign size={18} /> },
    { id: 'bank', label: 'Banco', icon: <DollarSign size={18} /> },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col text-slate-400 p-4 shrink-0 h-screen sticky top-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between mb-10 px-2 py-4">
          <div className="flex items-center gap-2 text-white">
            <Package size={24} className="text-primary" />
            <span className="text-xl font-bold tracking-tighter uppercase">MEDISTOCK <span className="text-[10px] font-normal bg-primary/20 text-primary px-1.5 rounded">ADMIN</span></span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <ChevronLeft size={20} />
          </button>
        </div>

        <nav className="flex-grow space-y-1">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all",
                activeTab === item.id 
                  ? "bg-primary/10 text-primary shadow-sm" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-4 border-t border-white/10 space-y-1">
          <button 
            onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
            className={cn(
              "flex w-full items-center gap-3 px-4 py-2.5 rounded-lg transition-all",
              activeTab === 'settings' 
                ? "bg-primary/10 text-primary" 
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <Settings size={18} />
            Configuración
          </button>
          <Link to="/" className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
            <ChevronLeft size={18} />
            Volver a la tienda
          </Link>
        </div>
      </aside>

      <main className="flex-grow flex flex-col min-w-0">
        <header className="h-16 sm:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all active:scale-90">
              <Menu size={20} />
            </button>
            <h1 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight truncate">
              {activeTab === 'dashboard' ? 'Dashboard' : navItems.find(i => i.id === activeTab)?.label || 'Configuración'}
            </h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center bg-slate-100 rounded-xl px-4 py-2 border border-slate-100 focus-within:ring-2 ring-primary/20 transition-all">
              <Search size={16} className="text-slate-400 mr-2" />
              <input type="text" placeholder="Buscar..." className="bg-transparent border-none text-sm focus:outline-none w-24 md:w-64 font-medium" />
            </div>
            <button className="relative text-slate-400 hover:text-slate-900 p-2 sm:p-3 hover:bg-slate-50 rounded-xl transition-all">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 bg-rose-500 w-2 h-2 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-200 ml-1">
              <img src="https://i.pravatar.cc/100?u=admin" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-slate-200 shadow-sm" alt="Admin" />
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 flex-grow">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' ? (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                className="space-y-6 md:space-y-8"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <StatCard title="Ventas del Mes" value="$12.45M" trend={12} icon={TrendingUp} color="bg-primary" />
                  <StatCard title="Pedidos Pendientes" value="28" trend={-4} icon={ShoppingCart} color="bg-amber-500" />
                  <StatCard title="Stock Crítico" value="5" trend={2} icon={Package} color="bg-rose-500" />
                  <StatCard title="Tiempo Despacho" value="4.2 hrs" trend={-8} icon={TrendingUp} color="bg-emerald-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2 p-4 md:p-6 overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="font-bold text-slate-800 tracking-tight text-sm uppercase text-slate-500">Rendimiento de Ventas (30 Días)</h3>
                      <select className="text-[10px] font-bold border-none bg-slate-100 rounded-lg px-2 py-1.5 focus:ring-0">
                        <option>Ultimos 30 días</option>
                        <option>Ultimos 7 días</option>
                      </select>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                          <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0066CC" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#0066CC" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                          <Tooltip />
                          <Area type="monotone" dataKey="sales" stroke="#0066CC" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <Card className="p-4 md:p-6">
                    <h3 className="font-bold text-slate-800 mb-6 tracking-tight text-sm uppercase text-slate-500">Pedidos Recientes</h3>
                    <div className="space-y-4">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 cursor-pointer group">
                          <div className="w-10 h-10 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-primary font-bold text-sm group-hover:bg-primary/10 transition-colors">
                            #{1020 + i}
                          </div>
                          <div className="flex-grow min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">Clínica Alemana</p>
                            <p className="text-[10px] text-slate-500 truncate">2 items • Hace {i*5} mins</p>
                          </div>
                          <Badge variant={i % 2 === 0 ? 'success' : 'warning'}>{i % 2 === 0 ? 'Pagado' : 'Pendiente'}</Badge>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <Button variant="ghost" className="w-full text-xs font-bold text-primary hover:bg-primary/5">Ver todos los pedidos</Button>
                    </div>
                  </Card>
                </div>
              </motion.div>
            ) : activeTab === 'inventory' ? (
              <motion.div 
                key="inventory"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="relative w-full sm:w-96">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Buscar por SKU, Categoría o Nombre..." className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 ring-primary/20 outline-none transition-all" />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" className="flex-1 sm:flex-none gap-2 rounded-xl h-11"><Filter size={16}/> Filtrar</Button>
                    <Button variant="primary" className="flex-1 sm:flex-none gap-2 rounded-xl h-11 shadow-lg shadow-primary/20"><Package size={16}/> Nuevo Producto</Button>
                  </div>
                </div>

                <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Producto</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bodega</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Precio</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {products.map((product, i) => (
                          <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden">
                                  <img src={product.image} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900 leading-none">{product.name}</p>
                                  <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase tracking-tighter">{product.sku}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge variant="info" className="bg-blue-50 text-blue-600 border-none font-bold text-[10px]">
                                {i % 2 === 0 ? 'RM - Quilicura' : 'Zona Norte'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-900">{product.stock} uds</p>
                                <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={cn(
                                      'h-full rounded-full',
                                      product.stock <= product.minStock ? 'bg-rose-500 w-1/4' : 'bg-emerald-500 w-3/4'
                                    )}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-slate-900">${product.price.toLocaleString()}</p>
                            </td>
                            <td className="px-6 py-4">
                              {product.stock <= product.minStock ? <Badge variant="warning">Crítico</Badge> : <Badge variant="success">OK</Badge>}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-primary font-bold hover:bg-primary/5"
                                  onClick={async () => {
                                    await updateProduct(product.id, { stock: product.stock + 10 });
                                    notify('Stock actualizado', 'success');
                                  }}
                                >
                                  Editar
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-rose-500 font-bold hover:bg-rose-50"
                                  onClick={async () => {
                                    await deleteProduct(product.id);
                                    notify('Producto eliminado', 'info');
                                  }}
                                >
                                  Eliminar
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </motion.div>
            ) : activeTab === 'orders' ? (
              <motion.div 
                key="orders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="relative w-full sm:w-96">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Buscar por ID, Cliente..." className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 ring-primary/20 outline-none transition-all" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 rounded-xl h-11"><Filter size={16}/> Filtros Avanzados</Button>
                  </div>
                </div>

                <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Pedido</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {orders.map((order, i) => (
                          <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900 text-sm">{order.id}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-primary">
                                  {i % 2 === 0 ? 'CA' : 'HT'}
                                </div>
                                <span className="text-sm font-medium text-slate-700">{i % 2 === 0 ? 'Clínica Alemana' : 'Hospital del Trabajador'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-500 font-medium">{new Date(order.createdAt).toLocaleDateString('es-CL')}</td>
                            <td className="px-6 py-4 font-bold text-slate-900 text-sm">${order.total.toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <Badge variant={order.status === 'pending' ? 'warning' : 'success'}>
                                {order.status === 'pending' ? 'Pendiente' : 'Completado'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button variant="ghost" size="sm" className="text-primary font-bold">Detalles</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </motion.div>
            ) : activeTab === 'users' ? (
              <motion.div 
                key="users"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="relative w-full sm:w-96">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Buscar por Nombre o Email..." className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 ring-primary/20 outline-none transition-all" />
                  </div>
                  <Button variant="primary" className="gap-2 rounded-xl h-11 shadow-lg shadow-primary/20"><UserCheck size={16}/> Nuevo Usuario</Button>
                </div>

                <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuario</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rol</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ubicación</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Último Acceso</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {users.map((user, i) => (
                          <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                                   <img src={`https://i.pravatar.cc/150?u=${user.id}`} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-slate-900 truncate tracking-tight">{user.name}</p>
                                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-bold text-slate-600 px-2.5 py-1 bg-slate-100 rounded-full uppercase tracking-tighter">
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                               <p className="text-xs text-slate-600 font-medium">{user.institution ?? 'Santiago, CL'}</p>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-400">Hace {i*2} horas</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />
                                <span className="text-[10px] font-bold text-emerald-600 uppercase">Activo</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-primary font-bold">Gestionar</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </motion.div>
            ) : activeTab === 'finance' ? (
              <motion.div 
                key="finance"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <Card className="p-6 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-none shadow-xl shadow-emerald-200">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Ingresos Totales</p>
                      <h3 className="text-3xl font-black mt-1">$45.8M</h3>
                      <div className="mt-4 flex items-center gap-2 text-xs bg-white/20 w-fit px-2 py-1 rounded-full">
                         <TrendingUp size={12} /> +15.5% vs mes anterior
                      </div>
                   </Card>
                   <Card className="p-6 bg-white border-slate-200 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gastos Operativos</p>
                      <h3 className="text-3xl font-black text-slate-900 mt-1">$12.2M</h3>
                      <p className="text-xs text-rose-500 font-bold mt-4 flex items-center gap-1">
                         <TrendingUp size={12} className="rotate-90" /> +2.1% incremento
                      </p>
                   </Card>
                   <Card className="p-6 bg-white border-slate-200 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Margen Neto</p>
                      <h3 className="text-3xl font-black text-slate-900 mt-1">26.4%</h3>
                      <div className="mt-4 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full bg-primary w-[26.4%]" />
                      </div>
                   </Card>
                </div>

                <Card className="p-6">
                   <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <Activity size={18} className="text-primary" /> Historial de Transacciones
                   </h4>
                   <div className="space-y-4">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-emerald-600">
                                 <PlusCircle size={20} />
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-slate-900">Venta de Insumos - Hospital #{i*23}</p>
                                 <p className="text-[10px] text-slate-500">Factura #F-9821{i} • 1{i} Abr, 2024</p>
                              </div>
                           </div>
                           <div className="text-right flex flex-col items-end gap-2">
                              <p className="text-sm font-black text-slate-900">+ ${(i*450000).toLocaleString()}</p>
                              <div className="flex gap-2">
                                <Badge variant="success" className="text-[9px] px-1.5 py-0">Completado</Badge>
                                <button className="text-[10px] text-primary font-bold hover:underline">Auditar</button>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </Card>
              </motion.div>
            ) : activeTab === 'bank' ? (
              <motion.div
                key="bank"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                      <DollarSign className="text-primary" />
                      Gestión Bancaria
                    </h1>
                    <p className="text-slate-500 mt-1">Administra cuentas, saldos y transacciones</p>
                  </div>
                </div>

                <BankAdminPanel />
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-6"
              >
                <div className="relative">
                   <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                   <div className="relative bg-white p-12 rounded-full shadow-xl border border-slate-100 text-slate-300">
                     {activeTab === 'settings' 
                       ? <Settings size={64} /> 
                       : React.cloneElement(navItems.find(i => i.id === activeTab)!.icon as any, { size: 64 })
                     }
                   </div>
                </div>
                <div className="space-y-3">
                   <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                     Módulo de {activeTab === 'settings' ? 'Configuración' : navItems.find(i => i.id === activeTab)?.label}
                   </h2>
                   <p className="text-slate-500 text-sm max-w-[320px] mx-auto">
                     Esta sección está siendo optimizada para ofrecer una mejor experiencia de gestión administrativa. Estará disponible en la versión 2.0.
                   </p>
                </div>
                <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 transition-all rounded-xl" onClick={() => setActiveTab('dashboard')}>
                   Regresar al Dashboard
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
