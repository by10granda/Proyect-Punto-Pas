import { useState, useMemo, useRef } from "react";
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
  getProductsByCategory,
  getDiscountedProducts,
  searchProducts,
  products,
  categories,
  Product,
} from "@/data/products";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
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

  // Refs for scrolling to sections
  const categoriesRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  // Persist cart to localStorage
  const updateCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("puntopas_cart", JSON.stringify(newCart));
  };

  const displayedProducts = useMemo(() => {
    if (searchQuery) {
      return searchProducts(searchQuery);
    }
    if (activeTab === "offers") {
      const allOffers = getDiscountedProducts();
      if (offersCategory === "all") {
        return allOffers;
      }
      return allOffers.filter(p => p.category === offersCategory || p.type === offersCategory);
    }
    return getProductsByCategory(selectedCategory);
  }, [selectedCategory, activeTab, searchQuery, offersCategory]);

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
      const categoryName = categories.find(c => c.id === offersCategory)?.name || offersCategory;
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
              onSelectCategory={setSelectedCategory}
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
              if (productsRef.current) {
                productsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }, 100);
          }}
        />
      )}

      <div ref={productsRef}>
        {/* Category filter for Offers tab */}
        {activeTab === "offers" && (
          <div className="px-4 py-4 bg-gradient-to-r from-primary/5 via-background to-primary/5">
            <div className="max-w-7xl mx-auto">
              <p className="text-sm text-muted-foreground mb-3 font-medium">Filtrar ofertas por categoría:</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
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
      </div>

      {activeTab === "home" && !searchQuery && (
        <BrandsBanner />
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
