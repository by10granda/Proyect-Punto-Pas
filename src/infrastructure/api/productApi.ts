import { API_CONFIG } from '@/infrastructure/api/config';
import { fetchWithAuth } from '@/infrastructure/api/fetchWithAuth';
import { ApiClassificationItem, ApiError, ApiErrorPayload, ApiInventoryItem, ApiProductItem } from '@/infrastructure/api/types';

export const productService = {
  async getProducts(): Promise<ApiProductItem[]> {
    try {
      const response = await fetchWithAuth(
        `/item/search3?IdPuntoVenta=${API_CONFIG.IdPuntoVenta}&IdNivelPrecio=${API_CONFIG.IdNivelPrecio}`
      );

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
      const response = await fetchWithAuth('/item/inventario');

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
