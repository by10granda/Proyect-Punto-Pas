import { productService } from '@/services/api';

export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  brand: string;
  unit: string;
  stock: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  type: string;
  image: string;
  images?: string[];
  video?: string;
  isActive: boolean;
  sold?: number;
  pvpPrice?: number;
  puntoPasPrice?: number;
}

const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/dbbkpdhze/image/upload/';
const CLOUDINARY_VERSION = 'v1774530743';

const CACHE_KEY = 'puntopas_products';
const CACHE_CATEGORIES_KEY = 'puntopas_categories';
const CACHE_EXPIRY = 1000 * 60 * 5;

let classificationsList: string[] = [];
const classificationsHierarchy: Map<number, { name: string; level: number; parentId: number | null }> = new Map();
let level2Categories: { id: number; name: string }[] = [];
const level3ByParent: Map<number, string[]> = new Map();
const level2ByName: Map<string, number> = new Map();

export const getClassifications = () => classificationsList;
export const getLevel2Categories = () => level2Categories;
export const getLevel3TypesByCategoryName = (categoryName: string) => {
  const parentId = level2ByName.get(categoryName.toUpperCase().trim());
  if (parentId === undefined) return [];
  return level3ByParent.get(parentId) || [];
};

const categoryMap: Record<string, { name: string; icon: string }> = {
  'DEPORTES Y MOVILIDAD': { name: 'Deportes y Movilidad', icon: '🏃' },
  'EQUIPOS ELECTRONICOS': { name: 'Equipos Electrónicos', icon: '📱' },
  'HOGAR': { name: 'Hogar', icon: '🏠' },
  'COCINA': { name: 'Cocina', icon: '🍳' },
  'ELECTRODOMESTICO': { name: 'Electrodomésticos', icon: '🧊' },
  'JUGUETES': { name: 'Juguetes', icon: '🧸' },
  'MUEBLES': { name: 'Muebles', icon: '🪑' },
  'BAÑOS': { name: 'Baños', icon: '🚿' },
  'CALZADO': { name: 'Calzado', icon: '👟' },
  'ACCESORIO': { name: 'Accesorios', icon: '🎒' },
  'FERRETERIA': { name: 'Ferretería', icon: '🔧' },
  'LINEA ELECTRICA Y TELEFONICA': { name: 'Línea Eléctrica', icon: '💡' },
};

const customProductImages: Record<string, string[]> = {
  '00000041': [
    'https://res.cloudinary.com/dbbkpdhze/image/upload/v1776195792/00000041_E.png',
  ],
  '00000349': [
    'https://res.cloudinary.com/dbbkpdhze/image/upload/v1776202043/00000349_E.png',
  ],
};

const defaultIcons: Record<string, string> = {
  'SERVICIOS': '🔧',
  'MENAJE': '🏠',
  'ELECTRODOMESTICOS': '🔌',
  'LINEA BLANCA': '❄️',
  'DEPORTES Y MOVILIDAD': '🏃',
  'EQUIPOS ELECTRONICOS': '📱',
  'HOGAR': '🏠',
  'COCINA': '🍳',
  'ELECTRODOMESTICO': '🧊',
  'JUGUETES': '🧸',
  'MUEBLES': '🪑',
  'BAÑOS': '🚿',
  'CALZADO': '👟',
  'ACCESORIO': '🎒',
  'FERRETERIA': '🔧',
  'LINEA ELECTRICA Y TELEFONICA': '💡',
};

const getCategoryIcon = (apiCategory: string): string => {
  if (!apiCategory) return '📦';
  const normalized = apiCategory.toUpperCase().trim();
  const fromMap = categoryMap[normalized]?.icon;
  return fromMap || defaultIcons[normalized] || '📦';
};

const getFriendlyCategory = (apiCategory: string): string => {
  if (!apiCategory) return 'OTROS';
  return apiCategory.toUpperCase().trim();
};

const getCachedProducts = (): Product[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

const setCachedProducts = (products: Product[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: products, timestamp: Date.now() }));
  } catch {
    // Ignore localStorage quota errors
  }
};

const getCachedCategories = (): { id: string; name: string; icon: string }[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_CATEGORIES_KEY);
    if (!cached) return null;
    return JSON.parse(cached);
  } catch {
    return null;
  }
};

const setCachedCategories = (categories: { id: string; name: string; icon: string }[]) => {
  try {
    localStorage.setItem(CACHE_CATEGORIES_KEY, JSON.stringify(categories));
  } catch {
    // Ignore localStorage quota errors
  }
};

