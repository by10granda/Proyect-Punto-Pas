import { getApiBaseUrl, getApiConfig } from '@/infrastructure/api/config';
import { getSelectedBranchKey } from '@/infrastructure/api/config';
import { createApiFetchWithTimeout, TimeoutError } from '@/infrastructure/api/client';
import { ApiError } from '@/infrastructure/api/types';

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;
let cachedBranchKey: string | null = null;
let generation = 0;
const pendingLogins = new Map<string, Promise<string>>();

const TOKEN_VALIDITY_MS = 55 * 60 * 1000;
const fetchLogin = createApiFetchWithTimeout(15000);

const isTokenValid = (): boolean => {
  if (!cachedToken || !tokenExpiry) return false;
  if (cachedBranchKey !== getSelectedBranchKey()) return false;
  return Date.now() < tokenExpiry;
};

export const authService = {
  async login(forceNew: boolean = false): Promise<string> {
    const branchKey = getSelectedBranchKey();
    const pending = pendingLogins.get(branchKey);
    if (pending) return pending;

    if (forceNew) {
      cachedToken = null;
      tokenExpiry = null;
      cachedBranchKey = null;
    }

    if (isTokenValid()) {
      return cachedToken;
    }

    const apiConfig = getApiConfig();
    const baseUrl = getApiBaseUrl();
    const loginGeneration = generation;
    const request = (async () => {
      try {
        const response = await fetchLogin(`${baseUrl}/usuario/login`, {
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

        const token = (await response.text()).trim();
        if (!token || /[<>\s]/.test(token) || /html/i.test(response.headers.get('content-type') || '')) {
          throw new ApiError('Respuesta de autenticacion invalida', response.status);
        }
        if (generation === loginGeneration && getSelectedBranchKey() === branchKey) {
          cachedToken = token;
          tokenExpiry = Date.now() + TOKEN_VALIDITY_MS;
          cachedBranchKey = branchKey;
        }

        return token;
      } catch (error) {
        if (error instanceof ApiError) throw error;
        if (error instanceof TimeoutError) throw new ApiError(error.message, 408);
        throw new ApiError(`Error de red: ${(error as Error).message}`, 0);
      }
    })();
    pendingLogins.set(branchKey, request);
    try {
      return await request;
    } finally {
      if (pendingLogins.get(branchKey) === request) pendingLogins.delete(branchKey);
    }
  },

  clearToken() {
    generation++;
    pendingLogins.clear();
    cachedToken = null;
    tokenExpiry = null;
    cachedBranchKey = null;
  },

  forceNewLogin() {
    authService.clearToken();
  },

  getToken(): string | null {
    return cachedToken;
  },
};
