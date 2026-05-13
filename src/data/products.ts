import { ApiClassificationItem, ApiInventoryItem, ApiProductItem, productService } from '@/services/api';
import { ClassificationItem, Level2Category, Product } from '@/domain/product';
import { buildClassificationMap } from '@/infrastructure/mappers/classificationMapper';
import { mapApiProductsToDomain } from '@/infrastructure/mappers/productMapper';

export type { Product, Level2Category, ClassificationItem } from '@/domain/product';

const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/dbbkpdhze/image/upload/';
const CLOUDINARY_VERSION = 'v1774530743';


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
    const [inventario, clasificaciones] = await Promise.all([
      productService.getInventario(),
      productService.getClasificacionItem()
    ]);
    
    if (inventario && Array.isArray(inventario)) {
      inventario.forEach((item: ApiInventoryItem) => {
        const key = String(item.codigo);
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

  if (!forceRefresh && apiProducts && apiProducts.length > 0) {
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
      inventario.forEach((item: ApiInventoryItem) => {
        const key = String(item.codigo);
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
    });
    apiProductsLastSyncAt = Date.now();

    return apiProducts;
  } catch (_error: unknown) {
    return [];
  }
};

export const getAPIPoducts = (): Product[] => {
  return apiProducts || [];
};
