import { Product } from "@/data/products";
import { useState, memo } from "react";

interface ProductListProps {
  product: Product;
  index: number;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

export const ProductListItem = memo(({ product, index, onAddToCart, onProductClick }: ProductListProps) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const hasPvpAndPuntoPas = product.pvpPrice && product.puntoPasPrice && product.pvpPrice > product.puntoPasPrice;
  const hasDiscount = hasPvpAndPuntoPas || (product.originalPrice && product.originalPrice > product.price);
  const discountPercent = hasPvpAndPuntoPas 
    ? Math.round((1 - product.puntoPasPrice! / product.pvpPrice!) * 100)
    : hasDiscount 
      ? Math.round((1 - product.price / product.originalPrice!) * 100)
      : 0;

  return (
    <div 
      className="group flex items-center gap-4 py-3 px-4 bg-white rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50"
      style={{ borderBottom: '1px solid #f5f5f5' }}
      onClick={() => onProductClick(product)}
    >
      <span className="text-sm font-medium text-gray-400 w-6 flex-shrink-0 font-manrope">
        {index + 1}.
      </span>

      <div className="w-16 h-16 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
        {imageError ? (
          <span className="text-2xl">📦</span>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain"
            onError={handleImageError}
            loading="lazy"
          />
        )}
      </div>

      <div className="flex-grow min-w-0 pr-4">
        <div className="flex items-center gap-2 mb-1">
          {hasPvpAndPuntoPas && product.stock > 0 && (
            <span 
              className="text-xs font-semibold px-1.5 py-0.5 rounded"
              style={{ backgroundColor: '#FA003F', color: 'white' }}
            >
              -{discountPercent}%
            </span>
          )}
          {product.stock === 0 && (
            <span className="text-xs font-medium text-red-600">
              Sin stock
            </span>
          )}
        </div>
        <h3 className="text-sm font-medium text-gray-900 truncate group-hover:text-red-600 transition-colors font-manrope">
          {product.name}
        </h3>
        <span className="text-xs text-gray-500 font-manrope">
          {product.brand || 'General'}
        </span>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right">
          <span className="text-lg font-bold font-manrope" style={{ color: '#FA003F' }}>
            ${(hasPvpAndPuntoPas ? product.puntoPasPrice : product.price)?.toFixed(2)}
          </span>
          {hasPvpAndPuntoPas && (
            <span className="text-xs text-gray-400 line-through block font-manrope">
              ${product.pvpPrice?.toFixed(2)}
            </span>
          )}
          {!hasPvpAndPuntoPas && hasDiscount && product.originalPrice && (
            <span className="text-xs text-gray-400 line-through block font-manrope">
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
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed font-manrope"
          style={{ 
            backgroundColor: '#FA003F', 
            color: 'white'
          }}
          onMouseOver={(e) => {
            if (product.stock !== 0) {
              e.currentTarget.style.backgroundColor = '#e00038';
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#FA003F';
          }}
        >
          {product.stock === 0 ? 'Sin stock' : 'Agregar'}
        </button>
      </div>
    </div>
  );
});

interface ProductListContainerProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  title?: string;
}

export const ProductList = memo(({ products, onAddToCart, onProductClick, title }: ProductListContainerProps) => {
  if (products.length === 0) {
    return (
      <div className="px-4 py-16 text-center bg-white rounded-xl">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🔍</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1 font-manrope">
          Sin productos
        </h3>
        <p className="text-sm text-gray-500 font-manrope">
          Intenta con otra búsqueda o categoría
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl">
      {title && (
        <div className="flex items-center justify-between mb-4 px-4 pt-4">
          <h2 
            className="text-xl font-bold" 
            style={{ color: '#FA003F', fontFamily: 'Manrope, sans-serif' }}
          >
            {title}
          </h2>
          <span className="text-sm text-gray-500 font-manrope">
            {products.length} {products.length === 1 ? 'resultado' : 'resultados'}
          </span>
        </div>
      )}
      <div className="flex flex-col">
        {products.map((product, idx) => (
          <ProductListItem
            key={product.id}
            product={product}
            index={idx}
            onAddToCart={onAddToCart}
            onProductClick={onProductClick}
          />
        ))}
      </div>
    </div>
  );
});