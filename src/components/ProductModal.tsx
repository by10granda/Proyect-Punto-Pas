import { useState, useEffect, useRef } from "react";
import { X, Minus, Plus, ShoppingCart, Check } from "lucide-react";
import { Product } from "@/data/products";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductModal = ({ product, isOpen, onClose, onAddToCart }: ProductModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [errorImages, setErrorImages] = useState<Set<number>>(new Set());
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [viewingCount, setViewingCount] = useState(() => Math.floor(Math.random() * 10) + 1);
const lastViewingCount = useRef(viewingCount);

  useEffect(() => {
    if (!isOpen || !product) return;
    const interval = setInterval(() => {
      setViewingCount(prev => {
        let newVal;
        do {
          const change = Math.random() > 0.5 ? 1 : -1;
          newVal = prev + change;
          if (newVal < 1) newVal = 1;
          if (newVal > 10) newVal = 10;
        } while (newVal === lastViewingCount.current);
        lastViewingCount.current = newVal;
        return newVal;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [isOpen, product]);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setAddedToCart(false);
      setSelectedImageIndex(0);
      setErrorImages(new Set());
      setIsZooming(false);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, product]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const rawImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const productImages = rawImages.slice(0, 4);
  
  const activeImages = productImages.filter((_, idx) => !errorImages.has(idx));
  const validImageCount = activeImages.length;
  const showThumbnails = validImageCount > 1;
  
  const hasDiscount = product.pvpPrice && product.puntoPasPrice && product.pvpPrice > product.puntoPasPrice;
  const discountPercent = hasDiscount ? Math.round((1 - product.puntoPasPrice! / product.pvpPrice!) * 100) : 0;
  const displayPrice = product.puntoPasPrice || product.pvpPrice || product.price;

  const handleAddToCart = () => {
    if (product.stock <= 0 || addedToCart) return;
    onAddToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => onClose(), 1500);
  };

  const handleImageError = (idx: number) => {
    setErrorImages(prev => {
      const newSet = new Set(prev);
      newSet.add(idx);
      return newSet;
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current || !isZooming) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ 
      x: Math.max(0, Math.min(100, x)), 
      y: Math.max(0, Math.min(100, y)) 
    });
  };

  const handleSelectImage = (index: number) => {
    setSelectedImageIndex(index);
  };

  const getDisplayImage = () => {
    if (selectedImageIndex < activeImages.length) {
      return activeImages[selectedImageIndex];
    }
    return activeImages[0] || product.image;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 lg:p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-50 w-8 h-8 lg:w-10 lg:h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
        </button>

        <div className="flex flex-col lg:flex-row">
          {showThumbnails && (
            <div className="w-full lg:w-20 p-2 lg:p-4 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto bg-gray-50">
              {productImages.map((img, idx) => {
                if (errorImages.has(idx)) return null;
                const isActive = activeImages[idx] === activeImages[selectedImageIndex];
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectImage(idx)}
                    className={`flex-shrink-0 w-12 h-12 lg:w-full lg:h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      isActive 
                        ? 'border-red-500 ring-2 ring-red-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} ${idx + 1}`} 
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(idx)}
                    />
                  </button>
                );
              })}
            </div>
          )}

          <div 
            ref={imageContainerRef}
            className="w-full lg:flex-1 bg-gray-50 p-2 lg:p-8 flex items-center justify-center overflow-hidden min-h-[250px] lg:min-h-[400px]"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
          >
            <div className="w-full max-w-md overflow-hidden">
              <img
                src={getDisplayImage()}
                alt={product.name}
                className="w-full h-auto object-contain transition-transform duration-100"
                style={{
                  transform: isZooming ? `scale(2.5) translate(${(50 - zoomPosition.x) * 0.3}%, ${(50 - zoomPosition.y) * 0.3}%)` : 'scale(1)',
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  cursor: isZooming ? 'zoom-out' : 'zoom-in'
                }}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (img.src !== product.image) {
                    img.src = product.image;
                  }
                }}
              />
            </div>
          </div>

          <div className="w-full lg:w-[45%] p-4 lg:p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-wider text-gray-500">
                {product.brand || 'General'}
              </span>
              <span className="text-xs text-gray-400">|</span>
              <span className="text-xs text-gray-500">CODIGO: {product.code}</span>
            </div>
            
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 lg:mb-4 leading-snug">
              {product.name}
            </h2>

            <div className="mb-4">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold" style={{ color: '#FA003F' }}>
                  ${displayPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-gray-400 line-through">
                    ${product.pvpPrice?.toFixed(2)}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <span 
                  className="inline-block mt-2 text-xs font-semibold px-2 py-1 rounded-full"
                  style={{ backgroundColor: '#FA003F', color: 'white' }}
                >
                  -{discountPercent}%
                </span>
              )}
            </div>

              <div className="mb-6">
                <span className="text-sm text-gray-600 mb-2 block">
                  {product.stock === 0 ? (
                    <span className="text-red-600 font-medium">Sin stock</span>
                  ) : (
                    <span className="text-green-600 font-medium">{product.stock} unidades disponibles</span>
                  )}
                </span>
                <div className="mt-3">
                  <span className="text-sm font-bold text-blue-700">
                    {viewingCount} personas estan viendo este producto ahora mismo
                  </span>
                </div>
              </div>

            <div className="mb-6">
              <span className="text-sm font-medium text-gray-700 mb-2 block">Cantidad</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold disabled:opacity-40"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.max(1, Math.min(val, product.stock)));
                  }}
                  className="w-16 h-10 rounded-lg text-center font-medium border"
                />
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-auto">
              <div className="flex items-center justify-between mb-3 lg:mb-2 text-base lg:text-lg font-semibold text-gray-700">
                <span>Total</span>
                <span className="text-2xl lg:text-3xl font-bold" style={{ color: '#FA003F' }}>
                  ${(displayPrice * quantity).toFixed(2)}
                </span>
              </div>
              
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addedToCart}
                className="w-full py-3 rounded-xl font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: addedToCart ? '#10B981' : '#FA003F', 
                  color: 'white' 
                }}
              >
                {addedToCart ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    Agregado
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
