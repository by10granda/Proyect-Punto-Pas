import { useState, useCallback, useEffect, memo } from "react";
import { 
  ChevronRight, 
  ShoppingCart, 
  Minus, 
  Plus, 
  Package, 
  Check, 
  X,
  Star,
  Shield,
  Truck,
  RotateCcw,
  Heart,
  Share2,
  ZoomIn,
  ChevronLeft,
  Eye,
  CreditCard,
  MapPin,
  Phone,
  MessageCircle,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCcw,
  Hash,
  Tag,
  Folder
} from "lucide-react";
import { Product, getProductsByCategory } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ProductViewProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onClose?: () => void;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const Breadcrumbs = ({ items }: { items: BreadcrumbItem[] }) => (
  <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 overflow-x-auto">
    {items.map((item, index) => (
      <div key={index} className="flex items-center gap-1.5 flex-shrink-0">
        {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
        <span className={cn(
          "hover:text-primary cursor-pointer transition-colors",
          index === items.length - 1 ? "text-foreground font-medium" : ""
        )}>
          {item.label}
        </span>
      </div>
    ))}
  </nav>
);

const ImageGallery = memo(({ 
  images, 
  productName,
  video 
}: { 
  images: string[]; 
  productName: string;
  video?: string;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});

  const allMedia = video ? [...images, video] : images;
  const isVideo = video && currentIndex === allMedia.length - 1;

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : allMedia.length - 1);
  }, [allMedia.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => prev < allMedia.length - 1 ? prev + 1 : 0);
  }, [allMedia.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, handlePrev, handleNext]);

  return (
    <>
      <div className="space-y-4">
        <div 
          className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden group cursor-zoom-in shadow-sm"
          onClick={() => !isVideo && setIsLightboxOpen(true)}
        >
          {!imageLoaded[currentIndex] && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {!isVideo ? (
            <img
              src={allMedia[currentIndex]}
              alt={productName}
              className={cn(
                "w-full h-full object-contain p-6 transition-all duration-500",
                imageLoaded[currentIndex] ? "opacity-100" : "opacity-0",
                "group-hover:scale-105"
              )}
              onLoad={() => setImageLoaded(prev => ({ ...prev, [currentIndex]: true }))}
            />
          ) : (
            <video
              src={allMedia[currentIndex]}
              muted
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain bg-black"
            />
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
              <Maximize2 className="w-5 h-5 text-gray-700" />
            </div>
          </div>

          {images.length > 1 && !isVideo && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110"
              >
                <ChevronLeft className="w-5 h-5 text-gray-800" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110"
              >
                <ChevronRight className="w-5 h-5 text-gray-800" />
              </button>
            </>
          )}

          <div className="absolute top-4 left-4 flex gap-2">
            {images.length > 1 && !isVideo && (
              <Badge variant="secondary" className="bg-black/70 text-white backdrop-blur-sm gap-1.5">
                <Eye className="w-3 h-3" />
                {currentIndex + 1}/{images.length}
              </Badge>
            )}
            {isVideo && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 gap-1.5">
                VIDEO
              </Badge>
            )}
          </div>
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((src, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={cn(
                  "flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all duration-200",
                  "border-2 focus:outline-none focus:ring-2 focus:ring-primary/20",
                  idx === currentIndex 
                    ? "border-primary shadow-md scale-105" 
                    : "border-transparent hover:border-gray-300 opacity-70 hover:opacity-100"
                )}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
            {video && (
              <button
                onClick={() => setCurrentIndex(allMedia.length - 1)}
                className={cn(
                  "flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all duration-200",
                  "border-2 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20",
                  currentIndex === allMedia.length - 1 
                    ? "border-white shadow-md scale-105" 
                    : "border-transparent hover:scale-105 opacity-70 hover:opacity-100"
                )}
              >
                <div className="text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </button>
            )}
          </div>
        )}
      </div>

      <div className={cn(
        "fixed inset-0 z-50 bg-black/95 flex items-center justify-center",
        "transition-all duration-300",
        isLightboxOpen ? "opacity-100 visible" : "opacity-0 invisible"
      )}>
        <button
          onClick={() => setIsLightboxOpen(false)}
          className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>
        
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <img
          src={allMedia[currentIndex]}
          alt={productName}
          className="max-w-[90vw] max-h-[90vh] object-contain"
          onClick={() => setIsLightboxOpen(false)}
        />

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {allMedia.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all",
                idx === currentIndex ? "bg-white w-6" : "bg-white/50 hover:bg-white/75"
              )}
            />
          ))}
        </div>
      </div>
    </>
  );
});

