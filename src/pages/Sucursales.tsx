import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { CartDrawer, CartItem } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { products } from "@/data/products";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, Phone, Navigation } from "lucide-react";

interface Store {
  id: number;
  name: string;
  address: string;
  iframeSrc: string;
  phone: string;
  hours: string;
  isOpen: boolean;
}

const stores: Store[] = [
  {
    id: 1,
    name: "SUCURSAL ESMERALDAS",
    address: "Esmeraldas, Ecuador",
    iframeSrc: "https://maps.app.goo.gl/5sSyaHzzvRcooRhg9",
    phone: "+593 97 654 3210",
    hours: "8:00 AM - 8:00 PM",
    isOpen: true,
  },
  {
    id: 2,
    name: "SUCURSAL SAN LORENZO",
    address: "San Lorenzo, Ecuador",
    iframeSrc: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2966.4628546293825!2d-78.81832138320499!3d1.2789763541405592!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e2c85208bb6d559%3A0x1efbad64a4d44346!2sSan%20Lorenzo!5e0!3m2!1ses!2sec!4v1777559477880!5m2!1ses!2sec",
    phone: "+593 98 765 4321",
    hours: "8:00 AM - 8:00 PM",
    isOpen: true,
  },
];

const Sucursales = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("puntopas_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

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
    if (query) {
      navigate(`/?search=${encodeURIComponent(query)}`);
    }
  };

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("puntopas_cart", JSON.stringify(newCart));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        cartCount={cartItemCount}
        onSearch={handleSearch}
        onCartClick={() => setIsCartOpen(true)}
      />

      <div className="pt-20">
        {/* Section Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Nuestras Sucursales
            </h1>
            <p className="text-gray-600 mt-2">
              Visítanos en cualquiera de nuestras ubicaciones
            </p>
          </div>
        </div>

        {/* Stores Grid */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {stores.map((store) => (
              <div
                key={store.id}
                onClick={() => setSelectedStore(store)}
                className={`bg-white rounded-2xl overflow-hidden shadow-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-xl ${
                  selectedStore?.id === store.id
                    ? 'border-red-500 ring-2 ring-red-200'
                    : 'border-gray-100 hover:border-red-200'
                }`}
              >
                {/* Map Preview */}
                <div className="relative">
                  <iframe
                    src={store.iframeSrc}
                    width="100%"
                    height="200"
                    className="w-full border-0"
                    loading="lazy"
                    title={store.name}
                  ></iframe>
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                    store.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {store.isOpen ? '● Abierto' : '○ Cerrado'}
                  </div>
                </div>

                {/* Store Info */}
                <div className="p-5">
                  <h2 className="text-xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {store.name}
                  </h2>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span>{store.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span>{store.hours}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span>{store.phone}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${store.address}`, '_blank');
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-medium transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    Cómo llegar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 text-center shadow border border-gray-100">
              <Clock className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <h3 className="text-gray-900 font-bold text-sm">Horario</h3>
              <p className="text-gray-600 text-xs mt-1">8:00 AM - 8:00 PM</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow border border-gray-100">
              <MapPin className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <h3 className="text-gray-900 font-bold text-sm">Parqueo</h3>
              <p className="text-gray-600 text-xs mt-1">Disponible</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow border border-gray-100">
              <Phone className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <h3 className="text-gray-900 font-bold text-sm">Atención</h3>
              <p className="text-gray-600 text-xs mt-1">Personalizada</p>
            </div>
          </div>

          {/* Advertising Space */}
          <div className="rounded-2xl overflow-hidden shadow-lg mb-8">
            <img
              src="https://res.cloudinary.com/dbbkpdhze/image/upload/v1771535149/muebles_lxrih1.jpg"
              alt="Promoción"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Contact Section */}
          <div id="contacto" className="bg-slate-900 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
              <Phone className="w-6 h-6 text-cyan-400" />
              Contáctanos
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {stores.map((store) => (
                <div key={store.id} className="bg-white/10 rounded-xl p-4">
                  <h3 className="font-bold text-cyan-400 mb-2">{store.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-cyan-400" />
                      <span>{store.phone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-slate-400 text-sm">
                Horario de atención: Lunes a Sábado de 8:00 AM - 8:00 PM
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />

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

export default Sucursales;
