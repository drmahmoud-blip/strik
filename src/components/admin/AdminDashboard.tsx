import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Truck,
  Clock,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Layers,
  BarChart3,
  SlidersHorizontal,
} from 'lucide-react';
import { Product, Order, AnalyticsSummary, InventoryLog, OrderStatus } from '../../types.js';
import { useAuth } from '../../context/AuthContext.js';
import { translations } from '../../translations.js';

interface AdminDashboardProps {
  initialSubTab?: 'analytics' | 'products' | 'inventory' | 'orders';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  initialSubTab = 'analytics',
}) => {
  const { token, language } = useAuth();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'inventory' | 'orders'>(
    initialSubTab
  );

  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & filter states
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [adjustingStockProduct, setAdjustingStockProduct] = useState<Product | null>(null);
  const [stockDelta, setStockDelta] = useState<number>(5);

  // Product Form State
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    brand: 'Nike' as Product['brand'],
    surface: 'FG' as Product['surface'],
    surfaceLabel: 'Firm Ground',
    surfaceLabelAr: 'عشب طبيعي',
    price: 260,
    originalPrice: 290,
    stock: 12,
    weightGrams: 195,
    description: '',
    descriptionAr: '',
    imageUrl: '/src/assets/images/boot_predator_elite_1791312482666.jpg',
    colorway: 'Black / Silver',
    colorwayAr: 'أسود / فضي',
    featured: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [analyticsRes, productsRes, ordersRes, inventoryRes] = await Promise.all([
        fetch('/api/admin/analytics', { headers }),
        fetch('/api/products'),
        fetch('/api/orders', { headers }),
        fetch('/api/admin/inventory', { headers }),
      ]);

      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (inventoryRes.ok) {
        const invData = await inventoryRes.json();
        setInventoryLogs(invData.logs || []);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Handle Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    try {
      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setIsProductModalOpen(false);
          setEditingProduct(null);
          fetchData();
        }
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers,
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setIsProductModalOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      console.error('Save product error', err);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDeletingProductId(null);
        fetchData();
      }
    } catch (err) {
      console.error('Delete product error', err);
    }
  };

  // Handle Quick Stock Adjust
  const handleQuickStockAdjust = async () => {
    if (!adjustingStockProduct) return;
    try {
      const res = await fetch(`/api/admin/inventory/${adjustingStockProduct.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stockDelta,
          reason: stockDelta > 0 ? 'توريد كمية جديدة للمخزن' : 'تسوية عجز أو جرد مخزني',
        }),
      });
      if (res.ok) {
        setAdjustingStockProduct(null);
        fetchData();
      }
    } catch (err) {
      console.error('Stock adjust error', err);
    }
  };

  // Handle Order Status Update
  const handleOrderStatusUpdate = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Status update error', err);
    }
  };

  // Open Edit Product Modal
  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      nameAr: p.nameAr,
      brand: p.brand,
      surface: p.surface,
      surfaceLabel: p.surfaceLabel || 'Firm Ground',
      surfaceLabelAr: p.surfaceLabelAr || 'عشب طبيعي',
      price: p.price,
      originalPrice: p.originalPrice || p.price + 30,
      stock: p.stock,
      weightGrams: p.weightGrams,
      description: p.description,
      descriptionAr: p.descriptionAr,
      imageUrl: p.imageUrl,
      colorway: p.colorway,
      colorwayAr: p.colorwayAr,
      featured: p.featured,
    });
    setIsProductModalOpen(true);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: 'Nike Mercurial Vapor 16 Pro',
      nameAr: 'نايكي ميركوريال فابور 16 برو',
      brand: 'Nike',
      surface: 'FG',
      surfaceLabel: 'Firm Ground',
      surfaceLabelAr: 'عشب طبيعي',
      price: 240,
      originalPrice: 270,
      stock: 15,
      weightGrams: 185,
      description: 'Ultra-lightweight speed cleats designed for rapid acceleration.',
      descriptionAr: 'حذاء كرة قدم فائق الخفة مصمم للتسارع والانطلاق الصاروخي.',
      imageUrl: '/src/assets/images/boot_mercurial_vapor_1791312493344.jpg',
      colorway: 'Volt / Crimson',
      colorwayAr: 'فسفوري / قرمزي',
      featured: true,
    });
    setIsProductModalOpen(true);
  };

  // Filtered lists
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.nameAr.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerPhone.includes(orderSearch);
    const matchesStatus =
      orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Top Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-neutral-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{language === 'ar' ? 'جلسة المدير نشطة (JWT Verified)' : 'Admin Session Active'}</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black text-white font-['Cairo',sans-serif]">
              {t.adminWelcome}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-neutral-400">
              {t.adminSummarySub}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-semibold text-neutral-300 hover:border-neutral-700 hover:text-white"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>{language === 'ar' ? 'تحديث البيانات' : 'Refresh'}</span>
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-bold text-neutral-950 hover:bg-emerald-400"
            >
              <Plus className="h-4 w-4" />
              <span>{t.addProductBtn}</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="mt-6 flex border-b border-neutral-800 gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 pb-3 text-sm font-bold transition-colors whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-b-2 border-emerald-400 text-emerald-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>{t.navAdminDashboard}</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 pb-3 text-sm font-bold transition-colors whitespace-nowrap ${
              activeTab === 'products'
                ? 'border-b-2 border-emerald-400 text-emerald-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>{t.navAdminProducts} ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 pb-3 text-sm font-bold transition-colors whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'border-b-2 border-emerald-400 text-emerald-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>{t.navAdminInventory}</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 pb-3 text-sm font-bold transition-colors whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-b-2 border-emerald-400 text-emerald-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>{t.navAdminOrders} ({orders.length})</span>
          </button>
        </div>

        {/* TAB 1: ANALYTICS DASHBOARD */}
        {activeTab === 'analytics' && analytics && (
          <div className="mt-8 space-y-8">
            {/* 4 KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-5">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-xs font-medium">{t.kpiTotalRevenue}</span>
                  <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 text-2xl sm:text-3xl font-black text-white font-mono tabular-nums">
                  ${analytics.totalRevenue.toLocaleString()}
                </div>
                <div className="mt-1 text-[11px] text-emerald-400">
                  +18.4% {language === 'ar' ? 'مقارنة بالشهر الماضي' : 'vs last month'}
                </div>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-5">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-xs font-medium">{t.kpiTotalOrders}</span>
                  <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 text-2xl sm:text-3xl font-black text-white font-mono tabular-nums">
                  {analytics.totalOrders}
                </div>
                <div className="mt-1 text-[11px] text-blue-400">
                  {language === 'ar' ? 'طلبات مؤكدة ومحدثة' : 'Verified customer orders'}
                </div>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-5">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-xs font-medium">{t.kpiAOV}</span>
                  <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
                    <Package className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 text-2xl sm:text-3xl font-black text-white font-mono tabular-nums">
                  ${analytics.averageOrderValue}
                </div>
                <div className="mt-1 text-[11px] text-purple-400">
                  {language === 'ar' ? 'لكل عملية شراء' : 'Per transaction'}
                </div>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-5">
                <div className="flex items-center justify-between text-neutral-400">
                  <span className="text-xs font-medium">{t.kpiLowStock}</span>
                  <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 text-2xl sm:text-3xl font-black text-white font-mono tabular-nums">
                  {analytics.lowStockCount}
                </div>
                <div className="mt-1 text-[11px] text-amber-400">
                  {language === 'ar' ? 'يحتاج توريد سريع (أقل من 5)' : 'Needs restock (< 5 pairs)'}
                </div>
              </div>
            </div>

            {/* Monthly Sales Revenue Chart Bar Visualization */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-white font-['Cairo',sans-serif]">
                    {t.monthlySalesChart}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {language === 'ar' ? 'تحليل الإيرادات والطلبات خلال الأشهر الأخيرة' : 'Revenue trajectory over recent active months'}
                  </p>
                </div>
                <div className="text-xs font-mono font-bold text-emerald-400">
                  Total: ${analytics.totalRevenue}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 h-48 items-end pt-6 border-b border-neutral-800">
                {analytics.monthlySales.map((monthItem) => {
                  const maxRev = Math.max(...analytics.monthlySales.map((m) => m.revenue), 1000);
                  const heightPercent = Math.max(15, Math.round((monthItem.revenue / maxRev) * 100));

                  return (
                    <div key={monthItem.month} className="flex flex-col items-center gap-2 h-full justify-end">
                      <span className="font-mono text-xs font-bold text-white tabular-nums">
                        ${monthItem.revenue}
                      </span>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full max-w-[60px] rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all hover:opacity-90"
                      />
                      <span className="text-xs font-medium text-neutral-400 mt-2">
                        {language === 'ar' ? monthItem.monthAr : monthItem.month}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {monthItem.ordersCount} {language === 'ar' ? 'طلب' : 'orders'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Breakdown Grids: Brands + Pitch Surfaces */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Sales by Brand */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-6">
                <h3 className="text-sm font-bold text-white mb-4">
                  {t.salesByBrand}
                </h3>
                <div className="space-y-4">
                  {analytics.salesByBrand.map((b) => {
                    const totalBrandRev = analytics.salesByBrand.reduce((s, it) => s + it.revenue, 0) || 1;
                    const percent = Math.round((b.revenue / totalBrandRev) * 100);
                    return (
                      <div key={b.brand} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-neutral-200">{b.brand}</span>
                          <span className="font-mono tabular-nums text-neutral-400">
                            ${b.revenue} ({percent}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden">
                          <div
                            style={{ width: `${percent}%` }}
                            className="h-full bg-blue-500 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sales by Surface */}
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-6">
                <h3 className="text-sm font-bold text-white mb-4">
                  {t.salesBySurface}
                </h3>
                <div className="space-y-4">
                  {analytics.salesBySurface.map((s) => {
                    const totalSurfRev = analytics.salesBySurface.reduce((sum, it) => sum + it.revenue, 0) || 1;
                    const percent = Math.round((s.revenue / totalSurfRev) * 100);
                    return (
                      <div key={s.surface} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-neutral-200">
                            {language === 'ar' ? s.labelAr : s.surface}
                          </span>
                          <span className="font-mono tabular-nums text-neutral-400">
                            ${s.revenue} ({percent}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden">
                          <div
                            style={{ width: `${percent}%` }}
                            className="h-full bg-emerald-500 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Top Selling Football Boots Table */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-6">
              <h3 className="text-sm font-bold text-white mb-4">
                {t.topSellingBoots}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead className="border-b border-neutral-800 text-neutral-400 font-medium">
                    <tr>
                      <th className="py-2.5 px-3 text-start">الحذاء</th>
                      <th className="py-2.5 px-3 text-start">الماركة</th>
                      <th className="py-2.5 px-3 text-start">الكمية المباعة</th>
                      <th className="py-2.5 px-3 text-start">إجمالي الإيرادات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {analytics.topProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-800/30">
                        <td className="py-3 px-3 flex items-center gap-3">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="h-9 w-9 rounded-md object-cover bg-neutral-950"
                          />
                          <span className="font-bold text-white">
                            {language === 'ar' ? p.nameAr : p.name}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-neutral-400">{p.brand}</td>
                        <td className="py-3 px-3 font-mono tabular-nums text-neutral-200">
                          {p.unitsSold} {t.unitsSold}
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums font-bold text-emerald-400">
                          ${p.revenue}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS CRUD MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="mt-8 space-y-6">
            {/* Search & Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute start-3 top-2.5 h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 py-2 ps-9 pe-3 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="text-xs text-neutral-400 font-medium">
                {filteredProducts.length} {t.itemsCount}
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/60">
              <table className="w-full text-start text-xs">
                <thead className="border-b border-neutral-800 text-neutral-400 font-medium bg-neutral-950/40">
                  <tr>
                    <th className="py-3 px-4 text-start">الحذاء الرياضي</th>
                    <th className="py-3 px-4 text-start">الماركة</th>
                    <th className="py-3 px-4 text-start">نوع الأرضية</th>
                    <th className="py-3 px-4 text-start">السعر</th>
                    <th className="py-3 px-4 text-start">المخزون المتوفر</th>
                    <th className="py-3 px-4 text-end">إجراءات الأدمن</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-neutral-800/40">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="h-10 w-10 rounded-lg object-cover bg-neutral-950"
                          />
                          <div>
                            <div className="font-bold text-white">
                              {language === 'ar' ? product.nameAr : product.name}
                            </div>
                            <div className="text-[11px] text-neutral-500">
                              {language === 'ar' ? product.colorwayAr : product.colorway}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-neutral-300">
                        {product.brand}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-emerald-400 font-bold">
                          {product.surface}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white tabular-nums">
                        ${product.price}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-mono font-bold tabular-nums ${
                            product.stock === 0
                              ? 'text-red-400'
                              : product.stock <= 5
                              ? 'text-amber-400'
                              : 'text-neutral-200'
                          }`}
                        >
                          {product.stock} زوج
                        </span>
                      </td>
                      <td className="py-3 px-4 text-end">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="rounded-lg border border-neutral-700 bg-neutral-800 p-1.5 text-neutral-300 hover:border-emerald-500 hover:text-emerald-400"
                            title={t.editProductBtn}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingProductId(product.id)}
                            className="rounded-lg border border-neutral-800 bg-neutral-800 p-1.5 text-neutral-400 hover:border-red-500 hover:text-red-400"
                            title={t.deleteProductBtn}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: INVENTORY MANAGEMENT */}
        {activeTab === 'inventory' && (
          <div className="mt-8 space-y-8">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white font-['Cairo',sans-serif]">
                  {t.inventoryTitle}
                </h3>
                <span className="text-xs text-neutral-400">
                  {language === 'ar' ? 'تحديثات حية للمخزن المتبقي' : 'Real-time stock monitor'}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => {
                  const isLow = p.stock > 0 && p.stock <= 5;
                  const isOut = p.stock === 0;
                  return (
                    <div
                      key={p.id}
                      className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-950/60 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="h-12 w-12 rounded-lg object-cover bg-neutral-900"
                        />
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-white line-clamp-1">
                            {language === 'ar' ? p.nameAr : p.name}
                          </h4>
                          <div className="mt-0.5 text-[11px] text-neutral-400">
                            {p.brand} · {p.surface}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between pt-3 border-t border-neutral-800">
                        <div>
                          <div className="text-[10px] text-neutral-500">المخزون الحالي</div>
                          <div
                            className={`text-base font-black font-mono tabular-nums ${
                              isOut
                                ? 'text-red-400'
                                : isLow
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {p.stock} زوج
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setAdjustingStockProduct(p);
                            setStockDelta(5);
                          }}
                          className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-bold text-neutral-200 hover:border-emerald-500 hover:text-emerald-400"
                        >
                          {t.quickStockAdjust}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inventory Audit Logs */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
              <h3 className="text-sm font-bold text-white mb-4">
                {t.auditLogsTitle}
              </h3>
              <div className="space-y-2">
                {inventoryLogs.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-800/60 bg-neutral-950/40 p-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{log.productName}</span>
                      <span className="mx-2 text-neutral-600">·</span>
                      <span className="text-neutral-400">{log.reason}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono font-bold tabular-nums ${
                          log.changeAmount > 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {log.changeAmount > 0 ? `+${log.changeAmount}` : log.changeAmount}
                      </span>
                      <span className="text-neutral-500 text-[11px] font-mono">
                        {new Date(log.timestamp).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="mt-8 space-y-6">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute start-3 top-2.5 h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="ابحث برقم الطلب، اسم العميل، الهاتف..."
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 py-2 ps-9 pe-3 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-neutral-500" />
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="all">جميع حالات الطلب</option>
                  <option value="pending">قيد الانتظار (Pending)</option>
                  <option value="processing">جاري التجهيز (Processing)</option>
                  <option value="shipped">تم الشحن (Shipped)</option>
                  <option value="delivered">تم التوصيل (Delivered)</option>
                  <option value="cancelled">ملغي (Cancelled)</option>
                </select>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-8 text-center text-xs text-neutral-400">
                  لا توجد طلبات مطابقة للبحث
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-black text-emerald-400">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {new Date(order.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
                        </span>
                      </div>

                      {/* Status Dropdown Updater */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-400 font-medium">
                          {t.status}:
                        </span>
                        <select
                          value={order.orderStatus}
                          onChange={(e) =>
                            handleOrderStatusUpdate(order.id, e.target.value as OrderStatus)
                          }
                          className="rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="pending">قيد الانتظار (Pending)</option>
                          <option value="processing">جاري التجهيز (Processing)</option>
                          <option value="shipped">تم الشحن (Shipped)</option>
                          <option value="delivered">تم التوصيل (Delivered)</option>
                          <option value="cancelled">ملغي (Cancelled)</option>
                        </select>
                      </div>
                    </div>

                    {/* Customer Info & Items */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <div className="text-neutral-500 font-medium">{t.customer}</div>
                        <div className="font-bold text-white mt-1">{order.customerName}</div>
                        <div className="font-mono text-neutral-400">{order.customerPhone}</div>
                        <div className="text-neutral-400 mt-1">
                          {order.shippingAddress.city} - {order.shippingAddress.address}
                        </div>
                      </div>

                      <div>
                        <div className="text-neutral-500 font-medium">{t.payment}</div>
                        <div className="font-bold text-white mt-1">
                          {order.paymentMethod === 'cash_on_delivery'
                            ? 'دفع عند الاستلام'
                            : order.paymentMethod === 'credit_card'
                            ? 'بطاقة ائتمانية'
                            : 'فودافون كاش / إنستاباي'}
                        </div>
                        <div className="mt-1">
                          <span
                            className={`font-semibold ${
                              order.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          >
                            {order.paymentStatus === 'paid' ? 'مدفوع ✓' : 'في انتظار التحصيل'}
                          </span>
                        </div>
                        <div className="mt-2 font-mono font-black text-sm text-white">
                          الإجمالي: ${order.total}
                        </div>
                      </div>

                      {/* Items */}
                      <div>
                        <div className="text-neutral-500 font-medium mb-1">
                          {t.itemsOrdered} ({order.items.length})
                        </div>
                        <div className="space-y-1.5">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <img
                                src={it.imageUrl}
                                alt={it.name}
                                referrerPolicy="no-referrer"
                                className="h-7 w-7 rounded object-cover bg-neutral-950"
                              />
                              <span className="font-medium text-neutral-200">
                                {language === 'ar' ? it.nameAr : it.name}
                              </span>
                              <span className="text-neutral-400 font-mono">
                                (EU {it.size} × {it.quantity})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white font-['Cairo',sans-serif]">
              {editingProduct ? t.editProductBtn : t.addProductBtn}
            </h2>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium">{t.productNameAr}</label>
                  <input
                    type="text"
                    required
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium">{t.productNameEn}</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-neutral-300 font-medium">{t.brand}</label>
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value as any })}
                    className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 p-2 text-white"
                  >
                    <option value="Nike">Nike</option>
                    <option value="Adidas">Adidas</option>
                    <option value="Puma">Puma</option>
                    <option value="Mizuno">Mizuno</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium">{t.surfaceType}</label>
                  <select
                    value={formData.surface}
                    onChange={(e) => setFormData({ ...formData, surface: e.target.value as any })}
                    className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 p-2 text-white"
                  >
                    <option value="FG">FG (عشب طبيعي)</option>
                    <option value="AG">AG (عشب صناعي)</option>
                    <option value="SG">SG (أرضيات لينة)</option>
                    <option value="TF">TF (ترتان)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium">{t.price}</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-medium">{t.stockCount}</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium">{t.imageUrl}</label>
                <input
                  type="text"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium">{t.descriptionAr}</label>
                <textarea
                  rows={2}
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-neutral-700 bg-neutral-800 p-2 text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="accent-emerald-500 h-4 w-4"
                />
                <label htmlFor="featured-check" className="text-neutral-300 cursor-pointer">
                  {t.featuredProduct}
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 font-bold text-neutral-300 hover:bg-neutral-700"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-500 px-4 py-2 font-bold text-neutral-950 hover:bg-emerald-400"
                >
                  {t.saveProduct}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK STOCK ADJUST MODAL */}
      {adjustingStockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-900 p-5 shadow-xl text-center">
            <h3 className="text-base font-bold text-white font-['Cairo',sans-serif]">
              {t.quickStockAdjust}
            </h3>
            <p className="mt-1 text-xs text-neutral-400">
              {language === 'ar' ? adjustingStockProduct.nameAr : adjustingStockProduct.name}
            </p>
            <div className="my-3 text-xs text-neutral-300">
              المخزون الحالي: <span className="font-bold font-mono text-emerald-400">{adjustingStockProduct.stock}</span>
            </div>

            <div className="flex items-center justify-center gap-3 my-4">
              <button
                onClick={() => setStockDelta(-1)}
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1 text-sm font-bold text-neutral-200"
              >
                -1
              </button>
              <input
                type="number"
                value={stockDelta}
                onChange={(e) => setStockDelta(Number(e.target.value))}
                className="w-20 rounded-lg border border-neutral-700 bg-neutral-800 p-1 text-center font-mono font-bold text-white"
              />
              <button
                onClick={() => setStockDelta((d) => d + 5)}
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1 text-sm font-bold text-neutral-200"
              >
                +5
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setAdjustingStockProduct(null)}
                className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 py-2 text-xs font-bold text-neutral-300"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleQuickStockAdjust}
                className="flex-1 rounded-lg bg-emerald-500 py-2 text-xs font-bold text-neutral-950 hover:bg-emerald-400"
              >
                حفظ التعديل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-red-400" />
            <h3 className="mt-3 text-sm font-bold text-white">
              {t.deleteConfirm}
            </h3>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setDeletingProductId(null)}
                className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 py-2 text-xs font-bold text-neutral-300"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => handleDeleteProduct(deletingProductId)}
                className="flex-1 rounded-lg bg-red-600 py-2 text-xs font-bold text-white hover:bg-red-500"
              >
                {t.deleteProductBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
