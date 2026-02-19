import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    image: "https://res.cloudinary.com/dbbkpdhze/image/upload/v1771532367/Portada_P1_eboylw.png",
    title: "Bienvenidos",
    subtitle: "Todo lo que necesitas en un solo lugar",
    cta: "Ver productos",
  },
  {
    id: 2,
    image: "https://res.cloudinary.com/dbbkpdhze/image/upload/v1771533974/Portada_2_PP_gsrjf2.png",
    title: "Calidad Garantizada",
    subtitle: "Los mejores productos para tu hogar y construcción",
    cta: "Comprar ahora",
  },
  {
    id: 3,
    image: "https://res.cloudinary.com/dbbkpdhze/image/upload/v1771332997/Portada-1_fvdnon.jpg",
    title: "Tu Aliado de Confianza",
    subtitle: "Más de 25 años de experiencia a tu servicio",
    cta: "Explorar",
  },
];

export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const handleImageError = (index: number) => {
    console.error(`Error loading hero image ${index}`);
  };

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Slides container */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="w-full flex-shrink-0 relative aspect-[16/6]"
          >
            <img
              src={slide.image}
              alt={slide.title}
              onError={() => handleImageError(index)}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Content overlay */}
            <div className="absolute bottom-4 left-4 right-4 text-primary-foreground">
              <h2 className="text-2xl md:text-3xl font-black mb-1 drop-shadow-lg">
                {slide.title}
              </h2>
              <p className="text-lg font-semibold mb-3 drop-shadow-md opacity-90">
                {slide.subtitle}
              </p>
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-full font-bold text-sm shadow-lg transition-all duration-200 active:scale-95">
                {slide.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center text-foreground shadow-lg hover:bg-card transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center text-foreground shadow-lg hover:bg-card transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? "w-6 bg-primary"
                : "w-2 bg-primary-foreground/50 hover:bg-primary-foreground/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
