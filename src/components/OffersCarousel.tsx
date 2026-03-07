import { Flame, ArrowRight } from "lucide-react";

interface OffersCarouselProps {
  onViewAll: () => void;
}

export const OffersCarousel = ({ onViewAll }: OffersCarouselProps) => {
  return (
    <section className="py-4 bg-gradient-to-r from-primary/5 via-background to-primary/5">
      <div className="px-4 max-w-7xl mx-auto">
        {/* Banner promocional */}
        <div 
          className="relative rounded-3xl overflow-hidden cursor-pointer group"
          onClick={onViewAll}
        >
          {/* Imagen de fondo */}
          <div className="relative h-48 md:h-64 lg:h-80">
            <img
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80"
              alt="Ofertas Especiales"
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
            {/* Overlay gradiente */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent" />
          </div>
          
          {/* Contenido */}
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10 lg:px-16">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/90 text-sm font-semibold tracking-wider uppercase">
                No te lo pierdas
              </span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 leading-tight">
              OFERTAS
              <span className="block text-yellow-300">ESPECIALES</span>
            </h2>
            
            <p className="text-white/80 text-sm md:text-base max-w-md mb-4">
              Descuentos increíbles en ferretería, herramientas y más. ¡Solo por tiempo limitado!
            </p>
            
            {/* Botón Ver todos */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewAll();
              }}
              className="flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-full font-bold text-base w-fit shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group/btn"
            >
              <span>Ver todas las ofertas</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
            </button>
          </div>
          
          {/* Badge de porcentaje */}
          <div className="absolute top-4 right-4 md:top-6 md:right-6 bg-yellow-400 text-primary font-black text-2xl md:text-3xl px-4 py-2 rounded-2xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
            -50%
          </div>
        </div>
        
        {/* Indicadores visuales de categorías con ofertas */}
        <div className="mt-4 flex justify-center gap-3 flex-wrap">
          {[
            { icon: "🔧", name: "Ferretería", color: "bg-blue-500" },
            { icon: "🛠️", name: "Herramientas", color: "bg-orange-500" },
            { icon: "🏡", name: "Hogar", color: "bg-green-500" },
            { icon: "💡", name: "Eléctricos", color: "bg-yellow-500" },
          ].map((item, idx) => (
            <div 
              key={idx}
              onClick={onViewAll}
              className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-sm cursor-pointer hover:shadow-md hover:bg-muted transition-all"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-semibold text-foreground">{item.name}</span>
              <span className={`w-2 h-2 rounded-full ${item.color}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
