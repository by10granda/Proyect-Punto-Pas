import { Search, ShoppingCart, Mic, MicOff, Plus, Minus, MapPin, X, Headphones, Radio, Play, Pause, Shield, ChevronRight, SlidersHorizontal } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AdvancedProductFilters, applyAdvancedProductFilters, defaultAdvancedProductFilters, getAdvancedFilterOptions } from "@/application/use-cases/advancedProductFilters";
import { buildSearchSuggestions, SearchSuggestion } from "@/application/use-cases/searchSuggestions";
import { useRadio } from "@/contexts/RadioContext";
import { buildCategoryImageCandidates, handleCategoryImageFallback } from "@/utils/categoryImage";
const headerLogo = "/LOGO_DISTRIBUIDOR-PUNTOPAS.png";
import { Level2Category, Product } from "@/data/products";

interface HeaderProps {
  cartCount: number;
  searchQuery?: string;
  onSearch: (query: string) => void;
  onCartClick: () => void;
  onGoToHome?: () => void;
  onClearSearch?: () => void;
  products?: Product[];
  onProductClick?: (product: Product) => void;
  onTypeSelect?: (type: string) => void;
  filters?: AdvancedProductFilters;
  onFiltersChange?: (filters: AdvancedProductFilters) => void;
  productsCount?: number;
  popularSearches?: string[];
  nivel2Categories?: Level2Category[];
  nivel3ByParent?: Map<number, string[]>; // Nivel 3 types grouped by parent ID
}