ImageGallery.displayName = "ImageGallery";

const PriceSection = ({ product }: { product: Product }) => {
  const hasDiscount = product.pvpPrice && product.puntoPasPrice && 
    product.pvpPrice > product.puntoPasPrice && product.puntoPasPrice > 0;
  
  const discountPercent = hasDiscount 
    ? Math.round((1 - product.puntoPasPrice! / product.pvpPrice!) * 100)
    : 0;
  
  const displayPrice = product.puntoPasPrice || product.pvpPrice || product.price;

  return (
    <div className="space-y-3">
      {hasDiscount && (
        <>
          <div className="flex items-center gap-3">
            <span className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-red-600 price-font">
              ${product.puntoPasPrice?.toFixed(2)}
            </span>
            <span className="text-xl text-gray-400 line-through font-medium price-font">
              ${product.pvpPrice?.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold px-3 py-1">
              -{discountPercent}% OFF
            </Badge>
            <span className="text-sm text-gray-500 price-font">
              Ahorras ${(product.pvpPrice! - product.puntoPasPrice!).toFixed(2)}
            </span>
          </div>
        </>
      )}
      {!hasDiscount && (
        <span className="text-4xl lg:text-5xl font-black text-primary price-font">
          ${displayPrice.toFixed(2)}
        </span>
      )}
    </div>
  );
};

const StockStatus = ({ stock }: { stock: number }) => {
  if (stock === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl">
        <X className="w-5 h-5" />
        <span className="font-semibold">Sin stock disponible</span>
      </div>
    );
  }
  
  if (stock <= 5) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl">
        <AlertCircle className="w-5 h-5" />
        <span className="font-semibold">¡Últimas {stock} unidades!</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl">
      <CheckCircle2 className="w-5 h-5" />
      <span className="font-semibold">Disponible - {stock} unidades</span>
    </div>
  );
};

const TrustIndicators = () => (
  <div className="grid grid-cols-2 gap-3">
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Shield className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-xs text-gray-500">Compra Segura</p>
        <p className="text-sm font-semibold text-gray-800">100% Protegida</p>
      </div>
    </div>
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Truck className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-xs text-gray-500">Envío Rápido</p>
        <p className="text-sm font-semibold text-gray-800">24-48 horas</p>
      </div>
    </div>
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <RotateCcw className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-xs text-gray-500">Devolución</p>
        <p className="text-sm font-semibold text-gray-800">30 días</p>
      </div>
    </div>
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <CreditCard className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-xs text-gray-500">Pago</p>
        <p className="text-sm font-semibold text-gray-800">Todos los métodos</p>
      </div>
    </div>
  </div>
);

const ProductSpecifications = ({ product }: { product: Product }) => {
  const specs = [
    { label: "Código", value: product.code || "N/A", icon: Hash },
    { label: "Marca", value: product.brand || "N/A", icon: Tag },
    { label: "Categoría", value: product.category || "General", icon: Folder },
    { label: "Unidad", value: product.unit || "UNIDAD", icon: Package },
    { label: "Disponibilidad", value: product.stock > 0 ? "En Stock" : "Sin Stock", icon: Package },
  ];

  return (
    <div className="grid grid-cols-1 gap-3">
      {specs.map((spec) => (
        <div key={spec.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
          <span className="text-sm text-gray-500">{spec.label}</span>
          <span className="text-sm font-semibold text-gray-800">{spec.value}</span>
        </div>
      ))}
    </div>
  );
};

const ReviewsSection = () => (
  <div className="space-y-6">
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
      <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm">
        <span className="text-4xl font-black text-primary">4.8</span>
        <div className="flex items-center gap-0.5 my-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn("w-4 h-4", i < 4 ? "text-amber-400 fill-current" : "text-gray-300")}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500">127 reseñas</span>
      </div>
      <div className="flex-1 space-y-2">
        {[5, 4, 3, 2, 1].map((stars) => (
          <div key={stars} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-6">{stars}★</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-400 rounded-full"
                style={{ width: stars === 5 ? '70%' : stars === 4 ? '20%' : stars === 3 ? '7%' : '3%' }}
              />
            </div>
            <span className="text-xs text-gray-500 w-8">{stars === 5 ? '70' : stars === 4 ? '20' : stars === 3 ? '7' : '3'}%</span>
          </div>
        ))}
      </div>
    </div>

    <div className="space-y-4">
      {[
        { name: "Carlos M.", date: "Hace 2 días", rating: 5, comment: "Excelente producto, llegó rápido y en perfecto estado. Muy recomendado!" },
        { name: "María G.", date: "Hace 1 semana", rating: 4, comment: "Muy bueno, pero el envío tardó un poco más de lo esperado." },
        { name: "Juan P.", date: "Hace 2 semanas", rating: 5, comment: "La mejor compra que he hecho. Calidad excepcional." },
      ].map((review, idx) => (
        <div key={idx} className="p-4 border border-gray-100 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-red-600 flex items-center justify-center text-white font-bold text-sm">
                {review.name.charAt(0)}
              </div>
              <span className="font-semibold text-sm">{review.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={cn("w-3 h-3", i < review.rating ? "text-amber-400 fill-current" : "text-gray-300")} />
                ))}
              </div>
              <span className="text-xs text-gray-400 ml-2">{review.date}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600">{review.comment}</p>
        </div>
      ))}
    </div>
  </div>
);

