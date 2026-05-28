import { Product } from '@/domain/product';
import { ApiProductItem } from '@/infrastructure/api/types';

interface ProductMapperOptions {
  imageVersion: string;
  customProductImages: Record<string, string[]>;
  inventarioMap: Record<string, number>;
  getFriendlyCategory: (category: string) => string;
}

const PRODUCTS_BASE_URL = (import.meta.env.VITE_PRODUCTS_BASE_URL as string | undefined) || '';
const PRODUCTS_BACKUP_BASE_URL = (import.meta.env.VITE_PRODUCTS_BACKUP_BASE_URL as string | undefined) || '';

const isPlaceholderBrand = (value: string) => {
  const cleaned = value.replace(/\s+/g, '');
  return cleaned.length > 0 && /^\.+$/.test(cleaned);
};

const inferBrandFromName = (name: string) => {
  const tokens = (name || '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length < 2) return '';

  const ignored = new Set(['LAPTOP', 'LAPTOPS', 'NOTEBOOK', 'ULTRABOOK', 'PC', 'COMPUTADORA']);
  for (const token of tokens) {
    if (!ignored.has(token) && /^[A-Z0-9]{2,12}$/.test(token)) {
      return token;
    }
  }

  return '';
};

const resolveBrand = (item: ApiProductItem) => {
  const rawBrand = (item.descripcionMarca || '').trim();
  if (rawBrand && !isPlaceholderBrand(rawBrand)) {
    return rawBrand;
  }

  return inferBrandFromName(item.descripcionItem || '');
};

const withVersionQuery = (url: string, imageVersion: string) => {
  if (!imageVersion) return url;
  const versionValue = imageVersion.replace(/^v/i, '');
  return `${url}${url.includes('?') ? '&' : '?'}v=${versionValue}`;
};

const buildImageCandidates = (baseUrl: string, paddedCode: string, suffixes: string[], extensions: string[]) => {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  if (!normalizedBaseUrl) return [];

  const images: string[] = [];
  suffixes.forEach((suffix) => {
    extensions.forEach((ext) => {
      images.push(`${normalizedBaseUrl}/${paddedCode}${suffix}${ext}`);
    });
  });

  return images;
};

const getProductImages = (codigo: string, imageVersion: string): string[] => {
  const paddedCode = codigo.padStart(8, '0').substring(0, 8);
  const suffixes = ['_E', ...Array.from({ length: 12 }, (_, index) => `_E${index + 2}`)];
  const extensions = ['.png', '.PNG'];
  const primaryImages = buildImageCandidates(PRODUCTS_BASE_URL, paddedCode, suffixes, extensions);
  const defaultTunnelImages = buildImageCandidates('https://assets.distribuidor-puntopas.com/PRODUCTOS_ESMERALDAS2', paddedCode, suffixes, extensions);
  const backupImages = buildImageCandidates(PRODUCTS_BACKUP_BASE_URL, paddedCode, suffixes, ['.png']);

  const imageCandidates = [
    ...backupImages,
    ...primaryImages,
    ...defaultTunnelImages,
  ];

  return Array.from(new Set(imageCandidates)).map((image) => withVersionQuery(image, imageVersion));
};

const normalizeProductCode = (value: string | undefined | null) =>
  String(value || '').trim().padStart(8, '0').substring(0, 8);

export const mapApiProductsToDomain = (
  data: ApiProductItem[],
  { imageVersion, customProductImages, inventarioMap, getFriendlyCategory }: ProductMapperOptions
): Product[] => {
  const rawProducts: Product[] = data.map((item, index) => {
    const categoria = item.descripcionCategoria || 'OTROS';
    const itemDescription = item.descripcionItem || '';
    const hasLaptopIntent = /\b(LAPTOP|LAPTOPS|NOTEBOOK|ULTRABOOK|COMPUTADORA|COMPUTADORAS)\b/i.test(itemDescription);
    const mappedCategory = hasLaptopIntent ? 'LAPTOPS' : getFriendlyCategory(categoria);
    const rawType = item.descripcionTipo || item.tipo || categoria || 'OTROS';
    const mappedType = hasLaptopIntent && /MONITOR/i.test(rawType) ? 'LAPTOPS' : rawType;
    const itemId = String(item.codigo || index + 1);
    const codigoInterno = String(item.codigo || '');

    const customImages = customProductImages[codigoInterno];
    let productImage: string;
    let productImages: string[] = [];

    if (customImages) {
      productImage = customImages[0];
      productImages = customImages;
    } else if (codigoInterno) {
      const paddedCode = codigoInterno.padStart(8, '0').substring(0, 8);
      productImages = getProductImages(paddedCode, imageVersion);
      if (PRODUCTS_BASE_URL) {
        productImage = productImages[0];
      } else {
        productImage = productImages[0];
      }
    } else {
      productImage = `https://placehold.co/400x400?text=${encodeURIComponent(item.descripcionItem || codigoInterno)}`;
      productImages = [productImage];
    }

    const pvpPrice = item.precioVentaSinImpuestos ? Number(item.precioVentaSinImpuestos) : undefined;
    const puntoPasPrice = item.precioVentaConImpuestos ? Number(item.precioVentaConImpuestos) : undefined;

    const hasBothPrices = pvpPrice && puntoPasPrice && pvpPrice > 0 && puntoPasPrice > 0;
    const discount = hasBothPrices ? Math.round((1 - puntoPasPrice / pvpPrice) * 100) : undefined;

    const finalPrice = puntoPasPrice || pvpPrice || 0;

    return {
      id: itemId,
      code: codigoInterno,
      name: itemDescription,
      description: itemDescription,
      brand: resolveBrand(item),
      unit: item.descripcionUnidadInventario || 'UNIDAD',
      stock: inventarioMap[normalizeProductCode(codigoInterno)] || 0,
      price: finalPrice,
      originalPrice: hasBothPrices ? pvpPrice : undefined,
      discount,
      category: mappedCategory,
      type: mappedType,
      image: productImage,
      images: productImages,
      isActive: item.estado === 'A',
      sold: 0,
      pvpPrice,
      puntoPasPrice,
    };
  });

  const productMap = new Map<string, Product>();
  rawProducts.forEach((product) => {
    const existing = productMap.get(product.code);
    if (!existing) {
      productMap.set(product.code, product);
      return;
    }

    const merged = { ...existing };
    if (product.pvpPrice && product.pvpPrice > 0 && !merged.pvpPrice) merged.pvpPrice = product.pvpPrice;
    if (product.puntoPasPrice && product.puntoPasPrice > 0 && !merged.puntoPasPrice) merged.puntoPasPrice = product.puntoPasPrice;
    if (product.price > 0 && merged.price === 0) merged.price = product.price;

    const hasBothPrices = !!(merged.pvpPrice && merged.puntoPasPrice && merged.pvpPrice > 0 && merged.puntoPasPrice > 0);
    const hasDiscount = hasBothPrices && (merged.pvpPrice as number) > (merged.puntoPasPrice as number);

    if (hasBothPrices) {
      merged.price = merged.puntoPasPrice as number;
      merged.originalPrice = merged.pvpPrice;
      merged.discount = hasDiscount ? Math.round((1 - (merged.puntoPasPrice as number) / (merged.pvpPrice as number)) * 100) : undefined;
    } else if (merged.puntoPasPrice && merged.puntoPasPrice > 0) {
      merged.price = merged.puntoPasPrice;
      merged.originalPrice = undefined;
      merged.discount = undefined;
    } else if (merged.pvpPrice && merged.pvpPrice > 0) {
      merged.price = merged.pvpPrice;
      merged.originalPrice = undefined;
      merged.discount = undefined;
    }

    productMap.set(product.code, merged);
  });

  return Array.from(productMap.values());
};
