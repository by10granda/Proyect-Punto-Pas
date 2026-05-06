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
      className="group bg-white rounded-xl overflow-hidden cursor-pointer h-full flex flex-col transition-all duration-200 sm:hover:shadow-lg sm:hover:-translate-y-1"
      style={{ 
        border: '1px solid #f1f1f1',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
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
            <span className={`${compact ? "text-base" : "text-base sm:text-xl"} font-bold text-gray-900 font-manrope`}>
              ${product.price?.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through font-manrope">
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
            className={`w-full ${compact ? "py-1.5 text-[11px]" : "py-2 sm:py-2.5 text-xs sm:text-sm"} rounded-lg font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:border-none font-manrope`}
            style={{ 
              backgroundColor: '#FA003F', 
              color: 'white',
              border: '1px solid #FA003F'
            }}
            onMouseOver={(e) => {
              if (product.stock !== 0) {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#FA003F';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#FA003F';
              e.currentTarget.style.color = 'white';
            }}
          >
            {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </div>
  );
});