export const products: Product[] = [];

let categoriesList: { id: string; name: string; icon: string }[] = [{ id: "all", name: "Todo", icon: "🏠" }];

export const categories = categoriesList;

const DEFAULT_CATEGORIES = [
  { id: "all", name: "Todo", icon: "🏠" },
  { id: "AIRE ACONDICIONADO", name: "Aire Acondicionado", icon: "❄️" },
  { id: "COLCHONES", name: "Colchones", icon: "🛏️" },
  { id: "BICICLETAS", name: "Bicicletas", icon: "🚴" },
  { id: "CELULARES", name: "Celulares", icon: "📱" },
  { id: "ELECTRODOMESTICOS PEQUEÑOS", name: "Electrodomésticos Pequeños", icon: "🔌" },
  { id: "COCINAS Y CAMPANAS", name: "Cocinas y Campanas", icon: "🍳" },
  { id: "CONGELADORES Y NEVERAS", name: "Congeladores y Neveras", icon: "🧊" },
  { id: "LAVADORAS Y SECADORAS", name: "Lavadoras y Secadoras", icon: "🧺" },
  { id: "TELEVISORES", name: "Televisores", icon: "📺" },
  { id: "MUEBLES", name: "Muebles", icon: "🪑" },
  { id: "DEPORTES Y MOVILIDAD", name: "Deportes y Movilidad", icon: "🏃" },
  { id: "HOGAR", name: "Hogar", icon: "🏠" },
  { id: "COCINA", name: "Cocina", icon: "🍳" },
  { id: "FERRETERIA", name: "Ferretería", icon: "🔧" },
];

export const getCategories = () => {
  if (categoriesList.length <= 1) {
    return DEFAULT_CATEGORIES;
  }
  return categoriesList;
};

export const setCategories = (uniqueCategories: string[]) => {
  const mappedCategories = uniqueCategories.map(cat => ({
    id: getFriendlyCategory(cat),
    name: getFriendlyCategory(cat),
    icon: getCategoryIcon(cat)
  }));
  
  const uniqueMapped = mappedCategories.reduce((acc: { id: string; name: string; icon: string }[], curr) => {
    if (!acc.find(c => c.id === curr.id)) {
      acc.push(curr);
    }
    return acc;
  }, []);
  
  categoriesList = [
    { id: "all", name: "Todo", icon: "🏠" },
    ...uniqueMapped.sort((a, b) => a.name.localeCompare(b.name))
  ];
  
  setCachedCategories(categoriesList);
};

const initFromCache = (): Product[] | null => {
  const cached = getCachedProducts();
  if (cached && cached.length > 0) {
    return cached;
  }
  return null;
};

export const getProductsByCategory = (categoryId: string): Product[] => {
  if (categoryId === "all") return products.filter(p => p.isActive);
  return products.filter(p => p.isActive && (p.category === categoryId || p.type === categoryId));
};

export const getDiscountedProducts = (): Product[] => {
  return products.filter(p => p.isActive && p.puntoPasPrice && p.puntoPasPrice > 0);
};

export const searchProducts = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase();
  return products.filter(p => 
    p.isActive && (
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description?.toLowerCase().includes(lowerQuery) ||
      p.brand.toLowerCase().includes(lowerQuery)
    )
  );
};

let apiProducts: Product[] | null = null;
const inventarioMap: Record<string, number> = {};
let updateInventoryCallback: ((products: Product[]) => void) | null = null;

export const setInventoryUpdateCallback = (callback: (products: Product[]) => void) => {
  updateInventoryCallback = callback;
};

const updateProductsStock = () => {
  if (apiProducts && apiProducts.length > 0) {
    apiProducts = apiProducts.map(product => ({
      ...product,
      stock: inventarioMap[product.id] || 0
    }));
    if (updateInventoryCallback) {
      updateInventoryCallback([...apiProducts]);
    }
  }
};

export const refreshInventario = async (): Promise<void> => {
  try {
    const inventario = await productService.getInventario();
    if (inventario && Array.isArray(inventario)) {
      inventario.forEach((item: any) => {
        const key = String(item.idItem);
        inventarioMap[key] = Number(item.cantidadExistencia || 0);
      });
      updateProductsStock();
    }
  } catch (error) {
    console.error('Error refreshing inventory:', error);
  }
};

