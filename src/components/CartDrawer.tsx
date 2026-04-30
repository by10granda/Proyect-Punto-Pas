import { useMemo } from "react";
import { ShoppingBag } from "lucide-react";
import { Product } from "@/data/products";
import { products } from "@/data/products";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export interface CartItem {
  id: string;
  code: string;
  name: string;
  price: number;
  pvpPrice?: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  products: Product[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onCheckout?: () => void;
}

export const CartDrawer = ({
  isOpen,
  onClose,
  items,
  products,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}: CartDrawerProps) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString("es-EC", {
      style: "currency",
      currency: "USD",
    });
  };

  const { subtotal, total, itemCount } = useMemo(() => {
    const sub = items.reduce((sum, item) => {
      const itemPrice = item.pvpPrice || item.originalPrice || item.price;
      return sum + itemPrice * item.quantity;
    }, 0);
    const tot = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    return { subtotal: sub, total: tot, itemCount: count };
  }, [items]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 bg-white/95 backdrop-blur-sm">
        {/* Header */}
        <SheetHeader className="p-5 bg-red-500">
          <SheetTitle className="text-xl font-light tracking-wide text-white">
            Carrito de compras
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <ShoppingBag className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-light text-gray-500 mb-4">Tu carrito está vacío</h3>
            <button
              onClick={onClose}
              className="bg-gray-900 text-white px-8 py-3 rounded-full text-sm font-light tracking-wide hover:bg-gray-800 transition-colors"
            >
              Explorar productos
            </button>
          </div>
        ) : (
          <>
            {/* Cart items - floating cards */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="relative bg-white rounded-2xl p-3 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                >
                  <div className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-xl object-cover shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-light text-sm text-gray-800 line-clamp-2 mb-1">
                        {item.name}
                      </h4>
                      <p className="text-red-500 font-medium text-base">
                        {formatPrice(item.price)}
                      </p>
                      
                      {/* Quantity controls - minimal */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-sm hover:bg-gray-200 disabled:opacity-40"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-sm font-light">{item.quantity}</span>
                        <button
                          onClick={() => {
                            const product = products.find(p => p.id === item.id);
                            const availableStock = product?.stock || 0;
                            if (item.quantity < availableStock) {
                              onUpdateQuantity(item.id, item.quantity + 1);
                            }
                          }}
                          disabled={item.quantity >= (products.find(p => p.id === item.id)?.stock || 0)}
                          className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-sm hover:bg-gray-200 disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer - minimal */}
            <div className="border-t border-gray-100 p-5 space-y-3 bg-white/80">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-light">Subtotal (sinIVA)</span>
                <span className="text-gray-600 font-light">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-gray-800 font-light">Total</span>
                <span className="text-xl font-light">{formatPrice(total)}</span>
              </div>
              
              <button 
                onClick={onCheckout}
                className="w-full bg-red-500 text-white py-4 rounded-full font-light text-sm tracking-widest hover:bg-red-600 transition-colors"
              >
                CHECKOUT
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
