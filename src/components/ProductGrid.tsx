import { Product } from "@/data/products";
import { useState, useEffect } from "react";

const ProductCardGrid = ({ product, onAddToCart, onProductClick }: {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onProductClick: (product: Product) => void;
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const hasStock = product.stock > 0;
  const imageCandidates = (product.images && product.images.length > 0 ? product.images : [product.image]).filter(Boolean);
  const currentImage = imageCandidates[imageIndex] || product.image;
  const resolvedImageSrc = retryAttempt > 0
    ? `${currentImage}${currentImage.includes("?") ? "&" : "?"}r=${Date.now()}`
    : currentImage;

  useEffect(() => {
    setImageError(false);
    setImageIndex(0);
    setRetryAttempt(0);
  }, [product.id, product.image]);

  const handleImageError = () => {
    if (retryAttempt === 0) {
      setRetryAttempt(1);
      return;
    }

    if (imageIndex < imageCandidates.length - 1) {
      setImageIndex((prev) => prev + 1);
      setRetryAttempt(0);
      return;
    }
    setImageError(true);
  };

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
      className="group bg-white rounded-xl overflow-hidden cursor-pointer h-full flex flex-col transition-all duration-200 sm:hover:shadow-sm"
      style={{ border: '1px solid #ececec', boxShadow: '0 1px 4px rgba(0,0,0,0.025)' }}
      onClick={() => onProductClick(product)}
    >
        <div className="relative aspect-[4/5] bg-gray-50/60 overflow-hidden">
        {!hasStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90">
            <span className="text-red-600 text-sm font-semibold px-4 py-2 bg-red-50 rounded-full">Sin stock</span>
          </div>
        )}
        {hasPvpAndPuntoPas && hasStock && (
          <div className="absolute top-2 left-2 z-10">
            <span className="text-[10px] font-semibold px-2 py-1 rounded-lg" style={{ backgroundColor: '#FA003F', color: 'white' }}>
              -{discountPercent}%
            </span>
          </div>
        )}
          <div className="w-full h-full flex items-center justify-center p-2.5 sm:p-3">
          {imageError ? (
            <span className="text-4xl">📦</span>
          ) : (
            <img src={resolvedImageSrc} alt={product.name} className="max-w-full max-h-full object-contain" onError={handleImageError} loading="lazy" />
          )}
        </div>
      </div>
      <div className="p-2.5 sm:p-3 flex flex-col flex-grow">
        <span className="text-[7px] uppercase tracking-[0.1em] text-gray-400 truncate">{product.brand || 'General'}</span>
        <h3 className="text-[11px] sm:text-[12px] font-medium text-gray-900 line-clamp-2 mb-1.5 leading-[1.3] tracking-[0.01em] font-manrope">{product.name}</h3>
        <div className="mt-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 mb-1.5">
            <div className="flex flex-col">
              <span className="text-[16px] sm:text-[17px] font-extrabold leading-none" style={{ color: '#FF0000', fontFamily: 'Nunito, sans-serif' }}>
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
            <div className="flex items-center gap-1 justify-between sm:justify-start">
              <button
                onClick={(e) => { e.stopPropagation(); setQuantity(q => Math.max(1, q - 1)); }}
                disabled={!hasStock || quantity <= 1}
                className="w-5.5 h-5.5 rounded-md flex items-center justify-center text-[10px] font-bold disabled:opacity-30"
                style={{ backgroundColor: '#f3f4f6', color: '#374151' }}
              >
                -
              </button>
              <input
                type="number"
                min={1}
                max={Math.max(1, product.stock)}
                value={quantity}
                onChange={(e) => {
                  e.stopPropagation();
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.max(1, Math.min(val, Math.max(1, product.stock))));
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-8 h-5.5 rounded-md text-center text-[11px] font-semibold border"
                style={{ borderColor: '#e5e7eb' }}
              />
              <button
                onClick={(e) => { e.stopPropagation(); setQuantity(q => Math.min(Math.max(1, product.stock), q + 1)); }}
                disabled={!hasStock || quantity >= Math.max(1, product.stock)}
                className="w-5.5 h-5.5 rounded-md flex items-center justify-center text-[10px] font-bold disabled:opacity-30"
                style={{ backgroundColor: '#f3f4f6', color: '#374151' }}
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={!hasStock}
            className="w-full py-2 rounded-md text-[10px] font-semibold disabled:opacity-40 transition hover:brightness-110"
            style={{ backgroundColor: '#FF0000', color: 'white' }}
          >
            {!hasStock ? 'Sin stock' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ITEMS_PER_PAGE = 18;

export const ProductGrid = ({ products, onAddToCart, onProductClick, title, showPagination = true, isLoading = false, resetPageKey = "" }: {
  products: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
  onProductClick: (product: Product) => void;
  title?: string;
  showPagination?: boolean;
  isLoading?: boolean;
  resetPageKey?: string;
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [showPagination, resetPageKey]);

  if (isLoading) {
    return (
      <div className="px-4 py-16 text-center bg-white rounded-xl">
        <div className="w-14 h-14 border-4 border-slate-200 border-t-[#FF0000] rounded-full animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-1 font-manrope">Cargando productos</h3>
        <p className="text-sm text-gray-500 font-manrope">Actualizando catalogo en tiempo real...</p>
      </div>
    );
  }

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

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleProducts = showPagination
    ? products.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    : products;
  const rangeStart = startIndex + 1;
  const rangeEnd = startIndex + visibleProducts.length;

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
    <div className="px-3 sm:px-4 pb-10 sm:pb-12 bg-white">
      <div className="flex items-start sm:items-center justify-between gap-3 mb-4 pt-4">
        <h2 className="text-lg sm:text-xl font-bold leading-tight" style={{ color: '#FA003F', fontFamily: 'Manrope, sans-serif' }}>
          {title}
        </h2>
        <span className="text-xs sm:text-sm text-gray-500 font-manrope whitespace-nowrap pt-1 sm:pt-0">
          {products.length} {products.length === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
        {visibleProducts.map((product) => (
          <ProductCardGrid
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onProductClick={onProductClick}
          />
        ))}
      </div>

      {showPagination && totalPages > 1 && (
        <div className="mt-8">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-1">
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
          <p className="mt-2 text-center text-xs sm:text-sm text-gray-500 font-manrope">
            Mostrando {rangeStart}-{rangeEnd} de {products.length} productos
          </p>
        </div>
      )}

    </div>
  );
};
