// Set your production API gateway/base URL here when deploying outside Vite proxy.
export const API_BASE_URL = '/api';

export const API_CONFIG = {
  // Keep SIAPE credentials out of git. Configure them in the deployment environment/backend proxy.
  username: import.meta.env.VITE_SIAPE_USERNAME || '',
  password: import.meta.env.VITE_SIAPE_PASSWORD || '',
  IdPuntoVenta: 1,
  IdNivelPrecio: 1,
  timeout: 10000,
};
