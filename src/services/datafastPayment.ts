interface CreateCheckoutRequest {
  amount: number;
  currency: string;
  paymentType: string;
  customerDocType?: string;
}

export interface CreateCheckoutResponse {
  checkoutId: string;
  scriptUrl: string;
  shopperResultURL: string;
  result?: {
    code?: string;
    description?: string;
  };
}

export interface DatafastStatusResponse {
  paymentState?: "approved" | "pending" | "rejected";
  verified?: boolean;
  result?: {
    code?: string;
    description?: string;
  };
}

const parseJsonResponse = async (response: Response) => {
  const raw = await response.text();
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error("Respuesta invalida del backend de pagos. Verifica que el servidor local este activo.");
  }
};

export const createDatafastCheckout = async (payload: CreateCheckoutRequest): Promise<CreateCheckoutResponse> => {
  const response = await fetch("/api/payments/datafast/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(data?.details || data?.error || "No se pudo crear checkout en Datafast");
  }

  return data as CreateCheckoutResponse;
};

export const fetchDatafastStatus = async (checkoutId: string, resourcePath: string): Promise<DatafastStatusResponse> => {
  const params = new URLSearchParams({ checkoutId, resourcePath });
  const response = await fetch(`/api/payments/datafast/status?${params.toString()}`);
  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new Error(data?.details || data?.error || "No se pudo consultar estado en Datafast");
  }

  return data as DatafastStatusResponse;
};
