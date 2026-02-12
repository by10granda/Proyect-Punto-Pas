import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Truck, MapPin, Phone, User, Mail, Check, ShoppingBag, Shield } from "lucide-react";
import { Elements } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import logoPuntoPas from "@/assets/logo-punto-pas.png";
import { stripePromise } from "@/lib/stripe";
import { StripePaymentForm } from "@/components/StripePaymentForm";

interface CheckoutForm {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  referencia: string;
  metodoPago: "efectivo" | "transferencia" | "tarjeta" | "retiro";
  sucursal?: string;
}

export const Checkout = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [form, setForm] = useState<CheckoutForm>({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    provincia: "",
    referencia: "",
    metodoPago: "efectivo",
    sucursal: ""
  });

  // Get cart from localStorage for demo
  const cartData = localStorage.getItem("puntopas_cart");
  const cartItems = cartData ? JSON.parse(cartData) : [];
  const subtotal = cartItems.reduce((sum: number, item: { price: number; quantity: number }) => sum + (item.price * item.quantity), 0);
  const envio = subtotal > 100 ? 0 : 5;
  const total = subtotal + envio;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica: si el método es retiro en tienda no requerimos dirección/ciudad,
    // pero sí requerimos seleccionar una sucursal.
    if (!form.nombre || !form.apellido || !form.telefono ||
      (form.metodoPago !== "retiro" && (!form.direccion || !form.ciudad)) ||
      (form.metodoPago === "retiro" && !form.sucursal)
    ) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    // Si el método de pago es tarjeta, mostrar formulario de Stripe
    if (form.metodoPago === "tarjeta") {
      setShowStripeForm(true);
      return;
    }

    setIsSubmitting(true);
    
    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Limpiar carrito
    localStorage.removeItem("puntopas_cart");
    
    toast.success("¡Pedido realizado con éxito!", {
      description: "Nos pondremos en contacto contigo pronto."
    });
    
    setIsSubmitting(false);
    navigate("/");
  };

  const handlePaymentSuccess = () => {
    // Limpiar carrito después del pago exitoso
    localStorage.removeItem("puntopas_cart");
    toast.success("¡Pago completado con éxito!");
    navigate("/");
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
        <div className="flex items-center justify-between px-4 py-4 max-w-7xl mx-auto">
          <Link 
            to="/" 
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Datos personales */}
              <div className="bg-card rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Datos Personales
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
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
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="Tu apellido"
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
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
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
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="+593 99 999 9999"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Dirección de envío */}
              <div className="bg-card rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  Dirección de Envío
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Dirección completa *
                    </label>
                    <input
                      type="text"
                      name="direccion"
                      value={form.direccion}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="Calle, número, barrio"
                      required
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        name="ciudad"
                        value={form.ciudad}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="Tu ciudad"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Provincia
                      </label>
                      <input
                        type="text"
                        name="provincia"
                        value={form.provincia}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="Tu provincia"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Referencia de ubicación
                    </label>
                    <textarea
                      name="referencia"
                      value={form.referencia}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
                      placeholder="Cerca de..., frente a..., color de casa..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Método de pago */}
              <div className="bg-card rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Método de Pago
                </h2>
                <div className="space-y-3">
                  {[
                    { id: "efectivo", label: "Pago contra entrega", desc: "Paga en efectivo al recibir tu pedido", icon: "💵" },
                    { id: "transferencia", label: "Transferencia bancaria", desc: "Te enviaremos los datos para transferir", icon: "🏦" },
                    { id: "tarjeta", label: "Tarjeta de crédito/débito", desc: "Pago seguro con tarjeta", icon: "💳" },
                    { id: "retiro", label: "Retiro en tienda / Envío", desc: "Retira tu pedido en tienda o elige envío a domicilio", icon: "🏬" },
                  ].map((metodo) => (
                    <label
                      key={metodo.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        form.metodoPago === metodo.id 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="metodoPago"
                        value={metodo.id}
                        checked={form.metodoPago === metodo.id}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span className="text-2xl">{metodo.icon}</span>
                      <div className="flex-1">
                        <span className="font-semibold text-foreground block">{metodo.label}</span>
                        <span className="text-sm text-muted-foreground">{metodo.desc}</span>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        form.metodoPago === metodo.id 
                          ? "border-primary bg-primary" 
                          : "border-border"
                      }`}>
                        {form.metodoPago === metodo.id && (
                          <Check className="w-4 h-4 text-primary-foreground" />
                        )}
                      </div>
                    </label>
                  ))}

                  {/* If method is retiro, show branch selector */}
                  {form.metodoPago === "retiro" && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-foreground mb-2">Selecciona sucursal *</label>
                      <select
                        name="sucursal"
                        value={form.sucursal}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      >
                        <option value="">-- Seleccionar --</option>
                        <option value="esmeraldas">Esmeraldas</option>
                        <option value="san_lorenzo">San Lorenzo</option>
                      </select>
                    </div>
                  )}

                  {/* Stripe Payment Form */}
                  {showStripeForm && form.metodoPago === "tarjeta" && (
                    <div className="mt-6">
                      <Elements stripe={stripePromise}>
                        <StripePaymentForm
                          amount={total}
                          onSuccess={handlePaymentSuccess}
                          onCancel={() => setShowStripeForm(false)}
                        />
                      </Elements>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit button for mobile */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="lg:hidden w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Confirmar Pedido - {formatPrice(total)}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl shadow-lg p-6 sticky top-24">
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
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Envío</span>
                      <span className={`font-medium ${envio === 0 ? "text-green-600" : ""}`}>
                        {envio === 0 ? "¡GRATIS!" : formatPrice(envio)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-black border-t border-border pt-3">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(total)}</span>
                    </div>
                  </div>

                  {envio > 0 && (
                    <p className="text-xs text-muted-foreground text-center mt-4 bg-muted p-2 rounded-lg">
                      🚚 ¡Agrega {formatPrice(100 - subtotal)} más para envío gratis!
                    </p>
                  )}
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
                  <div className="flex items-center gap-1">
                    <Truck className="w-4 h-4" />
                    <span>Envío rápido</span>
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
