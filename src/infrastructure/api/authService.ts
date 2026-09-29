import { getApiBaseUrl, getApiConfig } from '@/infrastructure/api/config';
import { getSelectedBranchKey } from '@/infrastructure/api/config';
import { TimeoutError } from '@/infrastructure/api/client';
import { ApiError } from '@/infrastructure/api/types';

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;
let cachedBranchKey: string | null = null;

const TOKEN_VALIDITY_MS = 55 * 60 * 1000;

const isTokenValid = (): boolean => {
  if (!cachedToken || !tokenExpiry) return false;
  if (cachedBranchKey !== getSelectedBranchKey()) return false;
  return Date.now() < tokenExpiry;
};

export const authService = {
  async login(forceNew: boolean = false): Promise<string> {
    if (forceNew) {
      cachedToken = null;
      tokenExpiry = null;
      cachedBranchKey = null;
    }

    if (isTokenValid()) {
      return cachedToken;
    }

    try {
      const apiConfig = getApiConfig();
      const response = await fetch(`${getApiBaseUrl()}/usuario/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: apiConfig.username,
          password: apiConfig.password,
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
      cachedBranchKey = getSelectedBranchKey();

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
    cachedBranchKey = null;
  },

  forceNewLogin() {
    cachedToken = null;
    tokenExpiry = null;
    cachedBranchKey = null;
  },

  getToken(): string | null {
    return cachedToken;
  },
};
