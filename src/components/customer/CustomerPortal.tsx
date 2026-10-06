import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Package, CheckCircle2, Clock, Truck, ShieldAlert, Sparkles } from 'lucide-react';
import { Product, Order } from '../../types.js';
import { ProductCard } from '../ProductCard.js';
import { useAuth } from '../../context/AuthContext.js';
import { translations } from '../../translations.js';

interface CustomerPortalProps {
  currentSubView: 'catalog' | 'orders';
  surfaceFilter: string;
  onSelectSurface: (surface: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAddProduct: (product: Product) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  currentSubView,
  surfaceFilter,
  onSelectSurface,
  onSelectProduct,
  onQuickAddProduct,
}) => {
  const { user, token, language } = useAuth();
  const t = translations[language];

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (e) {
        console.error('Failed to load products', e);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (currentSubView === 'orders' && token) {
      fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setOrders(data);
        })
        .catch((e) => console.error('Failed to load user orders', e));
    }
  }, [currentSubView, token]);

  // Filter products
  const filteredProducts = products
    .filter((p) => {
      const matchSurface = surfaceFilter === 'all' || p.surface === surfaceFilter;
      const matchBrand = selectedBrand === 'all' || p.brand.toLowerCase() === selectedBrand.toLowerCase();
      const matchStock = !inStockOnly || p.stock > 0;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.colorway.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSurface && matchBrand && matchStock && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  if (currentSubView === 'orders') {
    return (
      <div className="min-h-screen bg-neutral-950 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="border-b border-neutral-800 pb-4">
            <h1 className="text-2xl font-black text-white font-['Cairo',sans-serif]">
              {t.navMyOrders}
            </h1>
            <p className="mt-1 text-xs text-neutral-400">
              {language === 'ar' ? 'سجل طلباتك ومتابعة الشحن والتوصيل' : 'Track your purchases and fulfillment progress'}
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {orders.length === 0 ? (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-12 text-center text-neutral-400">
                <Package className="mx-auto h-12 w-12 text-neutral-700" />
                <p className="mt-4 text-sm font-medium">
                  {language === 'ar' ? 'لم تقم بطلب أي حذاء رياضي حتى الآن.' : 'No orders found yet.'}
                </p>
              </div>
            ) : (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-neutral-800 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-black text-emerald-400">
                        {ord.orderNumber}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {new Date(ord.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      {ord.orderStatus === 'delivered' && (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>{t.statusDelivered}</span>
                        </span>
                      )}
                      {ord.orderStatus === 'shipped' && (
                        <span className="flex items-center gap-1 text-blue-400">
                          <Truck className="h-4 w-4" />
                          <span>{t.statusShipped}</span>
                        </span>
                      )}
                      {ord.orderStatus === 'processing' && (
                        <span className="flex items-center gap-1 text-purple-400">
                          <Clock className="h-4 w-4" />
                          <span>{t.statusProcessing}</span>
                        </span>
                      )}
                      {ord.orderStatus === 'pending' && (
                        <span className="flex items-center gap-1 text-amber-400">
                          <Clock className="h-4 w-4" />
                          <span>{t.statusPending}</span>
                        </span>
                      )}
                      {ord.orderStatus === 'cancelled' && (
                        <span className="flex items-center gap-1 text-red-400">
                          <ShieldAlert className="h-4 w-4" />
                          <span>{t.statusCancelled}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={it.imageUrl}
                            alt={it.name}
                            referrerPolicy="no-referrer"
                            className="h-10 w-10 rounded-lg object-cover bg-neutral-950"
                          />
                          <div>
                            <div className="font-bold text-white">
                              {language === 'ar' ? it.nameAr : it.name}
                            </div>
                            <div className="text-[11px] text-neutral-400">
                              EU {it.size} · الكمية: {it.quantity}
                            </div>
                          </div>
                        </div>
                        <div className="font-mono font-bold text-white tabular-nums">
                          ${it.price * it.quantity}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-800 text-xs">
                    <span className="text-neutral-400">
                      طريقة الدفع: {ord.paymentMethod === 'cash_on_delivery' ? 'عند الاستلام' : 'إلكتروني'}
                    </span>
                    <span className="font-mono text-sm font-black text-emerald-400 tabular-nums">
                      الإجمالي: ${ord.total}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 pb-16">
      {/* Storefront Hero Section */}
      <section className="relative overflow-hidden border-b border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-400 mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                <span>تشكيلة الموسم الجديد 2026 للأندية والمحترفين</span>
              </div>
              <h1 className="text-3xl font-black text-white sm:text-5xl lg:text-6xl font-['Cairo',sans-serif] leading-tight">
                {language === 'ar' ? (
                  <>
                    سرعة فائقة. دقة متناهية. <br />
                    <span className="text-emerald-400">حذاءك يحسم المباراة.</span>
                  </>
                ) : (
                  <>
                    Next-Gen Velocity. <br />
                    <span className="text-emerald-400">Dominate The Matchday.</span>
                  </>
                )}
              </h1>
              <p className="mt-4 max-w-xl text-sm sm:text-base text-neutral-400 leading-relaxed">
                {language === 'ar'
                  ? 'اكتشف أفضل موديلات أحذية كرة القدم العالمية المختارة من نايكي، أديداس، بوما، وميزونو لجميع أرضيات الملاعب الطبيعية والصناعية والترتان.'
                  : 'Engineered speed and clinical ball control boots from Nike, Adidas, Puma, and Mizuno for every pitch condition.'}
              </p>

              {/* Surface Quick Shortcuts */}
              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                {['all', 'FG', 'AG', 'SG', 'TF'].map((s) => (
                  <button
                    key={s}
                    onClick={() => onSelectSurface(s)}
                    className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
                      surfaceFilter === s
                        ? 'bg-emerald-500 text-neutral-950 shadow-md shadow-emerald-500/20'
                        : 'border border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    {s === 'all'
                      ? t.allSurfaces
                      : s === 'FG'
                      ? t.surfaceFG
                      : s === 'AG'
                      ? t.surfaceAG
                      : s === 'SG'
                      ? t.surfaceSG
                      : t.surfaceTF}
                  </button>
                ))}
              </div>
            </div>

            {/* Hero Image Showcase */}
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-2 shadow-2xl">
                <img
                  src="/src/assets/images/hero_football_boot_1791312467212.jpg"
                  alt="Elite Football Boots"
                  referrerPolicy="no-referrer"
                  className="w-full rounded-xl object-cover aspect-[16/10]"
                />
                <div className="absolute bottom-4 start-4 rounded-lg bg-black/80 px-3 py-1.5 text-xs text-white backdrop-blur-md">
                  <span className="font-bold text-emerald-400">STRIKE ELITE · </span>
                  <span>Matchday Performance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog & Filter Controls */}
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-neutral-800/80 pb-6">
          {/* Brand Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0">
            {['all', 'Nike', 'Adidas', 'Puma', 'Mizuno'].map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedBrand.toLowerCase() === brand.toLowerCase()
                    ? 'bg-white text-neutral-950'
                    : 'text-neutral-400 hover:text-white bg-neutral-900/60'
                }`}
              >
                {brand === 'all' ? t.allBrands : brand}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute start-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900/80 py-1.5 ps-8 pe-3 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* In-Stock Toggle */}
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                inStockOnly
                  ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-400'
                  : 'border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:text-white'
              }`}
            >
              {t.inStockOnly}
            </button>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border border-neutral-800 bg-neutral-900/80 px-2.5 py-1.5 text-xs text-neutral-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="newest">{t.sortNewest}</option>
              <option value="price-asc">{t.sortPriceAsc}</option>
              <option value="price-desc">{t.sortPriceDesc}</option>
            </select>
          </div>
        </div>

        {/* Results Counter */}
        <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
          <span>
            {filteredProducts.length} {t.itemsCount}
          </span>
          {surfaceFilter !== 'all' && (
            <span className="text-emerald-400">
              {language === 'ar' ? `الملاعب المختارة: ${surfaceFilter}` : `Filtered by: ${surfaceFilter}`}
            </span>
          )}
        </div>

        {/* 3-Column Product Grid (Generous whitespace & lead with imagery) */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onQuickAdd={onQuickAddProduct}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
