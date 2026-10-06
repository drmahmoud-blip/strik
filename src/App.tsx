import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { CartProvider, useCart } from './context/CartContext.js';
import { Navbar } from './components/Navbar.js';
import { AuthLanding } from './components/AuthLanding.js';
import { AdminDashboard } from './components/admin/AdminDashboard.js';
import { CustomerPortal } from './components/customer/CustomerPortal.js';
import { ProductDetailModal } from './components/ProductDetailModal.js';
import { CartDrawer } from './components/CartDrawer.js';
import { OrderSuccessModal } from './components/OrderSuccessModal.js';
import { Product, Order } from './types.js';

function MainApp() {
  const { user, isLoading } = useAuth();
  const { addToCart } = useCart();

  // Navigation state
  const [currentView, setCurrentView] = useState<string>('auth-landing');
  const [surfaceFilter, setSurfaceFilter] = useState<string>('all');

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Sync default view on user load or switch
  React.useEffect(() => {
    if (!isLoading) {
      if (user) {
        if (user.role === 'admin') {
          setCurrentView((prev) => (prev.startsWith('admin') ? prev : 'admin-dashboard'));
        } else {
          setCurrentView((prev) => (prev === 'auth-landing' ? 'storefront' : prev));
        }
      } else {
        setCurrentView('auth-landing');
      }
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-neutral-950 text-neutral-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="text-xs font-mono">Loading StrikeElite...</span>
        </div>
      </div>
    );
  }

  const handleAuthSuccess = (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      setCurrentView('admin-dashboard');
    } else {
      setCurrentView('storefront');
    }
  };

  const handleQuickAdd = (product: Product) => {
    // pick first available size
    const availableSize = product.sizes?.find((s) => s.stock > 0)?.size || 42;
    addToCart(product, availableSize, 1);
  };

  const handleNavigate = (view: string) => {
    if (view.startsWith('admin') && user?.role !== 'admin') {
      setCurrentView(user ? 'storefront' : 'auth-landing');
      return;
    }
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-emerald-500 selection:text-neutral-950">
      {/* Universal Top Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        surfaceFilter={surfaceFilter}
        onSelectSurface={(surf) => {
          setSurfaceFilter(surf);
          setCurrentView('storefront');
        }}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'auth-landing' && (
          <AuthLanding onSuccess={handleAuthSuccess} />
        )}

        {currentView === 'storefront' && (
          <CustomerPortal
            currentSubView="catalog"
            surfaceFilter={surfaceFilter}
            onSelectSurface={setSurfaceFilter}
            onSelectProduct={setSelectedProduct}
            onQuickAddProduct={handleQuickAdd}
          />
        )}

        {currentView === 'customer-orders' && (
          <CustomerPortal
            currentSubView="orders"
            surfaceFilter={surfaceFilter}
            onSelectSurface={setSurfaceFilter}
            onSelectProduct={setSelectedProduct}
            onQuickAddProduct={handleQuickAdd}
          />
        )}

        {currentView === 'admin-dashboard' && user?.role === 'admin' && (
          <AdminDashboard initialSubTab="analytics" />
        )}

        {currentView === 'admin-products' && user?.role === 'admin' && (
          <AdminDashboard initialSubTab="products" />
        )}

        {currentView === 'admin-inventory' && user?.role === 'admin' && (
          <AdminDashboard initialSubTab="inventory" />
        )}

        {currentView === 'admin-orders' && user?.role === 'admin' && (
          <AdminDashboard initialSubTab="orders" />
        )}
      </main>

      {/* Modals & Slide-overs */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <CartDrawer
        onOrderComplete={(order) => {
          setCompletedOrder(order);
        }}
      />

      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
        onViewOrders={() => {
          setCompletedOrder(null);
          setCurrentView('customer-orders');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
