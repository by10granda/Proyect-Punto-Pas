import { Product } from "@/data/products";
import { useState, memo } from "react";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  compact?: boolean;
}

export const ProductCard = memo(({ product, onAddToCart, onProductClick, compact = false }: ProductCardProps) => {
  const [imageError, setImageError] = useState(false);


  const handleImageError = () => {
    setImageError(true);
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round((1 - product.price / product.originalPrice!) * 100)
    : 0;

  return (
    <div 
      className="group bg-white rounded-xl overflow-hidden cursor-pointer h-full flex flex-col transition-all duration-200 sm:hover:shadow-md sm:hover:-translate-y-0.5"
      style={{ 
        border: '1px solid #efefef',
        boxShadow: '0 1px 6px rgba(0,0,0,0.03)'
      }}
      onClick={() => onProductClick(product)}
    >
      <div className={`relative ${compact ? "aspect-[4/3]" : "aspect-[4/5]"} bg-gray-50 overflow-hidden`}>
        {product.stock === 0 && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90">
            <span className="text-red-600 text-sm font-semibold px-4 py-2 bg-red-50 rounded-full">
              Sin stock
            </span>
          </div>
        )}

        {hasDiscount && product.stock > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <span 
              className="text-xs font-semibold px-2 py-1 rounded-full"
              style={{ backgroundColor: '#FA003F', color: 'white' }}
            >
              -{discountPercent}%
            </span>
          </div>
        )}

        <div className={`w-full h-full flex items-center justify-center ${compact ? "p-2" : "p-3 sm:p-4"}`}>
          {imageError ? (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <span className="text-4xl mb-2">📦</span>
              <span className="text-sm">Sin imagen</span>
            </div>
          ) : (
            <img
              src={product.image}
              alt={product.name}
              className="max-w-full max-h-full object-contain transition-transform duration-300 sm:group-hover:scale-105"
              onError={handleImageError}
              loading="lazy"
            />
          )}
        </div>
      </div>

      <div className={`${compact ? "p-2" : "p-3 sm:p-4"} flex flex-col flex-grow`}>
        <div className="mb-1">
          <span className={`${compact ? "text-[10px]" : "text-[10px] sm:text-xs"} uppercase tracking-wider text-gray-500 truncate block`}>
            {product.brand || 'General'}
          </span>
        </div>

        <h3 className={`${compact ? "text-[11px] mb-1.5" : "text-xs sm:text-sm mb-2 sm:mb-3"} font-semibold text-gray-900 line-clamp-2 leading-snug font-manrope`}>
          {product.name}
        </h3>

        <div className="mt-auto">
          <div className={`flex flex-wrap items-baseline ${compact ? "gap-1 mb-1.5" : "gap-1.5 sm:gap-2 mb-2 sm:mb-3"}`}>
            <span className={`${compact ? "text-base" : "text-[17px] sm:text-[18px]"} font-black leading-none`} style={{ color: '#FF0000', fontFamily: 'Nunito, sans-serif' }}>
              ${(product.puntoPasPrice || product.pvpPrice || product.price)?.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through" style={{ fontFamily: 'Nunito, sans-serif' }}>
                ${product.originalPrice?.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={product.stock === 0}
            className={`w-full ${compact ? "py-1.5 text-[10px]" : "py-2 text-xs"} rounded-lg font-semibold transition hover:brightness-110 disabled:opacity-40`}
            style={{ backgroundColor: '#FF0000', color: 'white' }}
          >
            {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </div>
  );
});
