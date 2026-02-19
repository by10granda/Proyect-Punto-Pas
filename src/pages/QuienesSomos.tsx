import { Link } from "react-router-dom";
import { ArrowLeft, Award, Users, Heart, MapPin, Clock, Target, Sparkles } from "lucide-react";
import logoPuntoPas from "@/assets/logo-punto-pas.png";
import { useState, useEffect } from "react";
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
    description: "Punto Pas inicia sus actividades bajo la dirección de Franco Becerra, dedicándose a la comercialización de madera. Gracias al esfuerzo, trabajo constante y compromiso con sus clientes, la empresa logra posicionarse como un proveedor confiable en su sector.",
    image: "https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=800&q=80"
  },
  {
    year: "2008",
    title: "Expansión y Diversificación",
    description: "Con una visión de crecimiento y diversificación, Punto Pas abre su primera sucursal en San Lorenzo, incorporando la franquicia Disensa, y de manera conjunta inaugura un local de Stihl, ampliando su oferta hacia productos de ferretería, construcción y maquinaria.",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80"
  },
  {
    year: "2025",
    title: "Consolidación Regional",
    description: "Con el apoyo de sus hijos y continuando con su proceso de expansión, Punto Pas abre una nueva sucursal en Esmeraldas, consolidándose como una empresa comercial que ofrece una amplia variedad de productos, desde ferretería y materiales de construcción hasta electrodomésticos y artículos para el hogar.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
  },
  {
    year: "Presente",
    title: "Visión de Futuro",
    description: "Gracias a su trayectoria, visión empresarial y compromiso con la calidad, Punto Pas se proyecta como una empresa sólida y en constante crecimiento, orientada a satisfacer las necesidades de sus clientes y a fortalecer su presencia en el mercado regional.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
  }
];

const values = [
  {
    icon: Heart,
    title: "Pasión",
    description: "Amamos lo que hacemos y se refleja en cada producto que ofrecemos."
  },
  {
    icon: Award,
    title: "Calidad",
    description: "Solo trabajamos con las mejores marcas para garantizar tu satisfacción."
  },
  {
    icon: Users,
    title: "Servicio",
    description: "Nuestro equipo está capacitado para asesorarte en cada proyecto."
  },
  {
    icon: Target,
    title: "Compromiso",
    description: "Tu éxito es nuestro éxito. Trabajamos para superar tus expectativas."
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

  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1920&q=80",
      title: "Nuestra Historia",
      subtitle: "Más de una década construyendo sueños junto a nuestra comunidad",
      overlay: "from-primary via-primary/90 to-transparent"
    },
    {
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80",
      title: "Calidad y Confianza",
      subtitle: "Los mejores productos para cada proyecto importante",
      overlay: "from-blue-600 via-blue-600/90 to-transparent"
    },
    {
      image: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=1920&q=80",
      title: "Innovación Constante",
      subtitle: "Siempre evolucionando para servirte mejor",
      overlay: "from-purple-600 via-purple-600/90 to-transparent"
    },
    {
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80",
      title: "Compromiso con Ti",
      subtitle: "Tu éxito es nuestra mayor satisfacción",
      overlay: "from-orange-600 via-orange-600/90 to-transparent"
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
              <div className={`absolute inset-0 bg-gradient-to-t ${slide.overlay}`} />
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

          {/* Navegación del carrusel */}
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
        </div>
      </header>

      {/* Quiénes Somos */}
      <section className="px-4 py-16 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
          <Sparkles className="w-4 h-4" />
          Quiénes Somos
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-foreground mb-6">
          ¿Quiénes somos?
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          En <strong className="text-foreground">PuntoPas</strong> somos una empresa dedicada a la comercialización de una amplia variedad de productos para el hogar, la construcción y el uso diario. Ofrecemos desde artículos de ferretería y materiales de construcción hasta electrodomésticos y productos de consumo, brindando a nuestros clientes soluciones completas en un solo lugar.
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed mt-4">
          Nos caracterizamos por la <strong className="text-primary">calidad de nuestros productos</strong>, la atención personalizada y el compromiso con la satisfacción de quienes confían en nosotros.
        </p>
      </section>

      {/* Mission Statement */}
      <section className="px-4 py-16 max-w-4xl mx-auto text-center bg-muted/30">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
          <Target className="w-4 h-4" />
          Misión
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-foreground mb-6">
          Nuestra Misión
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Satisfacer las necesidades de nuestros clientes ofreciendo productos variados, confiables y a precios competitivos, acompañados de un servicio responsable y cercano, que garantice una experiencia de compra segura y eficiente.
        </p>
      </section>

      {/* Vision Statement */}
      <section className="px-4 py-16 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
          <Sparkles className="w-4 h-4" />
          Visión
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-foreground mb-6">
          Nuestra Visión
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Ser una empresa referente en la comercialización de productos para el hogar, la construcción y el comercio en general, reconocida por su variedad, calidad y excelencia en el servicio, consolidándonos como una opción confiable y preferida por nuestros clientes.
        </p>
      </section>

      {/* Timeline - Historia */}
      <section className="px-4 py-20 bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Clock className="w-4 h-4" />
              Nuestra Historia
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
              25 Años de Trayectoria
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
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

      {/* Values */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-foreground text-center mb-4">
            💎 Nuestros Valores
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Los principios que guían cada decisión y nos hacen ser tu mejor opción
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={value.title}
                className="bg-gradient-to-br from-card to-muted p-6 rounded-2xl text-center hover:shadow-lg transition-all duration-300 border border-border"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team/Store Image */}
      <section className="px-4 py-16 bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-black mb-6">
                👥 Nuestro Equipo
              </h2>
              <p className="text-primary-foreground/90 leading-relaxed mb-6">
                Contamos con un equipo de profesionales capacitados y apasionados por brindar 
                la mejor atención. Cada miembro de nuestra familia Punto Pas está comprometido 
                con tu satisfacción.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <span className="text-3xl font-black">+10</span>
                  <p className="text-sm text-primary-foreground/80">Años de experiencia</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <span className="text-3xl font-black">+5000</span>
                  <p className="text-sm text-primary-foreground/80">Clientes satisfechos</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <span className="text-3xl font-black">+1000</span>
                  <p className="text-sm text-primary-foreground/80">Productos disponibles</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <span className="text-3xl font-black">24/7</span>
                  <p className="text-sm text-primary-foreground/80">Atención online</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDG6sKbpOYHEmPi70Vki_CE5setRcNIBZ7SQ&s"
                alt="Equipo Punto Pas"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Location Card */}
      <section className="px-4 py-16 bg-slate-900">
        <div className="max-w-4xl mx-auto bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-700">
          <div className="grid md:grid-cols-2">
            <div className="p-8 text-white">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-cyan-400" />
                Visítanos
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                  <p className="text-slate-300">Ecuador - Tu ferretería de confianza</p>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white">Horario de atención</p>
                    <p className="text-slate-300">Lunes a Sábado: 8:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
              <Link 
                to="/"
                className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-bold mt-6 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
              >
                Ver productos
              </Link>
            </div>
            <div className="aspect-square md:aspect-auto relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 opacity-95" />
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d10925.215127800555!2d-78.81681414407421!3d1.2804919531416215!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sec!4v1770175357122!5m2!1ses!2sec" 
                width="100%" 
                height="100%" 
                style={{ border: 0, minHeight: '350px', filter: 'contrast(1.1) brightness(0.9)' }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Punto Pas"
                className="relative z-10"
              />
            </div>
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
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default QuienesSomos;
