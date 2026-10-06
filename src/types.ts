export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface ProductSize {
  size: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  brand: 'Nike' | 'Adidas' | 'Puma' | 'Mizuno' | 'New Balance';
  surface: 'FG' | 'AG' | 'SG' | 'TF' | 'IC'; // Firm Ground, Artificial Grass, Soft Ground, Turf, Indoor Court
  surfaceLabel?: string;
  surfaceLabelAr?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sizes: ProductSize[];
  description: string;
  descriptionAr: string;
  imageUrl: string;
  secondaryImageUrl?: string;
  colorway: string;
  colorwayAr: string;
  weightGrams: number;
  featured: boolean;
  rating: number;
  reviewsCount: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  size: number;
  quantity: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cash_on_delivery' | 'credit_card' | 'vodafone_cash' | 'instapay';
export type PaymentStatus = 'paid' | 'pending';

export interface OrderItem {
  productId: string;
  name: string;
  nameAr: string;
  price: number;
  size: number;
  quantity: number;
  imageUrl: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  postalCode?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  changeAmount: number;
  previousStock: number;
  newStock: number;
  reason: string;
  updatedBy: string;
  timestamp: string;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalProducts: number;
  lowStockCount: number;
  monthlySales: { month: string; monthAr: string; revenue: number; ordersCount: number }[];
  salesBySurface: { surface: string; labelAr: string; count: number; revenue: number }[];
  salesByBrand: { brand: string; count: number; revenue: number }[];
  ordersByStatus: { status: OrderStatus; labelAr: string; count: number }[];
  topProducts: {
    id: string;
    name: string;
    nameAr: string;
    brand: string;
    imageUrl: string;
    unitsSold: number;
    revenue: number;
  }[];
}
