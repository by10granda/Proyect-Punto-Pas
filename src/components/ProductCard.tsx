import { ShoppingCart, Heart, Star } from "lucide-react";
import { Product } from "@/data/products";
import { useState, useEffect } from "react";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

export const ProductCard = ({ product, onAddToCart, onProductClick }: ProductCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Add a timeout to handle cases where onLoad doesn't fire
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!imageLoaded && !imageError) {
        setLoadingTimeout(true);
        // Force show the image after timeout
        setImageLoaded(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timer);
  }, [product.image, imageLoaded, imageError]);

  const formatPrice = (price: number) => {
    return price.toLocaleString("es-EC", {
      style: "currency",
      currency: "USD",
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const getFallbackImage = () => {
    const fallbacks = [
      `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' font-size='16' fill='%236b7280' text-anchor='middle' dy='.3em'%3E${encodeURIComponent(product.name)}%3C/text%3E%3C/svg%3E`,
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23e5e7eb' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' font-size='18' fill='%239ca3af' text-anchor='middle' dy='.3em'%3EProducto%3C/text%3E%3C/svg%3E"
    ];
    return fallbacks[product.id.charCodeAt(0) % fallbacks.length];
  };

  const imageSrc = imageError ? getFallbackImage() : product.image;

  return (
    <div 
      className="product-card bg-card rounded-xl overflow-hidden shadow-card cursor-pointer animate-fade-in border border-border"
      onClick={() => onProductClick(product)}
    >
      {/* Image container */}
      <div className="relative aspect-square bg-muted">
        {/* Loading spinner - only show when not loaded and no error */}
        {!imageLoaded && !imageError && !loadingTimeout && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        )}
        
        {/* Error state */}
        {imageError && (
          <div className="absolute inset-0 bg-red-50 flex items-center justify-center z-10">
            <div className="text-center p-4">
              <div className="text-red-500 text-4xl mb-2">🖼️</div>
              <p className="text-red-600 text-xs">Imagen no disponible</p>
            </div>
          </div>
        )}
        
        <img
          src={imageSrc}
          alt={product.name}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded || loadingTimeout ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
          style={{
            display: 'block', // Ensure image takes up space
          }}
        />
        
        {/* Discount badge */}
        {product.discount && (
          <div className="absolute top-1 left-1 badge-sale text-[10px] px-1 py-0.5 z-20">
            -{product.discount}%
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center transition-colors shadow-sm z-20"
        >
          <Heart
            className={`w-3 h-3 transition-colors ${
              isFavorite ? "fill-primary text-primary" : "text-muted-foreground"
            }`}
          />
        </button>

        {/* Stock indicator */}
        {product.stock <= 3 && product.stock > 0 && (
          <div className="absolute bottom-1 left-1 bg-primary/90 text-primary-foreground text-[10px] px-1 py-0.5 rounded-full font-medium z-20">
            ¡{product.stock}!
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-1.5">
        {/* Brand */}
        <p className="text-[10px] text-primary font-medium mb-0.5 truncate">{product.brand}</p>
        
        {/* Product name */}
        <h3 className="text-xs font-semibold text-foreground line-clamp-2 mb-1 min-h-[1.75rem] leading-tight">
          {product.name}
        </h3>

        {/* Price section */}
        <div className="mb-1">
          <span className="text-primary font-bold text-sm block leading-tight">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-muted-foreground line-through text-[10px]">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground mb-1">
          <Star className="w-2.5 h-2.5 fill-primary text-primary" />
          <span>4.8</span>
          <span className="text-border">•</span>
          <span>{product.stock}</span>
        </div>

        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          className="w-full flex items-center justify-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground py-1.5 rounded-md font-medium text-[10px] transition-all duration-200 active:scale-95 shadow-sm"
        >
          <ShoppingCart className="w-3 h-3" />
          Agregar
        </button>
      </div>
    </div>
  );
};
