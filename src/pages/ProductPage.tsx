import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Product, loadProductsFromAPI } from "@/data/products";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { paymentBadgeCandidates, paymentBadges } from "@/utils/paymentBadges";
import { handleAssetFallback } from "@/utils/assetFallback";

const normalizeCategory = (value: string) =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

const inferDisplayBrand = (brand: string, name: string) => {
  const cleanedBrand = (brand || '').trim();
  if (cleanedBrand && !/^\.+$/.test(cleanedBrand.replace(/\s+/g, ''))) {
    return cleanedBrand;
  }

  const tokens = (name || '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const ignored = new Set(['LAPTOP', 'LAPTOPS', 'NOTEBOOK', 'ULTRABOOK', 'COMPUTADORA', 'COMPUTADORAS', 'PC']);

  for (const token of tokens) {
    if (!ignored.has(token) && /^[A-Z0-9]{2,12}$/.test(token)) {
      return token;
    }
  }

  return 'Sin marca';
};

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [carouselStart, setCarouselStart] = useState(0);
  const [brokenImageIndexes, setBrokenImageIndexes] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const cached = await loadProductsFromAPI({ maxAgeMs: 120000 });
        setProducts(cached);
        setProduct(cached.find((p) => p.id === id) || null);
      } catch {
        toast.error("No se pudo cargar el producto.");
      } finally {
        setLoading(false);
      }

      void (async () => {
        try {
          const fresh = await loadProductsFromAPI({ forceRefresh: true });
          setProducts(fresh);
          setProduct(fresh.find((p) => p.id === id) || null);
        } catch {
          // silent background refresh
        }
      })();
    };
    if (id) void run();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const interval = setInterval(async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const all = await loadProductsFromAPI({ forceRefresh: true });
        setProducts(all);
        const found = all.find((p) => p.id === id) || null;
        setProduct(found);
      } catch {
        // silent refresh
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [id]);

  useEffect(() => {
    const cartRaw = localStorage.getItem("puntopas_cart");
    const cart = cartRaw ? JSON.parse(cartRaw) : [];
    const count = cart.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 0), 0);
    setCartCount(count);
  }, [id]);

  useEffect(() => {
    setSelectedImageIndex(0);
    setQuantity(1);
    setCarouselStart(0);
    setBrokenImageIndexes([]);
  }, [id]);

  const addToCart = () => {
    if (!product) return;
    if (product.stock <= 0) {
      toast.error("Producto sin stock");
      return;
    }

    const cartRaw = localStorage.getItem("puntopas_cart");
    const current = cartRaw ? JSON.parse(cartRaw) : [];
    const existingIndex = current.findIndex((item: { id: string }) => item.id === product.id);

    if (existingIndex >= 0) {
      const existingQty = current[existingIndex].quantity || 0;
      current[existingIndex].quantity = Math.min(existingQty + quantity, product.stock);
    } else {
      current.push({
        id: product.id,
        name: product.name,
        price: product.puntoPasPrice || product.pvpPrice || product.price,
        image: product.image,
        quantity,
        stock: product.stock,
      });
    }

    localStorage.setItem("puntopas_cart", JSON.stringify(current));
    const count = current.reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 0), 0);
    setCartCount(count);
    toast.success("Producto agregado al carrito");
  };

  const openProductInNewTab = (productId: string) => {
    const productUrl = `${window.location.origin}/product/${productId}`;
    window.open(productUrl, "_blank", "noopener,noreferrer");
  };

  const handleWhatsAppBuy = () => {
    if (!product) return;
    const productUrl = `${window.location.origin}/product/${product.id}`;
    const productPrice = (product.puntoPasPrice || product.pvpPrice || product.price).toFixed(2);
    const message = [
      "Hola, quiero comprar este producto:",
      `Producto: ${product.name}`,
      `Codigo: ${product.code}`,
      `Cantidad: ${quantity}`,
      `Precio referencial: $${productPrice}`,
      `Link: ${productUrl}`,
    ].join("\n");

    const waUrl = `https://wa.me/593959990999?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const currentCategory = normalizeCategory(product.category || "");
    return products
      .filter((p) => {
        if (p.id === product.id) return false;
        const candidateCategory = normalizeCategory(p.category || "");
        return candidateCategory === currentCategory;
      });
  }, [products, product]);

  const productImages = useMemo(() => {
    if (!product) return [];
    const rawImages = (product.images && product.images.length > 0 ? product.images : [product.image]).filter(
      (img) => !!img && img.trim().length > 0,
    );

    const toImageIdentityKey = (imageUrl: string): string => {
      const withoutQuery = imageUrl.split("?")[0].toLowerCase();
      const fileName = withoutQuery.split("/").pop() || withoutQuery;
      const withoutExtension = fileName.replace(/\.(png|jpg|jpeg|webp|gif)$/i, "");
      return withoutExtension.replace(/_?e\d*$/i, "_e").replace(/_+/g, "_");
    };

    const unique = new Map<string, string>();
    rawImages.forEach((imageUrl) => {
      const key = toImageIdentityKey(imageUrl);
      if (!unique.has(key)) {
        unique.set(key, imageUrl);
      }
    });

    return Array.from(unique.values()).slice(0, 8);
  }, [product]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-600">Cargando producto...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Producto no encontrado</p>
          <button className="mt-3 rounded-lg border px-4 py-2" onClick={() => navigate("/")}>Volver</button>
        </div>
      </div>
    );
  }
  const visibleImages = productImages.filter((_, index) => !brokenImageIndexes.includes(index));
  const price = product.puntoPasPrice || product.pvpPrice || product.price;
  const visibleRelated = relatedProducts.slice(carouselStart, carouselStart + 6);
  const selectedImage = visibleImages[selectedImageIndex] || visibleImages[0] || product.image;
  const displayBrand = inferDisplayBrand(product.brand, product.name);

  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <Header
        cartCount={cartCount}
        searchQuery={searchQuery}
        onSearch={(query) => {
          setSearchQuery(query);
          const normalized = query.trim();
          if (normalized.length >= 2) {
            navigate(`/?q=${encodeURIComponent(normalized)}`);
          }
        }}
        onCartClick={() => navigate("/checkout")}
        onGoToHome={() => navigate("/")}
        onClearSearch={() => {
          setSearchQuery("");
          navigate("/");
        }}
        products={products}
        onProductClick={(selected) => openProductInNewTab(selected.id)}
      />

      <div className="mx-auto max-w-[1600px] px-0 py-0">
        <div className="bg-white p-2 md:p-4 xl:px-5">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[90px_1.5fr_1fr_360px]">
            <div className="order-2 xl:order-1 flex xl:flex-col gap-2 overflow-x-auto xl:overflow-visible">
              {visibleImages.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${selectedImageIndex === idx ? "border-[#FA003F]" : "border-slate-200"}`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="h-full w-full object-cover"
                    onError={() => {
                      const rawIndex = productImages.findIndex((raw) => raw === img);
                      if (rawIndex >= 0 && !brokenImageIndexes.includes(rawIndex)) {
                        setBrokenImageIndexes((prev) => [...prev, rawIndex]);
                        setSelectedImageIndex(0);
                      }
                    }}
                  />
                </button>
              ))}
            </div>

            <div className="order-1 xl:order-2 bg-slate-50 p-4">
              <img
                src={selectedImage}
                alt={product.name}
                className="mx-auto h-[320px] w-full object-contain md:h-[560px]"
                onError={() => {
                  const currentRawIndex = productImages.findIndex((img) => img === selectedImage);
                  if (currentRawIndex >= 0 && !brokenImageIndexes.includes(currentRawIndex)) {
                    setBrokenImageIndexes((prev) => [...prev, currentRawIndex]);
                    setSelectedImageIndex(0);
                  }
                }}
              />
            </div>

            <div className="order-3 space-y-4">
              <h1 className="text-3xl font-extrabold leading-tight text-slate-900">{product.name}</h1>
              <div className="space-y-1 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-800">Codigo:</span> {product.code}</p>
                <p><span className="font-semibold text-slate-800">Marca:</span> {displayBrand}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-600">Precio actual</p>
                <p className="text-4xl font-black text-[#FF0000]">${price.toFixed(2)}</p>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Modos de pago</p>
                <div className="flex flex-wrap items-center gap-3">
                  {paymentBadges.map((badge, index) => (
                    <img
                      key={`payment-badge-page-${index}`}
                      src={badge}
                      alt="Metodo de pago"
                      className="h-14 w-auto rounded-md border border-slate-200 bg-white p-1.5"
                      data-fallbacks={paymentBadgeCandidates[index]?.join("|")}
                      data-fallback-index="0"
                      onError={handleAssetFallback}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Cantidad</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border bg-white disabled:opacity-40"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={Math.max(1, product.stock)}
                    value={quantity}
                    onChange={(e) => {
                      const val = Number.parseInt(e.target.value, 10);
                      const safe = Number.isNaN(val) ? 1 : Math.max(1, Math.min(val, Math.max(1, product.stock)));
                      setQuantity(safe);
                    }}
                    className="h-10 w-20 rounded-lg border text-center font-semibold"
                  />
                  <button
                    onClick={() => setQuantity((prev) => Math.min(Math.max(1, product.stock), prev + 1))}
                    disabled={quantity >= Math.max(1, product.stock)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border bg-white disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <aside className="order-4 border border-slate-200 p-4">
              <div className="grid grid-cols-3 overflow-hidden rounded-lg border text-sm font-semibold">
                <div className="bg-emerald-50 px-2 py-2 text-center text-emerald-700">Efectivo / Transferencia</div>
                <div className="bg-slate-100 px-2 py-2 text-center text-slate-500">T. Credito</div>
                <div className="bg-slate-100 px-2 py-2 text-center text-slate-500">Credito Directo</div>
              </div>

              <div className="mt-4 rounded-lg border bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Precio</p>
                <p className="text-3xl font-black text-[#FF0000]">${price.toFixed(2)}</p>
                <p className="mt-1 text-xs text-slate-400">Precio incluye IVA</p>
              </div>

              <button
                onClick={addToCart}
                disabled={product.stock <= 0}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF0000] py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart className="h-5 w-5" />
                {product.stock <= 0 ? "Sin stock" : "Agregar al carrito"}
              </button>

              <button
                onClick={handleWhatsAppBuy}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#22c55e] px-3 py-3 text-sm font-bold text-white transition hover:bg-[#16a34a]"
              >
                Comprar por WhatsApp
                <img src="/whatsapp.png" alt="WhatsApp" className="h-4 w-4 object-contain" />
              </button>
            </aside>
          </div>

          <div className="mt-6 border-t pt-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Productos relacionados</h2>
              <div className="flex items-center gap-3">
                <p className="text-sm text-slate-500">{relatedProducts.length} productos</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCarouselStart((prev) => Math.max(0, prev - 1))}
                    disabled={carouselStart <= 0}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#FF0000] bg-[#FF0000] text-white disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCarouselStart((prev) => Math.min(Math.max(0, relatedProducts.length - 6), prev + 1))}
                    disabled={carouselStart + 6 >= relatedProducts.length}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#FF0000] bg-[#FF0000] text-white disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {visibleRelated.map((item) => {
                const itemPrice = item.puntoPasPrice || item.pvpPrice || item.price;
                return (
                  <button
                    key={item.id}
                    onClick={() => openProductInNewTab(item.id)}
                    className="rounded-xl border border-slate-200 p-2 text-left transition hover:-translate-y-0.5 hover:border-[#FA003F]/60 hover:shadow-md"
                  >
                    <div className="mb-2 rounded-lg bg-slate-50 p-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-32 w-full object-contain"
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          img.src = "/placeholder.svg";
                        }}
                      />
                    </div>
                    <p className="line-clamp-2 text-sm font-semibold text-slate-800">{item.name}</p>
                    <p className="mt-1 text-xs text-slate-500">Cod. {item.code}</p>
                    <p className="mt-1 text-lg font-black text-[#FA003F]">${itemPrice.toFixed(2)}</p>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      <Footer />

      <WhatsAppButton products={products} />
    </div>
  );
};

export default ProductPage;
