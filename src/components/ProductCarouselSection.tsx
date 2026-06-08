import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/data/products";
import { ProductCard } from "./ProductCard";
import { handleAssetFallback } from "@/utils/assetFallback";
import { AutoFitImage } from "./AutoFitImage";

interface ProductCarouselSectionProps {
  products: Product[];
  category: string;
  bannerImage: string;
  bannerImageFallbacks?: string[];
  layout?: 'default' | 'fridge';
  sectionTitle?: string;
  topTitle?: string;
  onBannerClick?: () => void;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCarouselSection = ({ 
  products, 
  category, 
  bannerImage,
  bannerImageFallbacks,
  layout = 'default',
  sectionTitle,
  topTitle,
  onBannerClick,
  onProductClick, 
  onAddToCart 
}: ProductCarouselSectionProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const normalizedCategory = category.toUpperCase().trim();
  const isFridgeAndFreezerSection = normalizedCategory === "CONGELADORES Y NEVERAS";
  const isWasherAndDryerSection = category.toUpperCase().trim() === "LAVADORAS Y SECADERAS";
  const isTelevisionSection = normalizedCategory === "TELEVISORES";

  const getScrollAmount = () => {
    if (isWasherAndDryerSection) {
      return window.innerWidth >= 768 ? 532 : 464;
    }

    return 280;
  };

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
  };

  const handleBannerClick = () => {
    if (onBannerClick) {
      onBannerClick();
    } else {
      const searchParam = encodeURIComponent(category);
      window.location.href = `/?search=${searchParam.replace(/%20/g, '')}&tab=home#productos`;
    }
  };

  if (layout === 'fridge') {
    return (
      <section className="relative bg-white py-3 md:py-5">
        <div className="max-w-[98vw] mx-auto px-3 md:px-4">
          <h2
            className="text-base md:text-2xl font-black uppercase tracking-wide mb-2 md:mb-4"
            style={{ color: '#FA003F', fontFamily: 'Nunito, sans-serif' }}
          >
            {(topTitle || category).replace(/-/g, ' ')}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 md:gap-4 items-start" style={{ minHeight: 'auto' }}>
            <div className="lg:col-span-2 h-full" onClick={handleBannerClick}>
              <AutoFitImage
                src={bannerImage}
                alt={category}
                className="w-full h-[150px] sm:h-[190px] lg:h-[680px] rounded-lg cursor-pointer bg-white"
                data-fallbacks={bannerImageFallbacks?.join("|")}
                data-fallback-index="0"
                onError={handleAssetFallback}
              />
            </div>

            <div className="lg:col-span-3 h-full lg:h-[680px] flex flex-col">
              <div className="h-10 md:h-14 rounded-lg border border-slate-200 bg-white px-3 md:px-5 flex items-center justify-between mb-2 md:mb-4">
                <h2 className="text-sm md:text-2xl uppercase tracking-wide" style={{ color: '#374151', fontFamily: 'Nunito, sans-serif' }}>
                  {(sectionTitle || category).replace(/-/g, ' ')}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={scrollLeft}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#4f6bd8' }}
                  >
                    <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </button>
                  <button
                    onClick={scrollRight}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#4f6bd8' }}
                  >
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </button>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                <div className="grid grid-rows-1 lg:grid-rows-2 grid-flow-col auto-cols-[168px] md:auto-cols-[188px] gap-2 md:gap-2.5 min-w-max pr-2">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className={`w-[168px] md:w-[188px] ${isFridgeAndFreezerSection ? "h-[250px] md:h-[280px]" : ""} ${isTelevisionSection ? "h-[248px] md:h-[296px]" : ""}`}
                    >
                      <ProductCard
                        product={product}
                        onAddToCart={onAddToCart}
                        compact
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const sectionBackground = isWasherAndDryerSection ? '#FF0000' : '#FA003F';

  return (
    <section className="relative mt-0" style={{ backgroundColor: sectionBackground }}>
      <div className="pb-16 pt-8" style={{ backgroundColor: sectionBackground, margin: 0, border: 'none' }}>
        <div className="max-w-[98vw] mx-auto px-3 md:px-4 relative z-10">
          <h2 
            className="text-lg md:text-2xl font-black uppercase tracking-wide mt-5 md:mt-8 mb-4 md:mb-6" 
            style={{ color: 'white', fontFamily: 'Nunito, sans-serif' }}
          >
            {category.replace(/-/g, ' ')}
          </h2>

          <div 
            className={`grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-5 items-stretch ${isWasherAndDryerSection ? "lg:min-h-[560px]" : ""}`}
            style={{ minHeight: 'auto' }}
          >
            <div className={`lg:col-span-2 relative ${isWasherAndDryerSection ? "lg:h-[560px]" : ""}`}>
              <button
                onClick={scrollLeft}
                className="absolute left-1 md:-left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: sectionBackground }}
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </button>

              <div 
                ref={scrollRef}
                className={`flex overflow-x-auto pb-2 scrollbar-hide ${isWasherAndDryerSection ? "lg:h-full" : ""}`} 
                style={{ scrollbarWidth: 'none' }}
              >
                <div 
                  className={`flex gap-3 md:gap-4 px-8 md:px-8 py-2 h-full ${isWasherAndDryerSection ? "items-stretch" : ""}`}
                >
                  {products.slice(0, 12).map((product) => (
                    <div key={product.id} className={`flex-shrink-0 w-[220px] md:w-[250px] ${isWasherAndDryerSection ? "h-full" : ""}`}>
                      <ProductCard
                        product={product}
                        onAddToCart={onAddToCart}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={scrollRight}
                className="absolute right-1 md:-right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: sectionBackground }}
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </button>
            </div>

            <div className={`lg:col-span-3 h-full ${isWasherAndDryerSection ? "lg:h-[560px]" : ""}`} onClick={handleBannerClick}>
              <AutoFitImage
                src={bannerImage}
                alt={category}
                className="w-full h-auto lg:h-full rounded-xl cursor-pointer"
                data-fallbacks={bannerImageFallbacks?.join("|")}
                data-fallback-index="0"
                onError={handleAssetFallback}
              />
            </div>
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
    </section>
  );
};
