import { useState, useRef } from "react";
import { X, ChevronLeft, ChevronRight, ShoppingCart, Minus, Plus, ZoomIn } from "lucide-react";
import { Product } from "@/data/products";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const ProductModal = ({ product, isOpen, onClose, onAddToCart }: ProductModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  if (!product) return null;

  const productImages = [
    product.image,
    product.image.replace("w=400", "w=500"),
    product.image.replace("w=400", "w=600"),
    product.image.replace("w=400", "w=450"),
  ];

  const formatPrice = (price: number) => {
    return price.toLocaleString("es-EC", {
      style: "currency",
      currency: "USD",
    });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setQuantity(1);
    onClose();
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-50 w-10 h-10 rounded-full bg-card shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Gallery Section */}
          <div className="bg-muted p-4">
            {/* Main Image with Zoom */}
            <div 
              ref={imageRef}
              className="relative aspect-square bg-card rounded-xl overflow-hidden cursor-zoom-in mb-4"
              onMouseEnter={() => setShowZoom(true)}
              onMouseLeave={() => setShowZoom(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={productImages[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-contain"
              />
              
              {/* Zoom indicator */}
              <div className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium shadow-md">
                <ZoomIn className="w-4 h-4" />
                Zoom
              </div>

              {/* Navigation arrows */}
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-card transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-card transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Discount badge */}
              {product.discount && (
                <div className="absolute top-3 left-3 badge-sale text-sm px-3 py-1.5">
                  -{product.discount}% OFF
                </div>
              )}
            </div>

            {/* Zoom preview window */}
            {showZoom && (
              <div className="hidden md:block absolute top-4 left-[calc(50%+1rem)] w-80 h-80 border-2 border-primary rounded-xl overflow-hidden shadow-2xl bg-white z-40">
                <img
                  src={productImages[currentImageIndex]}
                  alt="Zoom"
                  className="w-full h-full object-cover"
                  style={{
                    objectPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    transform: 'scale(3)',
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }}
                />
              </div>
            )}

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                    index === currentImageIndex ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
                  }`}
                >
                  <img src={img} alt={`Vista ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="p-6 flex flex-col">
            {/* Brand */}
            <p className="text-primary font-semibold text-sm mb-1">{product.brand}</p>
            
            {/* Name */}
            <h2 className="text-2xl font-bold text-foreground mb-3">{product.name}</h2>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-4xl font-black text-primary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {product.discount && (
                <span className="bg-primary/10 text-primary text-sm font-bold px-2 py-0.5 rounded">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground mb-4 leading-relaxed">{product.description}</p>
            )}

            {/* Characteristics */}
            <div className="bg-muted rounded-xl p-4 mb-4">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                📋 Características del Producto
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-card rounded-lg p-2.5">
                  <span className="text-muted-foreground block text-xs">Código</span>
                  <span className="font-semibold">{product.code}</span>
                </div>
                <div className="bg-card rounded-lg p-2.5">
                  <span className="text-muted-foreground block text-xs">Marca</span>
                  <span className="font-semibold">{product.brand}</span>
                </div>
                <div className="bg-card rounded-lg p-2.5">
                  <span className="text-muted-foreground block text-xs">Unidad</span>
                  <span className="font-semibold">{product.unit}</span>
                </div>
                <div className="bg-card rounded-lg p-2.5">
                  <span className="text-muted-foreground block text-xs">Categoría</span>
                  <span className="font-semibold">{product.category}</span>
                </div>
                <div className="bg-card rounded-lg p-2.5">
                  <span className="text-muted-foreground block text-xs">Tipo</span>
                  <span className="font-semibold">{product.type}</span>
                </div>
                <div className="bg-card rounded-lg p-2.5">
                  <span className="text-muted-foreground block text-xs">Stock</span>
                  <span className={`font-semibold ${product.stock <= 3 ? "text-destructive" : "text-success"}`}>
                    {product.stock} disponibles
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity selector */}
            <div className="flex items-center justify-between bg-muted rounded-xl p-4 mb-4">
              <span className="font-semibold text-foreground">Cantidad:</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-full bg-card flex items-center justify-center disabled:opacity-50 hover:bg-border transition-colors shadow-sm"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-xl font-bold">{quantity}</span>
                <button
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock}
                  className="w-10 h-10 rounded-full bg-card flex items-center justify-center disabled:opacity-50 hover:bg-border transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-muted-foreground">Total:</span>
              <span className="text-3xl font-black text-primary">{formatPrice(product.price * quantity)}</span>
            </div>

            {/* Add to cart button */}
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg active:scale-[0.98]"
            >
              <ShoppingCart className="w-6 h-6" />
              Agregar al carrito
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
