import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { authService } from '@/infrastructure/api/authService';

vi.mock('@/infrastructure/api/config', () => ({
  getApiBaseUrl: () => '/api',
  getApiConfig: () => ({ username: 'user', password: 'password' }),
  getSelectedBranchKey: () => 'branch-a',
}));

const fetchMock = vi.fn();
beforeEach(() => {
  authService.clearToken();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('trims and caches a text token', async () => {
  fetchMock.mockResolvedValue(new Response('  opaque-token  '));
  await expect(authService.login()).resolves.toBe('opaque-token');
  await expect(authService.login()).resolves.toBe('opaque-token');
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it.each(['', '   ', '<html>secret-response</html>'])('rejects invalid token text without exposing it', async (body) => {
  fetchMock.mockResolvedValue(new Response(body));
  await expect(authService.login()).rejects.toMatchObject({ message: 'Respuesta de autenticacion invalida' });
  expect(authService.getToken()).toBeNull();
});

it('rejects an HTML content type even if the body looks like a token', async () => {
  fetchMock.mockResolvedValue(new Response('secret', { headers: { 'Content-Type': 'text/html' } }));
  await expect(authService.login()).rejects.toMatchObject({ message: 'Respuesta de autenticacion invalida' });
});

it('aborts a stalled login and returns a timeout ApiError', async () => {
  vi.useFakeTimers();
  fetchMock.mockImplementation((_url, options: RequestInit) => new Promise((_resolve, reject) => {
    options.signal!.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
  }));
  const assertion = expect(authService.login()).rejects.toMatchObject({ statusCode: 408 });
  await vi.advanceTimersByTimeAsync(15000);
  await assertion;
  expect(authService.getToken()).toBeNull();
});
