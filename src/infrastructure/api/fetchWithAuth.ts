import { createFetchWithTimeout } from '@/infrastructure/api/client';
import { API_BASE_URL, API_CONFIG } from '@/infrastructure/api/config';
import { authService } from '@/infrastructure/api/authService';
import { ApiError } from '@/infrastructure/api/types';

export const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = await authService.login();
  const fetchWithT = createFetchWithTimeout(API_CONFIG.timeout);

  const response = await fetchWithT(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
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
        Authorization: `Bearer ${retryToken}`,
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