const RelatedProducts = ({ currentProduct }: { currentProduct: Product }) => {
  const related = getProductsByCategory(currentProduct.category)
    .filter(p => p.id !== currentProduct.id)
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900">Productos Relacionados</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {related.map((product) => (
          <div 
            key={product.id} 
            className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/20"
          >
            <div className="aspect-square bg-gray-50 overflow-hidden">
              <img
                src={product.images?.[0] || product.image}
                alt={product.name}
                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3">
              <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
              <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 min-h-[2.5rem]">
                {product.name}
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary price-font">
                  ${(product.puntoPasPrice || product.price).toFixed(2)}
                </span>
                {product.pvpPrice && product.puntoPasPrice && product.pvpPrice > product.puntoPasPrice && (
                  <span className="text-xs text-gray-400 line-through price-font">
                    ${product.pvpPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdditionalServices = () => (
  <div className="space-y-3 p-4 bg-gradient-to-r from-primary/5 to-red-50 rounded-xl border border-primary/10">
    <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
      <CheckCircle2 className="w-4 h-4 text-primary" />
      Servicios Adicionales
    </h4>
    <div className="space-y-2">
      {[
        { name: "Instalación básica", price: "$25.00" },
        { name: "Garantía extendida (1 año)", price: "$15.00" },
        { name: "Delivery express (mismo día)", price: "$10.00" },
      ].map((service, idx) => (
        <label key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-white cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
            <span className="text-sm text-gray-700">{service.name}</span>
          </div>
          <span className="text-sm font-medium text-gray-900 price-font">{service.price}</span>
        </label>
      ))}
    </div>
  </div>
);

const ShippingInfo = () => (
  <div className="space-y-3">
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
      <MapPin className="w-5 h-5 text-primary mt-0.5" />
      <div>
        <p className="text-sm font-medium text-gray-800">Retiro en Tienda</p>
        <p className="text-xs text-gray-500">Disponible en 24 horas - Gratis</p>
      </div>
    </div>
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
      <Truck className="w-5 h-5 text-primary mt-0.5" />
      <div>
        <p className="text-sm font-medium text-gray-800">Envío a Domicilio</p>
        <p className="text-xs text-gray-500">Llega en 24-48 horas - Desde $3.99</p>
      </div>
    </div>
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
      <Clock className="w-5 h-5 text-primary mt-0.5" />
      <div>
        <p className="text-sm font-medium text-gray-800">Horario de Atención</p>
        <p className="text-xs text-gray-500">Lun-Sáb: 8:00 - 20:00 | Dom: 9:00 - 14:00</p>
      </div>
    </div>
  </div>
);

const HelpButtons = () => (
  <div className="flex gap-2">
    <Button variant="outline" size="sm" className="flex-1 gap-2">
      <Phone className="w-4 h-4" />
      Llamar
    </Button>
    <Button variant="outline" size="sm" className="flex-1 gap-2">
      <MessageCircle className="w-4 h-4" />
      WhatsApp
    </Button>
  </div>
);

export const ProductView = ({ product, onAddToCart, onClose }: ProductViewProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const displayPrice = product.puntoPasPrice || product.pvpPrice || product.price;
  const hasDiscount = product.pvpPrice && product.puntoPasPrice && 
    product.pvpPrice > product.puntoPasPrice && product.puntoPasPrice > 0;

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];

  const handleAddToCart = useCallback(() => {
    if (product.stock <= 0 || addedToCart) return;
    onAddToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }, [product, quantity, addedToCart, onAddToCart]);

  const incrementQuantity = () => setQuantity(q => Math.min(q + 1, product.stock));
  const decrementQuantity = () => setQuantity(q => Math.max(q - 1, 1));

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Inicio", href: "/" },
    { label: product.category || "Productos", href: `/?category=${product.category}` },
    { label: product.name }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <Breadcrumbs items={breadcrumbs} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <ImageGallery images={images} productName={product.name} video={product.video} />
          </div>

          <div className="space-y-6">
            {product.brand && (
              <Badge variant="secondary" className="text-sm font-bold uppercase tracking-wider">
                {product.brand}
              </Badge>
            )}

            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("w-4 h-4", i < 4 ? "text-amber-400 fill-current" : "text-gray-300")} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">127 reseñas</span>
                <span className="text-sm text-gray-300">|</span>
                <span className="text-sm text-green-600 font-medium">{product.sold || 0} vendidos</span>
              </div>
            </div>

            <PriceSection product={product} />

            <StockStatus stock={product.stock} />

            <TrustIndicators />

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Cantidad</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                      quantity <= 1 
                        ? "border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed" 
                        : "border-gray-300 hover:border-primary hover:text-primary"
                    )}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-lg font-bold">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                      quantity >= product.stock
                        ? "border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed" 
                        : "border-gray-300 hover:border-primary hover:text-primary"
                    )}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {product.stock > 0 && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-500">Total ({quantity} {quantity === 1 ? 'unidad' : 'unidades'})</span>
                  <span className="text-xl font-bold text-primary price-font">
                    ${(displayPrice * quantity).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0 || addedToCart}
                  className={cn(
                    "flex-1 h-14 text-base font-bold gap-2 transition-all",
                    addedToCart
                      ? "bg-green-500 hover:bg-green-600"
                      : product.stock <= 0
                        ? "bg-gray-300"
                        : "bg-gradient-to-r from-primary to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl"
                  )}
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-5 h-5" />
                      ¡Agregado!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      {product.stock <= 0 ? 'Sin Stock' : 'Agregar al Carrito'}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-14 w-14 border-2",
                    isFavorite 
                      ? "border-red-300 bg-red-50 text-red-500" 
                      : "hover:border-primary hover:text-primary"
                  )}
                  onClick={() => setIsFavorite(!isFavorite)}
                >
                  <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
                </Button>
                <Button variant="outline" size="icon" className="h-14 w-14 border-2 hover:border-primary hover:text-primary">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              <HelpButtons />
            </div>

            <Separator />

            <AdditionalServices />
          </div>
        </div>

        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0">
              <TabsTrigger 
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-base px-4 py-3"
              >
                Descripción
              </TabsTrigger>
              <TabsTrigger 
                value="specs"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-base px-4 py-3"
              >
                Especificaciones
              </TabsTrigger>
              <TabsTrigger 
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-base px-4 py-3"
              >
                Reseñas (127)
              </TabsTrigger>
              <TabsTrigger 
                value="shipping"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-base px-4 py-3"
              >
                Envío y Entrega
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description || "Este producto cuenta con una excelente calidad y desempeño. Diseñado para satisfacer tus necesidades con la mejor relación calidad-precio del mercado."}
                </p>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: Shield, text: "Garantía Oficial" },
                    { icon: Truck, text: "Envío Rápido" },
                    { icon: RefreshCcw, text: "Devolución Fácil" },
                    { icon: CheckCircle2, text: "Calidad Asegurada" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <item.icon className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="specs" className="mt-6">
              <ProductSpecifications product={product} />
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <ReviewsSection />
            </TabsContent>
            
            <TabsContent value="shipping" className="mt-6">
              <ShippingInfo />
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-12">
          <RelatedProducts currentProduct={product} />
        </div>
      </div>
    </div>
  );
};

export default ProductView;
