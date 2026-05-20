import { useEffect, useState } from "react";
import { X, Minus, Plus, ShoppingCart, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/data/products";
import { paymentBadges } from "@/utils/paymentBadges";

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  relatedProducts?: Product[];
  onProductSelect?: (product: Product) => void;
}

export const ProductModal = ({ product, isOpen, onClose, onAddToCart, relatedProducts = [], onProductSelect }: ProductModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [carouselStart, setCarouselStart] = useState(0);

  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setAddedToCart(false);
      setSelectedImageIndex(0);
      setCarouselStart(0);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, product]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const productImages = (product.images && product.images.length > 0 ? product.images : [product.image]).slice(0, 8);
  const displayPrice = product.puntoPasPrice || product.pvpPrice || product.price;
  const related = relatedProducts.filter((p) => p.id !== product.id).slice(0, 12);
  const visibleRelated = related.slice(carouselStart, carouselStart + 5);

  const handleAddToCart = () => {
    if (product.stock <= 0 || addedToCart) return;
    onAddToCart(product, quantity);
    setAddedToCart(true);
  };

  const handleManualQuantity = (value: string) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      setQuantity(1);
      return;
    }
    setQuantity(Math.max(1, Math.min(parsed, Math.max(1, product.stock))));
  };

  const canMoveLeft = carouselStart > 0;
  const canMoveRight = carouselStart + 5 < related.length;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/55 overflow-y-auto">
      <div className="min-h-full p-2 md:p-5">
        <div className="mx-auto w-full max-w-[1500px] rounded-2xl bg-white shadow-2xl">
          <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-4 py-3 md:px-6">
            <p className="text-sm font-semibold text-slate-500">Vista del producto</p>
            <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200">
              <X className="h-5 w-5 text-slate-700" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 p-4 md:p-6 xl:grid-cols-[90px_1.5fr_1fr_360px]">
            <div className="order-2 xl:order-1 flex xl:flex-col gap-2 overflow-x-auto xl:overflow-visible">
              {productImages.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${selectedImageIndex === idx ? "border-[#FA003F]" : "border-slate-200"}`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>

            <div className="order-1 xl:order-2 rounded-xl border bg-slate-50 p-4">
              <img src={productImages[selectedImageIndex]} alt={product.name} className="mx-auto h-[300px] w-full object-contain md:h-[520px]" />
            </div>

            <div className="order-3 space-y-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">{product.category} / {product.type}</p>
              <h2 className="text-3xl font-extrabold leading-tight text-slate-900">{product.name}</h2>
              <div className="space-y-1 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-800">Codigo:</span> {product.code}</p>
                <p><span className="font-semibold text-slate-800">Marca:</span> {product.brand || "Sin marca"}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-600">Precio actual</p>
                <p className="text-4xl font-black text-[#FF0000]">${displayPrice.toFixed(2)}</p>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Modos de pago</p>
                <div className="flex flex-wrap items-center gap-2">
                  {paymentBadges.map((badge) => (
                    <img key={badge} src={badge} alt="Metodo de pago" className="h-10 w-auto rounded-md border border-slate-200 bg-white p-1" />
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
                    onChange={(e) => handleManualQuantity(e.target.value)}
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

            <aside className="order-4 rounded-xl border border-slate-200 p-4">
              <div className="grid grid-cols-3 overflow-hidden rounded-lg border text-sm font-semibold">
                <div className="bg-emerald-50 px-2 py-2 text-center text-emerald-700">Efectivo / Transferencia</div>
                <div className="bg-slate-100 px-2 py-2 text-center text-slate-500">T. Credito</div>
                <div className="bg-slate-100 px-2 py-2 text-center text-slate-500">Credito Directo</div>
              </div>

              <div className="mt-4 rounded-lg border bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Precio</p>
                <p className="text-3xl font-black text-[#FF0000]">${displayPrice.toFixed(2)}</p>
                <p className="mt-1 text-xs text-slate-400">Precio incluye IVA</p>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || addedToCart}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF0000] py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {addedToCart ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                {addedToCart ? "Agregado" : product.stock <= 0 ? "Sin stock" : "Agregar al carrito"}
              </button>
            </aside>
          </div>

          <div className="border-t px-4 py-5 md:px-6 md:py-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Productos relacionados</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => canMoveLeft && setCarouselStart((prev) => Math.max(0, prev - 1))}
                  disabled={!canMoveLeft}
                  className="flex h-9 w-9 items-center justify-center rounded-full border bg-white disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => canMoveRight && setCarouselStart((prev) => Math.min(related.length - 5, prev + 1))}
                  disabled={!canMoveRight}
                  className="flex h-9 w-9 items-center justify-center rounded-full border bg-white disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
              {visibleRelated.map((item) => {
                const itemPrice = item.puntoPasPrice || item.pvpPrice || item.price;
                return (
                  <button
                    key={item.id}
                    onClick={() => onProductSelect?.(item)}
                    className="rounded-xl border border-slate-200 p-2 text-left transition hover:-translate-y-0.5 hover:border-[#FA003F]/60 hover:shadow-md"
                  >
                    <div className="mb-2 rounded-lg bg-slate-50 p-2">
                      <img src={item.image} alt={item.name} className="h-32 w-full object-contain" />
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
    </div>
  );
};
