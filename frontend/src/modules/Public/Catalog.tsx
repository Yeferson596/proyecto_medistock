import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Package, Activity, MapPin, Globe, CheckCircle2 } from 'lucide-react';
import { Button, Card, Modal } from '@/src/components/ui/Base';
import { StockIndicator } from '@/src/components/medistock/Indicators';
import { useStore } from '@/src/store';
import { Navbar } from './LandingPage';
import { cn } from '@/src/lib/utils';
import { useLocation } from 'react-router-dom';

export const Catalog = () => {
  const { products, addToCart, notify } = useStore();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [isCoverageModalOpen, setIsCoverageModalOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [location]);

  const categories = React.useMemo(() => 
    ['Todas', ...Array.from(new Set(products.map(p => p.category)))],
    [products]
  );

  const filteredProducts = React.useMemo(() => products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }), [products, searchTerm, selectedCategory]);

  const handleAddToCart = (product: any) => {
    addToCart(product.id, 1);
    notify(`Agregado: ${product.name}`, 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Header Section */}
      <header className="bg-[#003366] text-white py-12 px-4 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold tracking-tight">Catálogo de Productos</h1>
              <p className="text-blue-100 text-lg max-w-2xl">Encuentra los mejores suministros e insumos médicos con despacho inmediato.</p>
            </div>
            
            <div className="relative group max-w-md w-full">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Buscar por nombre, código o marca..."
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:outline-none focus:ring-2 ring-primary/50 focus:bg-white text-white focus:text-slate-900 transition-all placeholder:text-blue-200"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 space-y-8">
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 font-bold text-slate-900 uppercase tracking-widest text-xs">
              <Filter size={16} /> Categorías
            </h3>
            <div className="flex flex-wrap lg:flex-col gap-2">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-sm font-bold text-left transition-all border",
                    selectedCategory === cat 
                      ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105" 
                      : "bg-white text-slate-600 border-slate-200 hover:border-primary/50 hover:bg-slate-50"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white border-none rounded-3xl">
            <h4 className="font-bold mb-2">Despacho Priority</h4>
            <p className="text-xs text-slate-400 mb-4">Recibe tus insumos en menos de 24h dentro de RM.</p>
            <Button 
              variant="primary" 
              className="w-full text-xs h-10"
              onClick={() => setIsCoverageModalOpen(true)}
            >
              Ver Cobertura
            </Button>
          </Card>
        </aside>

        {/* Product Grid */}
        <div className="flex-grow">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card hover className="flex flex-col p-0 overflow-hidden border-none rounded-3xl shadow-sm hover:shadow-2xl transition-all group">
                    <div className="relative aspect-square overflow-hidden bg-slate-200">
                      <img 
                        src={product.image} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt={product.name} 
                      />
                      <div className="absolute top-4 right-4">
                        <StockIndicator stock={product.stock} minStock={product.minStock} />
                      </div>
                    </div>
                    <div className="p-6 space-y-3 flex-grow bg-white">
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/70">{product.category}</p>
                        <span className="text-[10px] font-bold text-slate-400">SKU: {1000 + i}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{product.description}</p>
                      <div className="pt-4 flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                          <span className="text-2xl font-black text-slate-900">${product.price.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 font-bold">Precio Unitario</span>
                        </div>
                        <Button 
                          variant="primary" 
                          className="rounded-2xl h-11 px-6 shadow-xl shadow-primary/20 active:scale-95"
                          onClick={() => handleAddToCart(product)}
                        >
                          Comprar
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-slate-100 p-8 rounded-full text-slate-400 mb-6">
                 <Package size={64} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No encontramos lo que buscas</h3>
              <p className="text-slate-500 mt-2 max-w-md mx-auto">Prueba con términos más generales o explora nuestras categorías destacadas.</p>
              <Button variant="ghost" className="mt-6 text-primary font-bold" onClick={() => { setSearchTerm(''); setSelectedCategory('Todas'); }}>
                Ver Todo el Catálogo
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Coverage Modal */}
      <Modal
        isOpen={isCoverageModalOpen}
        onClose={() => setIsCoverageModalOpen(false)}
        title="Cobertura de Despacho"
      >
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm text-primary">
              <Globe size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Cobertura Nacional</h4>
              <p className="text-sm text-slate-600">Llegamos a todo Chile con tiempos de entrega garantizados.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-100 space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <CheckCircle2 size={16} /> Región Metropolitana
              </div>
              <p className="text-xs text-slate-500">Entrega en menos de 24 horas hábiles para pedidos procesados antes de las 14:00.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <CheckCircle2 size={16} /> Regiones
              </div>
              <p className="text-xs text-slate-500">Entrega entre 48 a 72 horas hábiles dependiendo de la zona geográfica.</p>
            </div>
          </div>

          <div className="relative h-48 bg-slate-100 rounded-2xl overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=600" 
              className="w-full h-full object-cover opacity-50 grayscale transition-all group-hover:grayscale-0 group-hover:opacity-100" 
              alt="Map"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-xl flex items-center gap-3">
                <MapPin size={20} className="text-rose-500 animate-bounce" />
                <span className="font-bold text-slate-900 text-sm">Centro de Distribución Central</span>
              </div>
            </div>
          </div>

          <Button className="w-full h-12 rounded-xl" onClick={() => setIsCoverageModalOpen(false)}>
            Entendido
          </Button>
        </div>
      </Modal>

      <footer className="bg-slate-900 text-slate-400 py-16 px-6 mt-12">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="space-y-4 col-span-2">
             <div className="flex items-center gap-2 text-white">
              <Activity size={28} className="text-primary" />
              <span className="text-3xl font-bold tracking-tighter">MEDISTOCK</span>
            </div>
            <p className="max-w-sm text-slate-500 leading-relaxed">
              Líderes en distribución de suministros médicos para Latinoamérica. Innovación, calidad y rapidez en cada entrega.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs">Empresa</h4>
            <ul className="space-y-3 text-sm">
              <li><button className="hover:text-white transition-colors">Nosotros</button></li>
              <li><button className="hover:text-white transition-colors">Términos y Condiciones</button></li>
              <li><button className="hover:text-white transition-colors">Privacidad</button></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase tracking-widest text-xs">Contacto</h4>
            <p className="text-sm">Av. Providencia 1234, Santiago, Chile</p>
            <p className="text-sm">contacto@medistock.cl</p>
            <p className="text-sm font-bold text-white mt-4">+56 9 1234 5678</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
