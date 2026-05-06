import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, ShoppingBag, Shield } from "lucide-react";
import { toast } from "sonner";
import logoPuntoPas from "@/assets/logo-punto-pas.png";
import { invoiceService, TipoIdentificacionCliente } from "@/services/api";
import { CheckoutSteps } from "@/components/CheckoutSteps";
import { createDatafastCheckout } from "@/services/datafastPayment";

interface CheckoutCustomerData {
  nombre: string;
  apellido: string;
  tipoIdentificacion: TipoIdentificacionCliente;
  numIdentificacion: string;
  email: string;
  telefono: string;
  entrega: "retiro" | "envio";
  sucursal?: string;
}

const STORAGE_KEY = "puntopas_checkout_customer";

declare global {
  interface Window {
    wpwlOptions?: Record<string, unknown>;
  }
}

const getDatafastDocType = (tipoIdentificacion?: TipoIdentificacionCliente) => {
  if (tipoIdentificacion === 2) return "TAXSTATEMENT";
  if (tipoIdentificacion === 3) return "PASSPORT";
  return "IDCARD";
};

const isTrustedDatafastScript = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname.endsWith("oppwa.com") && parsed.pathname === "/v1/paymentWidgets.js";
  } catch {
    return false;
  }
};

export const CheckoutPayment = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [widgetUrl, setWidgetUrl] = useState<string | null>(null);
  const [widgetReady, setWidgetReady] = useState(false);
  const [metodoPago, setMetodoPago] = useState<"transferencia" | "tarjeta">("transferencia");
  const [radioBubbleId, setRadioBubbleId] = useState<string | null>(null);
  const widgetContainerRef = useRef<HTMLDivElement | null>(null);

  const cartData = localStorage.getItem("puntopas_cart");
  const cartItems = cartData ? JSON.parse(cartData) : [];
  const customerRaw = sessionStorage.getItem(STORAGE_KEY);
  const customer = customerRaw ? (JSON.parse(customerRaw) as CheckoutCustomerData) : null;

  const subtotal = cartItems.reduce((sum: number, item: { price: number; quantity: number }) => sum + (item.price * item.quantity), 0);
  const total = subtotal;

  const formatPrice = (price: number) =>
    price.toLocaleString("es-EC", {
      style: "currency",
      currency: "USD",
    });

  useEffect(() => {
    if (!customer) {
      toast.error("Primero completa tus datos para continuar.");
      navigate("/checkout");
    }
  }, [customer, navigate]);

  const createInvoice = async () => {
    if (!customer) return;
    await invoiceService.createFactura({
      cliente: {
        tipoIdentificacion: customer.tipoIdentificacion,
        numIdentificacion: customer.numIdentificacion.trim(),
        direccion: "",
        telefono: customer.telefono?.trim() || "",
        email: customer.email?.trim() || "",
      },
    });
  };

  const handleConfirmTransfer = async () => {
    setIsSubmitting(true);
    try {
      await createInvoice();
      localStorage.removeItem("puntopas_cart");
      sessionStorage.removeItem(STORAGE_KEY);
      toast.success("Pedido registrado con éxito", {
        description: "Te contactaremos para coordinar el pago por transferencia.",
      });
      navigate("/");
    } catch (error: unknown) {
      const statusCode = (error as { statusCode?: number })?.statusCode;
      if (statusCode === 401) toast.error("Sesión no autorizada para facturar. Intenta nuevamente.");
      else if (statusCode === 404) toast.error("No se encontró registro para facturación.");
      else if (statusCode === 500) toast.error("Error interno del servidor al facturar.");
      else toast.error("No se pudo generar la factura. Verifica los datos del cliente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueCard = async () => {
    if (!customer) {
      toast.error("Primero completa tus datos para continuar.");
      navigate("/checkout");
      return;
    }

    if (!cartItems.length || total <= 0) {
      toast.error("Tu carrito esta vacio o el total no es valido.");
      return;
    }

    setIsSubmitting(true);
    try {
      const checkout = await createDatafastCheckout({
        amount: total,
        currency: "USD",
        paymentType: "DB",
        customerDocType: getDatafastDocType(customer.tipoIdentificacion),
      });

      if (!isTrustedDatafastScript(checkout.scriptUrl)) {
        throw new Error("La URL del widget de pago no es confiable.");
      }

      setCheckoutId(checkout.checkoutId);
      setWidgetUrl(checkout.scriptUrl);
      setWidgetReady(false);
      toast.success("Checkout de Datafast creado.");
    } catch (error) {
      toast.error((error as Error)?.message || "No se pudo iniciar pago con tarjeta");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!widgetUrl || !widgetContainerRef.current) return;

    const container = widgetContainerRef.current;
    container.innerHTML = "";

    window.wpwlOptions = {
      locale: "es",
      style: "plain",
      brands: ["VISA", "MASTERCARD", "AMEX"],
      brandDetection: true,
      showCVVHint: true,
      labels: {
        cvv: "CVV",
      },
      onReady: () => {
        const styleId = "datafast-widget-theme";
        const oldStyle = document.getElementById(styleId);
        if (oldStyle) oldStyle.remove();

        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
          .wpwl-form-card {
            max-width: 680px;
            margin: 0;
            padding: 1rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.9rem;
            background: #ffffff;
            box-shadow: none;
          }
          .wpwl-label,
          .wpwl-brand,
          .wpwl-group-brand label {
            color: #0f172a;
            font-weight: 600;
            font-size: 0.9rem;
          }
          .wpwl-control,
          .wpwl-control-cardNumber,
          .wpwl-control-expiry,
          .wpwl-control-cvv,
          .wpwl-control-cardHolder,
          .wpwl-select {
            border: 1px solid #cbd5e1 !important;
            border-radius: 0.7rem !important;
            background: #ffffff !important;
            color: #0f172a !important;
            min-height: 42px;
            box-shadow: none !important;
          }
          .wpwl-control:focus,
          .wpwl-control-cardNumber:focus,
          .wpwl-control-expiry:focus,
          .wpwl-control-cvv:focus,
          .wpwl-control-cardHolder:focus,
          .wpwl-select:focus {
            border-color: #ef4444 !important;
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12) !important;
            outline: none !important;
          }
          .wpwl-button-pay {
            background: #ef4444 !important;
            color: #fff !important;
            border: none !important;
            border-radius: 0.75rem !important;
            min-height: 44px;
            padding: 0 1.2rem !important;
            font-weight: 700 !important;
            box-shadow: none !important;
          }
          .wpwl-button-pay:hover {
            background: #dc2626 !important;
          }
          .wpwl-hint {
            color: #64748b !important;
            font-size: 0.78rem;
          }
          .wpwl-has-error .wpwl-control,
          .wpwl-has-error .wpwl-select {
            border-color: #e11d48 !important;
          }
          @media (max-width: 640px) {
            .wpwl-form-card {
              width: 100% !important;
              max-width: 100% !important;
              padding: 0.85rem !important;
              border-radius: 0.85rem !important;
            }
            .wpwl-group,
            .wpwl-group-brand,
            .wpwl-group-cardNumber,
            .wpwl-group-expiry,
            .wpwl-group-cvv,
            .wpwl-group-cardHolder,
            .wpwl-wrapper {
              width: 100% !important;
              display: block !important;
              float: none !important;
              margin-left: 0 !important;
              margin-right: 0 !important;
            }
            .wpwl-control,
            .wpwl-select {
              width: 100% !important;
              min-height: 44px;
            }
            .wpwl-button-pay {
              width: 100% !important;
              margin-top: 0.5rem !important;
            }
            .wpwl-label,
            .wpwl-brand,
            .wpwl-group-brand label {
              font-size: 0.82rem !important;
            }
          }
        `;

        document.head.appendChild(style);
      },
    };

    const form = document.createElement("form");
    form.setAttribute("action", "/checkout/pago/resultado");
    form.className = "paymentWidgets";
    form.setAttribute("data-brands", "VISA MASTERCARD AMEX");
    container.appendChild(form);

    const script = document.createElement("script");
    script.src = widgetUrl;
    script.async = true;
    script.onload = () => setWidgetReady(true);
    script.onerror = () => {
      setWidgetReady(false);
      toast.error("No se pudo cargar el formulario de tarjeta de Datafast.");
    };

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
      setWidgetReady(false);
      delete window.wpwlOptions;
    };
  }, [widgetUrl]);

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
        <CheckoutSteps activeStep={4} />
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
                Elije tu metodo de pago
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mb-5 sm:mb-6">Selecciona cómo deseas completar tu compra.</p>

              <div className="space-y-3">
                {[{ id: "transferencia", label: "Transferencia bancaria", desc: "Te compartiremos los datos para transferir." }, { id: "tarjeta", label: "Pago con tarjeta", desc: "Pago seguro con tarjeta de crédito o débito." }].map((metodo) => (
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
                      onChange={() => {
                        setMetodoPago(metodo.id as "transferencia" | "tarjeta");
                        setRadioBubbleId(metodo.id);
                        setTimeout(() => setRadioBubbleId(null), 420);
                        setCheckoutId(null);
                        setWidgetUrl(null);
                      }}
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
                          {radioBubbleId === metodo.id && (
                            <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping" />
                          )}
                        </>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {metodoPago === "tarjeta" && !checkoutId && (
                <button
                  onClick={handleContinueCard}
                  disabled={isSubmitting}
                  className="mt-6 w-full md:w-auto px-6 py-3.5 md:py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-70"
                >
                  {isSubmitting ? "Creando checkout..." : "Continuar con tarjeta"}
                </button>
              )}

              {checkoutId && widgetUrl && metodoPago === "tarjeta" && (
                <div className="mt-6 overflow-hidden">
                  {!widgetReady && <p className="text-sm text-slate-600 mb-3">Cargando formulario seguro de tarjeta...</p>}
                  <div ref={widgetContainerRef} />
                  <button
                    onClick={() => {
                      setCheckoutId(null);
                      setWidgetUrl(null);
                      setWidgetReady(false);
                    }}
                    className="mt-4 w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    Cancelar pago con tarjeta
                  </button>
                </div>
              )}

              {metodoPago === "transferencia" && (
                <button
                  onClick={handleConfirmTransfer}
                  disabled={isSubmitting}
                  className="mt-6 w-full md:w-auto px-6 py-3.5 md:py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 disabled:opacity-70"
                >
                  {isSubmitting ? "Procesando..." : "Confirmar por transferencia"}
                </button>
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
