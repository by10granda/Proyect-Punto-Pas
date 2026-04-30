import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/data/products";

interface WeeklyDealsProps {
  images: string[];
  products?: Product[];
  onProductClick?: (product: Product) => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export const WeeklyDeals = ({ images, products, onProductClick, selectedCategory = "all", onCategoryChange }: WeeklyDealsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -300, behavior: 'auto' });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 300, behavior: 'auto' });
  };

  // Obtener categorías únicas de los productos con descuento
  const categories = [
    { id: "HOGAR", name: "Hogar", icon: "🏠" },
    { id: "COCINA", name: "Cocina", icon: "🍳" },
    { id: "ELECTRODOMESTICO", name: "Electro", icon: "⚡" },
    { id: "LINEA ELECTRICA Y TELEFONICA", name: "Línea Elec.", icon: "🔌" },
  ];

 return (
    <section className="py-12 relative bg-white">
      <div className="max-w-[98vw] mx-auto px-4">
        <h2 
          className="text-2xl md:text-3xl font-black uppercase tracking-wide" 
          style={{ color: '#FA003F', fontFamily: 'Nunito, sans-serif' }}
        >
          Imperdibles de la semana
        </h2>
        <p className="text-sm text-gray-500 mb-4">productos con descuento</p>

        {/* Filtro de categorías independiente */}
        {onCategoryChange && (
          <div className="flex flex-wrap gap-2 mb-6">
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
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
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