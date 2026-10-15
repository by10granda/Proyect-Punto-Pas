import { afterEach, expect, it, vi } from 'vitest';
import handler from '../../api/siape.js';

vi.mock('../../api/_lib/siapeTransport.js', () => ({
  fetchSiape: (url: string, options: RequestInit) => globalThis.fetch(url, options),
}));

const response = () => ({
  status: vi.fn().mockReturnThis(),
  setHeader: vi.fn(),
  send: vi.fn(),
  json: vi.fn(),
});

afterEach(() => vi.unstubAllGlobals());

it('forwards login JSON to the selected branch without forwarding the website host', async () => {
  const fetch = vi.fn().mockResolvedValue(new Response('test-token'));
  vi.stubGlobal('fetch', fetch);
  const res = response();
  await handler({
    method: 'POST', query: { branch: 'almacen-pas', endpoint: 'usuario/login' },
    headers: { host: 'www.distribuidor-puntopas.com', 'content-type': 'application/json' },
    body: { login: 'test-user', password: 'test-password' },
  }, res);
  expect(fetch).toHaveBeenCalledWith('https://api.distribuidor-puntopas.com/api/usuario/login',
    expect.objectContaining({ method: 'POST', body: JSON.stringify({ login: 'test-user', password: 'test-password' }),
      headers: { 'Content-Type': 'application/json', 'Accept-Encoding': 'identity' } }));
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.send.mock.calls[0][0].toString()).toBe('test-token');
});

it('preserves authorization and product-code query parameters', async () => {
  const fetch = vi.fn().mockResolvedValue(new Response('{"codigo":"00000001"}'));
  vi.stubGlobal('fetch', fetch);
  await handler({ method: 'GET', headers: { authorization: 'Bearer test-token' },
    query: { branch: 'sucursal-3', endpoint: 'item', code: '00000001' } }, response());
  expect(fetch).toHaveBeenCalledWith('https://api-sucursal3.distribuidor-puntopas.com/api/item?code=00000001',
    expect.objectContaining({ headers: { Authorization: 'Bearer test-token', 'Accept-Encoding': 'identity' } }));
});

it('never falls back to another branch after an upstream failure', async () => {
  const fetch = vi.fn().mockImplementation(async () => new Response('unavailable', { status: 502 }));
  vi.stubGlobal('fetch', fetch);
  const res = response();
  await handler({ method: 'GET', headers: {},
    query: { branch: 'almacen-pas', endpoint: 'item/search3' } }, res);
  expect(fetch).toHaveBeenCalledTimes(3);
  expect(fetch.mock.calls.every(([url]) => url === 'https://api.distribuidor-puntopas.com/api/item/search3')).toBe(true);
  expect(res.status).toHaveBeenCalledWith(502);
});

it.each([
  { branch: 'unknown', endpoint: 'item/search3' },
  { branch: 'almacen-pas', endpoint: '../usuario/login' },
  { branch: ['almacen-pas'], endpoint: 'item/search3' },
])('rejects unsupported routes: %j', async (query) => {
  const fetch = vi.fn();
  vi.stubGlobal('fetch', fetch);
  const res = response();
  await handler({ method: 'GET', headers: {}, query }, res);
  expect(res.status).toHaveBeenCalledWith(404);
  expect(fetch).not.toHaveBeenCalled();
});

it('rejects unsupported methods before contacting SIAPE', async () => {
  const res = response();
  await handler({ method: 'GET', headers: {},
    query: { branch: 'almacen-pas', endpoint: 'usuario/login' } }, res);
  expect(res.status).toHaveBeenCalledWith(405);
  expect(res.setHeader).toHaveBeenCalledWith('Allow', 'POST');
});
