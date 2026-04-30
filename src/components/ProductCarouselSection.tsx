import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/data/products";
import { ProductCard } from "./ProductCard";

interface ProductCarouselSectionProps {
  products: Product[];
  category: string;
  bannerImage: string;
  onBannerClick?: () => void;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCarouselSection = ({ 
  products, 
  category, 
  bannerImage,
  onBannerClick,
  onProductClick, 
  onAddToCart 
}: ProductCarouselSectionProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const categoryProducts = products.filter(p => 
    p.category === category || 
    p.category === category.toUpperCase() ||
    p.type === category ||
    p.type === category.toUpperCase()
  );

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -260, behavior: 'auto' });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 260, behavior: 'auto' });
  };

  const handleBannerClick = () => {
    if (onBannerClick) {
      onBannerClick();
    } else {
      const searchParam = encodeURIComponent(category);
      window.location.href = `/?search=${searchParam.replace(/%20/g, '')}&tab=home#productos`;
    }
  };

  if (categoryProducts.length === 0) return null;

  return (
    <section className="relative mt-0" style={{ backgroundColor: '#FA003F' }}>
      <div className="pb-16 pt-8" style={{ backgroundColor: '#FA003F', margin: 0, border: 'none' }}>
        <div className="max-w-[98vw] mx-auto px-4 relative z-10">
          <h2 
            className="text-xl md:text-2xl font-black uppercase tracking-wide mt-8 mb-6" 
            style={{ color: 'white', fontFamily: 'Nunito, sans-serif' }}
          >
            {category.replace(/-/g, ' ')}
          </h2>

          <div 
            className="grid grid-cols-1 lg:grid-cols-5 gap-6"
            style={{ minHeight: '350px' }}
          >
            <div className="lg:col-span-2 relative" style={{ backgroundColor: '#FA003F', borderRadius: '12px', padding: '12px' }}>
              <button
                onClick={scrollLeft}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#FA003F' }}
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              <div 
                ref={scrollRef}
                className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide" 
                style={{ scrollbarWidth: 'none' }}
              >
                <div 
                  className="flex gap-4 px-12 h-full" 
                  style={{ backgroundColor: 'transparent', borderRadius: '12px', padding: '8px' }}
                >
                  {categoryProducts.slice(0, 12).map((product) => (
                    <div key={product.id} className="flex-shrink-0 w-[250px]">
                      <ProductCard
                        product={product}
                        onAddToCart={(p) => onAddToCart(p, 1)}
                        onProductClick={onProductClick}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={scrollRight}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#FA003F' }}
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="lg:col-span-3 flex items-center" onClick={handleBannerClick}>
              <img
                src={bannerImage}
                alt={category}
                className="w-full h-auto object-contain rounded-xl cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24">
          <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path 
              d="M0,80 C0,80 180,40 360,60 C540,80 720,30 900,50 C1080,70 1260,20 1440,40 L1440,80 Z" 
              fill="white" 
            />
          </svg>
        </div>
      </div>
    </section>
  );
};