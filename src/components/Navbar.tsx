import React from 'react';
import { ShoppingBag, ShieldCheck, UserCheck, Globe, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { translations } from '../translations.js';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  surfaceFilter?: string;
  onSelectSurface?: (surface: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  surfaceFilter = 'all',
  onSelectSurface,
}) => {
  const { user, logout, language, setLanguage, loginAsDemo } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const t = translations[language];

  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => onNavigate(isAdmin ? 'admin-dashboard' : 'storefront')}
          className="group flex items-center gap-2 text-left transition-opacity hover:opacity-90"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 font-black text-neutral-950 shadow-sm shadow-emerald-500/20">
            ⚡
          </div>
          <span className="text-xl font-black tracking-wider text-neutral-100 uppercase font-['Plus_Jakarta_Sans',sans-serif]">
            {t.brandName}
          </span>
        </button>

        {/* Zone 2: Navigation Links (Clean text links with hover transitions) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {isAdmin ? (
            <>
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className={`transition-colors whitespace-nowrap ${
                  currentView === 'admin-dashboard'
                    ? 'text-emerald-400 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-100'
                }`}
              >
                {t.navAdminDashboard}
              </button>
              <button
                onClick={() => onNavigate('admin-products')}
                className={`transition-colors whitespace-nowrap ${
                  currentView === 'admin-products'
                    ? 'text-emerald-400 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-100'
                }`}
              >
                {t.navAdminProducts}
              </button>
              <button
                onClick={() => onNavigate('admin-inventory')}
                className={`transition-colors whitespace-nowrap ${
                  currentView === 'admin-inventory'
                    ? 'text-emerald-400 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-100'
                }`}
              >
                {t.navAdminInventory}
              </button>
              <button
                onClick={() => onNavigate('admin-orders')}
                className={`transition-colors whitespace-nowrap ${
                  currentView === 'admin-orders'
                    ? 'text-emerald-400 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-100'
                }`}
              >
                {t.navAdminOrders}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  onNavigate('storefront');
                  if (onSelectSurface) onSelectSurface('all');
                }}
                className={`transition-colors whitespace-nowrap ${
                  currentView === 'storefront' && surfaceFilter === 'all'
                    ? 'text-emerald-400 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-100'
                }`}
              >
                {t.navCatalog}
              </button>
              <button
                onClick={() => {
                  onNavigate('storefront');
                  if (onSelectSurface) onSelectSurface('FG');
                }}
                className={`transition-colors whitespace-nowrap ${
                  currentView === 'storefront' && surfaceFilter === 'FG'
                    ? 'text-emerald-400 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-100'
                }`}
              >
                {t.surfaceFG}
              </button>
              <button
                onClick={() => {
                  onNavigate('storefront');
                  if (onSelectSurface) onSelectSurface('AG');
                }}
                className={`transition-colors whitespace-nowrap ${
                  currentView === 'storefront' && surfaceFilter === 'AG'
                    ? 'text-emerald-400 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-100'
                }`}
              >
                {t.surfaceAG}
              </button>
              <button
                onClick={() => {
                  onNavigate('storefront');
                  if (onSelectSurface) onSelectSurface('TF');
                }}
                className={`transition-colors whitespace-nowrap ${
                  currentView === 'storefront' && surfaceFilter === 'TF'
                    ? 'text-emerald-400 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-100'
                }`}
              >
                {t.surfaceTF}
              </button>
              <button
                onClick={() => onNavigate('customer-orders')}
                className={`transition-colors whitespace-nowrap ${
                  currentView === 'customer-orders'
                    ? 'text-emerald-400 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-100'
                }`}
              >
                {t.navMyOrders}
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Primary Actions (Identity Badge, Cart, Language, Logout) */}
        <div className="flex items-center gap-3">
          {/* Authentic Role Badge (Shows current verified identity) */}
          {user ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/90 px-2.5 py-1.5 text-xs font-semibold text-neutral-200">
              {isAdmin ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold font-['Cairo',sans-serif]">
                    {language === 'ar' ? 'المدير' : 'Admin'}
                  </span>
                </>
              ) : (
                <>
                  <UserCheck className="h-3.5 w-3.5 text-blue-400" />
                  <span className="text-blue-400 font-bold font-['Cairo',sans-serif]">
                    {language === 'ar' ? 'عميل' : 'Customer'}
                  </span>
                </>
              )}
              <span className="text-neutral-500 hidden sm:inline">({user.name.split(' ')[0]})</span>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('auth-landing')}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-900/40"
            >
              <span>{t.tabLogin}</span>
            </button>
          )}

          {/* Cart Drawer Button (only shown for customer mode or when browsing) */}
          {!isAdmin && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-neutral-200 transition-colors hover:border-neutral-700 hover:text-white"
              aria-label={t.cart}
            >
              <ShoppingBag className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-neutral-950 tabular-nums">
                  {totalItems}
                </span>
              )}
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-neutral-700 hover:text-white"
            title="تبديل اللغة / Change Language"
          >
            <Globe className="h-3.5 w-3.5 text-neutral-400" />
            <span className="uppercase">{language === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* User Sign out or Auth Switch */}
          {user ? (
            <button
              onClick={logout}
              className="flex items-center gap-1 rounded-lg border border-red-900/50 bg-red-950/20 px-2.5 py-1.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-900/40"
              title={t.logout}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.logout}</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('auth-landing')}
              className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-neutral-950 transition-colors hover:bg-emerald-400"
            >
              {t.tabLogin}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
