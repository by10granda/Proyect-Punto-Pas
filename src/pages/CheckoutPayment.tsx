import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, ShoppingBag, Shield } from "lucide-react";
import { toast } from "sonner";
import logoPuntoPas from "@/assets/logo-punto-pas.png";
import { TipoIdentificacionCliente } from "@/services/api";
import { CheckoutSteps } from "@/components/CheckoutSteps";

interface CheckoutCustomerData {
  nombre: string;
  apellido: string;
  tipoIdentificacion: TipoIdentificacionCliente;
  numIdentificacion: string;
  email: string;
  telefono: string;
  entrega: "retiro";
  sucursal?: string;
}

const STORAGE_KEY = "puntopas_checkout_customer";

declare global {
  interface Window {
    PPaymentButtonBox?: new (config: Record<string, unknown>) => { render: (target: string) => void };
  }
}

export const CheckoutPayment = () => {
  const navigate = useNavigate();
  const [metodoPago, setMetodoPago] = useState<"transferencia" | "tarjeta">("transferencia");
  const [whatsappSent, setWhatsappSent] = useState(false);

  const cartItems = useMemo(() => {
    const cartData = localStorage.getItem("puntopas_cart");
    return cartData ? JSON.parse(cartData) : [];
  }, []);

  const customer = useMemo(() => {
    const customerRaw = sessionStorage.getItem(STORAGE_KEY);
    return customerRaw ? (JSON.parse(customerRaw) as CheckoutCustomerData) : null;
  }, []);

  const subtotal = useMemo(
    () => cartItems.reduce((sum: number, item: { price: number; quantity: number }) => sum + (item.price * item.quantity), 0),
    [cartItems],
  );
  const total = subtotal;

  const formatPrice = (price: number) =>
    price.toLocaleString("es-EC", {
      style: "currency",
      currency: "USD",
    });

  const getIdentificationLabel = (tipo: TipoIdentificacionCliente) => {
    switch (tipo) {
      case 1:
        return "RUC";
      case 2:
        return "CEDULA";
      case 3:
        return "PASAPORTE";
      default:
        return "IDENTIFICACION";
    }
  };

  const buildWhatsappMessage = () => {
    const customerName = customer ? `${customer.nombre} ${customer.apellido}`.trim() : "";
    const identificationType = customer ? getIdentificationLabel(customer.tipoIdentificacion) : "";
    const identificationNumber = customer?.numIdentificacion?.trim() || "";
    const phone = customer?.telefono?.trim() || "";
    const email = customer?.email?.trim() || "";
    const branch = customer?.sucursal || "";

    const productLines = cartItems.map((item: { code?: string; quantity: number; name: string }) => {
      const code = String(item.code || "").trim() || "SIN_CODIGO";
      return `- CODIGO: ${code} | CANTIDAD: ${item.quantity} | DESCRIPCION: ${item.name}`;
    });

    return [
      "Hola, quiero finalizar mi compra por deposito/transferencia.",
      "",
      "PRODUCTOS:",
      ...productLines,
      "",
      `TOTAL: ${formatPrice(total)}`,
      "",
      "DATOS DE FACTURACION:",
      `NOMBRE: ${customerName}`,
      `${identificationType}: ${identificationNumber}`,
      `TELEFONO: ${phone}`,
      `EMAIL: ${email || "NO REGISTRADO"}`,
      `SUCURSAL DE RETIRO: ${branch || "NO REGISTRADA"}`,
    ].join("\n");
  };

  const handleTransferencia = () => {
    if (!customer) {
      toast.error("Primero completa tus datos para continuar.");
      navigate("/checkout");
      return;
    }

    if (!cartItems.length) {
      toast.error("Tu carrito esta vacio.");
      return;
    }

    const WHATSAPP_NUMBER = "593959990999";
    const message = buildWhatsappMessage();
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setWhatsappSent(true);
  };


  useEffect(() => {
    if (!customer) {
      toast.error("Primero completa tus datos para continuar.");
      navigate("/checkout");
    }
  }, [customer, navigate]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-lg">
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4 max-w-7xl mx-auto gap-3">
          <Link to="/checkout" className="inline-flex items-center gap-2 text-primary-foreground/90 hover:text-primary-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver</span>
          </Link>
          <div className="flex items-center gap-3">
            <img src={logoPuntoPas} alt="Punto Pas" className="w-10 h-10 rounded-lg" />
            <span className="text-xl font-black tracking-tight hidden sm:block">PUNTO PAS</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Proceso seguro</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5 sm:py-8">
        <CheckoutSteps activeStep={3} />
        <div className="lg:hidden mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total a pagar</p>
              <p className="text-sm text-slate-600">{cartItems.length} {cartItems.length === 1 ? "producto" : "productos"}</p>
            </div>
            <p className="text-2xl font-black text-primary">{formatPrice(total)}</p>
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-5 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 mb-2" style={{ fontFamily: "Nunito, sans-serif" }}>
                Elige tu metodo de pago
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mb-5 sm:mb-6">Selecciona como deseas completar tu compra con Datafast o transferencia.</p>

              <div className="space-y-3">
                {[
                  { id: "transferencia", label: "Deposito o transferencia", desc: "Completa tu venta por WhatsApp" },
                  { id: "tarjeta", label: "Pago en linea con Datafast", desc: "Proximamente" },
                ].map((metodo) => (
                  <label
                    key={metodo.id}
                    className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      metodoPago === metodo.id ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="metodoPago"
                      value={metodo.id}
                      checked={metodoPago === metodo.id}
                      onChange={() => setMetodoPago(metodo.id as "transferencia" | "tarjeta")}
                      className="sr-only"
                    />
                    <CreditCard className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <span className="font-semibold text-slate-900 block text-sm sm:text-base">{metodo.label}</span>
                      <span className="text-xs sm:text-sm text-slate-600">{metodo.desc}</span>
                    </div>
                    <div className={`relative w-6 h-6 rounded-full border-2 flex flex-shrink-0 items-center justify-center ${metodoPago === metodo.id ? "border-primary bg-primary" : "border-slate-300"}`}>
                      {metodoPago === metodo.id && (
                        <>
                          <span className="text-white text-sm leading-none font-bold">-</span>
                        </>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {metodoPago === "transferencia" ? (
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-base font-semibold text-slate-800">Compra por WhatsApp</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Enviaremos al vendedor tu pedido con codigo, cantidad, descripcion y tus datos de facturacion para continuar la venta por deposito o transferencia.
                  </p>
                  <button
                    type="button"
                    onClick={handleTransferencia}
                    className="mt-4 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1fb45a] text-white font-semibold"
                  >
                    Continuar por WhatsApp
                  </button>
                  {whatsappSent && (
                    <p className="mt-3 text-sm font-medium text-emerald-700">
                      Dentro de las proximas 3 horas un vendedor te contactara personalmente y la venta se realizara por WhatsApp.
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-base font-semibold text-slate-800">Proximamente</p>
                  <p className="mt-1 text-sm text-slate-600">Estamos habilitando el pago en linea con Datafast.</p>
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 lg:sticky lg:top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Resumen del Pedido
              </h2>
              {cartItems.length > 0 ? (
                <>
                  <div className="space-y-4 max-h-64 overflow-y-auto mb-6">
                    {cartItems.map((item: { id: string; name: string; image: string; quantity: number; price: number }) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 text-sm truncate">{item.name}</p>
                          <p className="text-xs text-slate-500">Cantidad: {item.quantity}</p>
                          <p className="text-sm font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-200 pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-black border-t border-slate-200 pt-3">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(total)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-500">Tu carrito está vacío</p>
                  <Link to="/" className="text-primary font-medium hover:underline mt-2 inline-block">
                    Ir a comprar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPayment;
