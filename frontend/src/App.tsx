import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { LandingPage } from './modules/Public/LandingPage';
import { Catalog } from './modules/Public/Catalog';
import { AdminDashboard } from './modules/Admin/Dashboard';
import { LogisticsPWA } from './modules/Logistics/PWA';
import { Profile } from './modules/Public/Profile';
import { B2BPortal } from './modules/B2B/Portal';
import { CartCheckout } from './modules/Public/CartCheckout';
import { useEffect } from 'react';
import { useStore } from './store';
import { Toast } from './components/ui/Base';
import { AnimatePresence } from 'motion/react';
import { MercadoPagoMockPage } from './modules/Public/MercadoPagoMockPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const { notification, clearNotification } = useStore();
  const { fetchProducts, fetchOrders, fetchUsers } = useStore();

  useEffect(() => {
    void fetchProducts().catch(console.error);
    void fetchOrders().catch(console.error);
    void fetchUsers().catch(console.error);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/cart" element={<CartCheckout />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/b2b" element={<B2BPortal />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/logistics" element={<LogisticsPWA />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/checkout/mercadopago-simulacion" element={<MercadoPagoMockPage />} />
      </Routes>
      <AnimatePresence>
        {notification && (
          <Toast 
            message={notification.message} 
            type={notification.type} 
            onClose={clearNotification} 
          />
        )}
      </AnimatePresence>
    </Router>
  );
}
