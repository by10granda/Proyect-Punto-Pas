import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchWithAuth } from '@/infrastructure/api/fetchWithAuth';
import { productService } from '@/infrastructure/api/productApi';
import { ApiError } from '@/infrastructure/api/types';

vi.mock('@/infrastructure/api/fetchWithAuth', () => ({ fetchWithAuth: vi.fn() }));
const fetchMock = vi.mocked(fetchWithAuth);
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status });

beforeEach(() => vi.resetAllMocks());

describe('SIAPE products', () => {
  it('returns the product array', async () => {
    const products = [{ codigo: '00000001', descripcionItem: 'Producto' }];
    fetchMock.mockResolvedValue(json(products));
    await expect(productService.getProducts()).resolves.toEqual(products);
    expect(fetchMock).toHaveBeenCalledWith('/item/search3');
  });

  it.each([{ data: {} }, { data: null }, { data: [{ codigo: '1' }] }])('rejects unexpected product formats: %j', async ({ data }) => {
    fetchMock.mockResolvedValue(json(data));
    await expect(productService.getProducts()).rejects.toBeInstanceOf(ApiError);
  });

  it('does not hide HTTP or JSON failures', async () => {
    fetchMock.mockResolvedValueOnce(json({}, 404));
    await expect(productService.getProducts()).rejects.toMatchObject({ statusCode: 404 });
    fetchMock.mockResolvedValueOnce(new Response('<html>error</html>'));
    await expect(productService.getProducts()).rejects.toBeInstanceOf(ApiError);
  });
});

describe('SIAPE inventory', () => {
  it.each([{ inventory: [] }, { inventory: [{ codigo: '00000001', disponible: 8 }] }])('uses inventory without BI: %j', async ({ inventory }) => {
    fetchMock.mockResolvedValue(json(inventory));
    await expect(productService.getInventario()).resolves.toEqual(inventory);
    expect(fetchMock.mock.calls).toEqual([['/item/inventario']]);
  });

  it('maps the report only after inventory returns 404', async () => {
    fetchMock.mockResolvedValueOnce(json({}, 404)).mockResolvedValueOnce(json([
      { codigo: '1', disponibilidad: 6 },
      { codigo: '2', bodegas: [{ stock: 2 }, { stock: 3 }] },
    ]));
    await expect(productService.getInventario()).resolves.toEqual([
      { codigo: '1', disponible: 6 }, { codigo: '2', disponible: 5 },
    ]);
    expect(fetchMock.mock.calls).toEqual([['/item/inventario'], ['/item/reporteinventario']]);
  });

  it.each([401, 403, 500])('propagates HTTP %i without consulting BI', async (status) => {
    fetchMock.mockResolvedValue(json({}, status));
    await expect(productService.getInventario()).rejects.toMatchObject({ statusCode: status });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('propagates invalid inventory and network failures', async () => {
    fetchMock.mockResolvedValueOnce(json({}));
    await expect(productService.getInventario()).rejects.toBeInstanceOf(ApiError);
    fetchMock.mockRejectedValueOnce(new Error('offline'));
    await expect(productService.getInventario()).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
