import { memo, useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Product } from "@/data/products";
import { useNavigate } from "react-router-dom";

interface BrandsBannerProps {
  products: Product[];
  onBrandClick: (brand: string) => void;
}

const BRANDS_BASE_URL = (import.meta.env.VITE_BRANDS_BASE_URL as string | undefined) || "";
const DEFAULT_BRANDS_BASE = "https://assets.distribuidor-puntopas.com/MARCAS";
const CLOUDINARY_BRANDS_BASE = "https://res.cloudinary.com/dx08ybps6/image/upload/v1779573858";

const featuredBrands = [
  "HONOR",
  "INDURAMA",
  "MABE",
  "PHILIPS",
  "RCA",
  "TCL",
];

const normalizeBrandFileName = (brand: string) =>
  brand
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const isGenericBrand = (brand: string) => normalizeBrandFileName(brand) === "GENERICA";

export const BrandsBanner = memo(({ products, onBrandClick }: BrandsBannerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isScrolling, setIsScrolling] = useState(false);
  const [brandsWithoutImage, setBrandsWithoutImage] = useState<Set<string>>(() => new Set());
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const availableBrands = Array.from(
    new Set(products.map((p) => String(p.brand || "").toUpperCase().trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));
  const sourceBrands = availableBrands.length > 0 ? availableBrands : featuredBrands;
  const brandsToRender = sourceBrands.filter((brand) => {
    const normalizedBrand = normalizeBrandFileName(brand);
    return isGenericBrand(brand) || !brandsWithoutImage.has(normalizedBrand);
  });
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

  const getLogoUrl = (brand: string) => {
    const normalizedBrand = normalizeBrandFileName(brand);
    const base = BRANDS_BASE_URL.replace(/\/$/, "") || DEFAULT_BRANDS_BASE;

    return `${base}/${normalizedBrand}_1.png`;
  };

  const getCloudinaryLogoUrl = (brand: string) => {
    const normalizedBrand = normalizeBrandFileName(brand);
    return `${CLOUDINARY_BRANDS_BASE}/${normalizedBrand}_1.png`;
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
              key={`${brand}-${index}`}
              onClick={() => handleBrandClick(brand)}
              className="flex-shrink-0 h-16 w-36 flex items-center justify-center overflow-hidden rounded-xl"
            >
              {isGenericBrand(brand) ? (
                <span className="font-bold text-gray-700 text-sm uppercase tracking-wide">
                  {brand}
                </span>
              ) : (
                  <img
                    src={getLogoUrl(brand)}
                    alt={brand}
                    className="h-full w-auto object-contain rounded-xl transition-transform duration-200 hover:scale-125"
                    onError={(event) => {
                      const image = event.currentTarget;
                      if (image.dataset.cloudinaryTried !== "1") {
                        image.dataset.cloudinaryTried = "1";
                        image.src = getCloudinaryLogoUrl(brand);
                        return;
                      }

                      const normalizedBrand = normalizeBrandFileName(brand);
                      setBrandsWithoutImage((current) => {
                        if (current.has(normalizedBrand)) return current;
                        const next = new Set(current);
                        next.add(normalizedBrand);
                        return next;
                      });
                    }}
                  />
                )}
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
