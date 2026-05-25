import { Link } from "react-router-dom";
import { Clock, Sparkles, Target } from "lucide-react";
import logoPuntoPas from "@/assets/logo-punto-pas.png";
import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { CartDrawer, CartItem } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import {
  products,
} from "@/data/products";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import { buildAssetCandidates, handleAssetFallback } from "@/utils/assetFallback";

const OTHER_BUSINESSES_BASE_URL = "https://assets.distribuidor-puntopas.com/NEGOCIOS_PUNTOPAS";
const ASSETS_BASE_URL = "https://assets.distribuidor-puntopas.com";
const QUIENES_HERO_CANDIDATES = buildAssetCandidates(ASSETS_BASE_URL, "PORTADAS", "PORTADA_QUIENESSOMOS.png");

const milestones = [
  {
    year: "2000",
    title: "Nuestros Inicios",
    description: "Punto Pas inicia sus actividades en el año 2000 bajo la dirección del Empresario Franco Becerra, dedicándose a la comercialización de madera. Gracias al esfuerzo, trabajo constante y compromiso con sus clientes, la empresa logra posicionarse como un proveedor confiable en su sector.",
     image: "https://assets.distribuidor-puntopas.com/EMPRENDIMIENTOS_PRESENTACIONES/MADEDERA_Q1.png"
  },
  {
    year: "2007",
    title: "Primer Local Stihl",
    description: "Con el valioso apoyo y respaldo incondicional de su esposa Marlene Ambuldi, El empresario Franco Becerra materializa una visión empresarial estratégica al fundar el primer local Stihl, marcando así el inicio de una alianza comercial con una de las marcas más prestigiosas del sector de maquinaria y equipos de exterior.",
     image: "https://assets.distribuidor-puntopas.com/EMPRENDIMIENTOS_PRESENTACIONES/QUIENES_SOMOS_2.png"
  },
  {
    year: "2008",
    title: "Expansión y Diversificación",
    description: "Con una visión de crecimiento y diversificación, Punto Pas abre su primera sucursal en San Lorenzo, incorporando la franquicia Disensa, ampliando así su oferta hacia productos de ferretería, construcción y maquinaria.",
     image: "https://assets.distribuidor-puntopas.com/EMPRENDIMIENTOS_PRESENTACIONES/DISENSA_1.png"
  },
  {
    year: "2025",
    title: "Consolidación Regional",
    description: "Con el apoyo de sus hijos y continuando con su proceso de expansión, Punto Pas abre una nueva sucursal en Esmeraldas, consolidándose como una empresa comercial que ofrece una amplia variedad de productos, desde ferretería y materiales de construcción hasta electrodomésticos y artículos para el hogar.",
     image: "https://assets.distribuidor-puntopas.com/PORTADAS/PORTADA_QUIENESSOMOS.png"
  }
];

