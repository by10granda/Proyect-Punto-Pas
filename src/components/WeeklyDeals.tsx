import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/data/products";

interface WeeklyDealsProps {
  images: string[];
  products?: Product[];
  onProductClick?: (product: Product) => void;
}

export const WeeklyDeals = ({ images, products, onProductClick }: WeeklyDealsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -300, behavior: 'auto' });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 300, behavior: 'auto' });
  };

return (
    <section className="py-12 relative bg-white">
      <div className="max-w-[98vw] mx-auto px-4">
        <h2 
          className="text-2xl md:text-3xl font-black uppercase tracking-wide" 
          style={{ color: '#FA003F', fontFamily: 'Nunito, sans-serif' }}
        >
          Imperdibles de la semana
        </h2>
        <p className="text-sm text-gray-500 mb-8">productos con descuento</p>

        <div className="relative">
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#FA003F' }}
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>

          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide px-10"
            style={{ scrollbarWidth: 'none' }}
          >
            {images.map((img, idx) => {
              const productCodes = ["00000723", "00000546", "00001213", "00000491", "00000401", "00000396", "00000549", "00000770"];
              const code = productCodes[idx];
              const matchedProduct = code && products ? products.find(p => p.code === code) : null;
              
              return (
                <div 
                  key={idx}
                  className="flex-shrink-0 w-[280px] md:w-[320px]"
                  style={{ aspectRatio: '4/5' }}
                  onClick={() => {
                    if (matchedProduct && onProductClick) {
                      onProductClick(matchedProduct);
                    }
                  }}
                >
                  <img
                    src={img}
                    alt={`Descuento ${idx + 1}`}
                    className="w-full h-full object-contain rounded-3xl"
                  />
                </div>
              );
            })}
          </div>

          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#FA003F' }}
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        </div>
      </div>
    </section>
  );
};