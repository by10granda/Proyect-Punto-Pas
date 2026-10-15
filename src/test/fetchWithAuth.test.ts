import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { authService } from '@/infrastructure/api/authService';
import { fetchWithAuth } from '@/infrastructure/api/fetchWithAuth';

vi.mock('@/infrastructure/api/config', () => ({
  getApiBaseUrl: () => '/api',
  getApiConfig: () => ({ username: 'user', password: 'password', timeout: 15000 }),
  getSelectedBranchKey: () => 'branch-a',
}));

const fetchMock = vi.fn();
beforeEach(() => {
  authService.clearToken();
  fetchMock.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

it.each(['pending', 'completed'])('reuses a %s renewal for a second 401', async (renewal) => {
  let resolveRenewal!: (response: Response) => void;
  const pendingRenewal = new Promise<Response>((resolve) => { resolveRenewal = resolve; });
  let resolveLate401!: (response: Response) => void;
  const late401 = new Promise<Response>((resolve) => { resolveLate401 = resolve; });
  let signalRenewal!: () => void;
  const renewalStarted = new Promise<void>((resolve) => { signalRenewal = resolve; });
  let signalSecondRetry!: () => void;
  const secondRetryStarted = new Promise<void>((resolve) => { signalSecondRetry = resolve; });
  let loginCount = 0;
  fetchMock.mockImplementation((url: string, options: RequestInit) => {
    if (url.endsWith('/usuario/login')) {
      loginCount++;
      if (loginCount === 1) return Promise.resolve(new Response('old-token'));
      signalRenewal();
      return pendingRenewal;
    }
    const token = (options.headers as Record<string, string>).Authorization;
    if (token === 'Bearer old-token') {
      return url.endsWith('/first') ? Promise.resolve(new Response(null, { status: 401 })) : late401;
    }
    expect(token).toBe('Bearer new-token');
    if (url.endsWith('/second')) signalSecondRetry();
    return Promise.resolve(new Response('ok'));
  });

  await authService.login();
  const first = fetchWithAuth('/first');
  const second = fetchWithAuth('/second');
  await renewalStarted;
  if (renewal === 'completed') {
    resolveRenewal(new Response('new-token'));
    await first;
  }
  resolveLate401(new Response(null, { status: 401 }));
  if (renewal === 'pending') {
    // Wait until the second 401 has joined the pending login before completing it.
    const loginSpy = vi.spyOn(authService, 'login');
    await vi.waitFor(() => expect(loginSpy).toHaveBeenCalledWith());
    loginSpy.mockRestore();
    resolveRenewal(new Response('new-token'));
  }
  await secondRetryStarted;
  const responses = await Promise.all([first, second]);
  expect(responses.map((response) => response.status)).toEqual([200, 200]);
  expect(loginCount).toBe(2);
  expect(fetchMock).toHaveBeenCalledTimes(6);
  expect(authService.getToken()).toBe('new-token');
});
