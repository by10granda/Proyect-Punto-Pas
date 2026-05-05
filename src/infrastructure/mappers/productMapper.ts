import { Product } from '@/domain/product';
import { ApiProductItem } from '@/infrastructure/api/types';

interface ProductMapperOptions {
  imageVersion: string;
  customProductImages: Record<string, string[]>;
  inventarioMap: Record<string, number>;
  getFriendlyCategory: (category: string) => string;
}

const getProductImages = (codigo: string, imageVersion: string): string[] => {
  const paddedCode = codigo.padStart(8, '0').substring(0, 8);
  const images: string[] = [];
  for (let i = 1; i <= 10; i++) {
    const suffix = i === 1 ? '_E' : `_E${i}`;
    images.push(`https://res.cloudinary.com/dbbkpdhze/image/upload/${imageVersion}/${paddedCode}${suffix}.png`);
  }
  return images;
};

export const mapApiProductsToDomain = (
  data: ApiProductItem[],
  { imageVersion, customProductImages, inventarioMap, getFriendlyCategory }: ProductMapperOptions
): Product[] => {
  const rawProducts: Product[] = data.map((item, index) => {
    const categoria = item.descripcionCategoria || 'OTROS';
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
      productImage = `https://res.cloudinary.com/dbbkpdhze/image/upload/${imageVersion}/${paddedCode}_E.png`;
      productImages = getProductImages(paddedCode, imageVersion);
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
      name: item.descripcionItem || '',
      description: item.descripcionItem || '',
      brand: item.descripcionMarca || '',
      unit: item.descripcionUnidadInventario || 'UNIDAD',
      stock: inventarioMap[codigoInterno] || 0,
      price: finalPrice,
      originalPrice: hasBothPrices ? pvpPrice : undefined,
      discount,
      category: getFriendlyCategory(categoria),
      type: item.tipo || item.descripcionTipo || categoria || 'OTROS',
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
