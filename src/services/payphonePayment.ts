export interface PayphoneConfirmResponse {
  statusCode?: number;
  transactionStatus?: string;
  clientTransactionId?: string;
  authorizationCode?: string;
  transactionId?: number;
  amount?: number;
  message?: string | null;
  errorCode?: number;
}

const parseJsonResponse = async (response: Response) => {
  const raw = await response.text();
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error("Respuesta invalida del backend de pagos.");
  }
};

export const confirmPayphoneTransaction = async (payload: { id: number; clientTxId: string }) => {
  const response = await fetch("/api/payments/payphone/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(data?.details || data?.message || data?.error || "No se pudo confirmar pago en Payphone");
  }

  return data as PayphoneConfirmResponse;
};
