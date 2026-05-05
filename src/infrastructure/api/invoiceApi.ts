import { fetchWithAuth } from '@/infrastructure/api/fetchWithAuth';
import { ApiError, ApiErrorPayload, FacturaRequest } from '@/infrastructure/api/types';

const VALID_TIPO_IDENTIFICACION = new Set([1, 2, 3, 4, 6]);

const validateFacturaRequest = (factura: FacturaRequest) => {
  if (!factura || typeof factura !== 'object') {
    throw new ApiError('Solicitud de factura inválida', 400, 'INVALID_FACTURA_BODY');
  }

  const { cliente } = factura;
  if (!cliente) {
    throw new ApiError('El nodo cliente es obligatorio', 400, 'MISSING_CLIENTE');
  }

  if (!VALID_TIPO_IDENTIFICACION.has(cliente.tipoIdentificacion)) {
    throw new ApiError('tipoIdentificacion inválido. Use 1, 2, 3, 4 o 6', 400, 'INVALID_TIPO_IDENTIFICACION');
  }

  if (!cliente.numIdentificacion || !cliente.numIdentificacion.trim()) {
    throw new ApiError('numIdentificacion es obligatorio', 400, 'MISSING_NUM_IDENTIFICACION');
  }

  if (cliente.direccion === undefined || cliente.telefono === undefined || cliente.email === undefined) {
    throw new ApiError('direccion, telefono y email deben enviarse según manual', 400, 'MISSING_CLIENT_FIELDS');
  }
};

export const invoiceService = {
  async createFactura(factura: FacturaRequest): Promise<Record<string, unknown>> {
    validateFacturaRequest(factura);

    try {
      const response = await fetchWithAuth('/factura', {
        method: 'POST',
        body: JSON.stringify({
          cliente: factura.cliente,
        }),
      });

      if (response.status === 401) {
        throw new ApiError('No autorizado: token ausente, inválido o caducado', 401, 'UNAUTHORIZED');
      }

      if (response.status === 404) {
        throw new ApiError('No se encontró registro', 404, 'NOT_FOUND');
      }

      if (response.status === 500) {
        throw new ApiError('Error interno del servidor', 500, 'INTERNAL_SERVER_ERROR');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as ApiErrorPayload));
        throw new ApiError(errorData.detail || `Error al crear factura: ${response.status}`, response.status, errorData.type);
      }

      const data = (await response.json()) as Record<string, unknown>;
      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Error al crear factura: ${(error as Error).message}`, 0);
    }
  },
};
