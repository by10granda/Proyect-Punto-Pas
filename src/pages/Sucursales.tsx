import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Header } from "@/components/Header";
import { CartDrawer, CartItem } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { products } from "@/data/products";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, Phone, Navigation, Search, X, ChevronRight, CheckCircle, XCircle } from "lucide-react";

// Types
interface Store {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;
  isOpen: boolean;
  city: string;
}

// Store data with extracted coordinates
const stores: Store[] = [
  {
    id: 1,
    name: "CRECOS AMBATO",
    address: "Ambato, Ecuador",
    lat: 1.279163,
    lng: -78.815915,
    phone: "+593 99 123 4567",
    hours: "8:00 AM - 8:00 PM",
    isOpen: true,
    city: "Ambato"
  },
  {
    id: 2,
    name: "CRECOS QUITO",
    address: "Quito, Ecuador",
    lat: 0.931167,
    lng: -79.672967,
    phone: "+593 98 765 4321",
    hours: "8:00 AM - 8:00 PM",
    isOpen: true,
    city: "Quito"
  },
  {
    id: 3,
    name: "CRECOS GUAYAQUIL",
    address: "Guayaquil, Ecuador",
    lat: -2.168997,
    lng: -79.922344,
    phone: "+593 97 654 3210",
    hours: "8:00 AM - 8:00 PM",
    isOpen: true,
    city: "Guayaquil"
  }
];

// Google Maps API Key - REPLACE with your actual key
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY_HERE";

// Red pin SVG for custom marker
const redPinSvg = (storeNumber: number) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="50" viewBox="0 0 40 50">
    <path d="M20 0C8.954 0 0 8.954 0 20c0 14.909 16.18 27.56 18.076 29.09a1.5 1.5 0 0 0 2.348 0C23.82 47.56 40 34.909 40 20 40 8.954 31.046 0 20 0z" fill="#DC2626"/>
    <circle cx="20" cy="20" r="10" fill="white"/>
    <text x="20" y="25" text-anchor="middle" font-size="12" font-weight="bold" fill="#DC2626">${storeNumber}</text>
  </svg>
`;

const Sucursales = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("puntopas_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [hoveredStore, setHoveredStore] = useState<number | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

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
    if (query) {
      navigate(`/?search=${encodeURIComponent(query)}`);
    }
  };

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("puntopas_cart", JSON.stringify(newCart));
  };

  // Filter stores based on search
  const filteredStores = useMemo(() => {
    if (!searchQuery.trim()) return stores;
    const query = searchQuery.toLowerCase();
    return stores.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.address.toLowerCase().includes(query) ||
      s.city.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Initialize Google Map
  useEffect(() => {
    if (!window.google && !document.querySelector('script[src*="maps.googleapis.com"]')) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
      script.async = true;
      script.defer = true;
      window.initMap = () => {
        setMapLoaded(true);
      };
      document.head.appendChild(script);
    } else if (window.google) {
      setMapLoaded(true);
    }
  }, []);

  // Create map instance
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: -0.5, lng: -79.5 },
      zoom: 7,
      styles: [
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      zoomControlOptions: { position: window.google.maps.ControlPosition.RIGHT_BOTTOM }
    });

    mapInstanceRef.current = map;
    addMarkers(map, filteredStores);
  }, [mapLoaded]);

  // Update markers when filtered stores change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    addMarkers(mapInstanceRef.current, filteredStores);
  }, [filteredStores]);

  // Center map on selected store
  useEffect(() => {
    if (selectedStore && mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: selectedStore.lat, lng: selectedStore.lng });
      mapInstanceRef.current.setZoom(15);
    }
  }, [selectedStore]);

  const addMarkers = (map: any, storesToShow: Store[]) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    storesToShow.forEach((store, index) => {
      const svgMarker = redPinSvg(index + 1);
      const marker = new window.google.maps.Marker({
        position: { lat: store.lat, lng: store.lng },
        map,
        title: store.name,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgMarker)}`,
          scaledSize: new window.google.maps.Size(40, 50),
          anchor: new window.google.maps.Point(20, 50)
        }
      });

      marker.addListener('click', () => {
        setSelectedStore(store);
        setHoveredStore(store.id);
      });

      marker.addListener('mouseover', () => {
        setHoveredStore(store.id);
      });

      marker.addListener('mouseout', () => {
        setHoveredStore(null);
      });

      markersRef.current.push(marker);
    });
  };

  const handleFindNearest = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalización no soportada");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        let nearest = stores[0];
        let minDist = getDistance(userLat, userLng, stores[0].lat, stores[0].lng);

        stores.forEach(store => {
          const dist = getDistance(userLat, userLng, store.lat, store.lng);
          if (dist < minDist) {
            minDist = dist;
            nearest = store;
          }
        });

        setSelectedStore(nearest);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo({ lat: nearest.lat, lng: nearest.lng });
          mapInstanceRef.current.setZoom(15);
        }
        toast.success(`Tienda más cercana: ${nearest.name}`);
      },
      (error) => {
        toast.error("No se pudo obtener tu ubicación");
      }
    );
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        cartCount={cartItemCount}
        onSearch={handleSearch}
        onCartClick={() => setIsCartOpen(true)}
      />

      <div className="flex flex-col lg:flex-row" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Left Panel - Store List (30%) */}
        <div className="w-full lg:w-[30%] bg-white border-r border-gray-200 flex flex-col">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Ciudad, provincia o tienda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Store count */}
            <p className="text-sm text-gray-500 mt-2">
              {filteredStores.length} tiendas encontradas
            </p>
          </div>

          {/* Store List with Scroll */}
          <div className="flex-1 overflow-y-auto">
            {filteredStores.map((store) => (
              <div
                key={store.id}
                onClick={() => setSelectedStore(store)}
                onMouseEnter={() => setHoveredStore(store.id)}
                onMouseLeave={() => setHoveredStore(null)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-300 hover:bg-red-50 ${
                  selectedStore?.id === store.id || hoveredStore === store.id
                    ? 'bg-red-50 border-l-4 border-l-red-600'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3
                    className="font-bold text-gray-900"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {store.name}
                  </h3>
                  <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                    store.isOpen
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                  >
                    {store.isOpen ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    {store.isOpen ? 'Abierto' : 'Cerrado'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{store.address}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>{store.hours}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{store.phone}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`, '_blank');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    Cómo llegar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStore(store);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Clock className="w-4 h-4" />
                    Horarios
                  </button>
                </div>
              </div>
            ))}

            {filteredStores.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No se encontraron tiendas</p>
              </div>
            )}
          </div>

          {/* Find Nearest Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleFindNearest}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              <Navigation className="w-5 h-5" />
              Más cercanas
            </button>
          </div>
        </div>

        {/* Right Panel - Google Map (70%) */}
        <div className="w-full lg:w-[70%] relative">
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando mapa...</p>
                {GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY_HERE" && (
                  <p className="text-sm text-red-500 mt-2">
                    Reemplaza YOUR_GOOGLE_MAPS_API_KEY_HERE con tu API key
                  </p>
                )}
              </div>
            </div>
          )}
          <div
            ref={mapRef}
            className="w-full h-full"
            style={{ minHeight: '500px' }}
          />
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