export const QuienesSomos = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("puntopas_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const historyRefs = useRef<(HTMLElement | null)[]>([]);
  const [visibleHistory, setVisibleHistory] = useState<number[]>([]);

  useEffect(() => {
    if (location.hash === "#otros-emprendimientos") {
      const section = document.getElementById("otros-emprendimientos");
      if (section) {
        setTimeout(() => {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      }
    }
  }, [location.hash]);

   const heroSlides = [
    {
      image: "https://assets.distribuidor-puntopas.com/PORTADAS/PORTADA_QUIENESSOMOS.png",
      title: "Quiénes Somos",
      subtitle: "25 años de historia, compromiso y servicio",
      overlay: "from-primary via-primary/80 to-transparent"
    }
  ];

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idxAttr = entry.target.getAttribute("data-history-idx");
          const idx = idxAttr ? Number(idxAttr) : -1;
          if (idx >= 0) {
            setVisibleHistory((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
          }
        });
      },
      { threshold: 0.2 }
    );

    historyRefs.current.forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        cartCount={cartItemCount} 
        onSearch={handleSearch}
        onCartClick={() => setIsCartOpen(true)}
      />

       {/* Hero Section - portada clásica */}
       <header className="relative h-[68vh] min-h-[480px] overflow-hidden">
         <img
           src={QUIENES_HERO_CANDIDATES[0]}
           data-fallbacks={QUIENES_HERO_CANDIDATES.join("|")}
           data-fallback-index="0"
           onError={handleAssetFallback}
           alt="Portada Quienes Somos"
           className="absolute inset-0 w-full h-full object-cover"
         />
         <div className="absolute inset-0 bg-black/35" />
         <div className="relative z-10 h-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center">
           <div className="w-28 h-28 md:w-32 md:h-32 bg-white rounded-full p-1 mb-6 shadow-2xl animate-in fade-in zoom-in-95 duration-700">
             <img src={logoPuntoPas} alt="Punto Pas Logo" className="w-full h-full object-cover rounded-full" />
           </div>
           <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white animate-in fade-in slide-in-from-bottom-5 duration-700">{heroSlides[0].title}</h1>
           <p className="mt-4 text-lg md:text-2xl text-white/90 max-w-3xl animate-in fade-in slide-in-from-bottom-5 duration-700">{heroSlides[0].subtitle}</p>
         </div>
      </header>

        {/* Quiénes Somos, Misión y Visión - Cards */}
        <section className="py-20 md:py-24 bg-[#ff0000] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(255,255,255,0.25),transparent_30%)]" />
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid gap-6">
              {/* Quiénes Somos */}
              <div className="bg-white/95 border border-white/80 rounded-2xl p-8 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.45)] hover:-translate-y-1 transition-all duration-300">
                <div className="mb-4">
                   <h2 className="text-2xl md:text-3xl font-black" style={{fontFamily: "'Josefin Sans', sans-serif", color: '#f82626'}}>
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
                <div className="bg-white/95 border border-white/80 rounded-2xl p-8 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.45)] hover:-translate-y-1 transition-all duration-300">
                  <div className="mb-4">
                    <h2 className="text-left text-xl md:text-2xl font-bold flex items-center gap-2" style={{fontFamily: "'Josefin Sans', sans-serif", color: '#FB0548'}}>
                      <Target className="w-5 h-5" />
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
                <div className="bg-white/95 border border-white/80 rounded-2xl p-8 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.45)] hover:-translate-y-1 transition-all duration-300">
                  <div className="mb-4">
                    <h2 className="text-left text-xl md:text-2xl font-bold flex items-center gap-2" style={{fontFamily: "'Josefin Sans', sans-serif", color: '#FB0548'}}>
                      <Sparkles className="w-5 h-5" />
                      Visión
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-justify">
                    Ser una empresa referente en la comercialización de productos para el hogar,
                    la construcción y el comercio en general, reconocida por su variedad,
                    calidad y excelencia en el servicio, consolidándonos como una empresa confiable
                    y preferida por nuestros clientes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ola SVG inferior */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none" style={{ lineHeight: 0, zIndex: 1 }}>
            <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full block" style={{ display: 'block' }}>
              <path d="M0,100 C360,0 1080,100 1440,100 L1440,100 L0,100 Z" fill="#ffffff" />
            </svg>
          </div>
        </section>

        {/* Timeline - Historia */}
        <section className="w-full pb-20 pt-6 bg-white">
          <div className="w-full">
            <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-5 duration-700">
              <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Clock className="w-4 h-4" />
                Nuestra Historia
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-[#FB0548] mt-4" style={{fontFamily: "'Josefin Sans', sans-serif"}}>
                 25 Años de Trayectoria
              </h2>
              <p className="text-muted-foreground max-w-3xl mt-3 mx-auto text-base md:text-lg">
                Un recorrido de esfuerzo, dedicación y compromiso con nuestros clientes
              </p>
            </div>

            {/* Timeline Alternado con imagen/texto */}
            <div className="space-y-0">
              {milestones.map((milestone, index) => (
                <article
                  key={milestone.year}
                  ref={(node) => {
                    historyRefs.current[index] = node;
                  }}
                  data-history-idx={index}
                  className={`relative overflow-hidden border-b border-slate-200 transition-all duration-700 ${
                    visibleHistory.includes(index)
                      ? "opacity-100 translate-y-0 scale-100"
                      : `opacity-0 translate-y-10 scale-[0.985] ${index % 2 === 0 ? "md:-translate-x-10" : "md:translate-x-10"}`
                  }`}
                >
                  <div className="grid md:grid-cols-2 min-h-[64vh] md:min-h-[78vh]">
                    <div className={`${index % 2 === 0 ? "md:order-1" : "md:order-2"} relative bg-slate-900`}>
                      <img
                        src={milestone.image}
                        data-fallbacks={buildAssetCandidates(ASSETS_BASE_URL, "EMPRENDIMIENTOS_PRESENTACIONES", milestone.image.split("/").pop() || "").join("|")}
                        data-fallback-index="0"
                        onError={handleAssetFallback}
                        alt={milestone.title}
                        className="w-full h-full object-contain transition-transform duration-1000 ease-out hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                      <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-white/90 backdrop-blur-sm text-primary px-4 py-2 rounded-full text-base md:text-lg font-black tracking-wide">
                        {milestone.year}
                      </div>
                    </div>
                    <div className={`${index % 2 === 0 ? "md:order-2" : "md:order-1"} bg-[#0f172a] text-white p-6 md:p-10 flex flex-col justify-center`}>
                      <p className="text-xs md:text-sm uppercase tracking-[0.22em] text-white/60 mb-4">Nuestra Historia</p>
                      <h3 className="text-4xl md:text-6xl font-black leading-[0.92]">{milestone.title}</h3>
                      <p className="mt-5 text-base md:text-xl text-white/85 leading-relaxed max-w-2xl">{milestone.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Otros emprendimientos */}
        <section id="otros-emprendimientos" className="px-4 py-16 bg-white border-t border-slate-100">
          <div className="max-w-[96vw] mx-auto text-center animate-in fade-in slide-in-from-bottom-5 duration-700">
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" /> Ecosistema de marcas
            </span>
            <h2 className="text-3xl md:text-5xl font-black" style={{ fontFamily: "'Josefin Sans', sans-serif", color: "#ff0000" }}>
              Otros Emprendimientos
            </h2>
            <p className="mt-3 text-sm md:text-base font-semibold text-slate-700">
              Pulse en una de las imagenes para mas informacion.
            </p>
            <p className="text-slate-500 mt-3 max-w-2xl mx-auto">
              Proyectos que complementan nuestra historia empresarial con identidad propia.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-5 items-center">
              {[
                {
                  image: `${OTHER_BUSINESSES_BASE_URL}/MADEDERA.PNG`,
                  fallback: "https://res.cloudinary.com/dx08ybps6/image/upload/v1779574073/MADEDERA.png",
                  href: "/emprendimientos/madedera"
                },
                {
                  image: `${OTHER_BUSINESSES_BASE_URL}/JARDIN_DE_LA_PAZ.PNG`,
                  fallback: "https://res.cloudinary.com/dx08ybps6/image/upload/v1779574073/JARDIN_DE_LA_PAZ.png",
                  href: "/emprendimientos/jardin-de-la-paz"
                },
                {
                  image: `${OTHER_BUSINESSES_BASE_URL}/RINCON.PNG`,
                  fallback: "https://res.cloudinary.com/dx08ybps6/image/upload/v1779574073/RINCON.png",
                  href: "/emprendimientos/rincon-del-pacifico"
                },
              ].map((item, index) => {
                const card = (
                  <div className="group relative overflow-hidden rounded-[28px] cursor-pointer" style={{ animationDelay: `${index * 100}ms` }}>
                    <img
                      src={item.image}
                      data-fallback-src={item.fallback || undefined}
                      alt={`Emprendimiento ${index + 1}`}
                      className="w-full h-[240px] md:h-[360px] object-contain rounded-[28px] transition-transform duration-500 hover:scale-[1.02]"
                      loading="lazy"
                      onError={(event) => {
                        const image = event.currentTarget;
                        const fallback = image.dataset.fallbackSrc;
                        if (!fallback || image.dataset.fallbackApplied === "1") return;
                        image.dataset.fallbackApplied = "1";
                        image.src = fallback;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="px-4 py-2 rounded-full bg-white/90 text-slate-900 text-sm md:text-base font-bold">
                        Pulse para mas
                      </span>
                    </div>
                  </div>
                );

                if (item.href) {
                  return (
                    <a key={item.image} href={item.href} target="_blank" rel="noopener noreferrer" className="block">
                      {card}
                    </a>
                  );
                }

                return <div key={item.image}>{card}</div>;
              })}
            </div>
          </div>
        </section>

       {/* Footer CTA */}
       <section className="px-4 py-12 bg-slate-950 text-center">
         <div className="max-w-2xl mx-auto">
           <h3 className="text-2xl font-bold text-white mb-4" style={{fontFamily: "'Josefin Sans', sans-serif"}}>
             ¿Listo para comenzar tu proyecto?
           </h3>
           <p className="text-slate-400 mb-8">
             Encuentra todo lo que necesitas en Punto Pas.
           </p>
           <Link 
             to="/"
             className="inline-flex items-center gap-2 bg-[#FB0548] hover:bg-[#d9043f] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
           >
             Explorar catálogo
           </Link>
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
