import { ApiClassificationItem, ApiInventoryItem, ApiProductItem, productService } from '@/services/api';
import { ClassificationItem, Level2Category, Product } from '@/domain/product';
import { buildClassificationMap } from '@/infrastructure/mappers/classificationMapper';
import { mapApiProductsToDomain } from '@/infrastructure/mappers/productMapper';

export type { Product, Level2Category, ClassificationItem } from '@/domain/product';

const normalizeProductCode = (value: string | number | undefined | null) =>
  String(value || '').trim().padStart(8, '0').substring(0, 8);

const manualStockOverrides: Record<string, number> = {
  '00001776': 0,
};

const excludedProductCodes = new Set(['00000626']);

const PRODUCT_DESCRIPTIONS_SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1Vw3Rb0Q0U5WSn5UciiJ8FuGsYtdWrOO9GLlQzphdiEA/export?format=csv&gid=0';


let classificationsList: string[] = [];
const classificationsHierarchy: Map<number, { name: string; level: number; parentId: number | null }> = new Map();
let level2Categories: Level2Category[] = [];
const level3ByParent: Map<number, string[]> = new Map();
const level2ByName: Map<string, number> = new Map();

const applyClassificationState = (items: ClassificationItem[]) => {
  const mapped = buildClassificationMap(items);
  classificationsHierarchy.clear();
  mapped.hierarchy.forEach((value, key) => classificationsHierarchy.set(key, value));
  level2Categories = mapped.level2Categories;
  level3ByParent.clear();
  mapped.level3ByParent.forEach((value, key) => level3ByParent.set(key, value));
  level2ByName.clear();
  mapped.level2ByName.forEach((value, key) => level2ByName.set(key, value));
  return mapped;
};