export const loadProductsFromAPI = async (): Promise<Product[]> => {
  if (apiProducts && apiProducts.length > 0) {
    return apiProducts;
  }

  const cached = initFromCache();
  if (cached) {
    apiProducts = cached;
    const cachedCats = getCachedCategories();
    if (cachedCats) {
      categoriesList = cachedCats;
    }
    refreshInventario();
    return apiProducts;
  }
  
  try {
    const data = await productService.getProducts();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }

    const [inventario, clasificaciones] = await Promise.all([
      productService.getInventario().catch(() => []),
      productService.getClasificacionItem().catch(() => [])
    ]);

    if (inventario && Array.isArray(inventario) && inventario.length > 0) {
      console.log('Inventario received:', inventario.length, 'items');
      console.log('First inventario item fields:', Object.keys(inventario[0]));
      console.log('First inventario values:', inventario[0]);
      
      inventario.forEach((item: any) => {
        const key = String(item.codigo);
        const disponible = Number(item.disponible || item.cantidadExistencia || item.stock || 0);
        inventarioMap[key] = disponible;
      });
      console.log('InventarioMap sample:', Object.entries(inventarioMap).slice(0, 5));
    } else {
      console.log('Inventario vacio o no es array:', inventario);
    }
    
    let uniqueCategories: string[] = [];
    
    if (clasificaciones && Array.isArray(clasificaciones) && clasificaciones.length > 0) {
      // Construir jerarquía
      classificationsHierarchy.clear();
      level2Categories = [];
      level3ByParent.clear();
      level2ByName.clear();
      
      clasificaciones.forEach((item: any) => {
        const id = item.idClasificacionitem;
        const name = item.txDescripcionClasificacionItem.toUpperCase().trim();
        const level = item.nivel;
        const parentId = item.idClasificacionitemPadre;
        
        classificationsHierarchy.set(id, { name, level, parentId });
        
        if (level === 2) {
          level2Categories.push({ id, name });
          level2ByName.set(name, id);
          level3ByParent.set(id, []);
        } else if (level === 3 && parentId) {
          const types = level3ByParent.get(parentId) || [];
          if (!types.includes(name)) {
            types.push(name);
            level3ByParent.set(parentId, types);
          }
        }
      });
      
      uniqueCategories = [...new Set(clasificaciones.map((item: any) => item.txDescripcionClasificacionItem).filter(Boolean))];
      
      // Filter out similar categories (e.g., "HOGAR" when "HOGAR INTERIORES" exists)
      uniqueCategories = uniqueCategories.filter((cat, index) => {
        const upperCat = cat.toUpperCase();
        for (let i = 0; i < uniqueCategories.length; i++) {
          if (i !== index) {
            const other = uniqueCategories[i].toUpperCase();
            // If one contains the other and they're not exactly the same, keep the longer one
            if (other.includes(upperCat) && other !== upperCat) {
              return false;
            }
            if (upperCat.includes(other) && other !== upperCat) {
              return false;
            }
          }
        }
        return true;
      });
      
      classificationsList = uniqueCategories;
      const mappedCats = uniqueCategories.map((cat: string) => ({
        id: cat.toUpperCase().trim(),
        name: cat,
        icon: getCategoryIcon(cat)
      }));
      categoriesList = [
        { id: "all", name: "Todo", icon: "🏠" },
        ...mappedCats.sort((a, b) => a.name.localeCompare(b.name))
      ];
      setCachedCategories(categoriesList);
    } else {
      const categoriesFromProducts = [...new Set(data.map((item: any) => item.descripcionCategoria || 'OTROS'))];
      
      // Filter out similar categories
      const filteredCategories = categoriesFromProducts.filter((cat, index) => {
        const upperCat = cat.toUpperCase();
        for (let i = 0; i < categoriesFromProducts.length; i++) {
          if (i !== index) {
            const other = categoriesFromProducts[i].toUpperCase();
            if ((other.includes(upperCat) || upperCat.includes(other)) && other !== upperCat) {
              return false;
            }
          }
        }
        return true;
      });
      
      const mappedCats = filteredCategories.map((cat: string) => {
        const normalizedId = cat.toUpperCase().trim();
        return {
          id: normalizedId,
          name: getFriendlyCategory(cat),
          icon: getCategoryIcon(cat)
        };
      });
      categoriesList = [
        { id: "all", name: "Todo", icon: '🏠' },
        ...mappedCats.sort((a, b) => a.name.localeCompare(b.name))
      ];
      setCachedCategories(categoriesList);
    }
    
    const IMAGE_VERSION = 'v1776289862'; // Cambiar esta versión para actualizar imágenes
    
    const getProductImages = (codigo: string): string[] => {
      const paddedCode = codigo.padStart(8, '0').substring(0, 8);
      const images: string[] = [];
      // Generar hasta 10 imágenes (_E, _E2, _E3, ... _E10)
      for (let i = 1; i <= 10; i++) {
        const suffix = i === 1 ? '_E' : `_E${i}`;
        images.push(`https://res.cloudinary.com/dbbkpdhze/image/upload/${IMAGE_VERSION}/${paddedCode}${suffix}.png`);
      }
      return images;
    };
    
console.log('Productos API: total=', data.length, 'first3 codigos:', data.slice(0, 3).map((i: any) => i.codigo));
    console.log('First producto fields:', Object.keys(data[0]));
    
    const rawProducts = data.map((item: any, index: number) => {
      console.log('Producto mapping:', item.descripcionItem?.substring(0, 20), 'categoria:', item.descripcionCategoria);
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
        productImage = `https://res.cloudinary.com/dbbkpdhze/image/upload/${IMAGE_VERSION}/${paddedCode}_E.png`;
        productImages = getProductImages(paddedCode);
      } else {
        productImage = `https://placehold.co/400x400?text=${encodeURIComponent(item.descripcionItem || codigoInterno)}`;
        productImages = [productImage];
      }
      
      const pvpPriceRaw = item.precioVentaSinImpuestos;
      const puntoPasPriceRaw = item.precioVentaConImpuestos;
      
      const pvpPrice = pvpPriceRaw ? Number(pvpPriceRaw) : undefined;
      const puntoPasPrice = puntoPasPriceRaw ? Number(puntoPasPriceRaw) : undefined;
      
      const hasBothPrices = pvpPrice && puntoPasPrice && pvpPrice > 0 && puntoPasPrice > 0;
      const hasDiscount = hasBothPrices;
      const discount = hasDiscount ? Math.round((1 - puntoPasPrice! / pvpPrice!) * 100) : undefined;
      
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
        originalPrice: hasDiscount ? pvpPrice : undefined,
        discount: discount,
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

    const productMap = new Map<string, any>();
    rawProducts.forEach((product: any) => {
      const existing = productMap.get(product.code);
      if (!existing) {
        productMap.set(product.code, product);
      } else {
        const merged = { ...existing };
        if (product.pvpPrice && product.pvpPrice > 0 && !merged.pvpPrice) merged.pvpPrice = product.pvpPrice;
        if (product.puntoPasPrice && product.puntoPasPrice > 0 && !merged.puntoPasPrice) merged.puntoPasPrice = product.puntoPasPrice;
        if (product.price > 0 && merged.price === 0) merged.price = product.price;
        
        const hasBothPrices = merged.pvpPrice && merged.puntoPasPrice && merged.pvpPrice > 0 && merged.puntoPasPrice > 0;
        const hasDiscount = hasBothPrices && merged.pvpPrice > merged.puntoPasPrice;
        
        if (hasBothPrices) {
          merged.price = merged.puntoPasPrice;
          merged.originalPrice = merged.pvpPrice;
          merged.discount = hasDiscount ? Math.round((1 - merged.puntoPasPrice / merged.pvpPrice) * 100) : undefined;
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
      }
    });
    
    apiProducts = Array.from(productMap.values()).map((p: any) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      description: p.description,
      brand: p.brand,
      unit: p.unit,
      stock: p.stock,
      price: p.price,
      originalPrice: p.originalPrice,
      discount: p.discount,
      category: p.category,
      type: p.type,
      image: p.image,
      images: p.images,
      isActive: p.isActive,
      sold: p.sold,
      pvpPrice: p.pvpPrice,
      puntoPasPrice: p.puntoPasPrice,
    }));

    setCachedProducts(apiProducts);
    return apiProducts;
  } catch (error: any) {
    const cached = getCachedProducts();
    if (cached) {
      apiProducts = cached;
      const cachedCats = getCachedCategories();
      if (cachedCats) {
        categoriesList = cachedCats;
      }
      return apiProducts;
    }
    return products;
  }
};

export const getAPIPoducts = (): Product[] => {
  return apiProducts || products;
};
