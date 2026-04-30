import { Product } from "@/data/products";
import { useState } from "react";

const ProductCardGrid = ({ product, onAddToCart, onProductClick }: {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onProductClick: (product: Product) => void;
}) => {
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleImageError = () => setImageError(true);

  const hasPvpAndPuntoPas = product.pvpPrice && product.puntoPasPrice && product.pvpPrice > product.puntoPasPrice;
  const hasDiscount = hasPvpAndPuntoPas || (product.originalPrice && product.originalPrice > product.price);
  const discountPercent = hasPvpAndPuntoPas 
    ? Math.round((1 - product.puntoPasPrice! / product.pvpPrice!) * 100)
    : hasDiscount 
      ? Math.round((1 - product.price / product.originalPrice!) * 100)
      : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, quantity);
    setQuantity(1);
  };

  return (
    <div 
      className="group bg-white rounded-xl overflow-hidden cursor-pointer h-full flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
      style={{ border: '1px solid #f1f1f1', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
      onClick={() => onProductClick(product)}
    >
      <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden">
        {product.stock === 0 && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90">
            <span className="text-red-600 text-sm font-semibold px-4 py-2 bg-red-50 rounded-full">Sin stock</span>
          </div>
        )}
        {hasPvpAndPuntoPas && product.stock > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: '#FA003F', color: 'white' }}>
              -{discountPercent}%
            </span>
          </div>
        )}
        <div className="w-full h-full flex items-center justify-center p-4">
          {imageError ? (
            <span className="text-4xl">📦</span>
          ) : (
            <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain" onError={handleImageError} loading="lazy" />
          )}
        </div>
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <span className="text-xs uppercase tracking-wider text-gray-500">{product.brand || 'General'}</span>
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 font-manrope">{product.name}</h3>
        <div className="mt-auto">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex flex-col">
              <span className="text-lg font-bold font-manrope" style={{ color: '#FA003F' }}>
                ${(hasPvpAndPuntoPas ? product.puntoPasPrice : product.price)?.toFixed(2)}
              </span>
              {hasPvpAndPuntoPas && (
                <span className="text-xs text-gray-400 line-through font-manrope">
                  ${product.pvpPrice?.toFixed(2)}
                </span>
              )}
              {!hasPvpAndPuntoPas && hasDiscount && product.originalPrice && (
                <span className="text-xs text-gray-400 line-through font-manrope">
                  ${product.originalPrice?.toFixed(2)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); setQuantity(q => Math.max(1, q - 1)); }}
                disabled={product.stock === 0 || quantity <= 1}
                className="w-6 h-6 rounded flex items-center justify-center text-sm font-bold disabled:opacity-30"
                style={{ backgroundColor: '#f3f4f6', color: '#374151' }}
              >
                -
              </button>
              <input
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(e) => {
                  e.stopPropagation();
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.max(1, Math.min(val, product.stock || 999)));
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-6 rounded text-center text-xs font-medium border"
                style={{ borderColor: '#e5e7eb' }}
              />
              <button
                onClick={(e) => { e.stopPropagation(); setQuantity(q => Math.min(product.stock || 999, q + 1)); }}
                disabled={product.stock === 0 || quantity >= (product.stock || 999)}
                className="w-6 h-6 rounded flex items-center justify-center text-sm font-bold disabled:opacity-30"
                style={{ backgroundColor: '#f3f4f6', color: '#374151' }}
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="w-full py-2 rounded-lg text-sm font-semibold disabled:opacity-40 font-manrope"
            style={{ backgroundColor: '#FA003F', color: 'white' }}
          >
            {product.stock === 0 ? 'Sin stock' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ITEMS_PER_PAGE = 18;

export const ProductGrid = ({ products, onAddToCart, onProductClick, title }: {
  products: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
  onProductClick: (product: Product) => void;
  title?: string;
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleProducts = products.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="px-4 pb-12 bg-white">
      <div className="flex items-center justify-between mb-4 pt-4">
        <h2 className="text-xl font-bold" style={{ color: '#FA003F', fontFamily: 'Manrope, sans-serif' }}>
          {title}
        </h2>
        <span className="text-sm text-gray-500 font-manrope">
          {products.length} {products.length === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {visibleProducts.map((product) => (
          <ProductCardGrid
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onProductClick={onProductClick}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
          >
            ‹
          </button>
          
          {getPageNumbers().map((page, idx) => (
            typeof page === 'number' ? (
              <button
                key={idx}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                  currentPage === page ? 'text-white' : 'hover:bg-gray-100'
                }`}
                style={{ 
                  backgroundColor: currentPage === page ? '#FA003F' : 'transparent',
                  color: currentPage === page ? 'white' : '#374151'
                }}
              >
                {page}
              </button>
            ) : (
              <span key={idx} className="w-8 h-8 flex items-center justify-center text-sm text-gray-400">
                {page}
              </span>
            )
          ))}
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};