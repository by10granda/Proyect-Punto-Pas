import { useState, useMemo, useRef } from "react";
import { Header } from "@/components/Header";
import { CartDrawer, CartItem } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import {
  products,
} from "@/data/products";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, Phone, Navigation } from "lucide-react";

const Sucursales = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("puntopas_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
    setSearchQuery(query);
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

      {/* Sucursales Content - Compacto */}
      <div className="pt-1">
        {/* Section Header - Reducido */}
        <div className="bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 dark:from-cyan-950 dark:via-blue-950 dark:to-teal-950 py-4 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">
                Nuestras Sucursales
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-base">
                Visítanos en cualquiera de nuestras ubicaciones
              </p>
            </div>

            {/* Maps Grid - Compacto */}
            <div className="grid lg:grid-cols-2 gap-4 mb-4">
              {/* Sucursal 1 */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg border-2 border-cyan-100 dark:border-cyan-800">
                <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-white text-lg">Sucursal Principal</h2>
                      <p className="text-white/80 text-sm">Disensa - Punto Pas</p>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5321.005202825693!2d-78.81475189967422!3d1.2786868727469063!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e2c85208bb6d559%3A0x1efbad64a4d44346!2sDisensa!5e0!3m2!1ses!2sec!4v1770566419524!5m2!1ses!2sec"
                    width="100%"
                    height="140"
                    className="w-full border-0"
                    loading="lazy"
                    title="Sucursal Principal"
                  ></iframe>
                </div>
                
                <div className="p-3 bg-cyan-50 dark:bg-cyan-900/30">
                  <div className="flex flex-wrap gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span className="text-gray-700 dark:text-gray-200">8:00 AM - 8:00 PM</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span className="text-gray-700 dark:text-gray-200">+593 XXX XXX XXXX</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sucursal 2 */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg border-2 border-teal-100 dark:border-teal-800">
                <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-white text-lg">Sucursal Centro</h2>
                      <p className="text-white/80 text-sm">Ubicación Central</p>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3989.2917084934197!2d-79.67238277042144!3d0.9309174275936912!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1ses!2sec!4v1770567372652!5m2!1ses!2sec"
                    width="100%"
                    height="140"
                    className="w-full border-0"
                    loading="lazy"
                    title="Sucursal Centro"
                  ></iframe>
                </div>
                
                <div className="p-3 bg-teal-50 dark:bg-teal-900/30">
                  <div className="flex flex-wrap gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span className="text-gray-700 dark:text-gray-200">8:00 AM - 8:00 PM</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span className="text-gray-700 dark:text-gray-200">+593 XXX XXX XXXX</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Cards - Compactos */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-3 text-center shadow border border-cyan-100 dark:border-cyan-800">
                <Clock className="w-6 h-6 text-cyan-500 mx-auto mb-1" />
                <h3 className="text-gray-900 dark:text-white font-bold text-sm">Horario</h3>
                <p className="text-gray-600 dark:text-gray-300 text-xs">8:00 AM - 8:00 PM</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-3 text-center shadow border border-teal-100 dark:border-teal-800">
                <MapPin className="w-6 h-6 text-teal-500 mx-auto mb-1" />
                <h3 className="text-gray-900 dark:text-white font-bold text-sm">Parqueo</h3>
                <p className="text-gray-600 dark:text-gray-300 text-xs">Disponible</p>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-3 text-center shadow border border-blue-100 dark:border-blue-800">
                <Phone className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                <h3 className="text-gray-900 dark:text-white font-bold text-sm">Atención</h3>
                <p className="text-gray-600 dark:text-gray-300 text-xs">Personalizada</p>
              </div>
            </div>

            {/* Advertising Space */}
            <div className="rounded-xl overflow-hidden mb-4 shadow-lg">
              <img 
                src="https://res.cloudinary.com/dbbkpdhze/image/upload/v1771535149/muebles_lxrih1.jpg" 
                alt="Promoción" 
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Sección de Contacto */}
            <div id="contacto" className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
              <h2 className="text-2xl font-black text-center mb-6 flex items-center justify-center gap-2">
                <Phone className="w-6 h-6 text-cyan-400" />
                Contáctanos
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-4">
                  <h3 className="font-bold text-cyan-400 mb-2">Sucursal Principal</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-cyan-400" />
                      <span>+593 98 765 4321</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-cyan-400" />
                      <span>+593 99 123 4567</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <h3 className="font-bold text-teal-400 mb-2">Sucursal Centro</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-teal-400" />
                      <span>+593 97 654 3210</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-teal-400" />
                      <span>+593 96 543 2109</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-slate-400 text-sm">
                  Horario de atención: Lunes a Sábado de 8:00 AM - 8:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

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

export default Sucursales;
