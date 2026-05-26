import { useRef, useEffect, useState, useCallback } from "react";

const HERO_BASE_URL = (import.meta.env.VITE_HERO_BASE_URL as string | undefined) || "";
const heroBase = HERO_BASE_URL.replace(/\/$/, "");
const heroAssetUrl = (fileName: string, defaultUrl: string) =>
  heroBase ? `${heroBase}/${encodeURIComponent(fileName)}` : defaultUrl;
const CLOUDINARY_CLOUD = "dx08ybps6";

const buildCloudinaryImageUrl = (fileName: string) =>
  `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/image/upload/${encodeURIComponent(fileName)}`;

const buildCloudinaryVideoUrl = (fileName: string) =>
  `https://res.cloudinary.com/${CLOUDINARY_CLOUD}/video/upload/${encodeURIComponent(fileName)}`;

const HERO_CLOUDINARY_FALLBACKS: Record<string, string[]> = {
  "PORTADA_1-1.png": [
    "https://res.cloudinary.com/dx08ybps6/image/upload/v1779574038/PORTADA_1-1.png",
    buildCloudinaryImageUrl("PORTADA_1-1.png"),
  ],
  "PORTADA_2.png": [
    "https://res.cloudinary.com/dx08ybps6/image/upload/v1779574063/PORTADA_2.png",
    buildCloudinaryImageUrl("PORTADA_2.png"),
  ],
  "PORTADA_3.png": [
    "https://res.cloudinary.com/dx08ybps6/image/upload/v1779574040/PORTADA_3.png",
    buildCloudinaryImageUrl("PORTADA_3.png"),
  ],
  "PORTADA_4.png": [
    "https://res.cloudinary.com/dx08ybps6/image/upload/v1779574041/PORTADA_4.png",
    buildCloudinaryImageUrl("PORTADA_4.png"),
  ],
  "PORTADA_1.mp4": [
    "https://res.cloudinary.com/dx08ybps6/video/upload/v1779574034/PORTADA_1.mp4",
    buildCloudinaryVideoUrl("PORTADA_1.mp4"),
    "https://assets.distribuidor-puntopas.com/PORTADAS/PORTADA_1.mp4",
  ],
};

const handleMediaFallback = (event: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement>) => {
  const media = event.currentTarget;
  const fallbackValue = media.dataset.fallbacks;
  if (!fallbackValue) return;

  const fallbacks = fallbackValue.split("|");
  const currentIndex = Number(media.dataset.fallbackIndex || "0");
  const nextIndex = currentIndex + 1;

  if (nextIndex >= fallbacks.length) {
    media.removeAttribute("data-fallbacks");
    return;
  }

  media.dataset.fallbackIndex = String(nextIndex);
  media.src = fallbacks[nextIndex];
};

const slides = [
  {
    id: 1,
    type: "image" as const,
    src: heroAssetUrl(
      "PORTADA_1-1.png",
      "https://assets.distribuidor-puntopas.com/PORTADAS/PORTADA_1-1.png",
    ),
    fallbacks: HERO_CLOUDINARY_FALLBACKS["PORTADA_1-1.png"],
    action: "none" as const,
    value: "",
  },
  {
    id: 2,
    type: "video" as const,
    src: "https://res.cloudinary.com/dx08ybps6/video/upload/v1779574034/PORTADA_1.mp4",
    fallbacks: HERO_CLOUDINARY_FALLBACKS["PORTADA_1.mp4"],
    action: "productCode" as const,
    value: "00000467",
  },
  {
    id: 3,
    type: "image" as const,
    src: "https://res.cloudinary.com/dx08ybps6/image/upload/v1779574063/PORTADA_2.png",
    fallbacks: HERO_CLOUDINARY_FALLBACKS["PORTADA_2.png"],
    action: "category" as const,
    value: "TELEVISORES",
  },
  {
    id: 4,
    type: "image" as const,
    src: "https://res.cloudinary.com/dx08ybps6/image/upload/v1779574040/PORTADA_3.png",
    fallbacks: HERO_CLOUDINARY_FALLBACKS["PORTADA_3.png"],
    action: "category" as const,
    value: "COLCHONES",
  },
  {
    id: 5,
    type: "image" as const,
    src: "https://res.cloudinary.com/dx08ybps6/image/upload/v1779574041/PORTADA_4.png",
    fallbacks: HERO_CLOUDINARY_FALLBACKS["PORTADA_4.png"],
    action: "category" as const,
    value: "MUEBLERIA COMEDORES Y MESAS",
  },
];

interface HeroCarouselProps {
  onProductClick?: (productCode: string) => void;
  onCategoryClick?: (category: string) => void;
}

export const HeroCarousel = ({ onProductClick, onCategoryClick }: HeroCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const slide = slides[currentIndex];
    if (slide.type === "video" && videoRef.current) {
      videoRef.current.src = slide.src;
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [currentIndex]);

  const goToSlide = useCallback((index: number) => {
    if (index === currentIndex || isTransitioning) return;
    
    setIsTransitioning(true);
    setDisplayIndex(index);
    
    setTimeout(() => {
      setCurrentIndex(index);
      setDisplayIndex(index);
      setIsTransitioning(false);
    }, 600);
  }, [currentIndex, isTransitioning]);

  const handlePrev = () => {
    const newIndex = (currentIndex - 1 + slides.length) % slides.length;
    goToSlide(newIndex);
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % slides.length;
    goToSlide(newIndex);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const newIndex = (currentIndex + 1) % slides.length;
      goToSlide(newIndex);
    }, 9000);
    return () => clearInterval(timer);
  }, [currentIndex, goToSlide]);

  const handleClick = () => {
    const slide = slides[currentIndex];
    if (slide.action === "productCode" && onProductClick) {
      onProductClick(slide.value);
    } else if (slide.action === "category" && onCategoryClick) {
      onCategoryClick(slide.value);
    }
  };

  const currentSlide = slides[displayIndex];

  return (
    <div 
      className="relative w-full mx-auto overflow-hidden rounded-[20px]"
      style={{ 
        aspectRatio: "2560/500",
        maxHeight: "500px"
      }}
    >
      {/* Main container with smooth crossfade */}
      <div 
        className={`absolute inset-0 transition-all duration-700 ease-in-out ${
          isTransitioning 
            ? 'opacity-0' 
            : 'opacity-100'
        }`}
        onClick={handleClick}
      >
        {currentSlide.type === "video" ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop={!isTransitioning}
            playsInline
            data-fallbacks={currentSlide.fallbacks?.join("|")}
            data-fallback-index="0"
            onError={handleMediaFallback}
            className="w-full h-full object-contain"
          />
        ) : (
          <img
            src={currentSlide.src}
            data-fallbacks={currentSlide.fallbacks?.join("|")}
            data-fallback-index="0"
            alt=""
            className="w-full h-full object-contain"
            onError={handleMediaFallback}
          />
        )}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#FF0000] shadow-xl flex items-center justify-center hover:scale-110 transition-all duration-300"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handleNext}
            className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#FF0000] shadow-xl flex items-center justify-center hover:scale-110 transition-all duration-300"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
};
