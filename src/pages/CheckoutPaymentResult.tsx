import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { confirmPayphoneTransaction } from "@/services/payphonePayment";
import { invoiceService, TipoIdentificacionCliente } from "@/services/api";

interface CheckoutCustomerData {
  tipoIdentificacion: TipoIdentificacionCliente;
  numIdentificacion: string;
  email: string;
  telefono: string;
}

const STORAGE_KEY = "puntopas_checkout_customer";

const CheckoutPaymentResult = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed" | "invoice_failed">("loading");
  const [message, setMessage] = useState("Validando resultado de pago...");
  const hasProcessedResult = useRef(false);

  const buildInvoicePayload = () => {
    const customerRaw = sessionStorage.getItem(STORAGE_KEY);
    const customer = customerRaw ? (JSON.parse(customerRaw) as CheckoutCustomerData) : null;
    if (!customer) return null;

    return {
      cliente: {
        tipoIdentificacion: customer.tipoIdentificacion,
        numIdentificacion: customer.numIdentificacion.trim(),
        direccion: "",
        telefono: customer.telefono?.trim() || "",
        email: customer.email?.trim() || "",
      },
    };
  };

  const retryInvoice = async () => {
    try {
      const payload = buildInvoicePayload();
      if (!payload) {
        setStatus("invoice_failed");
        setMessage("Pago aprobado, pero no hay datos del cliente para facturar.");
        return;
      }

      await invoiceService.createFactura(payload);
      localStorage.removeItem("puntopas_cart");
      sessionStorage.removeItem(STORAGE_KEY);
      setStatus("success");
      setMessage("Pago y factura procesados correctamente.");
      toast.success("Factura generada con exito");
    } catch (error) {
      setStatus("invoice_failed");
      setMessage((error as Error)?.message || "Pago aprobado, pero no se pudo generar la factura.");
    }
  };

  useEffect(() => {
    const run = async () => {
      if (hasProcessedResult.current) return;
      hasProcessedResult.current = true;

      const idParam = Number(searchParams.get("id") || 0);
      const clientTransactionId = searchParams.get("clientTransactionId") || "";

      if (!idParam || !clientTransactionId) {
        setStatus("failed");
        setMessage("No llegaron los datos de confirmacion de Payphone.");
        return;
      }

      try {
        const expectedClientTx = sessionStorage.getItem("puntopas_payphone_client_tx");
        if (expectedClientTx && expectedClientTx !== clientTransactionId) {
          setStatus("failed");
          setMessage("La transaccion recibida no coincide con la transaccion iniciada.");
          return;
        }

        const paymentStatus = await confirmPayphoneTransaction({ id: idParam, clientTxId: clientTransactionId });
        const isApproved = paymentStatus?.statusCode === 3 || String(paymentStatus?.transactionStatus || "").toLowerCase() === "approved";

        if (!isApproved) {
          setStatus("failed");
          setMessage(paymentStatus?.message || "Pago no aprobado por Payphone.");
          return;
        }

        const payload = buildInvoicePayload();

        if (!payload) {
          setStatus("success");
          setMessage("Pago aprobado. No se encontraron datos de cliente para facturar.");
          return;
        }

        try {
          await invoiceService.createFactura(payload);
          localStorage.removeItem("puntopas_cart");
          sessionStorage.removeItem(STORAGE_KEY);
          sessionStorage.removeItem("puntopas_payphone_client_tx");
          setStatus("success");
          setMessage("Pago y factura procesados correctamente.");
          toast.success("Pago completado con exito");
        } catch (invoiceError) {
          setStatus("invoice_failed");
          setMessage(`Pago aprobado, pero fallo la facturacion: ${(invoiceError as Error)?.message || "Error desconocido"}`);
        }
      } catch (error) {
        setStatus("failed");
        setMessage((error as Error)?.message || "No se pudo validar el pago.");
      }
    };

    void run();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-white border border-slate-200 rounded-2xl p-8 text-center">
        {status === "loading" && <LoaderCircle className="w-12 h-12 text-primary mx-auto animate-spin" />}
        {status === "success" && <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />}
        {status === "failed" && <XCircle className="w-12 h-12 text-rose-600 mx-auto" />}
        {status === "invoice_failed" && <CheckCircle2 className="w-12 h-12 text-amber-500 mx-auto" />}

        <h1 className="mt-4 text-2xl font-black text-slate-900">Resultado del pago Payphone</h1>
        <p className="mt-2 text-slate-600">{message}</p>

        <div className="mt-6 flex justify-center gap-3">
          <Link to="/" className="px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90">
            Volver al inicio
          </Link>
          {status === "invoice_failed" ? (
            <button onClick={() => void retryInvoice()} className="px-5 py-3 rounded-xl border border-slate-300 font-semibold hover:bg-slate-100">
              Reintentar facturacion
            </button>
          ) : (
            <button onClick={() => navigate("/checkout/pago")} className="px-5 py-3 rounded-xl border border-slate-300 font-semibold hover:bg-slate-100">
              Intentar de nuevo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPaymentResult;
