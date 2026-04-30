import { Link } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Sparkles, Target } from "lucide-react";
import logoPuntoPas from "@/assets/logo-punto-pas.png";
import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { CartDrawer, CartItem } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import {
  products,
} from "@/data/products";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const milestones = [
  {
    year: "2000",
    title: "Nuestros Inicios",
    description: "Punto Pas inicia sus actividades en el año 2000 bajo la dirección del Empresario Franco Becerra, dedicándose a la comercialización de madera. Gracias al esfuerzo, trabajo constante y compromiso con sus clientes, la empresa logra posicionarse como un proveedor confiable en su sector.",
    image: "https://res.cloudinary.com/dbbkpdhze/image/upload/v1771535501/Historia_Imagen1_xesimt.png"
  },
  {
    year: "2007",
    title: "Primer Local Stihl",
    description: "Con el valioso apoyo y respaldo incondicional de su esposa Marlene Ambuldi, El empresario Franco Becerra materializa una visión empresarial estratégica al fundar el primer local Stihl, marcando así el inicio de una alianza comercial con una de las marcas más prestigiosas del sector de maquinaria y equipos de exterior.",
    image: "https://res.cloudinary.com/dbbkpdhze/image/upload/v1771619722/Stihl_Historia2007_exyqd0.jpg"
  },
  {
    year: "2008",
    title: "Expansión y Diversificación",
    description: "Con una visión de crecimiento y diversificación, Punto Pas abre su primera sucursal en San Lorenzo, incorporando la franquicia Disensa, ampliando así su oferta hacia productos de ferretería, construcción y maquinaria.",
    image: "https://res.cloudinary.com/dbbkpdhze/image/upload/v1771535752/Disensa_2008_qcyig9.jpg"
  },
  {
    year: "2025",
    title: "Consolidación Regional",
    description: "Con el apoyo de sus hijos y continuando con su proceso de expansión, Punto Pas abre una nueva sucursal en Esmeraldas, consolidándose como una empresa comercial que ofrece una amplia variedad de productos, desde ferretería y materiales de construcción hasta electrodomésticos y artículos para el hogar.",
    image: "https://res.cloudinary.com/dbbkpdhze/image/upload/v1771539692/Historia_3_bqs3zr.jpg"
  },
  {
    year: "Presente",
    title: "Visión de Futuro",
    description: "Gracias a su trayectoria, visión empresarial y compromiso con la calidad, Punto Pas se proyecta como una empresa sólida y en constante crecimiento, orientada a satisfacer las necesidades de sus clientes y a fortalecer su presencia en el mercado regional.",
    image: "https://res.cloudinary.com/dbbkpdhze/image/upload/v1771536434/Historia_2025_qzxzic.png"
  }
];

