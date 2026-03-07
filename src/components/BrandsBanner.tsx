import { useState, useEffect, memo } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Product } from "@/data/products";

interface BrandsBannerProps {
  products: Product[];
  onBrandClick: (brand: string) => void;
}

const brandColors = [
  "from-blue-600 via-blue-700 to-blue-900",
  "from-red-600 via-red-700 to-red-900",
  "from-green-600 via-green-700 to-green-900",
  "from-purple-600 via-purple-700 to-purple-900",
  "from-orange-500 via-orange-600 to-orange-800",
  "from-pink-500 via-pink-600 to-pink-800",
  "from-teal-500 via-teal-600 to-teal-800",
  "from-indigo-500 via-indigo-600 to-indigo-800",
  "from-yellow-500 via-yellow-600 to-yellow-800",
  "from-cyan-500 via-cyan-600 to-cyan-800",
];

export const BrandsBanner = memo(({ products, onBrandClick }: BrandsBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];
  
  const getBrandInfo = (brand: string, index: number) => ({
    name: brand,
    color: brandColors[index % brandColors.length],
  });

  useEffect(() => {
    if (isHovered || uniqueBrands.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % uniqueBrands.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered, uniqueBrands.length]);

  const nextBrand = () => {
    setCurrentIndex((prev) => (prev + 1) % uniqueBrands.length);
  };

  const prevBrand = () => {
    setCurrentIndex((prev) => (prev - 1 + uniqueBrands.length) % uniqueBrands.length);
  };

  if (uniqueBrands.length === 0) return null;

  const currentBrand = getBrandInfo(uniqueBrands[currentIndex], currentIndex);
  const visibleBrands = uniqueBrands.slice(0, 12);

  return (
    <section className="py-10 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Star className="w-6 h-6 text-primary animate-pulse" />
          <h3 className="text-2xl md:text-3xl font-black text-foreground text-center">
            NUESTRAS MARCAS
          </h3>
          <Star className="w-6 h-6 text-primary animate-pulse" />
        </div>
        
        <div 
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button
            onClick={prevBrand}
            className="absolute right-14 md:right-20 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${currentBrand.color} transition-all duration-200`}>
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8">
              <div className="text-white text-center md:text-left max-w-lg">
                <h4 className="text-3xl md:text-4xl font-black mb-2">
                  {currentBrand.name}
                </h4>
                <p className="text-white/80 text-lg">
                  Productos de calidad garantizada
                </p>
                <button
                  onClick={() => onBrandClick(currentBrand.name)}
                  className="mt-4 px-6 py-2 bg-white text-gray-900 rounded-full font-semibold hover:bg-white/90 transition-all duration-150"
                >
                  Ver productos
                </button>
              </div>
              
              <div className="hidden md:block text-white/30 text-6xl md:text-8xl font-black opacity-50">
                {currentIndex + 1}/{uniqueBrands.length}
              </div>
            </div>
          </div>

          <button
            onClick={nextBrand}
            className="absolute left-14 md:left-20 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl hover:bg-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-8">
          <p className="text-center text-sm text-muted-foreground mb-4">Todas las marcas:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {visibleBrands.map((brand, index) => (
              <button
                key={brand}
                onClick={() => onBrandClick(brand)}
                className="px-4 py-2 bg-card hover:bg-primary hover:text-primary-foreground rounded-full text-sm font-medium transition-all duration-150 border border-border hover:border-primary"
              >
                {brand}
              </button>
            ))}
            {uniqueBrands.length > 12 && (
              <span className="px-4 py-2 text-sm text-muted-foreground">
                +{uniqueBrands.length - 12} más
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});