export const getClassifications = () => classificationsList;
export const getLevel2Categories = () => level2Categories;
export const getLevel3ByParent = () => level3ByParent;
export const loadClassificationsFromAPI = async (): Promise<void> => {
  try {
    const clasificaciones = await productService.getClasificacionItem();
    
    if (!Array.isArray(clasificaciones) || clasificaciones.length === 0) return;

    applyClassificationState(clasificaciones as ClassificationItem[]);
  } catch (error) {
    console.error('Error loading classifications:', error);
  }
};
export const getLevel3TypesByParentId = (parentId: number): string[] => {
  return level3ByParent.get(parentId) || [];
};
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
    'https://assets.distribuidor-puntopas.com/PRODUCTOS_ESMERALDAS2/00000041_E.png',
  ],
  '00000349': [
    'https://assets.distribuidor-puntopas.com/PRODUCTOS_ESMERALDAS2/00000349_E.png',
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
let apiProductsLastSyncAt = 0;
let productDescriptionsByCode: Record<string, string> = {};
const inventarioMap: Record<string, number> = {};
let updateInventoryCallback: ((products: Product[]) => void) | null = null;

const unescapeCsvValue = (value: string) => value.replace(/^"|"$/g, '').replace(/""/g, '"').trim();

const parseSheetCsv = (csv: string): Record<string, string> => {
  const map: Record<string, string> = {};
  const lines = csv.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  for (const line of lines) {
    const firstCommaIndex = line.indexOf(',');
    if (firstCommaIndex <= 0) continue;

    const code = unescapeCsvValue(line.slice(0, firstCommaIndex));
    const description = unescapeCsvValue(line.slice(firstCommaIndex + 1));

    if (!code || !description) continue;
    if (/^codigo$/i.test(code) || /^descripci[oó]n$/i.test(description)) continue;

    map[normalizeProductCode(code)] = description;
  }

  return map;
};

const loadProductDescriptionsFromSheet = async (): Promise<Record<string, string>> => {
  try {
    const response = await fetch(PRODUCT_DESCRIPTIONS_SHEET_CSV_URL);
    if (!response.ok) return productDescriptionsByCode;

    const csv = await response.text();
    const parsed = parseSheetCsv(csv);
    if (Object.keys(parsed).length > 0) {
      productDescriptionsByCode = parsed;
    }

    return productDescriptionsByCode;
  } catch (error) {
    console.error('Error loading product descriptions from sheet:', error);
    return productDescriptionsByCode;
  }
};

export const setInventoryUpdateCallback = (callback: (products: Product[]) => void) => {
  updateInventoryCallback = callback;
};

const updateProductsStock = () => {
  if (apiProducts && apiProducts.length > 0) {
    apiProducts = apiProducts.map(product => ({
      ...product,
      stock:
        manualStockOverrides[normalizeProductCode(product.code || product.id)] ??
        inventarioMap[normalizeProductCode(product.code || product.id)] ??
        0
    }));
    if (updateInventoryCallback) {
      updateInventoryCallback([...apiProducts]);
    }
  }
};

export const refreshInventario = async (): Promise<void> => {
  try {
    const [inventario, clasificaciones] = await Promise.all([
      productService.getInventario(),
      productService.getClasificacionItem()
    ]);
    
    if (inventario && Array.isArray(inventario)) {
      inventario.forEach((item: ApiInventoryItem) => {
        const key = normalizeProductCode(item.codigo);
        inventarioMap[key] = Number(item.disponible || 0);
      });
      updateProductsStock();
    }
    
    if (clasificaciones && Array.isArray(clasificaciones) && clasificaciones.length > 0) {
      applyClassificationState(clasificaciones as ClassificationItem[]);
    }
  } catch (error) {
    console.error('Error refreshing inventory:', error);
  }
};

export const loadProductsFromAPI = async ({
  forceRefresh = false,
  maxAgeMs = 60000,
}: { forceRefresh?: boolean; maxAgeMs?: number } = {}): Promise<Product[]> => {
  const hasFreshCache =
    apiProducts &&
    apiProducts.length > 0 &&
    Date.now() - apiProductsLastSyncAt <= maxAgeMs;

  if (!forceRefresh && hasFreshCache) {
    return apiProducts;
  }

  try {
    const data = await productService.getProducts();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }

    const [inventario, clasificaciones, descriptionsByCode] = await Promise.all([
      productService.getInventario().catch(() => []),
      productService.getClasificacionItem().catch(() => []),
      loadProductDescriptionsFromSheet().catch(() => ({}))
    ]);

    if (inventario && Array.isArray(inventario) && inventario.length > 0) {
      inventario.forEach((item: ApiInventoryItem) => {
        const key = normalizeProductCode(item.codigo);
        const disponible = Number(item.disponible || 0);
        inventarioMap[key] = disponible;
      });
    }
    
    let uniqueCategories: string[] = [];
    
    if (clasificaciones && Array.isArray(clasificaciones) && clasificaciones.length > 0) {
      const mapped = applyClassificationState(clasificaciones as ClassificationItem[]);

      uniqueCategories = mapped.classificationsList;
      
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
    } else {
      const categoriesFromProducts = [...new Set(data.map((item: ApiProductItem) => item.descripcionCategoria || 'OTROS'))];
      
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
    }
    
    const IMAGE_VERSION = 'v1776289862';

    apiProducts = mapApiProductsToDomain(data, {
      imageVersion: IMAGE_VERSION,
      customProductImages,
      inventarioMap,
      getFriendlyCategory,
    }).filter((product) => !excludedProductCodes.has(normalizeProductCode(product.code || product.id)));
    apiProducts = apiProducts.map((product) => {
      const normalizedCode = normalizeProductCode(product.code || product.id);
      const sheetDescription = descriptionsByCode[normalizedCode];
      if (!sheetDescription) return product;
      return { ...product, description: sheetDescription };
    });
    apiProducts = apiProducts.map((product) => {
      const code = normalizeProductCode(product.code || product.id);
      const forcedStock = manualStockOverrides[code];
      if (forcedStock === undefined) return product;
      return { ...product, stock: forcedStock };
    });
    apiProductsLastSyncAt = Date.now();

    return apiProducts;
  } catch (_error: unknown) {
    return apiProducts || [];
  }
};

export const getAPIPoducts = (): Product[] => {
  return apiProducts || [];
};
