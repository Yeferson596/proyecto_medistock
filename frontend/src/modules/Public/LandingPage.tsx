import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingCart, LogIn, Search, Menu, Package, Activity, 
  ShieldCheck, HeartPulse, Clock, Truck, Shield, User, 
  LogOut, Eye, EyeOff, Mail, Lock, UserPlus, ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { Button, Card, Modal } from '@/src/components/ui/Base';
import { StockIndicator } from '@/src/components/medistock/Indicators';
import { useStore } from '@/src/store';
import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

export const Navbar = () => {
  const { cart, user, setUser, notify } = useStore();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register' | 'demo'>('login');
  const [showPassword, setShowPassword] = useState(false);
  
  // Form States
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogin = (role: 'admin' | 'operator' | 'b2b_client' | 'customer') => {
    setUser({ 
      id: 'user-1', 
      name: 'Usuario Demo', 
      email: 'demo@medistock.cl',
      role 
    });
    setIsLoginModalOpen(false);
    notify(`Sesión iniciada como ${role.replace('_', ' ').toUpperCase()}`, 'success');
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUser({
        id: 'user-custom',
        name: loginForm.email.split('@')[0],
        email: loginForm.email,
        role: 'customer'
      });
      setIsLoading(false);
      setIsLoginModalOpen(false);
      notify('Bienvenido de nuevo', 'success');
    }, 1000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      notify('Las contraseñas no coinciden', 'error');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setUser({
        id: 'user-new',
        name: registerForm.name,
        email: registerForm.email,
        role: 'customer'
      });
      setIsLoading(false);
      setIsLoginModalOpen(false);
      notify('Cuenta creada exitosamente', 'success');
    }, 1500);
  };

  const handleLogout = () => {
    setUser(null);
    notify('Sesión cerrada', 'info');
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-lg border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 group shrink-0">
        <div className="bg-primary p-1.5 sm:p-2 rounded-lg text-white transition-transform group-hover:rotate-12">
          <Activity size={20} className="sm:w-6 sm:h-6" />
        </div>
        <span className="text-xl sm:text-2xl font-bold tracking-tighter text-slate-900">MEDISTOCK</span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
        <Link to="/catalog" className="hover:text-primary transition-colors">Productos</Link>
        <Link to="/b2b" className="hover:text-primary transition-colors">Portal B2B</Link>
        <Link to="/logistics" className="hover:text-primary transition-colors">Logística</Link>
        <Link to="/admin" className="hover:text-primary transition-colors">Admin</Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center bg-slate-100 rounded-full px-4 py-2 border border-slate-200 group focus-within:ring-2 ring-primary/20 transition-all">
          <Search size={16} className="text-slate-400 mr-2 group-focus-within:text-primary transition-colors" />
          <input type="text" placeholder="Buscar insumos médicos..." className="bg-transparent border-none text-sm focus:outline-none w-48" />
        </div>
        
        <Link to="/cart">
          <Button variant="ghost" size="icon" className="relative group">
            <ShoppingCart size={20} className="group-hover:text-primary transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white font-bold">
                {cartCount}
              </span>
            )}
          </Button>
        </Link>

        {user ? (
          <div className="flex items-center gap-2 ml-2 pl-2 sm:pl-4 border-l border-slate-200">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-xs font-bold text-slate-900 leading-tight">{user.name}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">{user.role}</span>
            </div>
            <img src={`https://i.pravatar.cc/100?u=${user.role}`} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200" alt="Avatar" />
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar Sesión" className="w-8 h-8 sm:w-10 sm:h-10">
              <LogOut size={16} className="text-slate-400 hover:text-rose-500" />
            </Button>
          </div>
        ) : (
          <Button variant="primary" className="flex items-center gap-2 rounded-xl sm:rounded-2xl px-4 sm:px-8 py-2 sm:py-3 bg-[#003366] text-white shadow-lg shadow-blue-900/10 hover:-translate-y-0.5 transition-all h-9 sm:h-11" onClick={() => { setAuthView('login'); setIsLoginModalOpen(true); }}>
            <LogIn size={18} className="sm:w-5 sm:h-5" />
            <span className="font-bold tracking-tight text-sm sm:text-base">Acceso</span>
          </Button>
        )}
        
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu size={24} className="text-slate-600" />
        </Button>
      </div>
    </nav>

    <Modal 
      isOpen={isLoginModalOpen} 
      onClose={() => setIsLoginModalOpen(false)} 
      title={authView === 'login' ? 'Bienvenido' : authView === 'register' ? 'Nueva Cuenta' : 'Perfiles de Prueba'}
    >
        <div className="min-h-0 flex flex-col pt-1">
          <AnimatePresence mode="wait">
            {authView === 'login' && (
              <motion.div 
                key="login"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 sm:space-y-6"
              >
                <form onSubmit={handleCustomLogin} className="space-y-4 sm:space-y-6">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Correo Electrónico</label>
                    <div className="relative group">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors sm:w-[18px] sm:h-[18px]" />
                      <input 
                        type="email" 
                        required
                        className="w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400 font-medium text-sm sm:text-base"
                        placeholder="tu@email.com"
                        value={loginForm.email}
                        onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Contraseña</label>
                      <button type="button" className="text-[9px] sm:text-[10px] text-primary font-bold hover:underline underline-offset-2">¿Olvidaste tu clave?</button>
                    </div>
                    <div className="relative group">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors sm:w-[18px] sm:h-[18px]" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required
                        className="w-full pl-11 sm:pl-12 pr-11 sm:pr-12 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm sm:text-base"
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} className="sm:w-[18px] sm:h-[18px]"/> : <Eye size={16} className="sm:w-[18px] sm:h-[18px]"/>}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" size="lg" className="w-full mt-1 sm:mt-2 h-12 sm:h-14" isLoading={isLoading}>
                    {isLoading ? 'Iniciando sesión...' : 'Entrar a mi cuenta'}
                  </Button>
                </form>

                <div className="relative py-2 sm:py-0">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                  <div className="relative flex justify-center text-[10px] sm:text-xs uppercase tracking-widest"><span className="bg-white px-4 text-slate-400 font-bold">Otras opciones</span></div>
                </div>

                <div className="flex gap-2 sm:gap-3">
                  <Button variant="outline" className="flex-1 py-3 sm:py-4 text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl" onClick={() => setAuthView('demo')}>
                    <Shield size={14} className="sm:w-4 sm:h-4 text-primary mr-1"/> Demos
                  </Button>
                  <Button variant="ghost" className="flex-1 py-3 sm:py-4 text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl" onClick={() => setAuthView('register')}>
                    <UserPlus size={14} className="sm:w-4 sm:h-4 mr-1"/> Registro
                  </Button>
                </div>
              </motion.div>
            )}

            {authView === 'register' && (
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
                  <form onSubmit={handleRegister} className="space-y-4 form-card">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.16em]">Nombre completo</label>
                      <input
                        type="text"
                        required
                        className="w-full input-pill focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                        placeholder="Juan Pérez"
                        value={registerForm.name}
                        onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.16em]">Correo electrónico</label>
                      <input
                        type="email"
                        required
                        className="w-full input-pill focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                        placeholder="tu@email.com"
                        value={registerForm.email}
                        onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.16em]">Contraseña</label>
                        <input
                          type="password"
                          required
                          className="w-full input-pill focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                          placeholder="Crea una contraseña segura"
                          value={registerForm.password}
                          onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                        />
                        <p className="text-[11px] text-slate-400 mt-1">Mínimo 8 caracteres, incluye números y letras.</p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.16em]">Confirmar contraseña</label>
                        <input
                            type="password"
                            required
                            className={cn("w-full input-pill focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm", registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200')}
                            placeholder="Repite la contraseña"
                            value={registerForm.confirmPassword}
                            onChange={e => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                          />
                        {registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword && (
                          <p className="text-[12px] text-rose-500 mt-1">Las contraseñas no coinciden</p>
                        )}
                      </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full primary-cta" isLoading={isLoading}>
                      Crear mi cuenta
                    </Button>

                    <div className="text-center">
                      <button onClick={() => setAuthView('login')} className="text-sm font-semibold text-primary hover:underline underline-offset-2">
                        ¿Ya tienes cuenta? Ingresa aquí
                      </button>
                    </div>
                  </form>

                  <div className="benefits-card">
                    <h4 className="text-lg font-bold mb-4">Beneficios</h4>
                    <ul className="space-y-3 text-sm leading-6 text-slate-700">
                      <li>• Accede a precios especiales para instituciones.</li>
                      <li>• Historial de pedidos y facturación centralizada.</li>
                      <li>• Seguimiento prioritario de envíos y soporte.</li>
                    </ul>
                    <div className="mt-6 text-xs text-slate-500">Al crear una cuenta aceptas nuestros <button className="underline">Términos y Condiciones</button>.</div>
                  </div>
                </div>
              </motion.div>
            )}

            {authView === 'demo' && (
              <motion.div 
                key="demo"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 py-1">
                   <Button variant="ghost" size="icon" onClick={() => setAuthView('login')} className="rounded-full h-8 w-8">
                    <ArrowLeft size={16}/>
                  </Button>
                  <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Panel de Demos</span>
                </div>
                
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {[
                    { role: 'customer', title: 'Cliente Retail', icon: <User size={18}/>, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { role: 'b2b_client', title: 'Comprador B2B', icon: <ShieldCheck size={18}/>, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { role: 'operator', title: 'Logística / PWA', icon: <Truck size={18}/>, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { role: 'admin', title: 'Admin Master', icon: <Shield size={18}/>, color: 'text-slate-900', bg: 'bg-slate-100' },
                  ].map((demo) => (
                    <button 
                      key={demo.role}
                      onClick={() => handleLogin(demo.role as any)} 
                      className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-[20px] bg-slate-50 border-2 border-transparent hover:border-primary/30 hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all text-left"
                    >
                      <div className={cn("p-2 sm:p-3 rounded-lg sm:rounded-2xl shadow-inner transition-transform group-hover:scale-110 shrink-0", demo.bg, demo.color)}>
                        {demo.icon}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-bold text-slate-900 group-hover:text-primary transition-colors text-sm sm:text-base leading-tight truncate">{demo.title}</p>
                        <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium mt-0.5 truncate">Pulsa para acceder como este perfil</p>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-primary transition-transform group-hover:translate-x-1 shrink-0"/>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>
    </>
  );
};

export const Hero = () => (
  <section className="relative py-12 sm:py-20 px-4 sm:px-6 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 sm:gap-12 items-center text-center lg:text-left">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-4 sm:space-y-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider mx-auto lg:ml-0">
          <Shield size={14} />
          Infraestructura Médica Certificada
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tighter text-slate-900">
          Suministros Médicos a un <span className="text-primary italic">Click</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-lg mx-auto lg:ml-0">
          Desde insumos hospitalarios críticos hasta soluciones domiciliarias. Abastecemos instituciones con calidad certificada y logística en 24h.
        </p>
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2 sm:pt-4">
          <Link to="/catalog">
            <Button size="lg" className="rounded-2xl shadow-xl shadow-blue-900/10 h-12 sm:h-14 px-8 sm:px-10">Comprar Ahora</Button>
          </Link>
          <Link to="/b2b">
            <Button variant="outline" size="lg" className="rounded-2xl h-12 sm:h-14 px-8 sm:px-10 border-slate-200">Soy Institución</Button>
          </Link>
        </div>
        <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-8 pt-4 sm:pt-8 opacity-80">
          <div className="flex -space-x-3">
            {[1,2,3,4].map(i => (
              <img key={i} src={`https://i.pravatar.cc/100?u=medical-${i}`} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-sm" alt="User" />
            ))}
          </div>
          <p className="text-[11px] sm:text-sm text-slate-500 font-bold">
            <span className="text-slate-900 font-extrabold">+2.5K</span> instituciones confían
          </p>
        </div>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative px-4 sm:px-0"
      >
        <div className="absolute -inset-4 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <Card className="relative p-0 border-none bg-transparent shadow-none overflow-visible">
          <img 
            src="https://picsum.photos/seed/medical-tech/800/600" 
            className="rounded-3xl shadow-2xl w-full object-cover aspect-[4/3] border-4 border-white"
            alt="Medical Supplies"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -bottom-4 -left-4 sm:-bottom-8 sm:-left-8 hidden sm:block">
            <Card className="flex items-center gap-4 p-3 sm:p-5 shadow-2xl animate-bounce-slow rounded-[20px] border-white/50 backdrop-blur-md bg-white/90">
              <div className="bg-emerald-100 text-emerald-600 p-2 sm:p-3 rounded-2xl shadow-inner">
                <Truck size={24} className="sm:w-7 sm:h-7" />
              </div>
              <div className="pr-4">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Entrega Flash</p>
                <p className="text-sm sm:text-base font-extrabold text-slate-900">En camino en 2h</p>
              </div>
            </Card>
          </div>
        </Card>
      </motion.div>
    </div>
  </section>
);

export const Categories = () => {
  const cats = [
    { name: 'Hospitalización', icon: <Package />, color: 'bg-blue-500', desc: 'Cuidados críticos y monitoreo' },
    { name: 'Insumos Clínicos', icon: <HeartPulse />, color: 'bg-emerald-500', desc: 'Descartables y esterilización' },
    { name: 'Equipamiento', icon: <Activity />, color: 'bg-purple-500', desc: 'Tecnología médica avanzada' },
    { name: 'Medicamentos', icon: <Clock />, color: 'bg-amber-500', desc: 'Farmacia institucional y hogar' },
  ];

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8 sm:mb-12 text-center sm:text-left">
          <div className="space-y-2 sm:space-y-4 mx-auto sm:ml-0">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Categorías Principales</h2>
            <p className="text-slate-500 text-sm sm:text-base">Explora nuestro catálogo especializado de alta gama</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {cats.map((cat, i) => (
            <Link key={i} to={`/catalog?category=${cat.name}`}>
              <Card hover className="group p-5 sm:p-8 rounded-[24px] h-full cursor-pointer">
                <div className={cn("inline-flex p-3 rounded-2xl text-white mb-4 sm:mb-6 transition-transform group-hover:scale-110 shadow-lg", cat.color)}>
                  {React.cloneElement(cat.icon as React.ReactElement, { size: 24 })}
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 group-hover:text-primary transition-colors tracking-tight">{cat.name}</h3>
                <p className="text-slate-500 text-[13px] sm:text-sm leading-relaxed">{cat.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export const FeaturedProducts = () => {
  const { products, addToCart, notify } = useStore();
  
  const handleAddToCart = (product: any) => {
    addToCart(product.id, 1);
    notify(`Agregado: ${product.name}`);
  };

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 sm:mb-12 space-y-2 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Equipos en Alza</h2>
          <p className="text-slate-500 text-sm sm:text-base">Los insumos más solicitados del mes</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {products.map((product) => (
            <Card key={product.id} hover className="flex flex-col p-0 overflow-hidden border-none rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all">
              <div className="relative aspect-square overflow-hidden">
                <img src={product.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={product.name} />
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                  <StockIndicator stock={product.stock} minStock={product.minStock} />
                </div>
              </div>
              <div className="p-3 sm:p-5 space-y-1.5 sm:space-y-2 flex-grow bg-white">
                <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">{product.category}</p>
                <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors text-sm sm:text-base line-clamp-1">{product.name}</h3>
                <p className="text-[11px] sm:text-sm text-slate-500 line-clamp-2 leading-relaxed hidden sm:block">{product.description}</p>
                <div className="pt-1.5 sm:pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <span className="text-base sm:text-xl font-black text-slate-900">${product.price.toLocaleString()}</span>
                  <Button size="sm" variant="primary" className="w-full sm:w-auto h-8 sm:h-9 text-[11px] sm:text-xs font-bold rounded-xl" onClick={() => handleAddToCart(product)}>Añadir</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export const LandingPage = () => (
  <div className="min-h-screen">
    <Navbar />
    <Hero />
    <Categories />
    <FeaturedProducts />
    <footer className="bg-slate-900 text-slate-400 py-12 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
        <div className="space-y-4 col-span-2">
           <div className="flex items-center gap-2 text-white">
            <Activity size={24} className="text-primary" />
            <span className="text-2xl font-bold tracking-tighter">MEDISTOCK</span>
          </div>
          <p className="max-w-sm">
            Líderes en distribución de suministros médicos para Latinoamérica. Innovación, calidad y rapidez en cada entrega.
          </p>
        </div>
        <div className="space-y-4">
          <h4 className="text-white font-bold">Enlaces Rápidos</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/catalog" className="hover:text-white">Catálogo</Link></li>
            <li><Link to="/b2b" className="hover:text-white">Institucional</Link></li>
            <li><Link to="/admin" className="hover:text-white">Admin</Link></li>
          </ul>
        </div>
        <div className="space-y-4">
          <h4 className="text-white font-bold">Contacto</h4>
          <p className="text-sm">Av. Providencia 1234, Santiago, Chile</p>
          <p className="text-sm">contacto@medistock.cl</p>
          <p className="text-sm font-bold text-white">+56 9 1234 5678</p>
        </div>
      </div>
    </footer>
  </div>
);
