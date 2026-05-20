import { memo, useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Product } from "@/data/products";
import { useNavigate } from "react-router-dom";

interface BrandsBannerProps {
  products: Product[];
  onBrandClick: (brand: string) => void;
}

const BRANDS_BASE_URL = (import.meta.env.VITE_BRANDS_BASE_URL as string | undefined) || "";
const SECTION_BRANDS_BASE_URL = (import.meta.env.VITE_SECTION_BRANDS_BASE_URL as string | undefined) || "";
const DEFAULT_BRANDS_BASE = "https://assets.distribuidor-puntopas.com/image/upload";
const BRAND_LOGO_VERSION = "v1778950354";

const featuredBrands = [
  { imageName: "MARCA HONOR.png", brand: "HONOR" },
  { imageName: "MARCA INDURAMA.png", brand: "INDURAMA" },
  { imageName: "MARCA MABE.png", brand: "MABE" },
  { imageName: "MARCA PHILIPS.png", brand: "PHILIPS" },
  { imageName: "MARCA RCA.png", brand: "RCA" },
  { imageName: "MARCA TCL.png", brand: "TCL" },
];

export const BrandsBanner = memo(({ products, onBrandClick }: BrandsBannerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const availableBrands = new Set(products.map((p) => String(p.brand || "").toUpperCase().trim()).filter(Boolean));
  const sectionBrands = featuredBrands.filter(({ brand }) => availableBrands.has(brand));
  const brandsToRender = sectionBrands.length > 0 ? sectionBrands : featuredBrands;
  const duplicatedBrands = [...brandsToRender, ...brandsToRender];

  const startScrolling = (direction: "left" | "right") => {
    if (scrollIntervalRef.current) return;
    setIsScrolling(true);
    
    const scrollStep = () => {
      if (scrollRef.current) {
        const multiplier = direction === "left" ? -1 : 1;
        scrollRef.current.scrollLeft += 300 * multiplier;
      }
    };
    
    scrollIntervalRef.current = setInterval(scrollStep, 16);
  };

  const stopScrolling = () => {
    setIsScrolling(false);
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  const getLogoUrl = (brand: { imageName: string; brand: string }) => {
    const normalizedBrand = brand.brand.toUpperCase().replace(/\s+/g, "_");
    const sectionBase = SECTION_BRANDS_BASE_URL.replace(/\/$/, "");

    if (sectionBase) {
      return `${sectionBase}/${encodeURIComponent(brand.imageName)}`;
    }

    if (BRANDS_BASE_URL) {
      return `${BRANDS_BASE_URL.replace(/\/$/, "")}/${normalizedBrand}_1.png`;
    }

    return `${DEFAULT_BRANDS_BASE}/${BRAND_LOGO_VERSION}/${normalizedBrand}_1.png`;
  };

  const handleBrandClick = (brand: string) => {
    onBrandClick(brand);
    navigate(`/?tab=all&brand=${encodeURIComponent(brand)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (brandsToRender.length === 0) return null;

return (
    <section className="py-8 bg-white">
      <div className="mb-6 px-4">
        <h3 className="text-lg md:text-xl lg:text-2xl font-black uppercase tracking-wide" style={{ color: '#FA003F', fontFamily: 'Nunito, sans-serif' }}>
          Nuestras Marcas
        </h3>
      </div>

      <div className="relative group">
        <button
          onMouseDown={() => startScrolling("left")}
          onMouseUp={stopScrolling}
          onMouseLeave={stopScrolling}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {duplicatedBrands.map((brand, index) => (
            <button
              key={`${brand.brand}-${index}`}
              onClick={() => handleBrandClick(brand.brand)}
              className="flex-shrink-0 h-16 w-36 flex items-center justify-center overflow-hidden rounded-xl"
            >
              <img
                src={getLogoUrl(brand)}
                alt={brand.brand}
                className="h-full w-auto object-contain rounded-xl transition-transform duration-200 hover:scale-125"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                  img.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <span className="hidden font-bold text-gray-700 text-sm uppercase tracking-wide">
                {brand.brand}
              </span>
            </button>
          ))}
        </div>

        <button
          onMouseDown={() => startScrolling("right")}
          onMouseUp={stopScrolling}
          onMouseLeave={stopScrolling}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </section>
  );
});
