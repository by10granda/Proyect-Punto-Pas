import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/data/products";
import { handleAssetFallback } from "@/utils/assetFallback";

interface WeeklyDealsProps {
  images: string[];
  imageCandidatesBySlot?: string[][];
  products?: Product[];
  onProductClick?: (product: Product) => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export const WeeklyDeals = ({ images, imageCandidatesBySlot, products, selectedCategory = "all", onCategoryChange }: WeeklyDealsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -360, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 360, behavior: 'smooth' });
  };

  // Obtener categorías únicas de los productos con descuento
  const categories = [
    { id: "HOGAR", name: "Hogar", icon: "🏠" },
    { id: "COCINA", name: "Cocina", icon: "🍳" },
    { id: "ELECTRODOMESTICO", name: "Electro", icon: "⚡" },
    { id: "LINEA ELECTRICA Y TELEFONICA", name: "Línea Elec.", icon: "🔌" },
  ];

 return (
    <section className="py-10 relative bg-white">
      <div className="max-w-[99vw] mx-auto px-3 md:px-4">
        <h2 
          className="text-2xl md:text-3xl font-black uppercase tracking-wide" 
          style={{ color: '#FA003F', fontFamily: 'Nunito, sans-serif' }}
        >
          Imperdibles de la semana
        </h2>
        <p className="text-sm text-gray-500 mb-5">productos con descuento</p>

        {/* Filtro de categorías independiente */}
        {onCategoryChange && (
          <div className="flex flex-wrap gap-2 mb-5">
            {categories.map((cat) => {
              const count = cat.id === "all" 
                ? products?.length || 0
                : products?.filter(p => p.category === cat.id || p.type === cat.id).length || 0;
              
              if (count === 0 && cat.id !== "all") return null;
              
              return (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    selectedCategory === cat.id
                      ? "bg-[#FA003F] text-white shadow-md"
                      : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-200"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    selectedCategory === cat.id 
                      ? "bg-white/20" 
                      : "bg-gray-300"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        
        <div className="relative">
          <button
            onClick={scrollLeft}
            className="absolute -left-2 md:-left-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: '#FA003F' }}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          
          <div 
            ref={scrollRef}
            className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide px-8 md:px-10 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none' }}
          >
            {images.map((img, idx) => {
              const productCodes = ["00000723", "00000546", "00001213", "00000491", "00000401", "00000396", "00000549", "00000770"];
              const code = productCodes[idx];
              const matchedProduct = code && products ? products.find(p => p.code === code) : null;
              const imageCandidates = imageCandidatesBySlot?.[idx] && imageCandidatesBySlot[idx].length > 0
                ? imageCandidatesBySlot[idx]
                : [img];
              
              return (
                <a
                  key={idx}
                  href={matchedProduct ? `/product/${matchedProduct.id}` : undefined}
                  target={matchedProduct ? "_blank" : undefined}
                  rel={matchedProduct ? "noopener noreferrer" : undefined}
                  className="group flex-shrink-0 w-[280px] md:w-[315px] snap-start"
                  style={{ aspectRatio: '4/5' }}
                  onClick={(event) => {
                    if (!matchedProduct) {
                      event.preventDefault();
                    }
                  }}
                >
                  <div className="w-full h-full rounded-[26px] overflow-hidden bg-white border border-gray-200 shadow-sm group-hover:shadow-md transition-shadow">
                    <img
                      src={imageCandidates[0]}
                      alt={`Descuento ${idx + 1}`}
                      className="w-full h-full object-cover"
                      data-fallbacks={imageCandidates.join("|")}
                      data-fallback-index="0"
                      onError={handleAssetFallback}
                    />
                  </div>
                </a>
              );
            })}
          </div>
          
          <button
            onClick={scrollRight}
            className="absolute -right-2 md:-right-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: '#FA003F' }}
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </section>
  );
};
