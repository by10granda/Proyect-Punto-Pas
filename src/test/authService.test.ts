import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { authService } from '@/infrastructure/api/authService';

const config = vi.hoisted(() => ({ branch: 'branch-a' }));
vi.mock('@/infrastructure/api/config', () => ({
  getApiBaseUrl: () => `/api/${config.branch}`,
  getApiConfig: () => ({ username: config.branch, password: 'password' }),
  getSelectedBranchKey: () => config.branch,
}));

const fetchMock = vi.fn();
beforeEach(() => {
  config.branch = 'branch-a';
  authService.clearToken();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

it('shares one POST across five concurrent logins, including forced logins', async () => {
  let resolve!: (response: Response) => void;
  fetchMock.mockReturnValue(new Promise<Response>((done) => { resolve = done; }));
  const logins = Array.from({ length: 5 }, (_, index) => authService.login(index > 0));
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock.mock.calls[0][1].method).toBe('POST');
  resolve(new Response('shared-token'));
  await expect(Promise.all(logins)).resolves.toEqual(Array(5).fill('shared-token'));
});

it('releases the pending login after failure', async () => {
  fetchMock.mockRejectedValueOnce(new Error('offline'));
  const logins = [authService.login(), authService.login(true)];
  await expect(Promise.all(logins)).rejects.toMatchObject({ statusCode: 0 });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  fetchMock.mockResolvedValueOnce(new Response('recovered-token'));
  await expect(authService.login()).resolves.toBe('recovered-token');
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it.each(['clearToken', 'forceNewLogin'] as const)('%s prevents an old pending login from repopulating the cache', async (invalidate) => {
  let resolve!: (response: Response) => void;
  fetchMock.mockReturnValueOnce(new Promise<Response>((done) => { resolve = done; }));
  const oldLogin = authService.login();
  authService[invalidate]();
  resolve(new Response('old-token'));
  await expect(oldLogin).resolves.toBe('old-token');
  expect(authService.getToken()).toBeNull();
  fetchMock.mockResolvedValueOnce(new Response('new-token'));
  await expect(authService.login()).resolves.toBe('new-token');
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it('captures the starting branch config and does not cache its token in another branch', async () => {
  let resolve!: (response: Response) => void;
  fetchMock.mockReturnValueOnce(new Promise<Response>((done) => { resolve = done; }));
  const login = authService.login();
  config.branch = 'branch-b';
  expect(fetchMock).toHaveBeenCalledWith('/api/branch-a/usuario/login', expect.objectContaining({
    body: JSON.stringify({ login: 'branch-a', password: 'password' }),
  }));
  resolve(new Response('branch-a-token'));
  await expect(login).resolves.toBe('branch-a-token');
  expect(authService.getToken()).toBeNull();
  fetchMock.mockResolvedValueOnce(new Response('branch-b-token'));
  await expect(authService.login()).resolves.toBe('branch-b-token');
  expect(authService.getToken()).toBe('branch-b-token');
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
