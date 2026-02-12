import { Search, ShoppingCart, Mic, MicOff, Plus, MapPin, X, Headphones, Radio, Play, Pause, Shield } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useRadio } from "@/contexts/RadioContext";
import logoPuntoPas from "@/assets/logo-punto-pas.png";

interface HeaderProps {
  cartCount: number;
  onSearch: (query: string) => void;
  onCartClick: () => void;
  onGoToHome?: () => void;
}

export const Header = ({ cartCount, onSearch, onCartClick, onGoToHome }: HeaderProps) => {
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
      <header className="sticky top-0 z-40 bg-primary shadow-xl">
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
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="¿Qué estás buscando hoy?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-14 py-3 rounded-full bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring shadow-inner"
              />
              <button
                type="button"
                onClick={isListening ? stopVoiceSearch : startVoiceSearch}
                className={`absolute right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isListening 
                    ? "bg-primary text-primary-foreground animate-pulse" 
                    : "bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary"
                }`}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            </div>
          </form>

          {/* Navigation links */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link 
              to="/quienes-somos"
              onClick={scrollToTop}
              className="text-primary-foreground text-sm font-semibold hover:text-primary-foreground/80 transition-colors whitespace-nowrap"
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
                className="text-primary-foreground text-sm font-semibold hover:text-primary-foreground/80 transition-colors"
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
              className={`absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 transition-all duration-500 ease-out transform origin-top-right ${
                isMenuOpen 
                  ? "opacity-100 scale-100 translate-y-0" 
                  : "opacity-0 scale-95 -translate-y-4 pointer-events-none"
              }`}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-primary/90 p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Más Opciones</h2>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Menu Options */}
              <div className="p-4 space-y-3">
                {/* Radio Option - Abre solo el widget */}
                <button
                  onClick={openRadioWidget}
                  className="w-full flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-violet-50 to-fuchsia-50 hover:from-violet-100 hover:to-fuchsia-100 border-2 border-violet-100 hover:border-violet-300 transition-all duration-300 group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Headphones className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-violet-700 transition-colors">Radio Punto Pas</h3>
                    <p className="text-sm text-gray-500">Escucha nuestra programación musical</p>
                  </div>
                  <Radio className="w-6 h-6 text-violet-400 group-hover:text-violet-600 transition-colors" />
                </button>
                
                {/* Maps Option - Navega a la página completa */}
                 <button
                  onClick={openSucursales}
                  className="w-full flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-cyan-50 to-teal-50 hover:from-cyan-100 hover:to-teal-100 border-2 border-cyan-100 hover:border-cyan-300 transition-all duration-300 group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-cyan-700 transition-colors">Nuestras Sucursales</h3>
                    <p className="text-sm text-gray-500">Encuentra tu tienda más cercana</p>
                  </div>
                  <MapPin className="w-6 h-6 text-cyan-400 group-hover:text-cyan-600 transition-colors" />
                </button>
                
                {/* Privacy Policy Option - Navega a la página de privacidad */}
                <button
                  onClick={openPrivacyPolicy}
                  className="w-full flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 border-2 border-slate-200 hover:border-slate-400 transition-all duration-300 group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-slate-600 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-slate-700 transition-colors">Política de Privacidad</h3>
                    <p className="text-sm text-gray-500">Conoce cómo protegemos tus datos</p>
                  </div>
                  <Shield className="w-6 h-6 text-slate-400 group-hover:text-slate-600 transition-colors" />
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
            className={`bg-white rounded-3xl shadow-[0_0_40px_rgba(139,92,246,0.4)] border-4 border-violet-400 w-80 overflow-hidden transform transition-all duration-300 hover:scale-[1.02] ${isPlaying ? 'shadow-[0_0_60px_rgba(236,72,153,0.6)]' : ''}`}
          >
            {/* Header - More attractive with glow */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-4 flex items-center justify-between relative overflow-hidden">
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
              
              <div className="flex items-center gap-3 relative z-10">
                <div className={`w-10 h-10 bg-white/25 rounded-xl flex items-center justify-center backdrop-blur-sm ${isPlaying ? 'animate-pulse' : ''}`}>
                  <Radio className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base tracking-wide">Radio Punto Pas</h3>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400 animate-ping' : 'bg-yellow-400'}`}></span>
                    <span className="text-xs text-white/90 font-semibold">{isPlaying ? '🔴 EN VIVO' : '⏸️ En Pausa'}</span>
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

            {/* Enhanced Visualizer / Status */}
            <div className="px-4 py-3 bg-gradient-to-b from-gray-50 to-white">
              {error ? (
                <div className="flex items-center justify-center h-10 text-red-500 text-sm text-center px-2 bg-red-50 rounded-lg">
                  <span className="font-medium">⚠️ {error}</span>
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center h-10 text-violet-600 text-sm bg-violet-50 rounded-lg">
                  <div className="w-5 h-5 border-3 border-violet-300 border-t-violet-600 rounded-full animate-spin mr-2"></div>
                  <span className="font-semibold">Conectando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1 h-10">
                  {[...Array(16)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full ${isPlaying ? 'bg-gradient-to-t from-violet-500 to-fuchsia-400 animate-pulse' : 'bg-gray-300'}`}
                      style={{
                        height: isPlaying ? `${Math.random() * 80 + 20}%` : '20%',
                        animationDelay: `${i * 0.08}s`,
                        animationDuration: `${0.3 + Math.random() * 0.4}s`
                      }}
                    ></div>
                  ))}
                </div>
              )}
            </div>

            {/* Now Playing - More prominent */}
            <div className="px-4 py-3 bg-gradient-to-r from-violet-100 via-purple-50 to-fuchsia-100 border-y-2 border-violet-200">
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">🎵</span>
                <p className="text-sm text-violet-800 font-bold text-center truncate flex-1" title={currentSong}>
                  {currentSong}
                </p>
                {isPlaying && (
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-pink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
                  </span>
                )}
              </div>
            </div>

            {/* Controls - Enhanced */}
            <div className="p-4 bg-white">
              <div className="flex items-center justify-between gap-4">
                <button 
                  onClick={toggleRadio}
                  disabled={isLoading}
                  className={`flex-1 flex items-center justify-center gap-2 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 ${
                    isPlaying 
                      ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-red-500/30' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-500/30'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Cargando</span>
                    </>
                  ) : isPlaying ? (
                    <>
                      <Pause className="w-6 h-6" />
                      <span className="text-base">PAUSAR</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6 ml-1" />
                      <span className="text-base">REPRODUCIR</span>
                    </>
                  )}
                </button>

                {/* Volume Button - Enhanced */}
                <button
                  onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                  className="w-12 h-12 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-full flex items-center justify-center text-violet-600 hover:from-violet-200 hover:to-fuchsia-200 transition-all shadow-md hover:shadow-lg"
                >
                  <span className="text-xl">{volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}</span>
                </button>
              </div>

              {/* Volume Slider - Enhanced */}
              {showVolumeSlider && (
                <div className="mt-4 flex items-center gap-3 px-2 py-2 bg-gray-50 rounded-xl">
                  <span className="text-lg">🔈</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-gradient-to-r from-violet-200 to-fuchsia-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  />
                  <span className="text-lg">🔊</span>
                  <span className="text-sm font-bold text-violet-600 w-10 text-right">{Math.round(volume * 100)}%</span>
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
