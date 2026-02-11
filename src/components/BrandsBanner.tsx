import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, ExternalLink } from "lucide-react";

const brands = [
  {
    name: "Holcim",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUalz7mzk1DhoayrlOizSjT9wND5kqb3OBZA&s",
    tagline: "Construyendo el futuro",
    description: "Líder mundial en materiales de construcción",
    color: "from-blue-600 via-blue-700 to-blue-900",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80"
  },
  {
    name: "Adelca",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxLRAVxIwLPqkyQ7PaoU9j8PlycL2C0CyjUg&s",
    tagline: "Acero de calidad superior",
    description: "La fuerza del acero ecuatoriano",
    color: "from-red-600 via-red-700 to-red-900",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
  },
  {
    name: "Mabe",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSsG_3U896-12bOKCqAaTJsp_LlXkFYzlo_A&s",
    tagline: "Electrodomésticos de confianza",
    description: "Innovación para tu hogar",
    color: "from-sky-500 via-sky-600 to-sky-800",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80"
  },
  {
    name: "Indurama",
    logo: "https://mir-s3-cdn-cf.behance.net/projects/404/84ae7069609155.Y3JvcCwyNjY3LDIwODYsMCwyNg.jpg",
    tagline: "Calidad que transforma",
    description: "30 años de experiencia en tu hogar",
    color: "from-orange-500 via-orange-600 to-orange-800",
    image: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&q=80"
  },
  {
    name: "TCL",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Logo_of_the_TCL_Corporation.svg/1280px-Logo_of_the_TCL_Corporation.svg.png",
    tagline: "Tecnología y electrónica",
    description: "Innovación en entretenimiento y dispositivos inteligentes",
    color: "from-blue-600 via-blue-700 to-blue-900",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80"
  },
];

export const BrandsBanner = () => {
  const [currentBrand, setCurrentBrand] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentBrand((prev) => (prev + 1) % brands.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const nextBrand = () => {
    setCurrentBrand((prev) => (prev + 1) % brands.length);
  };

  const prevBrand = () => {
    setCurrentBrand((prev) => (prev - 1 + brands.length) % brands.length);
  };

  return (
    <section className="py-10 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Star className="w-6 h-6 text-primary animate-pulse" />
          <h3 className="text-2xl md:text-3xl font-black text-foreground text-center">
            MARCAS DE CONFIANZA
          </h3>
          <Star className="w-6 h-6 text-primary animate-pulse" />
        </div>
        
        {/* Featured brand showcase */}
        <div 
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Navigation buttons */}
          <button 
            onClick={prevBrand}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={nextBrand}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl hover:bg-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${brands[currentBrand].color} transition-all duration-700`}>
            {/* Background image */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-20 transition-all duration-700"
              style={{ backgroundImage: `url(${brands[currentBrand].image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8">
              <div className="text-white text-center md:text-left max-w-lg">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-4">
                  <Star className="w-4 h-4 fill-white" />
                  Marca Premium
                </div>
                <h4 className="text-4xl md:text-5xl font-black mb-3 drop-shadow-lg">
                  {brands[currentBrand].name}
                </h4>
                <p className="text-xl md:text-2xl text-white/90 font-medium mb-2">
                  {brands[currentBrand].tagline}
                </p>
                <p className="text-white/70 text-sm md:text-base">
                  {brands[currentBrand].description}
                </p>
                <button className="mt-6 inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-white/90 transition-colors shadow-lg group">
                  Ver productos
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              
              <div className="w-40 h-40 md:w-56 md:h-56 bg-white rounded-3xl flex items-center justify-center p-6 shadow-2xl transform hover:scale-105 transition-transform">
                <img 
                  src={brands[currentBrand].logo} 
                  alt={brands[currentBrand].name}
                  className="w-full h-full object-contain"
                  onError={() => {
                    // Create a text-based logo fallback
                    const canvas = document.createElement('canvas');
                    canvas.width = 200;
                    canvas.height = 200;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      // Background
                      ctx.fillStyle = '#f3f4f6';
                      ctx.fillRect(0, 0, 200, 200);
                      // Text
                      ctx.fillStyle = '#374151';
                      ctx.font = 'bold 24px Arial';
                      ctx.textAlign = 'center';
                      ctx.textBaseline = 'middle';
                      ctx.fillText(brands[currentBrand].name, 100, 100);
                    }
                    e.currentTarget.src = canvas.toDataURL();
                  }}
                  crossOrigin="anonymous"
                />
              </div>
            </div>
          </div>
          
          {/* Progress indicators */}
          <div className="flex gap-2 mt-6 justify-center">
            {brands.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBrand(index)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  currentBrand === index 
                    ? "w-12 bg-primary" 
                    : "w-3 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Brand logos grid */}
        <div className="grid grid-cols-4 gap-4 mt-8">
          {brands.map((brand, index) => (
            <button
              key={brand.name}
              onClick={() => setCurrentBrand(index)}
              className={`bg-card rounded-2xl p-4 flex items-center justify-center aspect-square shadow-lg transition-all duration-300 ${
                currentBrand === index 
                  ? "ring-4 ring-primary scale-105 shadow-xl" 
                  : "hover:scale-105 hover:shadow-xl"
              }`}
            >
              <img 
                src={brand.logo} 
                alt={brand.name}
                className="w-full h-full object-contain"
                onError={() => {
                  // Create a text-based logo fallback for grid
                  const canvas = document.createElement('canvas');
                  canvas.width = 100;
                  canvas.height = 100;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    // Background
                    ctx.fillStyle = '#f3f4f6';
                    ctx.fillRect(0, 0, 100, 100);
                    // Text
                    ctx.fillStyle = '#374151';
                    ctx.font = 'bold 12px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(brand.name, 50, 50);
                  }
                  e.currentTarget.src = canvas.toDataURL();
                }}
                crossOrigin="anonymous"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
