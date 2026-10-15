import { getBranchConfigByKey, BranchKey } from '@/infrastructure/api/branchConfig';

export class TimeoutError extends Error {
  constructor(message: string = 'Tiempo de espera agotado') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export const createFetchWithTimeout = (timeout: number) => {
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
        throw new TimeoutError();
      }
      throw error;
    }
  };
};

export const createApiFetchWithTimeout = (timeout: number) => {
  const fetchWithTimeout = createFetchWithTimeout(timeout);
  return async (url: string, options: RequestInit = {}): Promise<Response> => {
    const route = url.match(/^\/api\/(almacen-pas|variedades-pas|sucursal-3)(\/.*)$/);
    const method = (options.method || 'GET').toUpperCase();
    // Never replay invoices or payments: only catalog reads and authentication are safe here.
    const canFallback = route && (method === 'GET' || (method === 'POST' && route[2] === '/usuario/login'));
    try {
      const response = await fetchWithTimeout(url, options);
      if (!canFallback || ![502, 503, 504].includes(response.status)) return response;
    } catch (error) {
      if (!canFallback || (options.signal?.aborted)) throw error;
    }
    const branch = getBranchConfigByKey(route![1] as BranchKey);
    const fallbackUrl = `${branch.apiBaseUrl.replace(/\/$/, '')}${route![2]}`;
    return fetchWithTimeout(fallbackUrl, options);
  };
};
