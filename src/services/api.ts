const API_BASE_URL = '/api';

const API_CONFIG = {
  username: 'Yuberin',
  password: '2015',
  IdPuntoVenta: 1,
  IdNivelPrecio: 1,
  timeout: 10000,
};

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

const TOKEN_VALIDITY_MS = 55 * 60 * 1000;

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const isTokenValid = (): boolean => {
  if (!cachedToken || !tokenExpiry) return false;
  return Date.now() < tokenExpiry;
};

export const authService = {
  async login(forceNew: boolean = false): Promise<string> {
    if (forceNew) {
      cachedToken = null;
      tokenExpiry = null;
    }

    if (isTokenValid()) {
      return cachedToken!;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/usuario/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: API_CONFIG.username,
          password: API_CONFIG.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.detail || `Error de autenticación: ${response.status}`,
          response.status,
          errorData.type
        );
      }

      const token = await response.text();
      cachedToken = token;
      tokenExpiry = Date.now() + TOKEN_VALIDITY_MS;

      return token;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Error de red: ${(error as Error).message}`, 0);
    }
  },

  clearToken() {
    cachedToken = null;
    tokenExpiry = null;
  },

  forceNewLogin() {
    cachedToken = null;
    tokenExpiry = null;
  },

  getToken(): string | null {
    return cachedToken;
  },
};

const createFetchWithTimeout = (timeout: number) => {
  return async (url: string, options: RequestInit = {}): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if ((error as Error).name === 'AbortError') {
        throw new ApiError('Tiempo de espera agotado', 408);
      }
      throw error;
    }
  };
};

const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = await authService.login();
  const fetchWithT = createFetchWithTimeout(API_CONFIG.timeout);

  const response = await fetchWithT(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    authService.forceNewLogin();
    const retryToken = await authService.login(true);
    const retryResponse = await fetchWithT(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${retryToken}`,
        ...options.headers,
      },
    });

    if (retryResponse.status === 401) {
      throw new ApiError('Sesión expirada', 401, 'UNAUTHORIZED');
    }
    return retryResponse;
  }

  return response;
};

export const productService = {
  async getProducts(): Promise<any[]> {
    try {
      const response = await fetchWithAuth(
        `/item/search3?IdPuntoVenta=${API_CONFIG.IdPuntoVenta}&IdNivelPrecio=${API_CONFIG.IdNivelPrecio}`
      );

      if (response.status === 404) {
        return [];
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.detail || `Error al obtener productos: ${response.status}`,
          response.status,
          errorData.type
        );
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Error al obtener productos: ${(error as Error).message}`, 0);
    }
  },

  async getInventario(): Promise<any[]> {
    try {
      const response = await fetchWithAuth('/item/inventario');

      if (response.status === 404) {
        return [];
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.detail || `Error al obtener inventario: ${response.status}`,
          response.status,
          errorData.type
        );
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Error al obtener inventario: ${(error as Error).message}`, 0);
    }
  },

  async getClasificacionItem(): Promise<any[]> {
    try {
      const response = await fetchWithAuth('/clasificacionitem/search');

      if (response.status === 404) {
        return [];
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.detail || `Error al obtener clasificación: ${response.status}`,
          response.status,
          errorData.type
        );
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Error al obtener clasificación: ${(error as Error).message}`, 0);
    }
  },

  async getProductByCode(codigo: string): Promise<any | null> {
    try {
      const response = await fetchWithAuth(`/item?code=${encodeURIComponent(codigo)}`);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.detail || `Error al obtener producto: ${response.status}`,
          response.status,
          errorData.type
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Error al obtener producto: ${(error as Error).message}`, 0);
    }
  },
};

export interface FacturaItem {
  codigo: string;
  cantidad: number;
  precioUnitario: number;
  descuento?: number;
  iva?: number;
}

export interface FacturaCliente {
  tipoIdentificacion: 1 | 2 | 3 | 4 | 6;
  numIdentificacion: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  nombre?: string;
}

export interface FacturaRequest {
  cliente: FacturaCliente;
  items: FacturaItem[];
  idPuntoVenta?: number;
  idFormaPago?: number;
  observaciones?: string;
}

export const invoiceService = {
  async createFactura(factura: FacturaRequest): Promise<any> {
    try {
      const response = await fetchWithAuth('/factura', {
        method: 'POST',
        body: JSON.stringify({
          cliente: factura.cliente,
          items: factura.items.map(item => ({
            codigo: item.codigo,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            descuento: item.descuento || 0,
            iva: item.iva || 15,
          })),
          idPuntoVenta: factura.idPuntoVenta || API_CONFIG.IdPuntoVenta,
          idFormaPago: factura.idFormaPago || 1,
          observaciones: factura.observaciones || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.detail || `Error al crear factura: ${response.status}`,
          response.status,
          errorData.type
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Error al crear factura: ${(error as Error).message}`, 0);
    }
  },
};

export default {
  auth: authService,
  products: productService,
  invoice: invoiceService,
};
