import { useState, useMemo, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { CategoryBar } from "@/components/CategoryBar";
import { HeroCarousel } from "@/components/HeroCarousel";
import { BrandsBanner } from "@/components/BrandsBanner";
import { ProductGrid } from "@/components/ProductGrid";
import { BottomNav } from "@/components/BottomNav";
import { ProductModal } from "@/components/ProductModal";
import { CartDrawer, CartItem } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import {
  getDiscountedProducts,
  products,
  categories,
  getCategories,
  Product,
  loadProductsFromAPI,
} from "@/data/products";
import { authService } from "@/services/api";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>(products);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [offersCategory, setOffersCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("puntopas_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [productCategories, setProductCategories] = useState(categories);
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Refs for scrolling to sections
  const categoriesRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  // Persist cart to localStorage
  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("puntopas_cart", JSON.stringify(newCart));
  };

  // Handle tab from URL query params
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "offers") {
      setActiveTab("offers");
    }
  }, [searchParams]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(12);
  }, [selectedCategory, activeTab, searchQuery, offersCategory]);

  // Function to load products from API
  const loadAPIProducts = async () => {
    try {
      setIsLoadingProducts(true);
      setApiStatus('loading');
      setApiError(null);
      
      const apiProducts = await loadProductsFromAPI();
      
      if (apiProducts && apiProducts.length > 0) {
        setAllProducts(apiProducts);
        setProductCategories(getCategories());
        setApiStatus('success');
      } else {
        setApiStatus('error');
        setApiError('No se recibieron productos de la API');
      }
    } catch (error: any) {
      console.error('❌ Error cargando productos de API:', error.message);
      setApiStatus('error');
      setApiError(error.message);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Load products from API on mount
  useEffect(() => {
    loadAPIProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const sourceProducts = apiStatus === 'success' && allProducts.length > 0 ? allProducts : products;
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      return sourceProducts.filter(p => 
        p.isActive && (
          p.name.toLowerCase().includes(lowerQuery) ||
          p.description?.toLowerCase().includes(lowerQuery) ||
          p.brand.toLowerCase().includes(lowerQuery) ||
          p.code.toLowerCase().includes(lowerQuery)
        )
      );
    }
    
    if (activeTab === "offers") {
      const allOffers = sourceProducts.filter(p => p.isActive && p.discount && p.discount > 0);
      if (offersCategory === "all") {
        return allOffers;
      }
      return allOffers.filter(p => p.category === offersCategory || p.type === offersCategory);
    }
    
    if (selectedCategory === "all") {
      return sourceProducts.filter(p => p.isActive);
    }
    return sourceProducts.filter(p => p.isActive && (p.category === selectedCategory || p.type === selectedCategory));
  }, [selectedCategory, activeTab, searchQuery, offersCategory, allProducts, apiStatus]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const hasMore = visibleCount < filteredProducts.length;

  const loadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 12);
      setIsLoadingMore(false);
    }, 300);
  };

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
          originalPrice: product.originalPrice,
          discount: product.discount,
          image: product.image,
          quantity: Math.min(quantity, product.stock),
        });
      }
      
      updateCart(newCart);
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

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      setActiveTab("home");
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === "cart") {
      setIsCartOpen(true);
      return;
    }
    setActiveTab(tab);
    setSearchQuery("");
    if (tab === "home") {
      setSelectedCategory("all");
      setOffersCategory("all");
      navigate('/');
    }
  };

  const handleGoToHome = () => {
    setActiveTab("home");
    setSearchQuery("");
    setSelectedCategory("all");
    setOffersCategory("all");
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll to categories when the categories tab is clicked so the section is visible
  const handleTabChangeWithScroll = (tab: string) => {
    handleTabChange(tab);
    if (tab === "categories") {
      // Wait a tick for DOM to update then scroll the categories into view
      setTimeout(() => {
        if (categoriesRef.current) {
          categoriesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          // fallback: scroll to top
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }, 50);
    }
  };

  const getTitle = () => {
    if (searchQuery) {
      return `Resultados para "${searchQuery}"`;
    }
    if (activeTab === "offers") {
      if (offersCategory === "all") {
        return "🔥 Todas las Ofertas";
      }
      const categoryName = productCategories.find(c => c.id === offersCategory)?.name || offersCategory;
      return `🔥 Ofertas: ${categoryName}`;
    }
    return "🛒 Todos Nuestros Productos";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        cartCount={cartItemCount} 
        onSearch={handleSearch}
        onCartClick={() => setIsCartOpen(true)}
        onGoToHome={handleGoToHome}
      />
      
      {activeTab === "home" && !searchQuery && (
        <>
          <HeroCarousel />
          <div ref={categoriesRef}>
            <CategoryBar 
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                // Scroll to products section after selecting category
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
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setActiveTab("home");
            // Scroll to products section after switching to home tab
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
        {/* Category filter for Offers tab */}
        {activeTab === "offers" && (
          <div className="px-4 py-4 bg-gradient-to-r from-primary/5 via-background to-primary/5">
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
          onAddToCart={(product) => handleAddToCart(product, 1)}
          onProductClick={handleProductClick}
          title={getTitle()}
        />

        {hasMore && (
          <div className="flex justify-center py-8">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all duration-150 shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center gap-2"
            >
              {isLoadingMore ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Cargando...
                </>
              ) : (
                "Ver más productos"
              )}
            </button>
          </div>
        )}
      </div>

      {activeTab === "home" && !searchQuery && (
        <BrandsBanner 
          products={allProducts} 
          onBrandClick={(brand) => {
            setSearchQuery(brand);
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

      <Footer />

      <BottomNav 
        activeTab={activeTab}
        onTabChange={handleTabChangeWithScroll}
        cartCount={cartItemCount}
      />

      <WhatsAppButton />

      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onAddToCart={handleAddToCart}
      />

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

export default Index;
