import { useState, useMemo, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { TopBar } from "@/components/TopBar";
import { CategoryBar } from "@/components/CategoryBar";
import { HeroCarousel } from "@/components/HeroCarousel";
import { BrandsBanner } from "@/components/BrandsBanner";
import { ImageCollage } from "@/components/ImageCollage";
import { WeeklyDeals } from "@/components/WeeklyDeals";
import { ProductGrid } from "@/components/ProductGrid";
import { BottomNav } from "@/components/BottomNav";
import { ProductModal } from "@/components/ProductModal";
import { CartDrawer, CartItem } from "@/components/CartDrawer";
import { ProductCarouselSection } from "@/components/ProductCarouselSection";
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
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [offersCategory, setOffersCategory] = useState("all");
  // Estados independientes para cada sección
  const [brandsBannerBrand, setBrandsBannerBrand] = useState("all");
  const [imageCollageBrand, setImageCollageBrand] = useState("all");
  const [carouselCategory, setCarouselCategory] = useState("LAVADORAS Y SECADORAS");
  // Estado independiente para WeeklyDeals
  const [weeklyDealsCategory, setWeeklyDealsCategory] = useState("all");
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

  const categoriesRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("puntopas_cart", JSON.stringify(newCart));
  };

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "offers") {
      setActiveTab("offers");
    }
  }, [searchParams]);

  useEffect(() => {
    setVisibleCount(12);
  }, [selectedCategory, activeTab, searchQuery, offersCategory]);

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
        toast.error("La API no devolvió productos. Verifica la consola.");
      }
    } catch (error: any) {
      console.error('Error cargando productos de API:', error.message);
      setApiStatus('error');
      setApiError(error.message);
      toast.error(`Error de conexión: ${error.message}`);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadAPIProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const sourceProducts = apiStatus === 'success' && allProducts.length > 0 ? allProducts : products;
    
    let filtered = sourceProducts.filter(p => p.isActive);
    
    if (selectedCategory !== "all") {
      const selectedUpper = selectedCategory.toUpperCase().trim();
      filtered = filtered.filter(p => 
        p.category?.toUpperCase().trim() === selectedUpper || 
        p.type?.toUpperCase().trim() === selectedUpper
      );
    }
    
    if (selectedBrand !== "all") {
      filtered = filtered.filter(p => 
        p.brand?.toUpperCase().trim() === selectedBrand.toUpperCase().trim()
      );
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.code.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
        p.type?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [selectedCategory, selectedBrand, activeTab, searchQuery, offersCategory, allProducts, apiStatus]);

  // Productos filtrados para BrandsBanner (independiente)
  const brandsBannerProducts = useMemo(() => {
    if (brandsBannerBrand === "all") return allProducts;
    return allProducts.filter(p => 
      p.brand?.toUpperCase().trim() === brandsBannerBrand.toUpperCase().trim()
    );
  }, [brandsBannerBrand, allProducts]);

  // Productos filtrados para ImageCollage (independiente)
  const imageCollageProducts = useMemo(() => {
    if (imageCollageBrand === "all") return allProducts;
    return allProducts.filter(p => 
      p.brand?.toUpperCase().trim() === imageCollageBrand.toUpperCase().trim()
    );
  }, [imageCollageBrand, allProducts]);

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
      
      const sourceProducts = apiStatus === 'success' ? allProducts : products;
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
    navigate("/checkout");
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleSearch = (query: string) => {
    console.log("Search query received:", query);
    if (!query || query.trim() === "") return;
    
    setSearchQuery(query);
    setActiveTab("home");
    setSelectedCategory("all");
    setOffersCategory("all");
    console.log("Variables state updated, searching for:", query);
    
    setTimeout(() => {
      const productsSection = document.getElementById('productos');
      console.log("Found products section:", !!productsSection);
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
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

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="h-[2px] bg-white/30 -mt-px relative z-40" />
      <Header 
        cartCount={cartItemCount} 
        onSearch={(q) => {
          console.log("Header calling handleSearch with:", q);
          handleSearch(q);
        }}
        onCartClick={() => setIsCartOpen(true)}
        onGoToHome={handleGoToHome}
        products={allProducts.length > 0 ? allProducts : products}
        popularSearches={["Lavadoras", "Televisores", "Refrigeradores", "Celulares"]}
        onProductClick={handleProductClick}
      />
      {activeTab === "home" && !searchQuery && (
        <>
          <div className="-mt-1">
            <HeroCarousel 
              onProductClick={(code) => {
                const sourceProducts = apiStatus === 'success' ? allProducts : products;
                const product = sourceProducts.find(p => p.code === code);
                if (product) {
                  setSelectedProduct(product);
                  setIsProductModalOpen(true);
                }
              }}
              onCategoryClick={(category) => {
                setActiveTab("home");
                setSelectedCategory(category);
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
            <div className="max-w-[98vw] mx-auto px-0">
              <img
                src="https://res.cloudinary.com/dbbkpdhze/image/upload/v1777323714/PORTADA_SECCION_2.png"
                alt="Sección Principal"
                className="w-full h-auto rounded-[50px]"
              />
            </div>
          </section>
          
          <div ref={categoriesRef}>
            <CategoryBar 
              selectedCategory={selectedCategory}
              products={allProducts}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
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
            setSelectedCategory(cat);
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
        />

        {activeTab === "home" && !searchQuery && (
          <>
            <ProductCarouselSection
              products={allProducts}
              category="LAVADORAS Y SECADORAS"
              bannerImage="https://res.cloudinary.com/dbbkpdhze/image/upload/v1777411113/IMAGEN_SECCION_LAVADORAS.png"
              onBannerClick={() => {
                setActiveTab("home");
                setSearchQuery("lavadora");
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

            <div id="brands-section">
            <BrandsBanner
              products={allProducts} 
              onBrandClick={(brand) => {
                setBrandsBannerBrand(brand.toUpperCase().trim());
                setSelectedCategory("all");
                setSearchQuery("");
                setTimeout(() => {
                  const brandsSection = document.getElementById('brands-section');
                  if (brandsSection) {
                    brandsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 100);
              }}
            />
            </div>

            <div id="imagecollage-section">
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
                  setImageCollageBrand(brands[index]);
                  setSelectedCategory("all");
                  setSearchQuery("");
                  setTimeout(() => {
                    const imageCollageSection = document.getElementById('imagecollage-section');
                    if (imageCollageSection) {
                      imageCollageSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                }
               }}
             />
             </div>

             <div id="weeklydeals-section">
             <WeeklyDeals
               images={[
                 "https://res.cloudinary.com/dbbkpdhze/image/upload/v1777429427/Descuento1_s.png",
                 "https://res.cloudinary.com/dbbkpdhze/image/upload/v1777429432/Descuento2_s.png",
                 "https://res.cloudinary.com/dbbkpdhze/image/upload/v1777429429/Descuento3_s.png",
                 "https://res.cloudinary.com/dbbkpdhze/image/upload/v1777429442/Descuento4_s.png",
                 "https://res.cloudinary.com/dbbkpdhze/image/upload/v1777433322/Descuento5_s.png",
                 "https://res.cloudinary.com/dbbkpdhze/image/upload/v1777429436/Descuento6_s.png",
                 "https://res.cloudinary.com/dbbkpdhze/image/upload/v1777429439/Descuento7_s.png",
                 "https://res.cloudinary.com/dbbkpdhze/image/upload/v1777429448/Descuento8_s.png",
               ]}
               products={weeklyDealsProducts}
               selectedCategory={weeklyDealsCategory}
               onCategoryChange={setWeeklyDealsCategory}
               onProductClick={(product) => {
                 setSelectedProduct(product);
                 setIsProductModalOpen(true);
               }}
             />
             </div>
          </>
        )}
      </div>

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
        products={apiStatus === 'success' ? allProducts : products}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default Index;