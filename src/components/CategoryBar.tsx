import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { categories } from "@/data/products";

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const categoryImages: Record<string, string> = {
  "all": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  "FERRETERIA EN GENERAL": "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&q=80",
  "HOGAR": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
  "HERRAMIENTAS": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=600&q=80",
  "ELECTRICOS": "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600&q=80",
  "ADITIVOS": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80",
};

export const CategoryBar = ({ selectedCategory, onSelectCategory }: CategoryBarProps) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    const newPosition = direction === "left" 
      ? scrollPosition - scrollAmount 
      : scrollPosition + scrollAmount;
    
    scrollRef.current.scrollTo({ left: newPosition, behavior: "smooth" });
    setScrollPosition(newPosition);
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      setScrollPosition(scrollRef.current.scrollLeft);
    }
  };

  useEffect(() => {
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener("scroll", handleScroll);
      return () => ref.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollRef.current 
    ? scrollPosition < scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 10
    : true;

  return (
    <div className="bg-card py-8 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-3xl md:text-4xl font-black text-foreground bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent leading-relaxed">🏷️ CATEGORÍAS</h3>
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center transition-all ${
                canScrollLeft ? "hover:bg-primary hover:text-primary-foreground" : "opacity-30"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center transition-all ${
                canScrollRight ? "hover:bg-primary hover:text-primary-foreground" : "opacity-30"
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="grid grid-flow-col grid-rows-2 auto-cols-max gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 flex-shrink-0 group ${
                selectedCategory === category.id
                  ? "bg-primary shadow-xl scale-105"
                  : "bg-muted hover:bg-primary/10 hover:shadow-lg hover:scale-102"
              }`}
            >
              <div className={`w-44 h-44 md:w-56 md:h-56 rounded-2xl overflow-hidden border-4 transition-all shadow-lg ${
                selectedCategory === category.id 
                  ? "border-primary-foreground" 
                  : "border-border group-hover:border-primary"
              }`}>
                <img
                  src={categoryImages[category.id] || categoryImages["all"]}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <span className={`text-sm font-bold text-center transition-colors mt-4 ${
                selectedCategory === category.id 
                  ? "text-primary-foreground" 
                  : "text-foreground group-hover:text-primary"
              }`}>
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
