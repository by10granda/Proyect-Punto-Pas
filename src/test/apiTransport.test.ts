import { afterEach, expect, it, vi } from 'vitest';
import { createApiFetchWithTimeout } from '@/infrastructure/api/client';

afterEach(() => vi.unstubAllGlobals());

it('uses the website proxy without contacting the tunnel when healthy', async () => {
  const fetch = vi.fn().mockResolvedValue(new Response('[]'));
  vi.stubGlobal('fetch', fetch);
  await createApiFetchWithTimeout(1000)('/api/almacen-pas/item/search3');
  expect(fetch).toHaveBeenCalledTimes(1);
});

it.each(['network', 502, 503, 504])('falls back to the same branch on %s', async (failure) => {
  const fetch = vi.fn();
  if (failure === 'network') fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
  else fetch.mockResolvedValueOnce(new Response(null, { status: failure as number }));
  fetch.mockResolvedValueOnce(new Response('[]'));
  vi.stubGlobal('fetch', fetch);
  await expect(createApiFetchWithTimeout(1000)('/api/almacen-pas/item/search3')).resolves.toHaveProperty('status', 200);
  expect(fetch.mock.calls[1][0]).toBe('https://api.distribuidor-puntopas.com/api/item/search3');
});

it('preserves the login body when using the alternate route', async () => {
  const fetch = vi.fn().mockRejectedValueOnce(new TypeError('offline')).mockResolvedValueOnce(new Response('token'));
  vi.stubGlobal('fetch', fetch);
  const options = { method: 'POST', body: JSON.stringify({ login: 'test', password: 'test' }) };
  await createApiFetchWithTimeout(1000)('/api/almacen-pas/usuario/login', options);
  expect(fetch.mock.calls[1][0]).toBe('https://api.distribuidor-puntopas.com/api/usuario/login');
  expect(fetch.mock.calls[1][1].body).toBe(options.body);
});

it.each([401, 429])('does not bypass HTTP %i using another route', async (status) => {
  const fetch = vi.fn().mockResolvedValue(new Response(null, { status }));
  vi.stubGlobal('fetch', fetch);
  await expect(createApiFetchWithTimeout(1000)('/api/almacen-pas/item/search3')).resolves.toHaveProperty('status', status);
  expect(fetch).toHaveBeenCalledTimes(1);
});

it('never automatically replays an invoice', async () => {
  const fetch = vi.fn().mockRejectedValue(new TypeError('offline'));
  vi.stubGlobal('fetch', fetch);
  await expect(createApiFetchWithTimeout(1000)('/api/almacen-pas/factura', { method: 'POST' })).rejects.toThrow('offline');
  expect(fetch).toHaveBeenCalledTimes(1);
});
