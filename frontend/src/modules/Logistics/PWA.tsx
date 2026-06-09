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
  CheckCircle2,
  PencilLine
} from 'lucide-react';
import { Card, Badge, Button, Modal } from '@/src/components/ui/Base';
import { StockIndicator, UrgencyBadge } from '@/src/components/medistock/Indicators';
import { LogisticsScanner } from './Scanner';
import { useStore } from '@/src/store';
import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

export const LogisticsPWA = () => {
  const [activeTab, setActiveTab] = React.useState<'home' | 'tasks' | 'camera' | 'route' | 'chat'>('home');
  const [pickupTasks, setPickupTasks] = React.useState([
    { id: 1, name: 'Sondas Foley x50', urgency: 'critical' as const, loc: '01-A', due: '15:00', items: 8, progress: 35 },
    { id: 2, name: 'Kit Quirúrgico General', urgency: 'high' as const, loc: '03-B', due: '15:20', items: 5, progress: 60 },
    { id: 3, name: 'Mascarillas N95 Caja', urgency: 'medium' as const, loc: '05-C', due: '15:40', items: 12, progress: 20 },
    { id: 4, name: 'Guantes de Nitrilo S', urgency: 'high' as const, loc: '02-D', due: '16:00', items: 4, progress: 75 }
  ]);
  const { user } = useStore();
  const [editingTaskId, setEditingTaskId] = React.useState<number | null>(null);
  const [editingTask, setEditingTask] = React.useState<{ id: number; name: string; urgency: 'critical' | 'high' | 'medium'; loc: string; due: string; items: number; progress: number } | null>(null);

  const mapQuery = React.useCallback((locationLabel: string) => encodeURIComponent(`${locationLabel} MediStock`), []);
  const googleMapsUrl = React.useCallback(
    (locationLabel: string) => `https://www.google.com/maps/search/?api=1&query=${mapQuery(locationLabel)}`,
    [mapQuery]
  );

  const activeRouteTask = React.useMemo(() => pickupTasks[0], [pickupTasks]);

  const openEditTask = (taskId: number) => {
    const task = pickupTasks.find((item) => item.id === taskId);
    if (!task) return;
    setEditingTaskId(taskId);
    setEditingTask({ ...task });
  };

  const saveTaskEdit = () => {
    if (!editingTask) return;

    setPickupTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === editingTask.id ? { ...task, ...editingTask } : task))
    );
    setEditingTaskId(null);
    setEditingTask(null);
  };

  const navItems = React.useMemo(
    () => [
      { id: 'home', icon: <LayoutDashboard size={20} className="sm:w-[22px] sm:h-[22px]" />, label: 'Inicio' },
      { id: 'tasks', icon: <ClipboardList size={20} className="sm:w-[22px] sm:h-[22px]" />, label: 'Tareas' },
      { id: 'camera', icon: <Camera size={26} className="sm:w-[30px] sm:h-[30px]" />, label: 'Scanner', isCenter: true },
      { id: 'route', icon: <Truck size={20} className="sm:w-[22px] sm:h-[22px]" />, label: 'Ruta' },
      { id: 'chat', icon: <MessageSquare size={20} className="sm:w-[22px] sm:h-[22px]" />, label: 'Chat' },
    ],
    []
  );

  return (
  <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.20),_transparent_34%),linear-gradient(180deg,#0b1120_0%,#08101d_100%)] flex justify-center font-sans">
    <div className="w-full max-w-md bg-slate-900/90 text-white relative flex flex-col shadow-2xl border-x border-white/10 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-40 right-0 h-36 w-36 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>
      {/* Header PWA */}
      <header className="relative z-10 p-5 sm:p-6 bg-slate-900/75 backdrop-blur-2xl border-b border-white/10 sticky top-0">
        <div className="flex items-center justify-between mb-5">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-2xl shadow-lg shadow-primary/25 ring-1 ring-white/10">
              <Package size={20} />
            </div>
            <div className="leading-tight">
              <span className="block font-black tracking-[0.24em] text-white/90 uppercase text-[10px]">MEDI-LOGISTICS</span>
              <span className="block text-[11px] text-slate-400">Panel operativo</span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
             <Badge variant="success">En Turno</Badge>
             <Link to="/profile" className="relative inline-flex rounded-full ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400/50">
               <img src={`https://i.pravatar.cc/150?u=${user?.id ?? 'operator'}`} className="w-8 h-8 rounded-full border border-white/10" alt="Perfil" />
               <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-800 rounded-full" />
             </Link>
          </div>
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-300">Hola, {user?.name ?? 'Roberto'} 👋</h1>
          <p className="text-slate-400 text-xs sm:text-sm font-medium italic">Operador de Zona Norte • 8 tareas pendientes</p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-[10px] sm:text-xs">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-xl">
            <p className="text-slate-400 uppercase tracking-[0.18em] font-bold">Ruta</p>
            <p className="mt-1 font-black text-white">12 paradas</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-xl">
            <p className="text-slate-400 uppercase tracking-[0.18em] font-bold">Tiempo</p>
            <p className="mt-1 font-black text-white">2h 14m</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-xl">
            <p className="text-slate-400 uppercase tracking-[0.18em] font-bold">Stock</p>
            <p className="mt-1 font-black text-emerald-400">98%</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 p-4 sm:p-6 space-y-6 flex-grow pb-36 sm:pb-32">
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
              <div className="flex gap-3 items-stretch">
                <div className="flex-grow relative text-slate-500 transition-colors">
                   <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input type="text" placeholder="Buscar por SKU..." className="w-full bg-slate-800/80 border border-white/10 rounded-3xl h-14 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary/40 focus:bg-slate-700/70 transition-all placeholder:text-slate-500 shadow-lg shadow-black/10" />
                </div>
                <Button className="h-14 w-14 rounded-3xl bg-gradient-to-br from-white to-cyan-50 text-slate-900 hover:from-cyan-50 hover:to-white shadow-xl shadow-cyan-500/10 ring-4 ring-white/5" onClick={() => setActiveTab('camera')}>
                  <Barcode size={22} />
                </Button>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Card className="relative overflow-hidden border border-white/10 bg-gradient-to-br from-slate-800 via-slate-800/90 to-slate-900 p-5 space-y-2 shadow-xl shadow-black/20">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Pedidos</p>
                  <div className="flex items-end justify-between gap-3">
                    <span className="text-3xl font-black tracking-tight">5/8</span>
                    <div className="flex flex-col items-end min-w-[64px]">
                      <span className="text-[10px] text-emerald-400 font-bold">62%</span>
                      <div className="w-full h-1.5 bg-slate-700/80 rounded-full mt-2 overflow-hidden">
                         <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 w-[62%] rounded-full" />
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="relative overflow-hidden border border-white/10 bg-gradient-to-br from-slate-800 via-slate-800/90 to-slate-900 p-5 space-y-2 shadow-xl shadow-black/20">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Eficiencia</p>
                  <div className="flex items-end justify-between gap-3">
                    <span className="text-3xl font-black tracking-tight">12m</span>
                    <Badge variant="info" className="shadow-sm">Gold</Badge>
                  </div>
                </Card>
              </div>

              {/* Task List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-black text-xl text-white tracking-tight">Pedidos Prioritarios</h2>
                  <button className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-bold text-cyan-200 transition-colors hover:bg-cyan-400/20 hover:text-cyan-100" onClick={() => setActiveTab('route')}>Ver Mapa</button>
                </div>
                
                <div className="space-y-4">
                  {[
                    { id: 1, name: 'Sondas Foley x50', urgency: 'critical', loc: '01-A' },
                    { id: 2, name: 'Kit Quirúrgico General', urgency: 'high', loc: '03-B' },
                    { id: 3, name: 'Mascarillas N95 Caja', urgency: 'medium', loc: '05-C' }
                  ].map((task, i) => (
                    <Card key={task.id} className="relative overflow-hidden bg-white/5 border border-white/10 p-5 rounded-[28px] group active:scale-[0.98] transition-all hover:bg-white/8 hover:border-primary/25 backdrop-blur-xl shadow-xl shadow-black/25">
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      <div className="flex items-start justify-between mb-4 gap-3">
                        <div className="space-y-1 min-w-0">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">ID PEDIDO: #{9870 + task.id}</p>
                          <h3 className="font-bold text-white group-hover:text-cyan-300 transition-colors text-lg leading-tight">{task.name}</h3>
                        </div>
                        <UrgencyBadge level={task.urgency as any} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/10 text-xs">
                        <div className="flex items-center gap-2 text-cyan-300 font-bold">
                          <MapPin size={14} />
                          <span className="truncate">PASILLO {task.loc}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 justify-end sm:justify-start">
                          <History size={14} />
                          <span>Límite: 15:{i}0</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Package size={14} />
                          <span className="text-xs font-bold tracking-tight">8 items</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full h-10 px-4 gap-2 border-white/10 text-white hover:bg-white/10"
                            onClick={() => openEditTask(task.id)}
                          >
                            <PencilLine size={16} />
                            Editar
                          </Button>
                          <Button size="sm" className="rounded-full h-10 px-5 gap-2 font-bold shadow-lg shadow-cyan-500/15 bg-cyan-400 text-slate-950 hover:bg-cyan-300" onClick={() => setActiveTab('route')}>
                          Picar <ChevronRight size={16} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'route' ? (
            <motion.div
              key="route"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-5"
            >
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Ruta activa</p>
                  <h2 className="text-2xl font-black tracking-tight text-white">Google Maps</h2>
                </div>
                <Badge variant="success">En vivo</Badge>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs text-slate-300">El mapa se abre en otra pestaña para no perder esta vista.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 rounded-full border-white/10 text-white hover:bg-white/10"
                  onClick={() => setActiveTab('tasks')}
                >
                  Volver a tareas
                </Button>
              </div>

              <Card className="overflow-hidden border border-white/10 bg-white/5 rounded-[28px] shadow-xl shadow-black/20">
                <div className="h-52 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.18),_transparent_55%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.88))] flex items-center justify-center px-6 text-center">
                  <div className="space-y-3">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/6 border border-white/10 shadow-inner">
                      <MapPin size={28} className="text-cyan-300" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Destino seleccionado</p>
                      <h3 className="mt-1 text-xl font-black text-white">{activeRouteTask.name}</h3>
                      <p className="mt-1 text-sm text-slate-300">{activeRouteTask.loc} · vence {activeRouteTask.due}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Ubicación cargada</p>
                      <p className="text-sm font-semibold text-white">{activeRouteTask.loc}</p>
                    </div>
                    <Badge variant="info">PASILLO</Badge>
                  </div>
                  <a
                    href={googleMapsUrl(activeRouteTask.loc)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-3 font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition-transform active:scale-[0.98]"
                  >
                    Abrir en Google Maps
                    <ChevronRight size={16} />
                  </a>
                </div>
              </Card>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Paradas de la ruta</h3>
                  <span className="text-[10px] font-bold text-slate-400">Se actualizan con la ubicación editada</span>
                </div>

                {pickupTasks.map((task, index) => (
                  <Card key={task.id} className="border border-white/10 bg-white/5 rounded-[22px] p-4 shadow-lg shadow-black/15">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Parada {index + 1}</p>
                        <h4 className="text-base font-bold text-white leading-tight">{task.name}</h4>
                      </div>
                      <UrgencyBadge level={task.urgency as any} />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs">
                      <div className="flex items-center gap-2 text-cyan-300 font-bold">
                        <MapPin size={14} />
                        <span>{task.loc}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-9 rounded-full border-white/10 text-white hover:bg-white/10" onClick={() => setActiveTab('tasks')}>
                          Ver tarea
                        </Button>
                        <a
                          href={googleMapsUrl(task.loc)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-9 items-center rounded-full bg-white px-3 font-bold text-slate-950 hover:bg-slate-100"
                        >
                          Maps
                        </a>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Button variant="outline" className="w-full rounded-full border-white/10 text-white hover:bg-white/10 active:scale-95" onClick={() => setActiveTab('home')}>
                Volver al Panel
              </Button>
            </motion.div>
          ) : activeTab === 'camera' ? (
            <motion.div
              key="camera"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-5"
            >
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Lector activo</p>
                  <h2 className="text-2xl font-black tracking-tight text-white">Scanner</h2>
                </div>
                <Badge variant="info">Listo</Badge>
              </div>

              <LogisticsScanner pickupTasks={pickupTasks} onGoToRoute={() => setActiveTab('route')} />

              <Button variant="outline" className="w-full rounded-full border-white/10 text-white hover:bg-white/10 active:scale-95" onClick={() => setActiveTab('home')}>
                Volver al Panel
              </Button>
            </motion.div>
          ) : activeTab === 'tasks' ? (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-5"
            >
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Preparación activa</p>
                  <h2 className="text-2xl font-black tracking-tight text-white">Tareas de picking</h2>
                </div>
                <Badge variant="info" className="shrink-0">{pickupTasks.length} en cola</Badge>
              </div>

              <Card className="border border-white/10 bg-white/5 p-4 rounded-[28px] shadow-xl shadow-black/20">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Estado del turno</p>
                    <p className="text-sm text-slate-300 mt-1">1 tarea crítica, 2 altas y 1 media</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Avance</p>
                    <p className="text-xl font-black text-cyan-300">48%</p>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-slate-800/80 rounded-full overflow-hidden">
                  <div className="h-full w-[48%] rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" />
                </div>
              </Card>

              <div className="space-y-3">
                {pickupTasks.map((task) => (
                  <Card key={task.id} className="relative overflow-hidden bg-white/5 border border-white/10 p-4 rounded-[24px] shadow-lg shadow-black/15">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Pedido #{9870 + task.id}</p>
                        <h3 className="text-base font-bold text-white leading-tight">{task.name}</h3>
                      </div>
                      <UrgencyBadge level={task.urgency as any} />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs border-y border-white/10 py-4">
                      <div className="space-y-1">
                        <p className="text-slate-500 font-bold uppercase tracking-[0.18em]">Ubicación</p>
                        <div className="flex items-center gap-2 text-cyan-300 font-bold">
                          <MapPin size={14} />
                          <span>PASILLO {task.loc}</span>
                        </div>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-slate-500 font-bold uppercase tracking-[0.18em]">Vence</p>
                        <div className="flex items-center justify-end gap-2 text-slate-300 font-bold">
                          <History size={14} />
                          <span>{task.due}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <Package size={14} />
                        <span className="font-bold tracking-tight">{task.items} items</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:block w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${task.progress}%` }} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{task.progress}%</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Button variant="outline" className="w-full rounded-2xl border-white/10 text-white hover:bg-white/5 active:scale-95" onClick={() => setActiveTab('home')}>
                Volver al Panel
              </Button>
            </motion.div>
          ) : (
              <motion.div 
              key={activeTab}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center min-h-[420px] text-center space-y-6 px-4"
            >
              <div className="relative">
                 <div className="absolute inset-0 bg-primary/25 blur-3xl rounded-full" />
                 <div className="relative bg-slate-800/90 border border-white/10 p-8 rounded-full text-slate-500 shadow-2xl shadow-black/20">
                   {React.cloneElement(navItems.find(i => i.id === activeTab)!.icon as any, { size: 48 })}
                 </div>
              </div>
              <div className="space-y-2">
                 <h2 className="text-2xl font-black text-white tracking-tight">{navItems.find(i => i.id === activeTab)?.label}</h2>
                 <p className="text-slate-400 text-sm max-w-[200px] mx-auto">Esta función estará disponible en la próxima actualización del terminal.</p>
              </div>
              <Button variant="outline" className="border-white/10 text-white hover:bg-white/10 active:scale-95 rounded-full px-6" onClick={() => setActiveTab('home')}>Volver al Panel</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Modal
        isOpen={editingTaskId !== null && editingTask !== null}
        onClose={() => {
          setEditingTaskId(null);
          setEditingTask(null);
        }}
        title="Editar tarea"
      >
        {editingTask && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Nombre</label>
              <input
                type="text"
                value={editingTask.name}
                onChange={(event) => setEditingTask({ ...editingTask, name: event.target.value })}
                className="w-full h-11 rounded-xl border border-slate-200 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Ubicación</label>
                <input
                  type="text"
                  value={editingTask.loc}
                  onChange={(event) => setEditingTask({ ...editingTask, loc: event.target.value })}
                  className="w-full h-11 rounded-xl border border-slate-200 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Vence</label>
                <input
                  type="time"
                  value={editingTask.due}
                  onChange={(event) => setEditingTask({ ...editingTask, due: event.target.value })}
                  className="w-full h-11 rounded-xl border border-slate-200 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Items</label>
                <input
                  type="number"
                  min={1}
                  value={editingTask.items}
                  onChange={(event) => setEditingTask({ ...editingTask, items: Number(event.target.value) })}
                  className="w-full h-11 rounded-xl border border-slate-200 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Progreso</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={editingTask.progress}
                  onChange={(event) => setEditingTask({ ...editingTask, progress: Number(event.target.value) })}
                  className="w-full h-11 rounded-xl border border-slate-200 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Prioridad</label>
              <select
                value={editingTask.urgency}
                onChange={(event) => setEditingTask({ ...editingTask, urgency: event.target.value as 'critical' | 'high' | 'medium' })}
                className="w-full h-11 rounded-xl border border-slate-200 px-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="critical">Crítica</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 rounded-full border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => {
                setEditingTaskId(null);
                setEditingTask(null);
              }}>
                Cancelar
              </Button>
              <Button className="flex-1 rounded-full bg-cyan-400 text-slate-950 hover:bg-cyan-300" onClick={saveTaskEdit}>
                Guardar cambios
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Bottom Nav PWA */}
      <nav className="fixed bottom-4 left-3 right-3 max-w-md mx-auto z-50">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[28px] px-4 py-3 flex items-center justify-between shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
           
           {navItems.map(item => item.isCenter ? (
             <div key={item.id} className="relative -mt-8 flex flex-1 justify-center">
               <div className="absolute inset-0 bg-cyan-400/25 rounded-full blur-2xl animate-pulse" />
               <button 
                onClick={() => setActiveTab(item.id as any)}
                aria-label="Abrir scanner"
                className={cn(
                  "relative flex h-16 w-16 items-center justify-center rounded-full border-[6px] border-slate-950 shadow-[0_18px_40px_rgba(34,211,238,0.28)] transition-all active:scale-90",
                  activeTab === item.id
                    ? "bg-white text-cyan-500"
                    : "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                )}
               >
                 {React.cloneElement(item.icon as any, { size: 28 })}
               </button>
             </div>
           ) : (
             <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all active:scale-75 px-3 py-1.5 rounded-full",
                activeTab === item.id ? "text-cyan-200 bg-cyan-400/10 ring-1 ring-cyan-400/20" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              )}
             >
               {item.icon}
               <span className="text-[9px] font-black uppercase tracking-[0.18em]">{item.label}</span>
             </button>
           ))}
        </div>
      </nav>
    </div>
  </div>
  );
};
