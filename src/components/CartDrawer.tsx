import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import { translations } from '../translations.js';
import { PaymentMethod, Order } from '../types.js';

interface CartDrawerProps {
  onOrderComplete: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOrderComplete }) => {
  const { cart, removeFromCart, updateQuantity, clearCart, subtotal, isCartOpen, setIsCartOpen } = useCart();
  const { user, token, language } = useAuth();
  const t = translations[language];

  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState('القاهرة');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const shippingFee = subtotal > 200 || subtotal === 0 ? 0 : 15;
  const grandTotal = subtotal + shippingFee;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const orderPayload = {
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        nameAr: item.product.nameAr,
        price: item.product.price,
        size: item.size,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl,
      })),
      shippingAddress: {
        fullName,
        phone,
        city,
        address,
      },
      paymentMethod,
      notes,
    };

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'فشل إتمام الطلب');
        setIsSubmitting(false);
        return;
      }

      clearCart();
      setIsCartOpen(false);
      setStep('cart');
      onOrderComplete(data.order);
    } catch {
      setErrorMessage('تعذر الاتصال بالخادم، يرجى المحاولة مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
      <div className="relative flex h-full w-full max-w-md flex-col bg-neutral-900 shadow-2xl border-s border-neutral-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 p-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white font-['Cairo',sans-serif]">
              {step === 'cart' ? t.cartTitle : t.checkoutTitle}
            </h2>
          </div>
          <button
            onClick={() => {
              setIsCartOpen(false);
              setStep('cart');
            }}
            className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {errorMessage && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
              {errorMessage}
            </div>
          )}

          {step === 'cart' ? (
            cart.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-6 text-neutral-400">
                <ShoppingBag className="h-12 w-12 text-neutral-700" />
                <p className="mt-4 text-sm">{t.cartEmpty}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={`${item.product.id}-${item.size}`}
                    className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-950/50 p-3"
                  >
                    <img
                      src={item.product.imageUrl}
                      alt={language === 'ar' ? item.product.nameAr : item.product.name}
                      referrerPolicy="no-referrer"
                      className="h-16 w-16 rounded-lg object-cover bg-neutral-900"
                    />
                    <div className="flex flex-1 flex-col">
                      <h4 className="text-xs font-bold text-white line-clamp-1">
                        {language === 'ar' ? item.product.nameAr : item.product.name}
                      </h4>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-neutral-400">
                        <span>EU {item.size}</span>
                        <span>·</span>
                        <span className="font-mono text-emerald-400 tabular-nums font-bold">
                          ${item.product.price}
                        </span>
                      </div>

                      {/* Stepper */}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-md border border-neutral-800 bg-neutral-900 text-xs">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.size, item.quantity - 1)
                            }
                            className="px-2 py-0.5 text-neutral-300 hover:text-white"
                          >
                            -
                          </button>
                          <span className="px-2 font-mono tabular-nums">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.size, item.quantity + 1)
                            }
                            className="px-2 py-0.5 text-neutral-300 hover:text-white"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id, item.size)}
                          className="text-neutral-500 hover:text-red-400"
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Checkout Form */
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
              <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                {t.shippingInfo}
              </h3>

              <div>
                <label className="block text-xs font-medium text-neutral-300">
                  {t.fullName}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="محمد أحمد"
                  className="mt-1 block w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300">
                  {t.phoneLabel}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+2010..."
                  className="mt-1 block w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300">
                  {t.city}
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="القاهرة - المعادي"
                  className="mt-1 block w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300">
                  {t.address}
                </label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="رقم المبنى، الشارع، تفاصيل الشقة"
                  className="mt-1 block w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Payment Methods */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  {t.paymentMethod}
                </label>

                <div className="space-y-2">
                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-xs transition-colors ${
                      paymentMethod === 'cash_on_delivery'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                        : 'border-neutral-800 bg-neutral-950/60 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-emerald-400" />
                      <span>{t.cod}</span>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash_on_delivery"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={() => setPaymentMethod('cash_on_delivery')}
                      className="accent-emerald-500"
                    />
                  </label>

                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-xs transition-colors ${
                      paymentMethod === 'credit_card'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                        : 'border-neutral-800 bg-neutral-950/60 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-blue-400" />
                      <span>{t.creditCard}</span>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={() => setPaymentMethod('credit_card')}
                      className="accent-emerald-500"
                    />
                  </label>

                  <label
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-xs transition-colors ${
                      paymentMethod === 'vodafone_cash'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                        : 'border-neutral-800 bg-neutral-950/60 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-red-400" />
                      <span>{t.vodafoneCash}</span>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="vodafone_cash"
                      checked={paymentMethod === 'vodafone_cash'}
                      onChange={() => setPaymentMethod('vodafone_cash')}
                      className="accent-emerald-500"
                    />
                  </label>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer Summary & Action */}
        {cart.length > 0 && (
          <div className="border-t border-neutral-800 bg-neutral-950/80 p-4">
            <div className="space-y-1.5 text-xs text-neutral-400">
              <div className="flex justify-between">
                <span>{t.subtotal}</span>
                <span className="font-mono tabular-nums text-white">${subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.shipping}</span>
                <span className="font-mono tabular-nums text-emerald-400">
                  {shippingFee === 0 ? t.freeShipping : `$${shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-800 text-sm font-bold text-white">
                <span>{t.total}</span>
                <span className="font-mono tabular-nums text-lg text-emerald-400">
                  ${grandTotal}
                </span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {step === 'checkout' && (
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-xs font-bold text-neutral-300 hover:bg-neutral-700"
                >
                  {language === 'ar' ? 'رجوع' : 'Back'}
                </button>
              )}

              {step === 'cart' ? (
                <button
                  onClick={() => setStep('checkout')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs sm:text-sm font-bold text-neutral-950 hover:bg-emerald-400 active:scale-[0.99]"
                >
                  <span>{t.checkoutBtn}</span>
                  {language === 'ar' ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </button>
              ) : (
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs sm:text-sm font-bold text-neutral-950 hover:bg-emerald-400 active:scale-[0.99] disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isSubmitting ? 'جاري تأكيد الطلب...' : t.confirmOrderBtn}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
