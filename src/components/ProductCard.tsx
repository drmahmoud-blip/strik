import React from 'react';
import { ShoppingBag, Eye, Zap } from 'lucide-react';
import { Product } from '../types.js';
import { useAuth } from '../context/AuthContext.js';
import { translations } from '../translations.js';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onQuickAdd,
}) => {
  const { language } = useAuth();
  const t = translations[language];

  const displayName = language === 'ar' ? product.nameAr : product.name;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-4 transition-all duration-200 hover:-translate-y-1 hover:border-neutral-700 hover:shadow-xl hover:shadow-black/40">
      {/* Product Image Area */}
      <div
        onClick={() => onSelect(product)}
        className="relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-lg bg-neutral-950/80 flex items-center justify-center"
      >
        <img
          src={product.imageUrl}
          alt={displayName}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // graceful fallback if image fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Fallback container if image fails or loading */}
        <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-950 p-4 text-center">
          <Zap className="h-8 w-8 text-neutral-700" />
          <span className="mt-2 text-xs text-neutral-500">{displayName}</span>
        </div>

        {/* Quiet status lead-in (No colored candy pills, clean text) */}
        {product.featured && (
          <div className="absolute top-2.5 start-2.5 rounded bg-black/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 backdrop-blur-sm">
            {language === 'ar' ? 'مميز بالملعب' : 'Featured Matchday'}
          </div>
        )}

        {isOutOfStock ? (
          <div className="absolute top-2.5 end-2.5 rounded bg-red-950/80 px-2 py-0.5 text-[10px] font-semibold text-red-300 backdrop-blur-sm">
            {t.outOfStock}
          </div>
        ) : isLowStock ? (
          <div className="absolute top-2.5 end-2.5 rounded bg-amber-950/80 px-2 py-0.5 text-[10px] font-semibold text-amber-300 backdrop-blur-sm">
            {language === 'ar' ? `متبقي ${product.stock} فقط` : `${product.stock} left`}
          </div>
        ) : null}
      </div>

      {/* Content Area */}
      <div className="mt-3 flex flex-1 flex-col justify-between">
        <div>
          {/* Metadata: Brand and Surface (Clean unboxed text with dot separator) */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <span className="uppercase tracking-wider">{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">{product.surface}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums font-mono text-[11px] text-neutral-500">
              {product.weightGrams}g
            </span>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onSelect(product)}
            className="mt-1 cursor-pointer text-base font-bold text-neutral-100 line-clamp-1 transition-colors hover:text-emerald-400 font-['Cairo',sans-serif]"
          >
            {displayName}
          </h3>

          {/* Colorway note */}
          <p className="mt-0.5 text-xs text-neutral-400 line-clamp-1">
            {language === 'ar' ? product.colorwayAr : product.colorway}
          </p>
        </div>

        {/* Pricing & Actions */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-neutral-800/80">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-white tabular-nums font-mono">
              ${product.price}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-neutral-500 line-through tabular-nums font-mono">
                ${product.originalPrice}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelect(product)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 transition-colors hover:border-neutral-700 hover:text-white"
              title={t.viewDetails}
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => onQuickAdd(product)}
              disabled={isOutOfStock}
              className="flex h-8 items-center gap-1.5 rounded-lg bg-emerald-500 px-3 text-xs font-bold text-neutral-950 transition-colors hover:bg-emerald-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              title={t.addToCart}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>{t.addToCart}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
