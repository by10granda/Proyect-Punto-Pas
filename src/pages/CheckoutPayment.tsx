import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, ShoppingBag, Shield } from "lucide-react";
import { toast } from "sonner";
import logoPuntoPas from "@/assets/logo-punto-pas.png";
import { invoiceService, TipoIdentificacionCliente } from "@/services/api";
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

const PAYPHONE_SCRIPT = "https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.js";
const PAYPHONE_CSS = "https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.css";

export const CheckoutPayment = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPayphoneReady, setIsPayphoneReady] = useState(false);
  const [metodoPago, setMetodoPago] = useState<"transferencia" | "tarjeta">("transferencia");
  const [radioBubbleId, setRadioBubbleId] = useState<string | null>(null);
  const payphoneContainerRef = useRef<HTMLDivElement | null>(null);

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

  const payphoneToken = import.meta.env.VITE_PAYPHONE_TOKEN as string | undefined;
  const payphoneStoreId = import.meta.env.VITE_PAYPHONE_STORE_ID as string | undefined;

  const ensurePayphoneAssets = async () => {
    const hasCss = document.querySelector(`link[href="${PAYPHONE_CSS}"]`);
    if (!hasCss) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = PAYPHONE_CSS;
      document.head.appendChild(link);
    }

    if (window.PPaymentButtonBox) return;

    await new Promise<void>((resolve, reject) => {
      const hasScript = document.querySelector(`script[src="${PAYPHONE_SCRIPT}"]`) as HTMLScriptElement | null;
      if (hasScript) {
        hasScript.addEventListener("load", () => resolve(), { once: true });
        hasScript.addEventListener("error", () => reject(new Error("No se pudo cargar SDK de Payphone")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = PAYPHONE_SCRIPT;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("No se pudo cargar SDK de Payphone"));
      document.body.appendChild(script);
    });
  };

  const getPayphoneIdentificationType = (tipoIdentificacion?: TipoIdentificacionCliente) => {
    if (tipoIdentificacion === 1) return 2;
    if (tipoIdentificacion === 3) return 3;
    return 1;
  };

  const buildClientTransactionId = () => {
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `PP-${Date.now()}-${random}`.slice(0, 50);
  };

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

  useEffect(() => {
    const renderPayphone = async () => {
      if (metodoPago !== "tarjeta" || !customer || !payphoneContainerRef.current) return;

      if (!payphoneToken || !payphoneStoreId) {
        setIsPayphoneReady(false);
        toast.error("Faltan credenciales de Payphone en el frontend.");
        return;
      }

      if (!cartItems.length || total <= 0) {
        setIsPayphoneReady(false);
        return;
      }

      try {
        setIsPayphoneReady(false);
        await ensurePayphoneAssets();

        const clientTransactionId = buildClientTransactionId();
        sessionStorage.setItem("puntopas_payphone_client_tx", clientTransactionId);

        const amount = Math.round(total * 100);

        payphoneContainerRef.current.innerHTML = "";
        const mount = document.createElement("div");
        mount.id = "pp-button";
        payphoneContainerRef.current.appendChild(mount);

        if (!window.PPaymentButtonBox) {
          throw new Error("SDK Payphone no inicializado.");
        }

        const normalizedStoreId = String(payphoneStoreId || "").trim();
        if (!normalizedStoreId) {
          throw new Error("StoreID de Payphone invalido.");
        }

        const ppbConfig: Record<string, unknown> = {
          token: payphoneToken,
          clientTransactionId,
          amount,
          amountWithoutTax: amount,
          amountWithTax: 0,
          tax: 0,
          service: 0,
          tip: 0,
          currency: "USD",
          storeId: normalizedStoreId,
          reference: `Pago Punto Pas ${clientTransactionId}`.slice(0, 100),
          lang: "es",
          defaultMethod: "card",
          timeZone: -5,
        };

        const cleanDocument = (customer.numIdentificacion || "").replace(/\s+/g, "").trim();
        if (customer.email?.trim()) ppbConfig.email = customer.email.trim();
        if (cleanDocument) {
          ppbConfig.documentId = cleanDocument;
          ppbConfig.identificationType = getPayphoneIdentificationType(customer.tipoIdentificacion);
        }

        const ppb = new window.PPaymentButtonBox(ppbConfig);

        ppb.render("pp-button");
        setIsPayphoneReady(true);
      } catch (error) {
        setIsPayphoneReady(false);
        toast.error((error as Error)?.message || "No se pudo cargar Payphone.");
      }
    };

    void renderPayphone();
  }, [metodoPago, customer, total, cartItems.length, payphoneToken, payphoneStoreId]);

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
                Elige tu metodo de pago
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mb-5 sm:mb-6">Selecciona como deseas completar tu compra con Payphone o transferencia.</p>

              <div className="space-y-3">
                {[{ id: "transferencia", label: "Transferencia bancaria", desc: "Te compartiremos los datos para transferir." }, { id: "tarjeta", label: "Pago en linea con Payphone", desc: "Pago seguro con tarjeta o saldo Payphone." }].map((metodo) => (
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

              {metodoPago === "tarjeta" && (
                <div className="mt-6 overflow-hidden">
                  {!isPayphoneReady && <p className="text-sm text-slate-600 mb-3">Cargando cajita segura de Payphone...</p>}
                  <div ref={payphoneContainerRef} />
                  <p className="mt-3 text-xs text-slate-500">Al completar el pago, seras redirigido para confirmar la transaccion en segundos.</p>
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
