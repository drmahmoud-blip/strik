import React, { useState } from 'react';
import { X, ShoppingBag, ShieldCheck, Check, Info } from 'lucide-react';
import { Product } from '../types.js';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { translations } from '../translations.js';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
}) => {
  const { language } = useAuth();
  const { addToCart } = useCart();
  const t = translations[language];

  if (!product) return null;

  // default to first available size
  const firstAvailableSize =
    product.sizes?.find((s) => s.stock > 0)?.size || product.sizes?.[0]?.size || 42;
  const [selectedSize, setSelectedSize] = useState<number>(firstAvailableSize);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedNotice, setAddedNotice] = useState(false);

  const displayName = language === 'ar' ? product.nameAr : product.name;
  const displayDesc = language === 'ar' ? product.descriptionAr : product.description;
  const selectedSizeStock =
    product.sizes?.find((s) => s.size === selectedSize)?.stock ?? product.stock;

  const handleAdd = () => {
    addToCart(product, selectedSize, quantity);
    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800/80 text-neutral-300 backdrop-blur-md transition-colors hover:bg-neutral-700 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Showcase */}
          <div className="relative flex items-center justify-center bg-neutral-950 p-6">
            <img
              src={product.imageUrl}
              alt={displayName}
              referrerPolicy="no-referrer"
              className="max-h-[380px] w-full rounded-xl object-contain drop-shadow-2xl"
            />
            <div className="absolute bottom-4 start-4 rounded bg-black/70 px-2.5 py-1 text-xs text-neutral-300">
              {product.brand} · {product.surface}
            </div>
          </div>

          {/* Details & Purchase Module */}
          <div className="flex flex-col justify-between p-6 sm:p-8">
            <div>
              {/* Brand and Surface */}
              <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium">
                <span className="uppercase text-emerald-400">{product.brand}</span>
                <span aria-hidden="true">·</span>
                <span>{product.surfaceLabelAr || product.surfaceLabel}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{product.weightGrams}g</span>
              </div>

              {/* Title */}
              <h2 className="mt-2 text-xl sm:text-2xl font-bold text-white font-['Cairo',sans-serif]">
                {displayName}
              </h2>

              {/* Pricing */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl font-black text-white tabular-nums font-mono">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-neutral-500 line-through tabular-nums font-mono">
                    ${product.originalPrice}
                  </span>
                )}
                <span className="text-xs text-emerald-400 font-medium">
                  {language === 'ar' ? 'شحن سريع ومجاني' : 'Express Delivery'}
                </span>
              </div>

              {/* Description */}
              <p className="mt-3 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {displayDesc}
              </p>

              {/* Colorway Spec */}
              <div className="mt-4 rounded-lg bg-neutral-950/60 p-3 text-xs text-neutral-400">
                <div className="flex justify-between">
                  <span>{t.colorway}:</span>
                  <span className="font-medium text-neutral-200">
                    {language === 'ar' ? product.colorwayAr : product.colorway}
                  </span>
                </div>
              </div>

              {/* Sizing Selector */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-neutral-200">{t.selectSize}</label>
                  <span className="text-neutral-400">
                    {selectedSizeStock > 0
                      ? language === 'ar'
                        ? `متوفر ${selectedSizeStock} زوج`
                        : `${selectedSizeStock} pairs in stock`
                      : t.outOfStock}
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-5 gap-2">
                  {product.sizes?.map((sizeItem) => {
                    const isSelected = selectedSize === sizeItem.size;
                    const isAvailable = sizeItem.stock > 0;
                    return (
                      <button
                        key={sizeItem.size}
                        disabled={!isAvailable}
                        onClick={() => setSelectedSize(sizeItem.size)}
                        className={`flex flex-col items-center justify-center rounded-lg border py-2 text-xs font-bold transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500'
                            : isAvailable
                            ? 'border-neutral-700 bg-neutral-800 text-neutral-200 hover:border-neutral-500'
                            : 'cursor-not-allowed border-neutral-800 bg-neutral-950/60 text-neutral-600 line-through'
                        }`}
                      >
                        <span className="font-mono tabular-nums">{sizeItem.size}</span>
                        <span className="text-[10px] font-normal text-neutral-400">
                          {isAvailable ? `${sizeItem.stock}` : '0'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fit Guide Note */}
              <div className="mt-4 flex items-start gap-2 text-[11px] text-neutral-400">
                <Info className="h-4 w-4 shrink-0 text-neutral-500 mt-0.5" />
                <span>{t.fitGuideText}</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-neutral-800">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center rounded-lg border border-neutral-700 bg-neutral-800">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-2.5 py-1.5 text-neutral-300 hover:text-white"
                  >
                    -
                  </button>
                  <span className="px-2 text-xs font-bold text-white font-mono tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) =>
                        Math.min(selectedSizeStock, q + 1)
                      )
                    }
                    className="px-2.5 py-1.5 text-neutral-300 hover:text-white"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <button
                  onClick={handleAdd}
                  disabled={selectedSizeStock <= 0}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
                    addedNotice
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400 active:scale-[0.99]'
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  {addedNotice ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>{language === 'ar' ? 'تمت الإضافة بنجاح!' : 'Added to Cart!'}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      <span>
                        {t.addToCart} · ${(product.price * quantity).toFixed(0)}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
