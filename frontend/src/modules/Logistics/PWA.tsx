import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft,
  ChevronRight,
  Search,
  Barcode, 
  Truck,
  Camera,
  History,
  MessageSquare,
  ClipboardList,
  LayoutDashboard,
  Package,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { Card, Badge, Button } from '@/src/components/ui/Base';
import { StockIndicator, UrgencyBadge } from '@/src/components/medistock/Indicators';
import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

export const LogisticsPWA = () => {
  const [activeTab, setActiveTab] = React.useState<'home' | 'tasks' | 'camera' | 'route' | 'chat'>('home');

  const navItems = [
    { id: 'home', icon: <LayoutDashboard size={20} className="sm:w-[22px] sm:h-[22px]" />, label: 'Inicio' },
    { id: 'tasks', icon: <ClipboardList size={20} className="sm:w-[22px] sm:h-[22px]" />, label: 'Tareas' },
    { id: 'camera', icon: <Camera size={26} className="sm:w-[30px] sm:h-[30px]" />, label: 'Scanner', isCenter: true },
    { id: 'route', icon: <Truck size={20} className="sm:w-[22px] sm:h-[22px]" />, label: 'Ruta' },
    { id: 'chat', icon: <MessageSquare size={20} className="sm:w-[22px] sm:h-[22px]" />, label: 'Chat' },
  ];

  return (
  <div className="min-h-screen bg-slate-950 flex justify-center font-sans">
    <div className="w-full max-w-md bg-slate-900 text-white relative flex flex-col shadow-2xl border-x border-white/5">
      {/* Header PWA */}
      <header className="p-6 bg-slate-800/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg shadow-lg shadow-primary/20">
              <Package size={20} />
            </div>
            <span className="font-bold tracking-tight text-white/90 uppercase text-xs">MEDI-LOGISTICS</span>
          </Link>
          <div className="flex items-center gap-2">
             <Badge variant="success">En Turno</Badge>
             <button className="relative">
               <img src="https://i.pravatar.cc/150?u=operator" className="w-8 h-8 rounded-full border border-white/10" alt="Operator" />
               <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-800 rounded-full" />
             </button>
          </div>
        </div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Hola, Roberto 👋</h1>
        <p className="text-slate-400 text-xs mt-1 font-medium italic">Operador de Zona Norte • 8 tareas pendientes</p>
      </header>

      <main className="p-6 space-y-6 flex-grow pb-28">
        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Search & Scanner */}
              <div className="flex gap-2">
                <div className="flex-grow relative text-slate-500 hover:text-white transition-colors">
                   <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" />
                   <input type="text" placeholder="Buscar por SKU..." className="w-full bg-slate-800 border-white/5 rounded-2xl h-14 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary focus:bg-slate-700/50 transition-all placeholder:text-slate-600" />
                </div>
                <Button className="h-14 w-14 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 shadow-xl shadow-white/5" onClick={() => setActiveTab('camera')}>
                  <Barcode size={28} />
                </Button>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-slate-800 to-slate-800/50 border-white/5 p-5 space-y-2">
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">PEDIDOS</p>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-bold">5/8</span>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-emerald-500 font-bold">62%</span>
                      <div className="w-12 h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
                         <div className="h-full bg-emerald-500 w-[62%]" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="bg-gradient-to-br from-slate-800 to-slate-800/50 border-white/5 p-5 space-y-2">
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">EFICIENCIA</p>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-bold">12m</span>
                    <Badge variant="info">Gold</Badge>
                  </div>
                </Card>
              </div>

              {/* Task List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-lg text-white/90">Pedidos Prioritarios</h2>
                  <button className="text-xs font-bold text-primary hover:underline" onClick={() => setActiveTab('route')}>Ver Mapa</button>
                </div>
                
                <div className="space-y-4">
                  {[
                    { id: 1, name: 'Sondas Foley x50', urgency: 'critical', loc: '01-A' },
                    { id: 2, name: 'Kit Quirúrgico General', urgency: 'high', loc: '03-B' },
                    { id: 3, name: 'Mascarillas N95 Caja', urgency: 'medium', loc: '05-C' }
                  ].map((task, i) => (
                    <Card key={task.id} className="bg-slate-800/60 border-white/5 p-5 relative group active:scale-[0.98] transition-all hover:bg-slate-800 hover:border-primary/20 backdrop-blur-sm shadow-xl shadow-black/20">
                      <div className="flex items-start justify-between mb-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">ID PEDIDO: #{9870 + task.id}</p>
                          <h3 className="font-bold text-white group-hover:text-primary transition-colors">{task.name}</h3>
                        </div>
                        <UrgencyBadge level={task.urgency as any} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5 text-xs">
                        <div className="flex items-center gap-2 text-primary font-bold">
                          <MapPin size={14} />
                          <span className="truncate">PASILLO {task.loc}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <History size={14} />
                          <span>Límite: 15:{i}0</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Package size={14} />
                          <span className="text-xs font-bold tracking-tight">8 items</span>
                        </div>
                        <Button size="sm" className="rounded-xl h-10 px-5 gap-2 font-bold shadow-lg shadow-primary/20" onClick={() => setActiveTab('tasks')}>
                          Picar <ChevronRight size={16} />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6"
            >
              <div className="relative">
                 <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                 <div className="relative bg-slate-800 p-8 rounded-full text-slate-500">
                   {React.cloneElement(navItems.find(i => i.id === activeTab)!.icon as any, { size: 48 })}
                 </div>
              </div>
              <div className="space-y-2">
                 <h2 className="text-xl font-bold text-white">{navItems.find(i => i.id === activeTab)?.label}</h2>
                 <p className="text-slate-400 text-sm max-w-[200px] mx-auto">Esta función estará disponible en la próxima actualización del terminal.</p>
              </div>
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/5 active:scale-95" onClick={() => setActiveTab('home')}>Volver al Panel</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Nav PWA */}
      <nav className="fixed bottom-6 left-4 right-4 max-w-md mx-auto z-50">
        <div className="bg-slate-800/95 backdrop-blur-2xl border border-white/10 rounded-[32px] px-6 py-3 flex items-center justify-between shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
           
           {navItems.map(item => item.isCenter ? (
             <div key={item.id} className="relative -mt-12">
               <div className="absolute inset-0 bg-primary/40 rounded-full blur-xl animate-pulse" />
               <button 
                onClick={() => setActiveTab(item.id as any)}
                className={cn(
                  "relative w-14 h-14 bg-primary rounded-full shadow-2xl flex items-center justify-center border-4 border-slate-900 active:scale-90 transition-all text-white",
                  activeTab === item.id ? "bg-white text-primary" : ""
                )}
               >
                 {item.icon}
               </button>
             </div>
           ) : (
             <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all active:scale-75",
                activeTab === item.id ? "text-primary" : "text-slate-500"
              )}
             >
               {item.icon}
               <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
             </button>
           ))}
        </div>
      </nav>
    </div>
  </div>
  );
};
