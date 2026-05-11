import { useRef, useEffect, useState, useCallback } from "react";

const slides = [
  {
    id: 1,
    type: "image" as const,
    src: "https://res.cloudinary.com/dbbkpdhze/image/upload/v1778001612/PORTADA_1-1.png",
    action: "none" as const,
    value: "",
  },
  {
    id: 2,
    type: "video" as const,
    src: "https://res.cloudinary.com/dbbkpdhze/video/upload/v1776308811/PORTADA_1.mp4",
    action: "productCode" as const,
    value: "00000467",
  },
  {
    id: 3,
    type: "image" as const,
    src: "https://res.cloudinary.com/dbbkpdhze/image/upload/v1776338344/PORTADA_2.png",
    action: "category" as const,
    value: "TELEVISORES",
  },
  {
    id: 4,
    type: "image" as const,
    src: "https://res.cloudinary.com/dbbkpdhze/image/upload/v1776346058/PORTADA_3.png",
    action: "category" as const,
    value: "COLCHONES",
  },
  {
    id: 5,
    type: "image" as const,
    src: "https://res.cloudinary.com/dbbkpdhze/image/upload/v1776786143/PORTADA_4.png",
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
            className="w-full h-full object-contain"
          />
        ) : (
          <img
            src={currentSlide.src}
            alt=""
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-[#FF0000] shadow-xl flex items-center justify-center hover:scale-110 transition-all duration-300"
          >
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-[#FF0000] shadow-xl flex items-center justify-center hover:scale-110 transition-all duration-300"
          >
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
};
