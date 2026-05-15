import { useState, useMemo, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { TopBar } from "@/components/TopBar";
import { CategoryBar } from "@/components/CategoryBar";
import { HeroCarousel } from "@/components/HeroCarousel";
import { BrandsBanner } from "@/components/BrandsBanner";
import { ImageCollage } from "@/components/ImageCollage";
import { WeeklyDeals } from "@/components/WeeklyDeals";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductModal } from "@/components/ProductModal";
import { CartDrawer, CartItem } from "@/components/CartDrawer";
import { ProductCarouselSection } from "@/components/ProductCarouselSection";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { AdvancedProductFilters, applyAdvancedProductFilters, defaultAdvancedProductFilters } from "@/application/use-cases/advancedProductFilters";
import { filterProductsUseCase } from "@/application/use-cases/filterProducts";
import { loadProductsUseCase } from "@/application/use-cases/loadProducts";
import {
  getDiscountedProducts,
  Level2Category,
  getCategories,
  getLevel2Categories,
  getLevel3ByParent,
  loadClassificationsFromAPI,
  Product,
  loadProductsFromAPI,
  refreshInventario,
  setInventoryUpdateCallback,
} from "@/data/products";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";

const Index = () => {
  const PRODUCTS_ALERT_COOLDOWN_MS = 15 * 60 * 1000;
  const PRODUCTS_ALERT_LAST_SENT_KEY = "products_alert_last_sent_at";

  const sendProductsUnavailableAlert = async (detail: string) => {
    try {
      const now = Date.now();
      const lastSentRaw = localStorage.getItem(PRODUCTS_ALERT_LAST_SENT_KEY);
      const lastSent = lastSentRaw ? Number(lastSentRaw) : 0;

      if (Number.isFinite(lastSent) && now - lastSent < PRODUCTS_ALERT_COOLDOWN_MS) {
        return;
      }

      const payload = {
        event: "productos_no_disponibles",
        site: "distribuidor-puntopas",
        apiStatus: "error",
        detail,
        apiUrl: "https://api.distribuidor-puntopas.com/api",
        timestamp: new Date().toISOString(),
      };

      const response = await fetch("/api/alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        localStorage.setItem(PRODUCTS_ALERT_LAST_SENT_KEY, String(now));
      }
    } catch (error) {
      console.error("No se pudo enviar la alerta de productos:", error);
    }
  };

  type MainFilterMode = "none" | "search" | "type" | "category" | "brand" | "carousel";
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedProductFilters>(defaultAdvancedProductFilters);
  const [mainFilter, setMainFilter] = useState<{ mode: MainFilterMode; value: string }>({ mode: "none", value: "all" });
  const [offersCategory, setOffersCategory] = useState("all");
  // Estados independientes para cada sección
  const [carouselCategory, setCarouselCategory] = useState("all");
  // Estado independiente para WeeklyDeals
  const [weeklyDealsCategory, setWeeklyDealsCategory] = useState("all");
  const [envBannerParallax, setEnvBannerParallax] = useState(0);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("puntopas_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [productCategories, setProductCategories] = useState(getCategories());
  const [nivel2Categories, setNivel2Categories] = useState<Level2Category[]>([]);
  const [nivel3ByParent, setNivel3ByParent] = useState<Map<number, string[]>>(new Map());
  
  // Get Nivel 2 categories after API loads
  const refreshCategories = async () => {
    await loadClassificationsFromAPI();
    
    const cats = getLevel2Categories();
    console.log('Index - getLevel2Categories():', cats);
    console.log('Index - nivel2Categories length:', cats?.length);
    if (cats && cats.length > 0) {
      setNivel2Categories(cats);
    }
    const level3 = getLevel3ByParent();
    console.log('Index - getLevel3ByParent():', level3);
    console.log('Index - nivel3ByParent size:', level3?.size);
    if (level3 && level3.size > 0) {
      setNivel3ByParent(level3);
    }
  };
  
  // Get Nivel 2 categories when products load
  useEffect(() => {
    if (apiStatus === 'success') {
      refreshCategories();
    }
  }, [apiStatus]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const categoriesRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const envBannerRef = useRef<HTMLDivElement>(null);

  const normalizeForMatch = (value: string) =>
    (value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .trim();

  const isTechAccessoriesFamilyProduct = (product: Product) => {
    const normalizedType = normalizeForMatch(product.type || "");
    const normalizedCategory = normalizeForMatch(product.category || "");
    const normalizedName = normalizeForMatch(product.name || "");

    const directTaxonomyMatch =
      normalizedType.includes("ACCESORIOS TECNOLOGICOS") ||
      normalizedCategory.includes("ACCESORIOS TECNOLOGICOS") ||
      normalizedType.includes("LAPTOP") ||
      normalizedCategory.includes("LAPTOP");

    if (directTaxonomyMatch) return true;

    const techKeywords = [
      "LAPTOP",
      "NOTEBOOK",
      "ULTRABOOK",
      "AURICULAR",
      "TECLADO",
      "MOUSE",
      "WEBCAM",
      "PARLANTE",
      "CARGADOR",
      "POWER BANK",
      "MEMORIA USB",
      "SSD",
      "DISCO DURO",
      "ROUTER",
      "SWITCH",
      "ADAPTADOR",
    ];

    return techKeywords.some((keyword) => normalizedName.includes(keyword));
  };

  const applyEnvBrandFilter = () => {
    const normalizedBrand = "ENV";
    setMainFilter({ mode: "brand", value: normalizedBrand });
    setSelectedType("all");
    setCarouselCategory("all");
    setSelectedBrand(normalizedBrand);
    setSelectedCategory("all");
    setSearchQuery("");
    setActiveTab("home");
    setTimeout(() => {
      const productsSection = document.getElementById('productos');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("puntopas_cart", JSON.stringify(newCart));
  };

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "offers") {
      setActiveTab("offers");
    }
  }, [searchParams, searchQuery]);

  useEffect(() => {
    const query = searchParams.get("q");
    if (!query) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [searchParams]);

  // Handle browser back button - sync with URL
  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      // Restore search query from URL
      const decodedQuery = decodeURIComponent(query);
      const normalizedQuery = decodedQuery.trim();
      if (decodedQuery !== searchQuery) {
        setSearchQuery(decodedQuery);
      }
      if (normalizedQuery.length >= 2) {
        setMainFilter({ mode: "search", value: normalizedQuery });
      } else {
        setMainFilter({ mode: "none", value: "all" });
      }
      setActiveTab("home");
      setSelectedCategory("all");
      setSelectedType("all");
      setSelectedBrand("all");
      setOffersCategory("all");
      if (normalizedQuery.length >= 2) {
        setTimeout(() => {
          const productsSection = document.getElementById("productos");
          if (productsSection) {
            productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 120);
      }
    } else {
      // No search query in URL = user pressed back button
      if (searchQuery) {
        setSearchQuery("");
        setMainFilter({ mode: "none", value: "all" });
        setSelectedCategory("all");
        setSelectedType("all");
        setSelectedBrand("all");
        setOffersCategory("all");
        setActiveTab("home");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [searchParams, searchQuery]);

  useEffect(() => {
    setVisibleCount(12);
  }, [selectedCategory, selectedType, activeTab, searchQuery, offersCategory]);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setMainFilter({ mode: "type", value: type });
    setSelectedCategory("all");
    setSelectedBrand("all");
    setCarouselCategory("all");
    setSearchQuery("");
    if (activeTab !== "home") {
      setActiveTab("home");
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadAPIProducts = async ({ silent = false }: { silent?: boolean } = {}) => {
    try {
      if (!silent) {
        setIsLoadingProducts(true);
      }
      setApiStatus('loading');
      setApiError(null);
      const loadResult = await loadProductsUseCase(() => loadProductsFromAPI({ maxAgeMs: 60000 }));
      if (loadResult.hasData) {
        setAllProducts(loadResult.products);
        setProductCategories(getCategories());
        setApiStatus('success');
      } else {
        setApiStatus('error');
        setApiError('No se recibieron productos de la API');
        if (!silent) {
          toast.error("La API no devolvió productos. Verifica la consola.");
        }
        void sendProductsUnavailableAlert("La API no devolvió productos");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      console.error('Error cargando productos de API:', message);
      setApiStatus('error');
      setApiError(message);
      if (!silent) {
        toast.error(`Error de conexión: ${message}`);
      }
      void sendProductsUnavailableAlert(`Error de conexión: ${message}`);
    } finally {
      if (!silent) {
        setIsLoadingProducts(false);
      }
    }
  };

  useEffect(() => {
    loadAPIProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        void loadAPIProducts({ silent: true });
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setInventoryUpdateCallback((updatedProducts) => {
      setAllProducts(updatedProducts);
    });

    const inventoryInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        void refreshInventario();
      }
    }, 15000);

    return () => {
      clearInterval(inventoryInterval);
      setInventoryUpdateCallback(() => {});
    };
  }, []);

  useEffect(() => {
    const handleViewport = () => {
      setIsMobileViewport(window.innerWidth < 768);
    };

    handleViewport();
    window.addEventListener('resize', handleViewport);

    return () => {
      window.removeEventListener('resize', handleViewport);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const baseAmplitude = isMobileViewport ? 10 : 24;
      const shift = Math.sin(window.scrollY / (isMobileViewport ? 120 : 180)) * baseAmplitude;
      setEnvBannerParallax(shift);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isMobileViewport]);

  const filteredProducts = useMemo(() => {
    const sourceProducts = allProducts;

    const selectedCategoryFilter = mainFilter.mode === "category" ? mainFilter.value : "all";
    const selectedTypeFilter = mainFilter.mode === "type" ? mainFilter.value : "all";
    const selectedBrandFilter = mainFilter.mode === "brand" ? mainFilter.value : "all";
    const searchFilter = mainFilter.mode === "search" ? mainFilter.value : "";
    const carouselFilter = mainFilter.mode === "carousel" ? mainFilter.value : "all";

    const baseFiltered = filterProductsUseCase({
      sourceProducts,
      selectedCategory: selectedCategoryFilter,
      selectedType: selectedTypeFilter,
      selectedBrand: selectedBrandFilter,
      searchQuery: searchFilter,
      carouselCategory: carouselFilter,
    });

    return applyAdvancedProductFilters(baseFiltered, advancedFilters);
  }, [mainFilter, allProducts, apiStatus, advancedFilters]);
  
  // Productos filtrados para WeeklyDeals (independiente)
  const weeklyDealsProducts = useMemo(() => {
    let dealsProducts = allProducts.filter(p => p.discount && p.discount > 0 && p.isActive);
    
    if (weeklyDealsCategory !== "all") {
      const categoryUpper = weeklyDealsCategory.toUpperCase().trim();
      dealsProducts = dealsProducts.filter(p => 
        p.category?.toUpperCase().trim() === categoryUpper || 
        p.type?.toUpperCase().trim() === categoryUpper
      );
    }
    
    return dealsProducts;
  }, [weeklyDealsCategory, allProducts]);

  const displayedProducts = useMemo(() => {
    return filteredProducts;
  }, [filteredProducts]);

  const showEnvLaptopBannerInSearch = useMemo(() => {
    if (mainFilter.mode !== "search" || !searchQuery.trim()) {
      return false;
    }

    return displayedProducts.some((product) => isTechAccessoriesFamilyProduct(product));
  }, [mainFilter.mode, searchQuery, displayedProducts]);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    try {
      const newCart = [...cart];
      const existingItem = newCart.find((item) => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity = Math.min(existingItem.quantity + quantity, product.stock);
      } else {
        newCart.push({
          id: product.id,
          code: product.code,
          name: product.name,
          price: product.price,
          pvpPrice: product.pvpPrice,
          originalPrice: product.originalPrice,
          discount: product.discount,
          image: product.image,
          stock: product.stock,
          quantity: Math.min(quantity, product.stock),
        });
      }
      
      updateCart(newCart);
      setIsCartOpen(true);
      toast.success(`${product.name} agregado al carrito`, {
        description: `Cantidad: ${quantity}`,
        duration: 2000,
      });
    } catch {
      toast.error('Error al agregar producto al carrito');
    }
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        handleRemoveItem(id);
        return;
      }
      
      const sourceProducts = allProducts;
      const product = sourceProducts.find(p => p.id === id);
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
    navigate("/compra");
  };

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  const handleSearch = (query: string) => {
    if (!query || query.trim() === "") return;
    
    setSearchQuery(query);
    setMainFilter({ mode: "search", value: query });
    setCarouselCategory("all");
    setActiveTab("home");
    setSelectedCategory("all");
    setSelectedType("all");
    setSelectedBrand("all");
    setOffersCategory("all");
    
    // Replace current history entry instead of adding new one
    // This way, no matter how many searches, back button always goes to home
    navigate(`/?q=${encodeURIComponent(query)}`, { replace: true });
    setTimeout(() => {
      const productsSection = document.getElementById('productos');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };
 
  // Helper to reset all filters including carousel category
  const resetAllFilters = () => {
    setMainFilter({ mode: "none", value: "all" });
    setCarouselCategory("all");
    setSelectedCategory("all");
    setSelectedType("all");
    setSelectedBrand("all");
    setOffersCategory("all");
    setSearchQuery("");
    setActiveTab("home");
  };

  // Clear search and go to home (for Header synchronization)
  const clearSearch = () => {
    resetAllFilters();
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab: string) => {
    if (tab === "cart") {
      setIsCartOpen(true);
      return;
    }
    setActiveTab(tab);
    setCarouselCategory("all");
    setSearchQuery("");
    setMainFilter({ mode: "none", value: "all" });
    if (tab === "home") {
      setSelectedCategory("all");
      setSelectedType("all");
      setSelectedBrand("all");
      setOffersCategory("all");
      navigate('/');
    }
  };

  const handleGoToHome = () => {
    resetAllFilters();
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChangeWithScroll = (tab: string) => {
    handleTabChange(tab);
    if (tab === "categories") {
      setTimeout(() => {
        if (categoriesRef.current) {
          categoriesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 50);
    }
  };

  const getTitle = () => {
    if (searchQuery) {
      return `Resultados para "${searchQuery}"`;
    }
    if (mainFilter.mode === "type" && selectedType !== "all") {
      return `Tipo: ${selectedType}`;
    }
    if (activeTab === "offers") {
      if (offersCategory === "all") {
        return "Todas las Ofertas";
      }
      const categoryName = productCategories.find(c => c.id === offersCategory)?.name || offersCategory;
      return `Ofertas: ${categoryName}`;
    }
    if (selectedCategory === "all") {
      return "Todos Nuestros Productos";
    }
    const categoryName = productCategories.find(c => c.id === selectedCategory)?.name || selectedCategory;
    return categoryName;
  };

  const searchSectionCategories = useMemo(() => {
    if (!searchQuery || mainFilter.mode !== "search") return [];

    return [
      ...new Set(
        filteredProducts
          .map((product) => product.category?.toUpperCase().trim())
          .filter((category): category is string => Boolean(category))
      ),
    ];
  }, [searchQuery, mainFilter.mode, filteredProducts]);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Distribuidor Punto Pas | Ferretería y Hogar en Ecuador</title>
        <meta
          name="description"
          content="Distribuidor Punto Pas: ferretería, hogar, electrodomésticos y más. Compra online con entrega rápida en Ecuador."
        />
      </Helmet>
      <TopBar />
      <div className="h-[2px] bg-white/30 -mt-px relative z-40" />
       <Header 
          cartCount={cartItemCount} 
          searchQuery={searchQuery}
          onSearch={(q) => {
            console.log("Header calling handleSearch with:", q);
            handleSearch(q);
          }}
          onCartClick={() => setIsCartOpen(true)}
          onGoToHome={handleGoToHome}
          onClearSearch={clearSearch}
          products={allProducts}
          popularSearches={["Lavadoras", "Televisores", "Refrigeradores", "Celulares"]}
          onProductClick={handleProductClick}
          onTypeSelect={handleTypeSelect}
          filters={advancedFilters}
          onFiltersChange={setAdvancedFilters}
          productsCount={filteredProducts.length}
          nivel2Categories={nivel2Categories}
          nivel3ByParent={nivel3ByParent}
        />
      {activeTab === "home" && !searchQuery && (
        <>
          <section className="bg-white pt-3 pb-2">
            <div className="max-w-[99vw] mx-auto px-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                <div className="overflow-hidden rounded-[28px] bg-transparent">
                  <video
                    src="https://res.cloudinary.com/dbbkpdhze/video/upload/v1778689011/PUBLICIDAD_PAGOS_2.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-[82px] md:h-[95px] object-contain"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/quienes-somos#otros-emprendimientos")}
                  className="overflow-hidden rounded-[28px] bg-transparent text-left"
                >
                  <video
                    src="https://res.cloudinary.com/dbbkpdhze/video/upload/v1778703220/PUBLICIDAD_OTROS_NEGOCIOS_2.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-[82px] md:h-[95px] object-contain"
                  />
                </button>
              </div>
            </div>
          </section>

          <div className="-mt-1 max-w-[99vw] mx-auto px-2">
              <HeroCarousel 
                onProductClick={(code) => {
                  console.log('HeroCarousel clicked, code:', code);
                  const product = allProducts.find(p => p.code === code);
                  console.log('Product found:', product?.name, 'code:', product?.code);
                  if (product) {
                    navigate(`/product/${product.id}`);
                  }
                }}
                onCategoryClick={(category) => {
                  setMainFilter({ mode: "category", value: category });
                  setSelectedType("all");
                  setCarouselCategory("all");
                  setActiveTab("home");
                  setSelectedCategory(category);
                  setSelectedBrand("all");
                  setSearchQuery("");
                  setTimeout(() => {
                    const productsSection = document.getElementById('productos');
                    if (productsSection) {
                      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                }}
              />
          </div>
          
          {/* Second Banner Image - below hero */}
          <section className="py-4 bg-white">
            <div className="max-w-[98vw] mx-auto px-2 md:px-0">
              <img
                src="https://res.cloudinary.com/dbbkpdhze/image/upload/v1777323714/PORTADA_SECCION_2.png"
                alt="Sección Principal"
                className="w-full h-auto rounded-xl md:rounded-2xl"
              />
            </div>
          </section>
          
          <div ref={categoriesRef}>
              <CategoryBar 
                selectedCategory={selectedCategory}
                products={allProducts}
                onSelectCategory={(cat) => {
                  setMainFilter({ mode: "category", value: cat });
                  setSelectedType("all");
                  setSelectedCategory(cat);
                  setCarouselCategory("all");
                  setSelectedBrand("all");
                  setSearchQuery("");
                  setTimeout(() => {
                    const productsSection = document.getElementById('productos');
                    if (productsSection) {
                      productsSection.scrollIntoView({ behavior: 'auto', block: 'start' });
                    }
                  }, 50);
                }}
              />
          </div>
        </>
      )}

      {activeTab === "categories" && (
        <CategoryBar 
          selectedCategory={selectedCategory}
          products={allProducts}
          onSelectCategory={(cat) => {
            setMainFilter({ mode: "category", value: cat });
            setSelectedType("all");
            setSelectedCategory(cat);
            setSelectedBrand("all");
            setSearchQuery("");
            setActiveTab("home");
            setTimeout(() => {
              const productsSection = document.getElementById('productos');
              if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 100);
          }}
        />
      )}

      <div ref={productsRef} id="productos">
        {showEnvLaptopBannerInSearch && (
          <div className="mb-4 md:mb-6 w-full bg-white" style={{ backgroundColor: '#FFFFFF' }}>
            <img
              src="https://res.cloudinary.com/dbbkpdhze/image/upload/v1778709681/PORTADA_TEC1.png"
              alt="Portada tecnologia ENV"
              className="block w-full h-auto cursor-pointer"
              onClick={applyEnvBrandFilter}
            />
          </div>
        )}

        {searchQuery && searchSectionCategories.length > 0 && (
          <section className="bg-white px-3 md:px-4 pt-5 md:pt-6 pb-3 border-b border-slate-200">
            <div className="max-w-7xl mx-auto">
              <h3 className="text-xl md:text-2xl font-bold mb-4" style={{ color: '#0A2A7A', fontFamily: 'Nunito, sans-serif' }}>
                Categorias
              </h3>
              <div className="overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                <div className="flex items-center gap-3 min-w-max pb-2">
                  {searchSectionCategories.map((category) => {
                    const imageName = category.replace(/\s+/g, '_');
                    const imageUrl = `https://res.cloudinary.com/dbbkpdhze/image/upload/v1775785362/${imageName}_123.png`;

                    return (
                      <button
                        key={category}
                        onClick={() => {
                          setMainFilter({ mode: 'category', value: category });
                          setSelectedCategory(category);
                          setSelectedType('all');
                          setSelectedBrand('all');
                          setCarouselCategory('all');
                          setOffersCategory('all');
                          setSearchQuery('');
                          navigate('/', { replace: true });
                        }}
                        className="flex items-center gap-2 md:gap-3 rounded-full border px-3 md:px-4 py-2 md:py-2.5 whitespace-nowrap transition-colors hover:bg-slate-50"
                        style={{ borderColor: '#C7D0E3' }}
                      >
                        <span className="w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0">
                          <img
                            src={imageUrl}
                            alt={category}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </span>
                        <span className="text-xl md:text-[28px] leading-none" style={{ color: '#0A2A7A' }}>•</span>
                        <span className="text-sm md:text-lg font-semibold uppercase" style={{ color: '#0A2A7A' }}>
                          {category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === "offers" && (
          <div className="px-4 py-8 bg-gradient-to-r from-primary/5 via-background to-primary/5">
            <div className="max-w-7xl mx-auto">
              <p className="text-sm text-muted-foreground mb-3 font-medium">Filtrar ofertas por categoría:</p>
              <div className="flex flex-wrap gap-2">
                {productCategories.map((category) => {
                  const count = category.id === "all" 
                    ? getDiscountedProducts().length 
                    : getDiscountedProducts().filter(p => p.category === category.id || p.type === category.id).length;
                  
                  if (count === 0 && category.id !== "all") return null;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setOffersCategory(category.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                        offersCategory === category.id
                          ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md"
                          : "bg-card hover:bg-muted text-foreground border border-border"
                      }`}
                    >
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        offersCategory === category.id 
                          ? "bg-white/20" 
                          : "bg-muted-foreground/10"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
          <ProductGrid 
            products={displayedProducts}
            onAddToCart={handleAddToCart}
            onProductClick={handleProductClick}
            title={getTitle()}
            showPagination={!searchQuery}
            isLoading={isLoadingProducts}
          />
          
          {activeTab === "home" && !searchQuery && (
            <>
              <div id="weeklydeals-section">
               <WeeklyDeals
               images={[
                  "https://res.cloudinary.com/dbbkpdhze/image/upload/v1778073484/Descuento1_s.png",
                 "https://res.cloudinary.com/dbbkpdhze/image/upload/v1777429432/Descuento2_s.png",
                 "https://res.cloudinary.com/dbbkpdhze/image/upload/v1777429429/Descuento3_s.png",
                 "https://res.cloudinary.com/dbbkpdhze/image/upload/v1777429442/Descuento4_s.png",
                 "https://res.cloudinary.com/dbbkpdhze/image/upload/v1777433322/Descuento5_s.png",
                 "https://res.cloudinary.com/dbbkpdhze/image/upload/v1777429436/Descuento6_s.png",
                 "https://res.cloudinary.com/dbbkpdhze/image/upload/v1777429439/Descuento7_s.png",
                 "https://res.cloudinary.com/dbbkpdhze/image/upload/v1777429448/Descuento8_s.png",
               ]}
               products={allProducts}
                selectedCategory={weeklyDealsCategory}
                onCategoryChange={(category) => {
                  setWeeklyDealsCategory(category);
                }}
                 onProductClick={(product) => {
                   navigate(`/product/${product.id}`);
                 }}
              />
              </div>

              <ProductCarouselSection
                products={allProducts.filter(p => {
                  const cat = (p.category || '').toUpperCase().trim();
                  const type = (p.type || '').toUpperCase().trim();
                  // Buscar coincidencias parciales
                  return cat.includes("LAVADORAS") || cat.includes("SECADERAS") || 
                         type.includes("LAVADORAS") || type.includes("SECADERAS");
                })}
                category="LAVADORAS Y SECADERAS"
                bannerImage="https://res.cloudinary.com/dbbkpdhze/image/upload/v1777756850/IMAGEN_SECCION_LAVADORAS.png"
                onBannerClick={() => {
                  setMainFilter({ mode: "carousel", value: "LAVADORAS Y SECADERAS" });
                  setSelectedType("all");
                  setCarouselCategory("LAVADORAS Y SECADERAS");
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedBrand("all");
                  setOffersCategory("all");
                  setActiveTab("home");
                  setTimeout(() => {
                    const productsSection = document.getElementById('productos');
                    if (productsSection) {
                      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                }}
                onProductClick={handleProductClick}
                onAddToCart={(product) => handleAddToCart(product, 1)}
              />

              <ProductCarouselSection
                products={allProducts
                  .filter((p) => {
                    const cat = (p.category || "").toUpperCase().trim();
                    const type = (p.type || "").toUpperCase().trim();
                    return (
                      cat.includes("CONGELADORES") ||
                      cat.includes("NEVERAS") ||
                      cat.includes("REFRIGERADOR") ||
                      type.includes("CONGELADORES") ||
                      type.includes("NEVERAS") ||
                      type.includes("REFRIGERADOR")
                    );
                  })
                  .sort((a, b) => {
                    const aInStock = (a.stock || 0) > 0 ? 1 : 0;
                    const bInStock = (b.stock || 0) > 0 ? 1 : 0;
                    return bInStock - aInStock;
                  })}
                category="CONGELADORES Y NEVERAS"
                topTitle="CONGELADORES Y NEVERAS"
                sectionTitle="REFRIGERADORAS Y CONGELADORES PARA TU HOGAR"
                bannerImage="https://res.cloudinary.com/dbbkpdhze/image/upload/v1777823224/Seccion_Neveras_1.png"
                layout="fridge"
                onBannerClick={() => {
                  const sourceProducts = allProducts;
                  const featuredProduct = sourceProducts.find((p) => p.code === "00001528");
                  if (featuredProduct) {
                    navigate(`/product/${featuredProduct.id}`);
                  }
                }}
                onProductClick={handleProductClick}
                onAddToCart={(product) => handleAddToCart(product, 1)}
              />

              <ProductCarouselSection
                products={allProducts
                  .filter((p) => {
                    const cat = (p.category || "").toUpperCase().trim();
                    const type = (p.type || "").toUpperCase().trim();
                    const name = (p.name || "").toUpperCase().trim();
                    return (
                      cat.includes("TELEVIS") ||
                      type.includes("TELEVIS") ||
                      type.includes("TV") ||
                      name.includes("TELEVIS")
                    );
                  })
                  .sort((a, b) => {
                    const aInStock = (a.stock || 0) > 0 ? 1 : 0;
                    const bInStock = (b.stock || 0) > 0 ? 1 : 0;
                    return bInStock - aInStock;
                  })}
                category="TELEVISORES"
                topTitle="TELEVISORES"
                sectionTitle="TELEVISORES PARA TU HOGAR"
                bannerImage="https://res.cloudinary.com/dbbkpdhze/image/upload/v1778731751/televisores_1.png"
                layout="fridge"
                onBannerClick={() => {
                  setMainFilter({ mode: "carousel", value: "TELEVISORES" });
                  setSelectedType("all");
                  setCarouselCategory("TELEVISORES");
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedBrand("all");
                  setOffersCategory("all");
                  setActiveTab("home");
                  setTimeout(() => {
                    const productsSection = document.getElementById('productos');
                    if (productsSection) {
                      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                }}
                onProductClick={handleProductClick}
                onAddToCart={(product) => handleAddToCart(product, 1)}
              />
                
              <div
                ref={envBannerRef}
                className="relative mt-4 md:mt-6 w-full overflow-hidden bg-white"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                <img
                  src="https://res.cloudinary.com/dbbkpdhze/image/upload/v1778709681/PORTADA_TEC1.png"
                  alt="Portada tecnologia ENV"
                  className="relative z-10 block w-full h-auto cursor-pointer"
                  style={{
                    transform: `translateY(${envBannerParallax * -0.35}px) scale(${isMobileViewport ? 1.012 : 1.026})`,
                    transition: 'transform 110ms linear',
                    willChange: 'transform',
                  }}
                  onClick={applyEnvBrandFilter}
                />
              </div>

              <div id="brands-section">
              <BrandsBanner
                products={allProducts} 
                onBrandClick={(brand) => {
                  const normalizedBrand = brand.toUpperCase().trim();
                  setMainFilter({ mode: "brand", value: normalizedBrand });
                  setSelectedType("all");
                  setCarouselCategory("all");
                  setSelectedBrand(normalizedBrand);
                  setSelectedCategory("all");
                  setSearchQuery("");
                  setActiveTab("home");
                  setTimeout(() => {
                    const productsSection = document.getElementById('productos');
                    if (productsSection) {
                      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                }}
              />
             </div>

             <div id="imagecollage-section" className="mb-10 md:mb-14">
              <ImageCollage
               images={[
                 "https://res.cloudinary.com/dbbkpdhze/image/upload/v1777305703/IMAGEN_1.png",
                 "https://res.cloudinary.com/dbbkpdhze/image/upload/v1777305710/IMAGEN_2.png",
                 "https://res.cloudinary.com/dbbkpdhze/image/upload/v1777306355/IMAGEN_3.png",
                 "https://res.cloudinary.com/dbbkpdhze/image/upload/v1777301931/IMAGEN_4.png",
                 "https://res.cloudinary.com/dbbkpdhze/image/upload/v1777413591/IMAGEN_5.png",
                 "https://res.cloudinary.com/dbbkpdhze/image/upload/v1777301925/IMAGEN_6.png",
               ]}
               onImageClick={(index) => {
                 const brands = ["INDURAMA", "MABE", "TCL", "RCA", "HONOR", "PHILIPS"];
                 if (brands[index]) {
                   const normalizedBrand = brands[index].toUpperCase().trim();
                   setMainFilter({ mode: "brand", value: normalizedBrand });
                    setSelectedType("all");
                    setSelectedBrand(normalizedBrand);
                    setSelectedCategory("all");
                    setSearchQuery("");
                    setActiveTab("home");
                  setTimeout(() => {
                    const productsSection = document.getElementById('productos');
                    if (productsSection) {
                      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                }
               }}
             />
             </div>
            </>
          )}
      </div>

        <Footer onCartClick={() => setIsCartOpen(true)} />
        
        <WhatsAppButton products={allProducts} />
        
              <ProductModal
                product={selectedProduct}
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onAddToCart={handleAddToCart}
                relatedProducts={allProducts.filter((p) => selectedProduct && p.id !== selectedProduct.id && (p.category === selectedProduct.category || p.type === selectedProduct.type))}
                onProductSelect={(product) => setSelectedProduct(product)}
              />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        products={allProducts}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default Index;
