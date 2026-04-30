import { ShoppingCart, Mic, MicOff, Plus, MapPin, X, Headphones, Radio, Play, Pause, Shield, Volume2 as Volume2Icon, VolumeX } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useRadio } from "@/contexts/RadioContext";
import { SmartSearch } from "./SmartSearch";
import logoPuntoPas from "@/assets/logo-punto-pas.png";
import { Product } from "@/data/products";

interface HeaderProps {
  cartCount: number;
  onSearch: (query: string) => void;
  onCartClick: () => void;
  onGoToHome?: () => void;
  products?: Product[];
  popularSearches?: string[];
  onProductClick?: (product: Product) => void;
}

export const Header = ({ cartCount, onSearch, onCartClick, onGoToHome, products = [], popularSearches, onProductClick }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const { isPlaying, toggleRadio, currentSong, isLoading, error, volume, setVolume } = useRadio();
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Show mini player when radio is playing
  useEffect(() => {
    if (isPlaying) {
      setShowMiniPlayer(true);
    }
  }, [isPlaying]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Tu navegador no soporta búsqueda por voz");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'es-ES';
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      onSearch(transcript);
      setIsListening(false);
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const stopVoiceSearch = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }

  // Open Radio Widget - Solo reproduce y muestra el widget
  const openRadioWidget = () => {
    // Iniciar reproducción si no está reproduciendo
    if (!isPlaying) {
      toggleRadio();
    }
    // Mostrar el widget
    setShowMiniPlayer(true);
    // Cerrar el menú
    setIsMenuOpen(false);
    // Scroll al tope
    scrollToTop();
  };

  // Open Sucursales Page - Navega a la página completa
  const openSucursales = () => {
    navigate('/sucursales');
    setIsMenuOpen(false);
    scrollToTop();
  };

  // Open Privacy Policy Page - Navega a la página de privacidad
  const openPrivacyPolicy = () => {
    navigate('/privacidad');
    setIsMenuOpen(false);
    scrollToTop();
  };

  // Scroll to top helper function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to home and reset state
  const goToHome = () => {
    if (onGoToHome) {
      onGoToHome();
    } else {
      navigate('/', { replace: true });
      scrollToTop();
    }
    // Reset any menu states
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-primary">
        {/* Main header bar */}
        <div className="flex items-center justify-between px-4 py-3 gap-3 max-w-7xl mx-auto">
          {/* Logo - Navigate to home */}
          <div onClick={goToHome} className="flex items-center gap-3 flex-shrink-0 group cursor-pointer">
            <div className="w-12 h-12 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
              <img 
                src={logoPuntoPas} 
                alt="Punto Pas" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <span className="text-2xl font-black text-primary-foreground tracking-tight block leading-tight">
                PUNTO PAS
              </span>
              <span className="text-[10px] text-primary-foreground/80 font-medium tracking-widest">
                ENCUENTRA TODO EN UN SOLO LUGAR
              </span>
            </div>
          </div>

          {/* Search bar */}
          <SmartSearch
            products={products}
            onSearch={onSearch}
            popularSearches={popularSearches}
            onProductClick={onProductClick}
          />

          {/* Navigation links */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link 
              to="/quienes-somos"
              onClick={scrollToTop}
              className="text-primary-foreground text-sm font-semibold hover:text-primary-foreground/80 transition-colors whitespace-nowrap font-rubik"
            >
              Quiénes Somos
            </Link>
            {(location.pathname === '/' || location.pathname === '/sucursales') && (
              <button 
                onClick={() => {
                  scrollToTop();
                  // Buscar sección contacto en inicio o sucursales
                  setTimeout(() => {
                    const element = document.getElementById("contacto");
                    if (element) element.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="text-primary-foreground text-sm font-semibold hover:text-primary-foreground/80 transition-colors font-rubik"
              >
                Contacto
              </button>
            )}
          </nav>

          {/* Plus button and dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={toggleMenu}
              className={`relative text-primary-foreground p-2.5 flex-shrink-0 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                isMenuOpen 
                  ? "bg-white/30 rotate-45 shadow-lg" 
                  : "bg-white/10 hover:bg-white/20 hover:shadow-md"
              }`}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 transition-transform duration-300" />
              ) : (
                <Plus className="w-6 h-6 transition-transform duration-300" />
              )}
            </button>
            
            {/* Dropdown menu with two options */}
            <div 
              className={`absolute right-0 top-full mt-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 transition-all duration-500 ease-out transform origin-top-right ${
                isMenuOpen 
                  ? "opacity-100 scale-100 translate-y-0" 
                  : "opacity-0 scale-95 -translate-y-4 pointer-events-none"
              }`}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-primary/90 p-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">Más Opciones</h2>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Menu Options */}
              <div className="p-3 space-y-2">
                {/* Radio Option - Abre solo el widget */}
                <button
                  onClick={openRadioWidget}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-red-50 to-red-50 hover:from-red-100 hover:to-red-100 border border-red-100 hover:border-red-300 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Headphones className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-gray-900 text-sm group-hover:text-red-700 transition-colors">Radio Punto Pas</h3>
                    <p className="text-xs text-gray-500">Escucha nuestra radio</p>
                  </div>
                  <Radio className="w-4 h-4 text-red-400 group-hover:text-red-600 transition-colors" />
                </button>
                
                {/* Maps Option - Navega a la página completa */}
                 <button
                  onClick={openSucursales}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-cyan-50 to-teal-50 hover:from-cyan-100 hover:to-teal-100 border border-cyan-100 hover:border-cyan-300 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-gray-900 text-sm group-hover:text-cyan-700 transition-colors">Nuestras Sucursales</h3>
                    <p className="text-xs text-gray-500">Encuentra tu tienda</p>
                  </div>
                  <MapPin className="w-4 h-4 text-cyan-400 group-hover:text-cyan-600 transition-colors" />
                </button>
                
                {/* Privacy Policy Option - Navega a la página de privacidad */}
                <button
                  onClick={openPrivacyPolicy}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 border border-slate-200 hover:border-slate-400 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-gray-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-gray-900 text-sm group-hover:text-slate-700 transition-colors">Política de Privacidad</h3>
                    <p className="text-xs text-gray-500">Protección de datos</p>
                  </div>
                  <Shield className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </button>
              </div>
            </div>
          </div>

          {/* Cart */}
          <button 
            onClick={onCartClick} 
            className="relative text-primary-foreground p-2.5 flex-shrink-0 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-card text-primary text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-bounce">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile navigation */}
        <div className="lg:hidden flex justify-center gap-6 pb-3 border-t border-primary-foreground/10">
          <Link 
            to="/quienes-somos"
            onClick={scrollToTop}
            className="text-primary-foreground text-xs font-semibold hover:text-primary-foreground/80 transition-colors pt-2"
          >
            Quiénes Somos
          </Link>
          {(location.pathname === '/' || location.pathname === '/sucursales') && (
            <button 
              onClick={() => {
                scrollToTop();
                // Buscar sección contacto en inicio o sucursales
                setTimeout(() => {
                  const element = document.getElementById("contacto");
                  if (element) element.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
              className="text-primary-foreground text-xs font-semibold hover:text-primary-foreground/80 transition-colors pt-2"
            >
              Contacto
            </button>
          )}
        </div>
      </header>

      {/* Mini Radio Player - Floating when radio is playing - ABOVE WhatsApp */}
      {showMiniPlayer && (
        <div className="fixed bottom-40 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
          <div 
            className="bg-white rounded-xl border border-gray-200 w-80 overflow-hidden"
          >
            <div className="bg-red-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Radio className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base tracking-wide">Radio Punto Pas</h3>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                    <span className="text-xs text-white/90 font-semibold">{isPlaying ? 'EN VIVO' : 'En Pausa'}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (isPlaying) {
                    toggleRadio();
                  }
                  setShowMiniPlayer(false);
                }}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 py-3 bg-gray-50">
              {error ? (
                <div className="flex items-center justify-center h-10 text-red-500 text-sm text-center px-2">
                  <span className="font-medium">{error}</span>
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center h-10 text-red-600 text-sm">
                  <div className="w-5 h-5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin mr-2"></div>
                  <span>Conectando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1 h-10">
                  {[...Array(16)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full ${isPlaying ? 'bg-red-500' : 'bg-gray-300'}`}
                      style={{
                        height: isPlaying ? `${Math.random() * 80 + 20}%` : '20%',
                      }}
                    ></div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2">
                <p className="text-sm text-gray-700 font-medium text-center truncate flex-1">
                  {currentSong}
                </p>
              </div>
            </div>

            <div className="p-4 bg-white">
              <div className="flex items-center justify-center gap-4">
                <button 
                  onClick={toggleRadio}
                  disabled={isLoading}
                  className={`flex-1 flex items-center justify-center gap-2 text-white px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isPlaying 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Cargando</span>
                    </>
                  ) : isPlaying ? (
                    <>
                      <Pause className="w-5 h-5" />
                      <span>PAUSAR</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>REPRODUCIR</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                  className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-all"
                >
                  <span className="text-xl">{volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}</span>
                </button>
              </div>

              {/* Volume Slider */}
              {showVolumeSlider && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-3 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setVolume(0)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Silenciar"
                    >
                      <VolumeX className="w-4 h-4" />
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                    <button
                      onClick={() => setVolume(1)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Volumen máximo"
                    >
                      <Volume2Icon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-center mt-1">
                    <span className="text-xs font-medium" style={{ color: '#FA003F' }}>
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Add type declarations for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: () => void;
  onend: () => void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
