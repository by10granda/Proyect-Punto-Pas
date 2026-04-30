import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/data/products";

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  products?: Product[];
}

const CLOUDINARY_VERSION = 'v1775785362';

export const CategoryBar = ({ selectedCategory, onSelectCategory, products = [] }: CategoryBarProps) => {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const getCategoryImage = (categoryId: string): string => {
    if (categoryId === "all") {
      return "https://res.cloudinary.com/dbbkpdhze/image/upload/v1777335777/TODOS.png";
    }
    const formattedName = categoryId.toUpperCase().trim().replace(/\s+/g, '_');
    return `https://res.cloudinary.com/dbbkpdhze/image/upload/${CLOUDINARY_VERSION}/${formattedName}_123.png`;
  };

  const PRIORITY_CATEGORIES = [
    "all",
    "TELEVISORES",
    "MUEBLERIA COMEDORES Y MESAS",
    "LAVADORAS Y SECADORAS",
    "COCINAS Y CAMPANAS",
    "CELULARES",
    "CONGELADORES Y NEVERAS"
  ];
  
  const allTypes = [...new Set(products.map(p => p.type).filter(Boolean))].sort();
  const displayTypes = PRIORITY_CATEGORIES.filter(cat => 
    cat === "all" || allTypes.includes(cat)
  );
  const itemWidth = 380;

  const getProductCount = (type: string) => {
    if (type === "all") return products.filter(p => p.isActive).length;
    return products.filter(p => p.isActive && (p.type === type || p.category === type)).length;
  };

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 10);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }
  };

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    
    const current = Math.round(el.scrollLeft / itemWidth);
    
    if (dir === "left" && current > 0) {
      el.scrollTo({ left: (current - 1) * itemWidth, behavior: "smooth" });
    } else if (dir === "right" && current < displayTypes.length - 1) {
      el.scrollTo({ left: (current + 1) * itemWidth, behavior: "smooth" });
    }
    
    setTimeout(updateScrollButtons, 350);
  };

  return (
    <section className="py-8 bg-white">
      <div className="max-w-[99vw] mx-auto px-2">
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-lg md:text-xl lg:text-2xl font-black uppercase tracking-wide" style={{ color: '#FA003F', fontFamily: 'Nunito, sans-serif' }}>
            CATEGORÍAS
          </h3>
          <button
            onClick={() => setShowAllCategories(true)}
            className="px-4 py-2 text-white rounded-full font-semibold text-sm"
            style={{ backgroundColor: '#FF000B' }}
          >
            Ver todas
          </button>
        </div>

        <div className="flex items-center gap-0 pl-2">
          <button 
            onClick={() => scroll("left")} 
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-transform z-10 disabled:opacity-50"
            style={{ backgroundColor: '#FF0000' }}
            disabled={!canScrollLeft}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <div className="overflow-hidden px-2">
            <div 
              ref={scrollRef} 
              className="flex justify-start overflow-x-auto scroll-smooth hide-scrollbar py-4"
              style={{ scrollbarWidth: 'none' }}
            >
              {displayTypes.map((type) => {
                const isSelected = selectedCategory === type;
                const count = getProductCount(type);
                const imgSrc = getCategoryImage(type);
                
                return (
                  <button
                    key={type}
                    onClick={() => onSelectCategory(type)}
                    className={`flex-shrink-0 flex flex-col items-center gap-2 transition-all ${isSelected ? 'scale-105' : ''}`}
                  >
                    <div 
                      className="relative" 
                      style={{ width: "350px", height: "175px", minWidth: "340px", borderRadius: "12px" }}
                    >
                      <img src={imgSrc} alt={type} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-xs font-medium text-center max-w-[350px]" style={{ color: isSelected ? '#FF000B' : '#374151', fontWeight: isSelected ? 700 : 400 }}>
                      {type === "all" ? "TODOS" : type}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button 
            onClick={() => scroll("right")} 
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-transform z-10 disabled:opacity-50"
            style={{ backgroundColor: '#FF0000' }}
            disabled={!canScrollRight}
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {showAllCategories && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowAllCategories(false)} />
          <div className="absolute inset-4 bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6" style={{ backgroundColor: '#FA003F' }}>
              <div>
                <h3 className="text-xl font-bold text-white">Todas las categorías</h3>
                <p className="text-sm text-white/80">{allTypes.length} tipos</p>
              </div>
              <button onClick={() => setShowAllCategories(false)} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white text-xl">×</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                {allTypes.map((type) => (
                  <button key={type} onClick={() => { onSelectCategory(type); setShowAllCategories(false); }} className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-all">
                    <div className="relative rounded-full overflow-hidden shadow-md" style={{ width: "80px", height: "80px" }}>
                      <img src={getCategoryImage(type)} alt={type} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs text-center font-medium">{type}</span>
                    <span className="text-[10px] text-gray-500">{getProductCount(type)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};