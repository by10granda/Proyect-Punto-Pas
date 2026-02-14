import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

const slides = [
  {
    id: 1,
    // Imagen de portada desde Cloudinary
    image:
      "https://res.cloudinary.com/dbbkpdhze/image/upload/v1771030357/Gemini_Generated_Image_rkyu17rkyu17rkyu_onknty.png",
    title: "Herramientas Pro",
    subtitle: "Las mejores marcas",
    cta: "Ver productos",
  },
  {
    id: 2,
    image: hero2,
    title: "Decoración Hogar",
    subtitle: "Transforma tu espacio",
    cta: "Explorar",
  },
  {
    id: 3,
    image: hero3,
    title: "Material Eléctrico",
    subtitle: "Calidad garantizada",
    cta: "Comprar ahora",
  },
];

export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // manage image URLs so we can fallback if a public image is missing
  const fallbackImages = [hero1, hero2, hero3];
  const [imageUrls, setImageUrls] = useState<string[]>(() => slides.map((s) => s.image));

  const handleImageError = (index: number) => {
    setImageUrls((prev) => {
      const next = [...prev];
      // only replace if different to avoid infinite loop
      if (next[index] !== fallbackImages[index]) {
        next[index] = fallbackImages[index];
      }
      return next;
    });
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
            className="w-full flex-shrink-0 relative bg-gray-100"
          >
            <img
              src={imageUrls[index]}
              alt={slide.title}
              onError={() => handleImageError(index)}
              className="w-full h-auto object-contain max-h-[70vh] mx-auto"
            />
            {/* Content below image */}
            <div className="bg-gradient-to-t from-primary/10 to-transparent py-6 px-4 text-center">
              <h2 className="text-2xl md:text-3xl font-black mb-1 text-foreground">
                {slide.title}
              </h2>
              <p className="text-lg font-semibold mb-3 text-muted-foreground">
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
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
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
