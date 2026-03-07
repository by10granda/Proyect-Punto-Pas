import { Minus, Plus, ShoppingBag, Trash2, ShoppingCart } from "lucide-react";
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
  originalPrice?: number;
  discount?: number;
  image: string;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onCheckout?: () => void;
}

export const CartDrawer = ({
  isOpen,
  onClose,
  items,
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

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 bg-gradient-to-b from-card to-background">
        {/* Header */}
        <SheetHeader className="p-4 bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-3 text-primary-foreground">
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-lg font-bold">Mi Carrito</span>
                <span className="text-sm font-normal opacity-90">{itemCount} productos</span>
              </div>
            </SheetTitle>
            {/* Close button is provided by SheetContent to avoid duplicate X buttons */}
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-16 h-16 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Tu carrito está vacío
            </h3>
            <p className="text-muted-foreground text-center mb-6">
              ¡Explora nuestros productos y agrega lo que necesites!
            </p>
            <button
              onClick={onClose}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-bold transition-colors"
            >
              Ver productos
            </button>
          </div>
        ) : (
          <>
            {/* Clear cart button */}
            {items.length > 0 && (
              <div className="px-4 py-2 border-b border-border">
                <button
                  onClick={onClearCart}
                  className="text-destructive text-sm font-medium hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Vaciar carrito
                </button>
              </div>
            )}

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 bg-card rounded-xl p-3 shadow-card border border-border"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-border"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm line-clamp-2 mb-1">
                      {item.name}
                    </h4>
                    <p className="text-primary font-bold text-xl">
                      {formatPrice(item.price)}
                    </p>
                    
                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 bg-muted rounded-full p-1">
                        <button
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 rounded-full bg-card flex items-center justify-center hover:bg-border transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-bold">{item.quantity}</span>
                        <button
                          onClick={() => {
                            const availableStock = products.find(p => p.id === item.id)?.stock || 0;
                            if (item.quantity < availableStock) {
                              onUpdateQuantity(item.id, item.quantity + 1);
                            }
                          }}
                          disabled={item.quantity >= (products.find(p => p.id === item.id)?.stock || 0)}
                          className="w-8 h-8 rounded-full bg-card flex items-center justify-center hover:bg-border transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="w-9 h-9 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-border p-4 space-y-4 bg-card shadow-lg">
              {/* Summary */}
              <div className="bg-muted rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({itemCount} productos)</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span>Total a pagar</span>
                  <span className="text-primary text-xl">{formatPrice(subtotal)}</span>
                </div>
              </div>
              
              <button 
                onClick={onCheckout}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Proceder al pago
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
