import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/data/products";

interface MochilasBannerProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export const MochilasBanner = ({ products, onProductClick, onAddToCart }: MochilasBannerProps) => {
  const mochilasProducts = products.filter(p => 
    p.category === 'MOCHILAS' || 
    p.category === 'BACKPACK' || 
    p.name.toUpperCase().includes('MOCHILA') || 
    p.name.toUpperCase().includes('BACKPACK')
  ).slice(0, 12);
  
  if (mochilasProducts.length === 0) return null;
  
  const mochilasRef = useRef<HTMLDivElement>(null);
  
  const scrollLeft = () => {
    if (mochilasRef.current) {
      mochilasRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (mochilasRef.current) {
      mochilasRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="relative py-6 rounded-3xl" style={{ background: 'linear-gradient(90deg, #6be500, #5cd400, #6be500)' }}>
        <h3 className="text-center text-lg md:text-xl lg:text-2xl font-black text-white mb-6 uppercase tracking-wide">MOCHILAS</h3>
        
        {/* Arrow Controls */}
        <button
          onClick={scrollLeft}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6" style={{ color: '#6be500' }} />
        </button>
        <button
          onClick={scrollRight}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110"
        >
          <ChevronRight className="w-6 h-6" style={{ color: '#6be500' }} />
        </button>
        
        <div 
          ref={mochilasRef}
          className="flex gap-4 px-12 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {mochilasProducts.map(product => (
            <div
              key={product.id}
              className="flex-shrink-0 bg-white rounded-xl shadow-lg overflow-hidden w-48"
            >
              <div 
                className="aspect-square bg-gray-50 p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onProductClick(product)}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://placehold.co/200x200?text=${encodeURIComponent(product.name.substring(0, 10))}`;
                  }}
                />
              </div>
              <button
                onClick={() => onAddToCart(product, 1)}
                className="w-full py-2 text-white text-xs font-bold transition-all duration-300 hover:brightness-110"
                style={{ background: '#FF5252' }}
              >
                AÑADIR
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
