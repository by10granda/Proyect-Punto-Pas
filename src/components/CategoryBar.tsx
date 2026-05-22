import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/data/products";
import { buildCategoryImageCandidates, handleCategoryImageFallback } from "@/utils/categoryImage";
import allProductsImage from "@/assets/todos-los-productos.png";

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  products?: Product[];
}

const CATEGORY_IMAGE_VERSION = 'v1775785362';
const CATEGORY_IMAGES_BASE_URL = 'https://assets.distribuidor-puntopas.com/CATEGORIAS_PRINCIPAL';
const CATEGORY_IMAGES_ENV_BASE_URL = (import.meta.env.VITE_CATEGORY_IMAGES_BASE_URL as string | undefined) || '';
const CATEGORY_DEFAULT_FALLBACK = 'https://assets.distribuidor-puntopas.com/CATEGORIAS_PRINCIPAL/MUEBLERIA_COMEDORES_Y_MESAS_123.png';
const CATEGORY_FIXED_FILES: Record<string, string> = {
  all: 'TODOS_123.png',
  TELEVISORES: 'TELEVISORES_123.png',
  'MUEBLERIA COMEDORES Y MESAS': 'MUEBLERIA_COMEDORES_Y_MESAS_123.png',
  'LAVADORAS Y SECADORAS': 'LAVADORAS Y SECADORAS_123.png',
  'COCINAS Y CAMPANAS': 'COCINAS_Y_CAMPANAS_123.png',
  CELULARES: 'CELULARES_123.png',
  'CONGELADORES Y NEVERAS': 'CONGELADORES Y NEVERAS_123.png',
};
const ITEM_WIDTH = 350;

export const CategoryBar = ({ selectedCategory, onSelectCategory, products = [] }: CategoryBarProps) => {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const buildCombinedCategoryFallbacks = (categoryName: string): string[] => {
    const normalizedCategory = categoryName === 'all' ? 'all' : categoryName.toUpperCase().trim();
    const fixedFile = CATEGORY_FIXED_FILES[normalizedCategory];
    const fixedCandidates = fixedFile ? [`${CATEGORY_IMAGES_BASE_URL}/${encodeURIComponent(fixedFile)}`] : [];

    const primary = buildCategoryImageCandidates(categoryName, CATEGORY_IMAGES_BASE_URL, CATEGORY_IMAGE_VERSION);

    const localFallback = categoryName === "TODOS" ? [allProductsImage] : [];
    const sharedFallback = [CATEGORY_DEFAULT_FALLBACK];

    if (fixedCandidates.length > 0) {
      return Array.from(new Set([...fixedCandidates, ...localFallback, ...sharedFallback]));
    }

    if (!CATEGORY_IMAGES_ENV_BASE_URL || CATEGORY_IMAGES_ENV_BASE_URL === CATEGORY_IMAGES_BASE_URL) {
      return Array.from(new Set([...fixedCandidates, ...primary, ...localFallback, ...sharedFallback]));
    }

    const secondary = buildCategoryImageCandidates(categoryName, CATEGORY_IMAGES_ENV_BASE_URL, CATEGORY_IMAGE_VERSION);
    return Array.from(new Set([...fixedCandidates, ...primary, ...secondary, ...localFallback, ...sharedFallback]));
  };

  const getCategoryImage = (categoryId: string): string => {
    if (categoryId === "all") {
      const allCandidates = buildCombinedCategoryFallbacks('TODOS');
      return allCandidates[0];
    }
    return buildCombinedCategoryFallbacks(categoryId)[0];
  };

  const getCategoryImageFallbacks = (categoryId: string): string[] => {
    if (categoryId === "all") {
      return buildCombinedCategoryFallbacks('TODOS');
    }

    return buildCombinedCategoryFallbacks(categoryId);
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
  
   const allTypes = [...new Set([
    ...products.map(p => p.type).filter(Boolean),
    ...products.map(p => p.category).filter(Boolean)
  ])].sort();

  const displayTypes = PRIORITY_CATEGORIES.filter(cat => 
    cat === "all" || allTypes.includes(cat)
  );
  
  const getProductCount = (type: string) => {
    if (type === "all") return products.filter(p => p.isActive).length;
    const typeUpper = type.toUpperCase().trim();
    return products.filter(p => p.isActive && (
      p.type?.toUpperCase().trim() === typeUpper || 
      p.category?.toUpperCase().trim() === typeUpper
    )).length;
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
    
    const current = Math.round(el.scrollLeft / ITEM_WIDTH);
    
    if (dir === "left" && current > 0) {
      el.scrollTo({ left: (current - 1) * ITEM_WIDTH, behavior: "smooth" });
    } else if (dir === "right" && current < displayTypes.length - 1) {
      el.scrollTo({ left: (current + 1) * ITEM_WIDTH, behavior: "smooth" });
    }
    
    setTimeout(updateScrollButtons, 350);
  };

  useEffect(() => {
    updateScrollButtons();
  }, [displayTypes.length]);

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
                onScroll={updateScrollButtons}
                className="flex justify-start overflow-x-auto scroll-smooth hide-scrollbar py-4"
                style={{ scrollbarWidth: 'none' }}
              >
              {displayTypes.map((type) => {
                const isSelected = selectedCategory === type;
                const count = getProductCount(type);
                const imageCandidates = getCategoryImageFallbacks(type);
                const imgSrc = imageCandidates[0] || getCategoryImage(type);
                
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
                      <img
                        src={imgSrc}
                        alt={type}
                        className="w-full h-full object-contain"
                        data-fallbacks={imageCandidates.join("|")}
                        data-fallback-index="0"
                        onError={handleCategoryImageFallback}
                      />
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
                      <img
                        src={getCategoryImage(type)}
                        alt={type}
                        className="w-full h-full object-cover"
                        data-fallbacks={getCategoryImageFallbacks(type).join("|")}
                        data-fallback-index="0"
                        onError={handleCategoryImageFallback}
                      />
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