export const QuienesSomos = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("puntopas_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [visibleStats, setVisibleStats] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 400;
      carouselRef.current.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
    }
  };

   const heroSlides = [
    {
      image: "https://res.cloudinary.com/dbbkpdhze/image/upload/v1777489090/Portada_Q.png",
      title: "Quiénes Somos",
      subtitle: "25 años de historia, compromiso y servicio",
      overlay: "from-primary via-primary/80 to-transparent"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  // Persist cart to localStorage
  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("puntopas_cart", JSON.stringify(newCart));
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleUpdateQuantity = (id: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        handleRemoveItem(id);
        return;
      }
      
      const product = products.find(p => p.id === id);
      const maxQuantity = product ? product.stock : 999;
      
      const newCart = cart.map((item) => 
        item.id === id ? { ...item, quantity: Math.min(quantity, maxQuantity) } : item
      );
      updateCart(newCart);
    } catch {
      toast.error('Error al actualizar cantidad');
    }
  };

  const handleRemoveItem = (id: string) => {
    const newCart = cart.filter((item) => item.id !== id);
    updateCart(newCart);
    toast.info("Producto eliminado del carrito");
  };

  const handleClearCart = () => {
    updateCart([]);
    toast.info("Carrito vaciado");
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate("/checkout");
  };

  const handleSearch = (query: string) => {
    // Navigate to home with search
    if (query) {
      navigate(`/?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        cartCount={cartItemCount} 
        onSearch={handleSearch}
        onCartClick={() => setIsCartOpen(true)}
      />

       {/* Hero Section con Carrusel */}
       <header className="relative h-[70vh] overflow-hidden">
         {/* Carrusel de imágenes de fondo */}
         <div className="absolute inset-0">
           {heroSlides.map((slide, index) => (
             <div
               key={index}
               className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                 index === currentSlide ? 'opacity-100' : 'opacity-0'
               }`}
             >
               <div 
                 className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                 style={{ backgroundImage: `url(${slide.image})` }}
               />
               {/* Efecto oscuro sutil */}
               <div className="absolute inset-0 bg-black/30" />
             </div>
           ))}
         </div>

        {/* Contenido animado */}
        <div className="relative z-10 h-full flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-20">
            <div className="w-32 h-32 bg-white rounded-full p-1 mb-6 shadow-2xl animate-fade-in">
              <img 
                src={logoPuntoPas} 
                alt="Punto Pas Logo" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight text-white animate-fade-in-up">
              {heroSlides[currentSlide].title}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl animate-fade-in-up">
              {heroSlides[currentSlide].subtitle}
            </p>
          </div>

          {/* Navegación del carrusel - Solo mostrar si hay más de un slide */}
          {heroSlides.length > 1 && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
              <button
                onClick={prevSlide}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2 items-center">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={nextSlide}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>
          )}
        </div>
      </header>

        {/* Quiénes Somos, Misión y Visión - Cards */}
        <section className="py-16 bg-[#ffbd2b] relative">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid gap-6">
              {/* Quiénes Somos */}
              <div className="bg-white border-2 border-border rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="mb-4">
                   <h2 className="text-2xl md:text-3xl font-black" style={{fontFamily: "'Josefin Sans', sans-serif", color: '#ffbd2b'}}>
                     ¿Quiénés somos?
                   </h2>
                 </div>
                 <p className="text-muted-foreground leading-relaxed text-justify">
                   En <strong className="text-foreground">Punto-Pas</strong> somos una empresa
                   dedicada a la comercialización de una amplia variedad de productos para el hogar,
                   la construcción y el uso diario. Ofrecemos desde artículos de ferretería y materiales
                   de construcción hasta electrodomésticos, brindando a nuestros clientes soluciones
                   completas en un solo lugar.
                 </p>
                 <p className="text-muted-foreground leading-relaxed mt-4 text-justify">
                   Nos caracterizamos por la <strong className="text-primary">calidad de nuestros productos</strong>,
                   la atención personalizada y el compromiso con la satisfacción de quienes
                   confían en nosotros.
                 </p>
               </div>

              {/* Misión y Visión en grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Misión */}
                <div className="bg-white border-2 border-border rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="mb-4">
                    <h2 className="text-left text-xl md:text-2xl font-bold" style={{fontFamily: "'Josefin Sans', sans-serif", color: '#FB0548'}}>
                      Misión
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-justify">
                    Satisfacer las necesidades de nuestros clientes ofreciendo productos variados,
                    confiables y a precios competitivos, acompañados de un servicio responsable y
                    cercano, que garantice una experiencia de compra segura y eficiente.
                  </p>
                </div>

                {/* Visión */}
                <div className="bg-white border-2 border-border rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="mb-4">
                    <h2 className="text-left text-xl md:text-2xl font-bold" style={{fontFamily: "'Josefin Sans', sans-serif", color: '#FB0548'}}>
                      Visión
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-justify">
                    Ser una empresa referente en la comercialización de productos para el hogar,
                    la construcción y el comercio en general, reconocida por su variedad,
                    calidad y excelencia en el servicio, consolidándonos como una opción confiable
                    y preferida por nuestros clientes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ola SVG inferior */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none translate-y-full" style={{ lineHeight: 0 }}>
            <svg viewBox="0 0 1440 150" preserveAspectRatio="none" className="w-full block" style={{ display: 'block' }}>
              <path d="M0,0 Q360,150 720,0 T1440,0 L1440,150 L0,150 Z" fill="#ffffff" />
            </svg>
          </div>
        </section>

        {/* Timeline - Historia */}
        <section className="px-4 pt-20 pb-20 bg-gradient-to-b from-muted/50 to-background">
          <div className="max-w-5xl mx-auto">
            <div className="text-left mb-16">
              <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Clock className="w-4 h-4" />
                Nuestra Historia
              </span>
              <h2 className="text-left text-3xl md:text-4xl font-bold text-[#FB0548] mt-4" style={{fontFamily: "'Josefin Sans', sans-serif"}}>
                 25 Años de Trayectoria
              </h2>
              <p className="text-muted-foreground max-w-2xl mt-2">
                Un recorrido de esfuerzo, dedicación y compromiso con nuestros clientes
              </p>
            </div>

            {/* Timeline Vertical */}
            <div className="relative">
              {/* Línea central vertical */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent transform md:-translate-x-1/2" />

              {milestones.map((milestone, index) => (
                <div
                  key={milestone.year}
                  className={`relative flex flex-col md:flex-row items-start md:items-center gap-6 mb-16 last:mb-0 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Círculo con año */}
                  <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 z-10">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-xl shadow-primary/30 border-4 border-background">
                      <span className="text-primary-foreground font-black text-sm text-center leading-tight">
                        {milestone.year}
                      </span>
                    </div>
                  </div>

                  {/* Contenido - Izquierda */}
                  <div className={`flex-1 pl-16 md:pl-0 ${index % 2 === 0 ? 'md:pr-24 md:text-right' : 'md:pl-24 md:text-left'}`}>
                    <div className={`bg-card rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-border group ${index % 2 === 0 ? 'md:ml-auto' : 'md:mr-auto'} max-w-md`}>
                      {/* Imagen */}
                      <div className="aspect-[16/10] overflow-hidden relative">
                        <img
                          src={milestone.image}
                          alt={milestone.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-white font-bold text-lg drop-shadow-lg">{milestone.title}</h3>
                        </div>
                      </div>
                      {/* Descripción */}
                      <div className="p-5">
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {milestone.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Espacio vacío para el otro lado */}
                  <div className="hidden md:block flex-1" />
                </div>
              ))}
            </div>
          </div>
        </section>

      {/* Sección de Videos - Carrusel */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-left text-2xl md:text-3xl font-bold text-[#FB0548] mb-10" style={{fontFamily: "'Josefin Sans', sans-serif"}}>
            Nuestros Videos
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Conoce más sobre Punto Pas en nuestras redes
          </p>
          
          {/* Carrusel con scroll-snap */}
          <div className="relative">
            {/* Flecha izquierda */}
            <button 
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-[#FB0548] rounded-full shadow-md flex items-center justify-center hover:bg-[#d9043f] transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div 
              ref={carouselRef}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {[
                { id: '7627152226280244753', cite: 'https://www.tiktok.com/@punto_pas/video/7634170687552310536?is_from_webapp=1&sender_device=pc&web_id=7627152226280244753' },
                { id: '7633990538231893256', cite: 'https://www.tiktok.com/@punto_pas/video/7633990538231893256' },
                { id: '7622439772660698376', cite: 'https://www.tiktok.com/@punto_pas/video/7622439772660698376' },
                { id: '7622438037452000530', cite: 'https://www.tiktok.com/@punto_pas/video/7622438037452000530' },
                { id: '7600147557926341895', cite: 'https://www.tiktok.com/@punto_pas/video/7600147557926341895' },
              ].map((video, index) => (
                <div 
                  key={index} 
                  className="flex-none w-full md:w-[400px] snap-center"
                >
                  <blockquote 
                    className="tiktok-embed" 
                    cite={video.cite}
                    data-video-id={video.id}
                  >
                    <section>
                      <a target="_blank" title="@punto_pas" href="https://www.tiktok.com/@punto_pas">@punto_pas</a>
                    </section>
                  </blockquote>
                </div>
              ))}
            </div>

            {/* Flecha derecha */}
            <button 
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-[#FB0548] rounded-full shadow-md flex items-center justify-center hover:bg-[#d9043f] transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-4 py-16 bg-slate-950 text-center border-t border-slate-800">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h3 className="text-2xl font-black text-white mb-4">
              ¿Listo para comenzar tu proyecto?
            </h3>
            <p className="text-slate-400 mb-6">
              Encuentra todo lo que necesitas en Punto Pas. Calidad, confianza y el mejor servicio.
            </p>
            <Link 
              to="/"
              className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-xl font-bold transition-all duration-200 shadow-xl hover:shadow-cyan-500/25 text-lg"
            >
              Explorar catálogo
            </Link>
          </div>
          <div className="pt-8 border-t border-slate-800">
            <p className="text-slate-500 mb-4">
              © 2024 <span className="font-bold text-cyan-400">Punto Pas</span>. Todos los derechos reservados.
            </p>
            <Link 
              to="/"
              className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors"
            >
              ← Volver al catálogo
            </Link>
          </div>
        </div>
      </section>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        products={products}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default QuienesSomos;
