import { createApiFetchWithTimeout } from '@/infrastructure/api/client';
import { getApiBaseUrl, getApiConfig } from '@/infrastructure/api/config';
import { authService } from '@/infrastructure/api/authService';
import { ApiError } from '@/infrastructure/api/types';

export const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = await authService.login();
  const fetchWithT = createApiFetchWithTimeout(getApiConfig().timeout);

  const response = await fetchWithT(`${getApiBaseUrl()}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    const retryToken = await (authService.getToken() === token
      ? authService.login(true)
      : authService.login());
    const retryResponse = await fetchWithT(`${getApiBaseUrl()}${endpoint}`, {
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