export const Header = ({ cartCount, searchQuery: propSearchQuery, onSearch, onCartClick, onGoToHome, onClearSearch, products = [], onProductClick, onTypeSelect, filters = defaultAdvancedProductFilters, onFiltersChange, productsCount = 0, popularSearches = [], nivel2Categories = [], nivel3ByParent }: HeaderProps) => {
  const BRAND_LOGO_BASE_URL = (import.meta.env.VITE_BRANDS_BASE_URL as string | undefined) || "https://assets.distribuidor-puntopas.com/image/upload/v1778950354";
  const CATEGORY_IMAGES_BASE_URL = (import.meta.env.VITE_CATEGORY_IMAGES_BASE_URL as string | undefined) || "";
  const russoRadioImageCandidates = [
    "https://assets.distribuidor-puntopas.com/PERRO/RUSSO2.png",
    "https://assets.distribuidor-puntopas.com/image/upload/v1777752695/2.png",
  ];
  // Local state for input (allows typing), synced with parent
  const [searchQuery, setSearchQuery] = useState(propSearchQuery || "");
  const [isListening, setIsListening] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [isRadioMinimized, setIsRadioMinimized] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showCategoriesPanel, setShowCategoriesPanel] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const [mobileCategoriesView, setMobileCategoriesView] = useState<'categories' | 'types'>('categories');
  const { isPlaying, toggleRadio, currentSong, isLoading, error, volume, setVolume } = useRadio();
  const location = useLocation();
  const navigate = useNavigate();
  const hideCommerceControls = ["/quienes-somos", "/sucursales", "/privacidad", "/politicas", "/seguimiento"].includes(location.pathname);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchQueryRef = useRef(searchQuery);
  const showMiniPlayerRef = useRef(showMiniPlayer);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const categoriesPanelRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const miniPlayerRef = useRef<HTMLDivElement>(null);

  const [draftFilters, setDraftFilters] = useState<AdvancedProductFilters>(filters);

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  useEffect(() => {
    showMiniPlayerRef.current = showMiniPlayer;
  }, [showMiniPlayer]);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  const filterOptions = useMemo(() => getAdvancedFilterOptions(products), [products]);
  const brandSuggestions = useMemo(
    () => filterOptions.brands.filter((brand) => Boolean(brand && brand.trim())),
    [filterOptions.brands]
  );
  const previewCount = useMemo(() => applyAdvancedProductFilters(products.filter((p) => p.isActive), draftFilters).length, [draftFilters, products]);
  const priceBounds = useMemo(() => {
    const prices = products
      .map((p) => p.puntoPasPrice || p.pvpPrice || p.price || 0)
      .filter((price) => Number.isFinite(price) && price > 0);
    if (prices.length === 0) return { min: 0, max: 1000 };
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

  const selectedMinPrice = draftFilters.minPrice === '' ? priceBounds.min : Number(draftFilters.minPrice);
  const selectedMaxPrice = draftFilters.maxPrice === '' ? priceBounds.max : Number(draftFilters.maxPrice);
  const minPercent = priceBounds.max > priceBounds.min
    ? ((selectedMinPrice - priceBounds.min) / (priceBounds.max - priceBounds.min)) * 100
    : 0;
  const maxPercent = priceBounds.max > priceBounds.min
    ? ((selectedMaxPrice - priceBounds.min) / (priceBounds.max - priceBounds.min)) * 100
    : 100;

  useEffect(() => {
    const stored = localStorage.getItem("puntopas_recent_searches");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as string[];
      if (Array.isArray(parsed)) {
        setRecentSearches(parsed.slice(0, 5));
      }
    } catch {
      setRecentSearches([]);
    }
  }, []);

  const pushRecentSearch = (value: string) => {
    const normalized = value.trim();
    if (!normalized) return;
    setRecentSearches((prev) => {
      const next = [normalized, ...prev.filter((item) => item.toLowerCase() !== normalized.toLowerCase())].slice(0, 5);
      localStorage.setItem("puntopas_recent_searches", JSON.stringify(next));
      return next;
    });
  };

  // Get types for hovered category (Nivel 3) - RIGHT COLUMN
  // Uses nivel3ByParent prop (from API) to get Nivel 3 by parent ID
  const getTypes = (categoryName: string) => {
    if (!categoryName || !nivel2Categories || nivel2Categories.length === 0) {
      return [];
    }
    
    // Find the Nivel 2 category to get its ID
    const category = nivel2Categories.find((cat) => 
      cat.name?.toUpperCase().trim() === categoryName.toUpperCase().trim()
    );
    
    if (!category) {
      return [];
    }
    
    // Get Nivel 3 from nivel3ByParent Map using category ID
    const nivel3Types = nivel3ByParent?.get(category.id) || [];
    
    return nivel3Types.map((typeName: string) => {
      // Generate image URL from type name
      const imageCandidates = buildCategoryImageCandidates(typeName, CATEGORY_IMAGES_BASE_URL, "v1775783635");
      
      return {
        name: typeName,
        image: imageCandidates[0],
        imageCandidates,
      };
    });
  };

  const visibleNivel2Categories = useMemo(
    () => nivel2Categories.filter((cat) => (nivel3ByParent?.get(cat.id) || []).length > 0),
    [nivel2Categories, nivel3ByParent]
  );
    
  // Close categories panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoriesPanelRef.current && !categoriesPanelRef.current.contains(event.target as Node)) {
        setShowCategoriesPanel(false);
      }
    };

    if (showCategoriesPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCategoriesPanel]);

  const updateDraftFilter = (patch: Partial<AdvancedProductFilters>) => {
    const next = { ...draftFilters, ...patch };
    setDraftFilters(next);
    if (onFiltersChange) {
      onFiltersChange(next);
    }
  };

  const applyFilters = () => {
    if (onFiltersChange) {
      onFiltersChange(draftFilters);
    }
    setShowFiltersPanel(false);
  };

  const clearFilters = () => {
    setDraftFilters(defaultAdvancedProductFilters);
    if (onFiltersChange) {
      onFiltersChange(defaultAdvancedProductFilters);
    }
  };

  const handleMinPriceRange = (value: number) => {
    const safeMin = Math.min(value, selectedMaxPrice);
    updateDraftFilter({ minPrice: String(safeMin) });
  };

  const handleMaxPriceRange = (value: number) => {
    const safeMax = Math.max(value, selectedMinPrice);
    updateDraftFilter({ maxPrice: String(safeMax) });
  };

  // Sync with parent's searchQuery (for browser back button)
  useEffect(() => {
    if (propSearchQuery !== undefined && propSearchQuery !== searchQueryRef.current) {
      setSearchQuery(propSearchQuery || "");
      if (!propSearchQuery) {
        setShowSuggestions(false);
      }
    }
  }, [propSearchQuery]);

  // Debounce search query and trigger search
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery || "");
      // Trigger real-time search when typing
      if (isSearchFocused && (searchQuery || "").trim().length >= 2) {
        setShowSuggestions(true);
      } else if ((searchQuery || "").trim().length === 0 || !isSearchFocused) {
        setShowSuggestions(false);
      }
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, isSearchFocused]);

  const handleSearchBlur = () => {
    setTimeout(() => {
      const activeElement = document.activeElement;
      const stillInsideSearch = !!(searchRef.current && activeElement && searchRef.current.contains(activeElement));
      if (!stillInsideSearch) {
        setIsSearchFocused(false);
        setShowSuggestions(false);
      }
    }, 0);
  };

  // Generate all suggestions based on debounced query
  const suggestions = useMemo(
    () => buildSearchSuggestions(products, debouncedQuery, products.length),
    [debouncedQuery, products]
  );

  const groupedSuggestions = useMemo(() => {
    const queryLength = (searchQuery || "").trim().length;
    if (queryLength < 3) {
      return {
        taxonomy: [] as SearchSuggestion[],
        productItems: [] as SearchSuggestion[],
        combined: [] as SearchSuggestion[],
      };
    }

    const taxonomy = suggestions.filter(
      (item) => item.type === "category" || item.type === "brand"
    );

    const productItems = suggestions.filter(
      (item) => item.type === "product" || item.type === "code"
    );

    const seenProductIds = new Set<string>();
    const uniqueProductItems = productItems.filter((item) => {
      const key = item.product?.id ? `product:${item.product.id}` : item.id;
      if (seenProductIds.has(key)) return false;
      seenProductIds.add(key);
      return true;
    });

    return {
      taxonomy,
      productItems: uniqueProductItems,
      combined: [...taxonomy, ...uniqueProductItems],
    };
  }, [suggestions, searchQuery]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation with scroll
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestion(prev => {
          const newIndex = Math.min(prev + 1, groupedSuggestions.combined.length - 1);
          // Scroll to show the selected suggestion
          setTimeout(() => {
            if (suggestionsRef.current) {
              const selectedElement = suggestionsRef.current.querySelector(
                `[data-suggestion-index="${newIndex}"]`
              ) as HTMLElement | null;
              if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
              }
            }
          }, 0);
          return newIndex;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestion(prev => {
          const newIndex = Math.max(prev - 1, -1);
          if (newIndex >= 0) {
            // Scroll to show the selected suggestion
            setTimeout(() => {
              if (suggestionsRef.current) {
                const selectedElement = suggestionsRef.current.querySelector(
                  `[data-suggestion-index="${newIndex}"]`
                ) as HTMLElement | null;
                if (selectedElement) {
                  selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }
              }
            }, 0);
          }
          return newIndex;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestion >= 0 && groupedSuggestions.combined[selectedSuggestion]) {
          selectSuggestion(groupedSuggestions.combined[selectedSuggestion]);
        } else {
          handleSearchSubmit();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        inputRef.current?.blur();
        break;
    }
  };

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
    pushRecentSearch(suggestion.text);
    
    if (suggestion.product && onProductClick) {
      onProductClick(suggestion.product);
    } else {
      onSearch(suggestion.text);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      const submittedQuery = searchQuery.trim();
      onSearch(submittedQuery);
      setSearchQuery(submittedQuery);
      setDebouncedQuery(submittedQuery);
      pushRecentSearch(submittedQuery);
      setShowSuggestions(false);
      setSelectedSuggestion(-1);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Update local state immediately (allows typing)
    setSearchQuery(value);
    setSelectedSuggestion(-1);
    if (value.length >= 3) {
      setShowSuggestions(true);
    } else if (value.length === 0) {
      // Clear search
      if (onClearSearch) {
        onClearSearch();
      }
      setShowSuggestions(false);
    } else {
      setShowSuggestions(false);
    }
  };

  const clearSearchInput = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
    if (onClearSearch) {
      onClearSearch();
    }
  };

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
    handleSearchSubmit();
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
    setIsRadioMinimized(false);
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

  useEffect(() => {
    const handleMiniPlayerOutside = (event: MouseEvent) => {
      if (!showMiniPlayer || isRadioMinimized) return;
      if (miniPlayerRef.current && !miniPlayerRef.current.contains(event.target as Node)) {
        setIsRadioMinimized(true);
        setShowVolumeSlider(false);
      }
    };

    document.addEventListener('mousedown', handleMiniPlayerOutside);
    return () => {
      document.removeEventListener('mousedown', handleMiniPlayerOutside);
    };
  }, [showMiniPlayer, isRadioMinimized]);

  useEffect(() => {
    if (showMiniPlayerRef.current) {
      setIsRadioMinimized(true);
      setShowVolumeSlider(false);
    }
  }, [location.pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 shadow-xl rounded-b-[26px]" style={{ backgroundColor: "#ff0000" }}>
        {/* Main header bar */}
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between px-3 md:px-4 py-3 gap-2 md:gap-3 max-w-7xl mx-auto">
          {/* Logo - Navigate to home */}
          <div onClick={goToHome} className="flex items-center gap-2 md:gap-3 flex-shrink-0 group cursor-pointer">
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-[1.02] transition-transform overflow-hidden">
              <img 
                src={headerLogo} 
                alt="Punto Pas" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden sm:block leading-none">
              <span className="block text-white font-black tracking-tight text-lg md:text-2xl">PUNTO PAS</span>
              <span className="block text-white/95 font-semibold tracking-wide text-[9px] md:text-sm mt-1">ENCUENTRA TODO EN UN SOLO LUGAR</span>
              <span className="block text-white font-black italic tracking-[0.02em] text-sm md:text-[24px] mt-1">PETMEMEBASPS</span>
              <span className="block h-[3px] md:h-[5px] w-[150px] md:w-[250px] rounded-full bg-lime-400 mt-1" />
            </div>
          </div>

          {!hideCommerceControls && (
            <div className="relative">
              <button
                onClick={() => setShowFiltersPanel((prev) => !prev)}
                className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-2 md:py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all font-medium text-xs md:text-sm"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filtros</span>
              </button>
            </div>
          )}
          
          {/* Categories Button */}
          {!hideCommerceControls && (
          <div className="relative" ref={categoriesPanelRef}>
             <button
              onClick={() => {
                setShowCategoriesPanel(!showCategoriesPanel);
                setMobileCategoriesView('categories');
              }}
              className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-4 py-2 md:py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all font-medium text-xs md:text-sm"
             >
              <span className="hidden sm:inline">Categorías</span>
              <span className="sm:hidden">Cat.</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${showCategoriesPanel ? 'rotate-90' : ''}`} />
            </button>

             {/* Categories Panel - shows on click */}
             {showCategoriesPanel && (
               <div className="fixed md:absolute left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 top-[72px] md:top-full mt-0 md:mt-3 w-[94vw] md:w-[92vw] max-w-[680px] max-h-[calc(100vh-92px)] md:max-h-none bg-white rounded-2xl shadow-[0_22px_70px_-20px_rgba(0,0,0,0.35)] border border-slate-200 overflow-hidden z-50">
                 <div className="sm:hidden flex items-center gap-2 p-3 border-b border-slate-100 bg-slate-50/70">
                   <button
                     onClick={() => setMobileCategoriesView('categories')}
                     className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                       mobileCategoriesView === 'categories' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
                     }`}
                   >
                     Categorias
                   </button>
                   <button
                     onClick={() => setMobileCategoriesView('types')}
                     className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                       mobileCategoriesView === 'types' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200'
                     }`}
                   >
                     Tipos
                   </button>
                 </div>

                 <div className="flex flex-col sm:flex-row min-h-[70vh] sm:min-h-[340px]">
{/* Left column - Nivel 2 (Categorías) - max 7 visible + scroll */}
                    <div className={`${mobileCategoriesView === 'categories' ? 'block' : 'hidden'} sm:block sm:w-[42%] border-r border-slate-100 bg-slate-50/45`}>
                      <div className="p-4">
                         <h3 className="text-[11px] font-semibold tracking-[0.18em] text-slate-500 uppercase mb-3">Categorías</h3>
                         <div className="overflow-y-auto pr-1 max-h-[calc(70vh-96px)] sm:max-h-[300px]">
                          {visibleNivel2Categories.map((catObj, idx) => (
                            <button
                              key={`${catObj.id}-${idx}`}
                              onMouseEnter={() => setHoveredType(catObj.name)}
                              onClick={() => {
                                setHoveredType(catObj.name);
                                setMobileCategoriesView('types');
                              }}
                              className={`w-full text-left px-3 py-2.5 rounded-xl text-[13px] transition-all border mb-1 ${
                                hoveredType === catObj.name
                                  ? 'bg-white text-slate-900 font-semibold border-slate-300 shadow-sm'
                                  : 'bg-transparent text-slate-700 border-transparent hover:bg-white hover:border-slate-200'
                              }`}
                            >
                              {catObj.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

{/* Right column - Nivel 3 (Tipos con fotos for hovered category) - Grid layout */}
                    <div className={`${mobileCategoriesView === 'types' ? 'block' : 'hidden'} sm:block sm:w-[58%] bg-white`}>
                      <div className="p-4">
                        <div className="flex items-end justify-between mb-3">
                          <h3 className="text-sm font-semibold text-slate-800 truncate max-w-[72%]">
                            {hoveredType ? `Tipos de ${hoveredType}` : 'Tipos'}
                          </h3>
                          {hoveredType && (
                            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 rounded-full px-2.5 py-1">
                              {getTypes(hoveredType).length}
                            </span>
                          )}
                        </div>
                        {hoveredType ? (
                           <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1 max-h-[calc(70vh-96px)] sm:max-h-[300px]">
                            {getTypes(hoveredType).map((typeObj, idx) => (
                              <button
                                key={`${typeObj.name}-${idx}`}
                                onClick={() => {
                                  if (onTypeSelect) {
                                    onTypeSelect(typeObj.name);
                                    setShowCategoriesPanel(false);
                                    setTimeout(() => {
                                      const productsSection = document.getElementById('productos');
                                      if (productsSection) {
                                        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                      }
                                    }, 100);
                                  }
                                }}
                                className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors flex flex-col items-center gap-1.5"
                              >
                                {typeObj.image && (
                                  <img
                                    src={typeObj.image}
                                    alt={typeObj.name}
                                    className="w-12 h-12 object-contain rounded-md"
                                    data-fallbacks={typeObj.imageCandidates.join("|")}
                                    data-fallback-index="0"
                                    onError={handleCategoryImageFallback}
                                  />
                                )}
                                <span className="text-[11px] leading-tight text-center font-medium">{typeObj.name}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                           <div className="h-[calc(70vh-96px)] sm:h-[300px] flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400 text-sm">
                             Pasa el puntero sobre una categoría
                           </div>
                        )}
                     </div>
                   </div>
                 </div>
               </div>
             )}
          </div>
          )}
          
          {/* Search bar */}
          {!hideCommerceControls && (
           <form onSubmit={handleSearch} className="order-3 md:order-none basis-full md:basis-auto flex-1 md:max-w-md" ref={searchRef}>
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-muted-foreground z-10" />
              <input
                ref={inputRef}
                type="text"
                placeholder="¿Qué estás buscando hoy?"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  setIsSearchFocused(true);
                  setShowSuggestions(true);
                }}
                onBlur={handleSearchBlur}
                onKeyDown={handleKeyDown}
                className="w-full pl-11 pr-24 py-2.5 md:py-3 rounded-full bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring shadow-inner"
                autoComplete="off"
              />
              {searchQuery.trim().length > 0 && (
                <button
                  type="button"
                  onClick={clearSearchInput}
                  className="absolute right-12 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={isListening ? stopVoiceSearch : startVoiceSearch}
                className={`absolute right-3 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all ${
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
            
            {/* Autocomplete suggestions with scroll - same width as search bar */}
            {showSuggestions && isSearchFocused && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                {isSearching && (
                  <div className="px-3 py-2 text-xs text-slate-500 border-b border-slate-100 flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></span>
                    Buscando productos...
                  </div>
                )}

                {!isSearching && groupedSuggestions.combined.length > 0 && (
                  <div ref={suggestionsRef} className="max-h-[72vh] overflow-y-auto overscroll-contain">
                    {groupedSuggestions.taxonomy.length > 0 && (
                      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 bg-slate-50 border-b border-slate-100">
                        Categorias y marcas
                      </div>
                    )}
                    {groupedSuggestions.combined.map((suggestion, index) => {
                      const query = debouncedQuery.toLowerCase();
                      const text = suggestion.text;
                      const lowerText = text.toLowerCase();
                      const matchIndex = lowerText.indexOf(query);
                      const isProduct = suggestion.type === "product" || suggestion.type === "code";
                      const firstProductIndex = groupedSuggestions.taxonomy.length;
                      const showProductsHeader =
                        groupedSuggestions.productItems.length > 0 && index === firstProductIndex;

                      return (
                        <div key={suggestion.id}>
                          {showProductsHeader && (
                            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 bg-slate-50 border-y border-slate-100">
                              Productos
                            </div>
                          )}
                          <button
                            data-suggestion-index={index}
                            onClick={() => selectSuggestion(suggestion)}
                            onMouseEnter={() => setSelectedSuggestion(index)}
                            className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors border-b border-slate-100 last:border-b-0 ${
                              index === selectedSuggestion ? 'bg-slate-100' : 'hover:bg-slate-50'
                            }`}
                          >
                            <img
                              src={suggestion.product?.image || "https://placehold.co/64x64?text=IMG"}
                              alt={suggestion.text}
                              className="w-10 h-10 object-contain flex-shrink-0 rounded-md bg-slate-50"
                            />

                            <div className="flex-1 min-w-0">
                              <span className="text-sm block truncate text-slate-800">
                                {matchIndex >= 0 ? (
                                  <>
                                    {text.slice(0, matchIndex)}
                                    <span className="font-semibold text-primary">
                                      {text.slice(matchIndex, matchIndex + query.length)}
                                    </span>
                                    {text.slice(matchIndex + query.length)}
                                  </>
                                ) : (
                                  text
                                )}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                {suggestion.product?.category && (
                                  <span className="text-[11px] text-slate-500 truncate max-w-[160px]">
                                    {suggestion.product.category}
                                  </span>
                                )}
                                <span className="text-[10px] uppercase tracking-wide text-slate-400">{suggestion.type}</span>
                              </div>
                            </div>

                            {isProduct && suggestion.price !== undefined && (
                              <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                                ${suggestion.price.toFixed(2)}
                              </span>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {!isSearching && groupedSuggestions.combined.length === 0 && searchQuery.length >= 3 && (
                  <div className="p-3 text-sm text-slate-500">No encontramos resultados para "{searchQuery}".</div>
                )}

                {showSuggestions && searchQuery.length < 3 && (brandSuggestions.length > 0 || recentSearches.length > 0 || popularSearches.length > 0) && (
                  <div ref={suggestionsRef} className="p-3 border-t border-slate-100 max-h-[72vh] overflow-y-auto overscroll-contain">
                    {brandSuggestions.length > 0 && (
                      <>
                        <p className="text-xs text-slate-500 mb-2">Marcas</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {brandSuggestions.map((brand) => (
                            <button
                              key={`brand-suggestion-${brand}`}
                              onClick={() => {
                                setSearchQuery(brand);
                                onSearch(brand);
                                pushRecentSearch(brand);
                                setShowSuggestions(false);
                              }}
                              className="text-xs bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1.5"
                            >
                              <img
                                src={`${BRAND_LOGO_BASE_URL}/${brand.toUpperCase().replace(/\s+/g, "_")}_1.png`}
                                alt={brand}
                                className="w-4 h-4 object-contain rounded-full bg-white"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                              <span>{brand}</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {recentSearches.length > 0 && (
                      <>
                        <p className="text-xs text-slate-500 mb-2">Recientes</p>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {recentSearches.map((term, idx) => (
                            <button
                              key={`recent-${idx}`}
                              onClick={() => {
                                setSearchQuery(term);
                                onSearch(term);
                                pushRecentSearch(term);
                                setShowSuggestions(false);
                              }}
                              className="text-xs bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full transition-colors"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {popularSearches.length > 0 && (
                      <>
                        <p className="text-xs text-slate-500 mb-2">Búsquedas populares</p>
                        <div className="flex flex-wrap gap-1.5">
                          {popularSearches.slice(0, 5).map((term, idx) => (
                            <button
                              key={`popular-${idx}`}
                              onClick={() => {
                                setSearchQuery(term);
                                onSearch(term);
                                pushRecentSearch(term);
                                setShowSuggestions(false);
                              }}
                              className="text-xs bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-full transition-colors"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            </div>
          </form>
          )}

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
              className={`relative text-primary-foreground p-2 md:p-2.5 flex-shrink-0 rounded-xl transition-all duration-300 transform hover:scale-110 ${
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
            className="relative text-primary-foreground p-2 md:p-2.5 flex-shrink-0 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
          >
            <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
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

      {showFiltersPanel && (
        <>
          <div
            className="fixed inset-0 bg-black/45 z-[70]"
            onClick={() => setShowFiltersPanel(false)}
          />
          <aside className="fixed top-0 left-0 h-full w-[92vw] max-w-[420px] bg-white z-[71] shadow-[16px_0_40px_-20px_rgba(0,0,0,0.45)] flex flex-col animate-in slide-in-from-left duration-300">
            <div className="px-4 py-4 border-b border-red-700/30 flex items-center justify-between bg-primary">
              <div>
                <h3 className="text-xl font-semibold text-white" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>Todos los filtros</h3>
                <p className="text-xs text-white/85">{previewCount} productos disponibles</p>
              </div>
              <button
                onClick={() => setShowFiltersPanel(false)}
                className="w-9 h-9 rounded-full border border-white/50 text-white hover:bg-white/15 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2">
              <div className="py-3 border-b border-slate-100">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2 block">Marca</label>
                <select value={draftFilters.brand} onChange={(e) => updateDraftFilter({ brand: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                  <option value="all">Todas</option>
                  {filterOptions.brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
                </select>
              </div>

              <div className="py-3 border-b border-slate-100">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2 block">Categoría</label>
                <select value={draftFilters.category} onChange={(e) => updateDraftFilter({ category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                  <option value="all">Todas</option>
                  {filterOptions.categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </div>

              <div className="py-3 border-b border-slate-100">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2 block">Disponibilidad</label>
                <select value={draftFilters.availability} onChange={(e) => updateDraftFilter({ availability: e.target.value as AdvancedProductFilters['availability'] })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm">
                  <option value="all">Todas</option>
                  <option value="in-stock">Con stock</option>
                  <option value="out-of-stock">Sin stock</option>
                </select>
              </div>

              <div className="py-3 border-b border-slate-100">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2 block">Modelo</label>
                <input value={draftFilters.model} onChange={(e) => updateDraftFilter({ model: e.target.value })} placeholder="Código o modelo" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
              </div>

              <div className="py-3">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2 block">Precio</label>
                <div className="mb-3 px-1">
                  <div className="relative h-7 flex items-center">
                    <div className="absolute w-full h-1.5 rounded-full bg-slate-200"></div>
                    <div
                      className="absolute h-1.5 rounded-full bg-red-600"
                      style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
                    ></div>
                    <input
                      type="range"
                      min={priceBounds.min}
                      max={priceBounds.max}
                      value={selectedMinPrice}
                      onChange={(e) => handleMinPriceRange(Number(e.target.value))}
                      className="absolute w-full bg-transparent appearance-none z-30 pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-red-600 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow [&::-moz-range-thumb]:pointer-events-auto"
                    />
                    <input
                      type="range"
                      min={priceBounds.min}
                      max={priceBounds.max}
                      value={selectedMaxPrice}
                      onChange={(e) => handleMaxPriceRange(Number(e.target.value))}
                      className="absolute w-full bg-transparent appearance-none z-30 pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-red-600 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow [&::-moz-range-thumb]:pointer-events-auto"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                    <span>${selectedMinPrice}</span>
                    <span>${selectedMaxPrice}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" min={priceBounds.min} value={draftFilters.minPrice} onChange={(e) => handleMinPriceRange(Number(e.target.value || priceBounds.min))} placeholder="Min" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                  <input type="number" min={priceBounds.min} value={draftFilters.maxPrice} onChange={(e) => handleMaxPriceRange(Number(e.target.value || priceBounds.max))} placeholder="Max" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm" />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-white">
              <div className="text-xs text-slate-500 mb-3">Mostrando {productsCount} productos</div>
              <div className="flex items-center gap-2">
                <button onClick={clearFilters} className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50">Limpiar</button>
                <button onClick={applyFilters} className="flex-1 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800">Aplicar filtros</button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Mini Radio Player - Floating when radio is playing - ABOVE WhatsApp */}
      {showMiniPlayer && isRadioMinimized && (
        <button
          onClick={() => setIsRadioMinimized(false)}
          className="fixed bottom-40 right-4 z-50 w-16 h-16 rounded-full overflow-hidden shadow-[0_14px_28px_-12px_rgba(0,0,0,0.55)]"
          aria-label="Abrir radio"
        >
          <img
            src={russoRadioImageCandidates[0]}
            alt="Radio Punto Pas"
            className="w-full h-full object-contain"
            onError={(event) => {
              const image = event.currentTarget;
              const currentIndex = Number(image.dataset.fallbackIndex || "0");
              const nextIndex = currentIndex + 1;

              if (nextIndex >= russoRadioImageCandidates.length) {
                return;
              }

              image.dataset.fallbackIndex = String(nextIndex);
              image.src = russoRadioImageCandidates[nextIndex];
            }}
          />
          <span className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full border border-white ${isPlaying ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
        </button>
      )}

      {showMiniPlayer && !isRadioMinimized && (
        <div className="fixed bottom-40 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500">
          <div 
            ref={miniPlayerRef}
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
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsRadioMinimized(true)}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all"
                  aria-label="Minimizar radio"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => {
                    if (isPlaying) {
                      toggleRadio();
                    }
                    setShowMiniPlayer(false);
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all relative z-10"
                  aria-label="Cerrar radio"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
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
                <div className="mt-3 flex items-center gap-3 px-2 py-2 bg-gray-50 rounded-lg">                  
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <span className="text-sm font-medium text-gray-600 w-10 text-right">{Math.round(volume * 100)}%</span>
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
