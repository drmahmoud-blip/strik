import React from 'react';
import { CheckCircle, Package, ArrowRight, ArrowLeft } from 'lucide-react';
import { Order } from '../types.js';
import { useAuth } from '../context/AuthContext.js';
import { translations } from '../translations.js';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onViewOrders: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onViewOrders,
}) => {
  const { language } = useAuth();
  const t = translations[language];

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 p-6 sm:p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-8 ring-emerald-500/10">
          <CheckCircle className="h-8 w-8" />
        </div>

        <h2 className="mt-4 text-2xl font-black text-white font-['Cairo',sans-serif]">
          {t.orderSuccessTitle}
        </h2>
        <p className="mt-1 text-xs text-neutral-400">
          {t.orderSuccessDesc}
          <span className="font-mono font-bold text-emerald-400 tabular-nums">
            {order.orderNumber}
          </span>
        </p>

        {/* Receipt summary card */}
        <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-950/70 p-4 text-start text-xs space-y-2">
          <div className="flex justify-between text-neutral-300">
            <span>{t.customer}:</span>
            <span className="font-bold text-white">{order.customerName}</span>
          </div>
          <div className="flex justify-between text-neutral-300">
            <span>{t.phoneLabel}:</span>
            <span className="font-mono text-neutral-200">{order.customerPhone}</span>
          </div>
          <div className="flex justify-between text-neutral-300">
            <span>{t.city}:</span>
            <span className="text-neutral-200">{order.shippingAddress.city}</span>
          </div>
          <div className="flex justify-between text-neutral-300">
            <span>{t.itemsOrdered}:</span>
            <span className="font-bold text-emerald-400">
              {order.items.reduce((acc, it) => acc + it.quantity, 0)} {language === 'ar' ? 'حذاء' : 'items'}
            </span>
          </div>
          <div className="pt-2 border-t border-neutral-800 flex justify-between font-bold text-white text-sm">
            <span>{t.total}:</span>
            <span className="font-mono tabular-nums text-emerald-400">${order.total}</span>
          </div>
        </div>

        <p className="mt-4 text-xs text-neutral-400 leading-relaxed">
          {t.orderSuccessNotice}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-neutral-800 py-3 text-xs font-bold text-neutral-200 hover:bg-neutral-700"
          >
            {t.continueShopping}
          </button>
          <button
            onClick={onViewOrders}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-neutral-950 hover:bg-emerald-400"
          >
            <Package className="h-4 w-4" />
            <span>{t.viewOrderDetails}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
