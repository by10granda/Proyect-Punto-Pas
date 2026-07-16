import { fetchWithAuth } from '@/infrastructure/api/fetchWithAuth';
import { ApiClassificationItem, ApiError, ApiErrorPayload, ApiInventoryItem, ApiProductItem } from '@/infrastructure/api/types';

interface ApiInventoryReportItem {
  codigo: string;
  disponibilidad?: number;
  bodegas?: Array<{
    bodegaALMACEN?: string;
    stock?: number;
  }>;
}

const mapInventoryReport = (items: ApiInventoryReportItem[]): ApiInventoryItem[] => {
  return items.map((item) => {
    const availability = Number(item.disponibilidad);
    const fallbackStockFromWarehouses = Array.isArray(item.bodegas)
      ? item.bodegas.reduce((sum, warehouse) => sum + Number(warehouse.stock || 0), 0)
      : Number.NaN;

    return {
      codigo: item.codigo,
      disponible: Number.isFinite(availability) ? availability : fallbackStockFromWarehouses,
    };
  });
};

const fetchInventoryEndpoint = async (endpoint: string): Promise<unknown[]> => {
  const response = await fetchWithAuth(endpoint);

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({} as ApiErrorPayload));
    throw new ApiError(
      errorData.detail || `Error al obtener inventario: ${response.status}`,
      response.status,
      errorData.type
    );
  }

  const data = (await response.json()) as unknown;
  return Array.isArray(data) ? data : [];
};

export const productService = {
  async getProducts(): Promise<ApiProductItem[]> {
    try {
      const response = await fetchWithAuth('/item/search3');

      if (response.status === 404) {
        return [];
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as ApiErrorPayload));
        throw new ApiError(
          errorData.detail || `Error al obtener productos: ${response.status}`,
          response.status,
          errorData.type
        );
      }

      const data = (await response.json()) as unknown;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Error al obtener productos: ${(error as Error).message}`, 0);
    }
  },

  async getInventario(): Promise<ApiInventoryItem[]> {
    try {
      const reportData = await fetchInventoryEndpoint('/item/reporteinventario');
      if (reportData.length > 0) {
        return mapInventoryReport(reportData as ApiInventoryReportItem[]);
      }

      return await fetchInventoryEndpoint('/item/inventario') as ApiInventoryItem[];
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Error al obtener inventario: ${(error as Error).message}`, 0);
    }
  },

  async getClasificacionItem(): Promise<ApiClassificationItem[]> {
    try {
      const response = await fetchWithAuth('/clasificacionitem/search');

      if (response.status === 404) {
        return [];
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as ApiErrorPayload));
        throw new ApiError(
          errorData.detail || `Error al obtener clasificación: ${response.status}`,
          response.status,
          errorData.type
        );
      }

      const data = (await response.json()) as unknown;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Error al obtener clasificación: ${(error as Error).message}`, 0);
    }
  },

  async getProductByCode(codigo: string): Promise<Record<string, unknown> | null> {
    try {
      const response = await fetchWithAuth(`/item?code=${encodeURIComponent(codigo)}`);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({} as ApiErrorPayload));
        throw new ApiError(
          errorData.detail || `Error al obtener producto: ${response.status}`,
          response.status,
          errorData.type
        );
      }

      const data = (await response.json()) as Record<string, unknown>;
      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Error al obtener producto: ${(error as Error).message}`, 0);
    }
  },
};
