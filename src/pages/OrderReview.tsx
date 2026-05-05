import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Trash2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { products } from "@/data/products";
import { productService } from "@/services/api";
import { CheckoutSteps } from "@/components/CheckoutSteps";

interface CartItem {
  id: string;
  code: string;
  name: string;
  price: number;
  image: string;
  stock?: number;
  quantity: number;
}

const OrderReview = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>(() => {
    const raw = localStorage.getItem("puntopas_cart");
    return raw ? JSON.parse(raw) : [];
  });
  const [stockByCode, setStockByCode] = useState<Record<string, number>>({});

  const persistItems = (next: CartItem[]) => {
    setItems(next);
    localStorage.setItem("puntopas_cart", JSON.stringify(next));
  };

  useEffect(() => {
    let active = true;

    const loadLiveStock = async () => {
      try {
        const inventory = await productService.getInventario();
        if (!active) return;

        const nextStockMap: Record<string, number> = {};
        inventory.forEach((entry) => {
          nextStockMap[(entry.codigo || "").trim()] = Number(entry.disponible || 0);
        });
        setStockByCode(nextStockMap);

        setItems((prev) => {
          const adjusted = prev.map((item) => {
            const live = nextStockMap[(item.code || "").trim()];
            if (typeof live === "number" && live >= 0 && item.quantity > live && live > 0) {
              return { ...item, quantity: live };
            }
            if (typeof live === "number" && live === 0 && item.quantity > 1) {
              return { ...item, quantity: 1 };
            }
            return item;
          });
          localStorage.setItem("puntopas_cart", JSON.stringify(adjusted));
          return adjusted;
        });
      } catch {
        // Keep cart usable if inventory endpoint is unavailable.
      }
    };

    void loadLiveStock();
    const intervalId = setInterval(() => {
      void loadLiveStock();
    }, 30000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  const getMaxStock = (item: CartItem) => {
    const liveStock = stockByCode[(item.code || "").trim()];
    if (typeof liveStock === "number") {
      return Math.max(0, liveStock);
    }

    if (typeof item.stock === "number" && item.stock > 0) {
      return item.stock;
    }
    const { id, code, quantity: currentQty } = item;
    const product = products.find((item) => item.id === id || item.code === code);
    return product?.stock ?? currentQty;
  };

  const updateQty = (item: CartItem, qty: number) => {
    if (qty < 1) return;
    const maxStock = getMaxStock(item);
    const safeQty = maxStock > 0 ? Math.min(qty, maxStock) : 1;
    persistItems(items.map((row) => (row.id === item.id ? { ...row, quantity: safeQty } : row)));
  };

  const removeItem = (id: string) => {
    persistItems(items.filter((item) => item.id !== id));
  };

  const { subtotal, total } = useMemo(() => {
    const sub = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    return { subtotal: sub, total: sub };
  }, [items]);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const formatPrice = (price: number) =>
    price.toLocaleString("es-EC", {
      style: "currency",
      currency: "USD",
    });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        cartCount={cartCount}
        onSearch={() => {}}
        onCartClick={() => {}}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-5 sm:py-8 pb-14 sm:pb-16">
        <CheckoutSteps activeStep={1} />
        <div className="flex items-center justify-between gap-3 mb-5 sm:mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Volver
          </Link>
          <div className="hidden sm:block text-sm text-slate-400 tracking-wide uppercase">Revisar orden · Entrega · Pago</div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5 lg:gap-8">
          <section className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-5 sm:mb-6" style={{ fontFamily: "Nunito, sans-serif" }}>
              Vista previa de la orden
            </h1>

            {items.length === 0 ? (
              <div className="py-14 text-center">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">Tu carrito está vacío.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <article key={item.id} className="border border-slate-200 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                    <img src={item.image} alt={item.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover bg-slate-100 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm md:text-base font-semibold text-slate-900 uppercase line-clamp-2">{item.name}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => updateQty(item, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 rounded-md bg-[#FA003F] text-white font-bold"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={Math.max(1, getMaxStock(item))}
                          value={item.quantity}
                          onChange={(e) => {
                            const nextValue = Number(e.target.value || 1);
                            if (Number.isNaN(nextValue)) return;
                            updateQty(item, Math.max(1, nextValue));
                          }}
                          className="w-14 h-8 text-center text-sm font-semibold border border-slate-300 rounded-md"
                        />
                        <button
                          onClick={() => updateQty(item, item.quantity + 1)}
                          disabled={getMaxStock(item) === 0 || item.quantity >= getMaxStock(item)}
                          className="w-8 h-8 rounded-md bg-[#FA003F] text-white font-bold disabled:opacity-40"
                        >
                          +
                        </button>
                        <span className="text-xs text-slate-400 sm:ml-1">Stock: {getMaxStock(item)}</span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="sm:ml-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" /> Eliminar
                        </button>
                      </div>
                    </div>
                    </div>
                    <p className="text-lg font-bold text-slate-900 sm:text-right">{formatPrice(item.price * item.quantity)}</p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 h-fit lg:sticky lg:top-6 shadow-sm lg:shadow-none">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Resumen</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between text-xl font-black text-slate-900">
                <span>Total:</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              disabled={items.length === 0}
              className="mt-6 w-full h-12 rounded-xl bg-[#132a86] hover:bg-[#0f226d] text-white font-semibold disabled:opacity-50 shadow-md"
            >
              Finalizar compra
            </button>

            <button onClick={() => navigate("/")} className="mt-4 w-full text-sm text-slate-500 hover:text-slate-900">
              Seguir comprando
            </button>
          </aside>
        </div>
      </main>
      <div className="mt-10">
        <Footer />
      </div>
    </div>
  );
};

export default OrderReview;
