import { 
  Building2, 
  History, 
  TrendingUp, 
  FileText, 
  Download, 
  Plus, 
  Search,
  LayoutDashboard,
  ShoppingCart,
  PieChart as PieChartIcon,
  HelpCircle,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Card, Badge, Button } from '@/src/components/ui/Base';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Cell,
  Pie
} from 'recharts';
import { cn } from '@/src/lib/utils';
import { Link } from 'react-router-dom';
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

const consumptionData = [
  { name: 'Insumos Quirúrgicos', value: 450 },
  { name: 'Medicamentos G1', value: 300 },
  { name: 'Equipamiento', value: 300 },
  { name: 'Ropa Médica', value: 200 },
];

const COLORS = ['#0066CC', '#00B4D8', '#10B981', '#F59E0B'];

export const B2BPortal = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'catalog' | 'history' | 'billing' | 'analytics'>('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, section: 'Principal' },
    { id: 'catalog', label: 'Catálogo Institucional', icon: <ShoppingCart size={18} />, section: 'Principal' },
    { id: 'history', label: 'Historial de Pedidos', icon: <History size={18} />, section: 'Operaciones' },
    { id: 'billing', label: 'Facturación', icon: <FileText size={18} />, section: 'Operaciones' },
    { id: 'analytics', label: 'Analítica de Gasto', icon: <TrendingUp size={18} />, section: 'Operaciones' },
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
        "fixed inset-y-0 left-0 z-50 w-64 lg:w-72 bg-[#003366] text-white/70 transform transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col p-6 shadow-2xl lg:shadow-none shrink-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <div className="flex items-center gap-3 text-white">
            <div className="bg-white/10 p-2 rounded-lg text-primary shadow-inner">
              <Building2 size={24} className="text-[#FFB800]" />
            </div>
            <span className="text-xl font-bold tracking-tighter">MEDISTOCK <span className="text-[#FFB800] text-xs align-top">B2B</span></span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/50 hover:text-white">
            <X size={18} />
          </button>
        </div>
    
        <nav className="flex-grow space-y-8">
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-2 mb-3">Principal</p>
            <div className="space-y-1">
              {navItems.filter(i => i.section === 'Principal').map(item => (
                <button 
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium",
                    activeTab === item.id 
                      ? "bg-white/10 text-white shadow-lg shadow-black/10" 
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest pl-2 mb-3">Operaciones</p>
            <div className="space-y-1">
              {navItems.filter(i => i.section === 'Operaciones').map(item => (
                <button 
                  key={item.id}
                  onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium",
                    activeTab === item.id 
                      ? "bg-white/10 text-white shadow-lg shadow-black/10" 
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </nav>
    
        <div className="pt-6 border-t border-white/10 space-y-2">
           <button className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-white/5 hover:text-white rounded-xl transition-colors">
            <HelpCircle size={18} />
            Soporte Gold
          </button>
          <Link to="/" className="flex w-full items-center gap-3 px-4 py-2.5 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors">
            <LogOut size={18} />
            Cerrar Sesión
          </Link>
        </div>
      </aside>

      <main className="flex-grow flex flex-col min-w-0">
        <header className="h-16 sm:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all active:scale-90">
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-3 sm:gap-4">
               <Badge variant="info" className="px-3 py-1">Hospital Clínico Regional</Badge>
               <span className="text-slate-200 font-thin text-xl">/</span>
               <p className="text-xs sm:text-sm font-bold text-slate-400">{navItems.find(i => i.id === activeTab)?.label}</p>
            </div>
            <div className="sm:hidden flex flex-col">
               <span className="text-xs font-bold text-slate-900 leading-none">H. Clínico</span>
               <span className="text-[10px] text-slate-400">{navItems.find(i => i.id === activeTab)?.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
             <Button variant="outline" size="sm" className="gap-2 border-slate-200 hidden md:flex">
                <Download size={16} />
                Lista Precios
             </Button>
             <Button size="sm" className="gap-2 bg-[#003366] hover:bg-[#002244] px-4 sm:px-6 rounded-xl">
               <Plus size={16} />
               <span className="hidden xs:inline">Nuevo Pedido</span>
               <span className="xs:hidden">Nuevo</span>
             </Button>
          </div>
        </header>

        <div className="p-4 md:p-8 flex-grow">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 md:space-y-8"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                  <Card className="border-l-4 border-l-[#FFB800] p-6 space-y-2">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Gasto Mensual</p>
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-bold">$18.25M</span>
                      <span className="text-emerald-500 text-xs font-bold leading-none mb-1">+4.2%</span>
                    </div>
                  </Card>
                  <Card className="p-6 space-y-2">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Ahorro Anual</p>
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-bold">$2.4M</span>
                      <Badge variant="success">Gold</Badge>
                    </div>
                  </Card>
                  <Card className="p-6 space-y-2">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Pedidos Activos</p>
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-bold">12</span>
                      <span className="text-slate-400 text-xs">8 en camino</span>
                    </div>
                  </Card>
                  <Card className="p-6 space-y-2">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Alerta de Stock</p>
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-bold text-rose-500">5 items</span>
                      <button className="text-[10px] font-bold text-[#003366] hover:underline">Surtir</button>
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <Card className="p-4 md:p-8 bg-white overflow-hidden">
                    <h3 className="font-bold text-slate-800 mb-8 border-b border-slate-100 pb-4">Consumo por Departamento</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={consumptionData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical stroke="#E2E8F0" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{ fontSize: 10, fill: '#64748B' }} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#0066CC" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                  <Card className="p-4 md:p-8 bg-white overflow-hidden">
                    <h3 className="font-bold text-slate-800 mb-8 border-b border-slate-100 pb-4">Distribución de Gasto</h3>
                    <div className="h-[300px] flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={consumptionData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {consumptionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab !== 'dashboard' && ( activeTab === 'catalog' ? (
              <motion.div 
                key="catalog"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Catálogo Institucional</h2>
                  <div className="flex gap-2">
                    <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 flex items-center gap-2">
                      <Search size={16} className="text-slate-400" />
                      <input type="text" placeholder="Buscar insumos..." className="bg-transparent border-none focus:outline-none text-sm" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1,2,3,4,5,6].map(i => (
                    <Card key={i} className="p-0 overflow-hidden group">
                      <div className="aspect-[16/10] bg-slate-100 relative">
                         <img src={`https://picsum.photos/seed/med-${i}/400/300`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                         <Badge variant="info" className="absolute top-4 right-4">Lote #{i*100}</Badge>
                      </div>
                      <div className="p-5 space-y-3">
                        <h4 className="font-bold text-slate-900">Insumo Quirúrgico {i}</h4>
                        <p className="text-sm text-slate-500">Insumo de alta precisión certificado bajo normas ISO.</p>
                        <div className="flex items-center justify-between pt-2">
                          <span className="font-bold text-primary">$45.000</span>
                          <Button size="sm">Añadir</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            ) : activeTab === 'history' ? (
              <motion.div 
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Historial de Pedidos</h2>
                <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Pedido</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Items</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {[1,2,3,4,5,6].map(i => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">#ORD-{2024}-{i*100}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">2{i} Abril, 2024</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{i*3} productos</td>
                          <td className="px-6 py-4 font-bold text-slate-900">${(i*120000).toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                             <Badge variant={i % 3 === 0 ? 'warning' : 'success'}>
                                {i % 3 === 0 ? 'En Tránsito' : 'Entregado'}
                             </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </motion.div>
            ) : activeTab === 'billing' ? (
              <motion.div 
                key="billing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Estado de Cuenta y Facturación</h2>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Card className="flex items-center gap-4 px-4 py-2 border-slate-200 shadow-sm bg-white">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Deuda Vencida</p>
                        <p className="text-sm font-black text-rose-500">$0</p>
                      </div>
                      <div className="w-px h-8 bg-slate-100" />
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Por Vencer</p>
                        <p className="text-sm font-black text-slate-900">$12,450,000</p>
                      </div>
                    </Card>
                  </div>
                </div>

                <Card className="p-0 overflow-hidden border-slate-200 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nº Factura</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Emisión</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vencimiento</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Monto</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {[1,2,3,4].map(i => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900 font-mono">FE-2024-00{i}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{i+5} Abr, 2024</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{i+20} Abr, 2024</td>
                            <td className="px-6 py-4 font-bold text-slate-900">${(i*5200000).toLocaleString()}</td>
                            <td className="px-6 py-4">
                               <Badge variant={i === 1 ? 'success' : 'warning'}>
                                  {i === 1 ? 'Pagada' : 'Pendiente'}
                               </Badge>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <Button variant="ghost" size="sm" className="text-primary gap-1">
                                 <Download size={14} /> PDF
                               </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </motion.div>
            ) : activeTab === 'analytics' ? (
              <motion.div 
                key="analytics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Analítica de Gasto Institucional</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <Card className="p-8">
                      <h4 className="font-bold mb-4">Gasto Mensual Acumulado</h4>
                      <div className="h-48 bg-slate-50 flex items-center justify-center rounded-xl border border-dashed border-slate-200">
                         <TrendingUp className="text-slate-300" size={48} />
                      </div>
                      <p className="text-center text-xs text-slate-400 mt-4 italic">Cargando datos de tiempo real...</p>
                   </Card>
                   <Card className="p-8">
                      <h4 className="font-bold mb-4">Eficiencia en Adquisiciones</h4>
                      <div className="h-48 bg-slate-50 flex items-center justify-center rounded-xl border border-dashed border-slate-200">
                         <PieChartIcon className="text-slate-300" size={48} />
                      </div>
                      <p className="text-center text-xs text-slate-400 mt-4 italic">Cargando modelos predictivos...</p>
                   </Card>
                </div>
              </motion.div>
            ) : null ) }
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
