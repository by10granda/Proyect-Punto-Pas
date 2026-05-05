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
