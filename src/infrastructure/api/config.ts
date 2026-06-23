export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const API_CONFIG = {
  // Use env vars when available; keep fallback values to avoid breaking product loading.
  username: import.meta.env.VITE_SIAPE_USERNAME || 'Yuberin',
  password: import.meta.env.VITE_SIAPE_PASSWORD || '2015',
  IdPuntoVenta: 1,
  IdNivelPrecio: 1,
  timeout: 10000,
};
