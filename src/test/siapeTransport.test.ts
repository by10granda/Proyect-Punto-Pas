// @vitest-environment node
import { createServer } from 'node:http';
import { expect, it } from 'vitest';
import { fetchSiape } from '../../api/_lib/siapeTransport.js';

it('sends an explicit byte length and reads the complete upstream response', async () => {
  let receivedLength: string | undefined;
  let receivedBody = '';
  const server = createServer((req, res) => {
    receivedLength = req.headers['content-length'];
    req.on('data', (chunk) => { receivedBody += chunk; });
    req.on('end', () => {
      res.setHeader('Content-Type', 'application/json');
      res.end('[{"codigo":"00000001"}]');
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing server port');
    const body = JSON.stringify({ login: 'test-user' });
    const result = await fetchSiape(`http://127.0.0.1:${address.port}/api/usuario/login`, {
      method: 'POST', headers: { 'Accept-Encoding': 'identity' }, body,
    });
    expect(receivedLength).toBe(String(Buffer.byteLength(body)));
    expect(receivedBody).toBe(body);
    expect(await result.json()).toEqual([{ codigo: '00000001' }]);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

it('honors cancellation without contacting an external service', async () => {
  const controller = new AbortController();
  controller.abort();
  await expect(fetchSiape('http://127.0.0.1:1/api/item/search3', {
    method: 'GET', headers: {}, signal: controller.signal,
  })).rejects.toMatchObject({ name: 'AbortError' });
});
