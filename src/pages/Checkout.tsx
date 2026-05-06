import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Truck, Phone, User, Mail, ShoppingBag, Shield } from "lucide-react";
import { toast } from "sonner";
import logoPuntoPas from "@/assets/logo-punto-pas.png";
import { TipoIdentificacionCliente } from "@/services/api";
import { CheckoutSteps } from "@/components/CheckoutSteps";

interface CheckoutForm {
  nombre: string;
  apellido: string;
  tipoIdentificacion: TipoIdentificacionCliente;
  numIdentificacion: string;
  email: string;
  telefono: string;
  entrega: "retiro";
  sucursal?: string;
  acceptedPolicies: boolean;
}

export const Checkout = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<CheckoutForm>({
    nombre: "",
    apellido: "",
    tipoIdentificacion: 2,
    numIdentificacion: "",
    email: "",
    telefono: "",
    entrega: "retiro",
    sucursal: "",
    acceptedPolicies: false,
  });

  const CHECKOUT_STORAGE_KEY = "puntopas_checkout_customer";

  // Get cart from localStorage for demo
  const cartData = localStorage.getItem("puntopas_cart");
  const cartItems = cartData ? JSON.parse(cartData) : [];
  const subtotal = cartItems.reduce((sum: number, item: { price: number; quantity: number }) => sum + (item.price * item.quantity), 0);
  const total = subtotal;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.nombre || !form.apellido || !form.telefono || !form.numIdentificacion || !form.sucursal) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    if (!form.acceptedPolicies) {
      toast.error("Debes aceptar las políticas de compra para continuar.");
      return;
    }

    setIsSubmitting(true);

    sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(form));
    setIsSubmitting(false);
    navigate("/checkout/pago");
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("es-EC", {
      style: "currency",
      currency: "USD",
    });
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-lg">
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4 max-w-7xl mx-auto gap-3">
          <Link 
            to="/compra" 
            className="inline-flex items-center gap-2 text-primary-foreground/90 hover:text-primary-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <img src={logoPuntoPas} alt="Punto Pas" className="w-10 h-10 rounded-lg" />
            <span className="text-xl font-black tracking-tight hidden sm:block">PUNTO PAS</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Compra segura</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5 sm:py-8">
        <CheckoutSteps activeStep={2} />
        <div className="lg:hidden mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Resumen</p>
              <p className="text-sm text-slate-600">{cartItems.length} {cartItems.length === 1 ? "producto" : "productos"}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-xl font-black text-primary">{formatPrice(total)}</p>
            </div>
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-5 lg:gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* Datos personales */}
              <div className="bg-card rounded-2xl shadow-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Datos Personales
                </h2>
                <p className="text-sm text-muted-foreground mb-5 sm:mb-6">Ingresa tus datos para registrar la compra.</p>
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm sm:text-base"
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      name="apellido"
                      value={form.apellido}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm sm:text-base"
                      placeholder="Tu apellido"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Tipo de identificación *
                    </label>
                    <select
                      name="tipoIdentificacion"
                      value={String(form.tipoIdentificacion)}
                      onChange={(e) => setForm((prev) => ({ ...prev, tipoIdentificacion: Number(e.target.value) as TipoIdentificacionCliente }))}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm sm:text-base"
                      required
                    >
                      <option value="1">RUC</option>
                      <option value="2">CÉDULA</option>
                      <option value="3">PASAPORTE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Número de identificación *
                    </label>
                    <input
                      type="text"
                      name="numIdentificacion"
                      value={form.numIdentificacion}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm sm:text-base"
                      placeholder="Ej: 0850465030"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm sm:text-base"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={form.telefono}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm sm:text-base"
                      placeholder="+593 99 999 9999"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Entrega */}
              <div className="bg-card rounded-2xl shadow-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  Entrega
                </h2>
                <p className="text-sm text-muted-foreground mb-5 sm:mb-6">Todas las compras se entregan solo por retiro en tienda.</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 border-primary bg-primary/5">
                    <span className="text-xl sm:text-2xl">🏬</span>
                    <div className="flex-1">
                      <span className="font-semibold text-foreground block text-sm sm:text-base">Retiro en tienda</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">Retira tu pedido con cédula y número de orden</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium text-foreground mb-2">Selecciona sucursal *</label>
                    <select
                      name="sucursal"
                      value={form.sucursal}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm sm:text-base"
                      required
                    >
                      <option value="">-- Seleccionar --</option>
                      <option value="esmeraldas">Esmeraldas</option>
                      <option value="san_lorenzo" disabled>San Lorenzo (Próximamente)</option>
                      <option value="stihl_san_lorenzo" disabled>Stihl San Lorenzo (Próximamente)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit button for mobile */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.acceptedPolicies}
                    onChange={(e) => setForm((prev) => ({ ...prev, acceptedPolicies: e.target.checked }))}
                    className="mt-1 w-4 h-4"
                  />
                  <span className="text-sm text-slate-700">
                    He leído y acepto las{" "}
                    <Link to="/politicas" target="_blank" className="text-primary font-semibold hover:underline">
                      políticas de compra, cancelación y devolución
                    </Link>
                    .
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="lg:hidden w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-200 shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Continuar a pago - {formatPrice(total)}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Resumen del pedido */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-card rounded-2xl shadow-lg p-4 sm:p-6 lg:sticky lg:top-24">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Resumen del Pedido
              </h2>
              
              {cartItems.length > 0 ? (
                <>
                  <div className="space-y-4 max-h-64 overflow-y-auto mb-6">
                    {cartItems.map((item: { id: string; name: string; image: string; quantity: number; price: number }) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
                          <p className="text-sm font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-black border-t border-border pt-3">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(total)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Tu carrito está vacío</p>
                  <Link to="/" className="text-primary font-medium hover:underline mt-2 inline-block">
                    Ir a comprar
                  </Link>
                </div>
              )}

              {/* Submit button for desktop */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || cartItems.length === 0}
                className="hidden lg:flex w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg items-center justify-center gap-2 mt-6 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Confirmar Pedido
                  </>
                )}
              </button>

              {/* Trust badges */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>Pago seguro</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
