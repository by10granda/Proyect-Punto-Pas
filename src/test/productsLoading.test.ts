import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { productService } from '@/services/api';
import { loadProductsFromAPI, resetProductsCache } from '@/data/products';
import { ApiError } from '@/infrastructure/api/types';

const branch = vi.hoisted(() => ({ key: 'branch-a' }));
vi.mock('@/infrastructure/api/config', () => ({ getSelectedBranchKey: () => branch.key }));
vi.mock('@/services/api', () => ({ productService: {
  getProducts: vi.fn(), getInventario: vi.fn(), getClasificacionItem: vi.fn(),
} }));

const fetchMock = vi.fn();
beforeEach(() => {
  vi.resetAllMocks();
  resetProductsCache();
  branch.key = 'branch-a';
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockImplementation(async () => new Response('codigo,descripcion'));
  vi.mocked(productService.getProducts).mockResolvedValue([
    { codigo: '00000001', descripcionItem: 'Producto', estado: 'A', precioVentaConImpuestos: 12 },
    { codigo: '00001776', descripcionItem: 'Override', estado: 'A' },
    { codigo: '00000626', descripcionItem: 'Excluido', estado: 'A' },
  ]);
  vi.mocked(productService.getInventario).mockResolvedValue([
    { codigo: '00000001', disponible: 7 }, { codigo: '00001776', disponible: 9 },
  ]);
  vi.mocked(productService.getClasificacionItem).mockResolvedValue([]);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it('propagates product and inventory errors without cache', async () => {
  const error = new ApiError('unavailable', 503);
  vi.mocked(productService.getProducts).mockRejectedValueOnce(error);
  await expect(loadProductsFromAPI()).rejects.toBe(error);
  vi.mocked(productService.getInventario).mockRejectedValueOnce(error);
  await expect(loadProductsFromAPI()).rejects.toBe(error);
});

it('keeps stock and commercial overrides when a same-branch refresh fails', async () => {
  const cached = await loadProductsFromAPI();
  expect(cached.map(({ code, stock }) => ({ code, stock }))).toEqual([
    { code: '00000001', stock: 7 }, { code: '00001776', stock: 0 },
  ]);
  expect(cached[0].price).toBe(12);
  const error = new ApiError('offline', 0);
  vi.mocked(productService.getInventario).mockRejectedValue(error);
  await expect(loadProductsFromAPI({ forceRefresh: true })).resolves.toBe(cached);
  branch.key = 'branch-b';
  await expect(loadProductsFromAPI()).rejects.toBe(error);
});

it('clears old stock after a legitimate empty inventory', async () => {
  await loadProductsFromAPI();
  vi.mocked(productService.getInventario).mockResolvedValue([]);
  const refreshed = await loadProductsFromAPI({ forceRefresh: true });
  expect(refreshed.every((product) => product.stock === 0)).toBe(true);
});

it('allows a legitimately empty product catalog', async () => {
  vi.mocked(productService.getProducts).mockResolvedValue([]);
  await expect(loadProductsFromAPI()).resolves.toEqual([]);
});

it('aborts a stalled Sheet after 5 seconds without failing the catalog', async () => {
  vi.useFakeTimers();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  let signal: AbortSignal;
  fetchMock.mockImplementation((_url, options: RequestInit) => new Promise((_resolve, reject) => {
    signal = options.signal!;
    signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
  }));
  const loading = loadProductsFromAPI();
  await vi.advanceTimersByTimeAsync(5000);
  expect(signal!.aborted).toBe(true);
  await expect(loading).resolves.toHaveLength(2);
});
