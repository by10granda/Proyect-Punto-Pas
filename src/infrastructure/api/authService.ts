import { API_BASE_URL, API_CONFIG } from '@/infrastructure/api/config';
import { TimeoutError } from '@/infrastructure/api/client';
import { ApiError } from '@/infrastructure/api/types';

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

const TOKEN_VALIDITY_MS = 55 * 60 * 1000;

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
      return cachedToken;
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
      if (error instanceof TimeoutError) throw new ApiError(error.message, 408);
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
