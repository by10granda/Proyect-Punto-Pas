import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CreditCard, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface StripePaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const StripePaymentForm = ({ amount, onSuccess, onCancel }: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error("Stripe no está cargado. Intenta de nuevo.");
      return;
    }

    setIsProcessing(true);
    setCardError(null);

    try {
      // Crear el método de pago
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement)!,
      });

      if (error) {
        setCardError(error.message || "Error en el pago");
        toast.error(error.message || "Error al procesar la tarjeta");
        setIsProcessing(false);
        return;
      }

      // Aquí normalmente enviarías el paymentMethod.id a tu backend
      // Para este ejemplo, simulamos un pago exitoso
      console.log("PaymentMethod creado:", paymentMethod.id);
      
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("¡Pago procesado exitosamente!");
      onSuccess();
    } catch (err) {
      console.error("Error en el pago:", err);
      toast.error("Error al procesar el pago. Intenta de nuevo.");
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Pago con Tarjeta</h3>
          <p className="text-sm text-gray-500">Ingresa los datos de tu tarjeta</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Información de la Tarjeta
          </label>
          <div className="border-2 border-gray-200 rounded-xl p-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
            <CardElement options={cardElementOptions} />
          </div>
          {cardError && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <span>⚠️</span> {cardError}
            </p>
          )}
        </div>

        <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">Pago Seguro</p>
            <p className="text-xs text-blue-600 mt-1">
              Tus datos están protegidos con encriptación SSL. No almacenamos los datos de tu tarjeta.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <p className="text-sm text-gray-500">Total a pagar:</p>
            <p className="text-2xl font-bold text-gray-900">${amount.toFixed(2)}</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!stripe || isProcessing}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Pagar ${amount.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-6 flex items-center justify-center gap-4 text-gray-400">
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-8 opacity-50" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-8 opacity-50" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-8 opacity-50" />
      </div>
    </div>
  );
};
