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
}

const CACHE_KEY = 'puntopas_products';
const CACHE_CATEGORIES_KEY = 'puntopas_categories';
const CACHE_EXPIRY = 1000 * 60 * 30;

const categoryMap: Record<string, { name: string; icon: string }> = {
  'HERRAMIENTAS': { name: 'Herramientas', icon: '🔧' },
  'ELECTRICOS': { name: 'Electricidad', icon: '💡' },
  'FERRETERIA EN GENERAL': { name: 'Ferretería', icon: '🔩' },
  'HOGAR': { name: 'Hogar', icon: '🏠' },
  'ADITIVOS': { name: 'Aditivos', icon: '🧪' },
  'CABOS Y PIOLAS': { name: 'Cables y Cuerdas', icon: '🪢' },
  'CLAVOS Y TORNILLOS': { name: 'Fijación', icon: '🔩' },
  'PINTURAS': { name: 'Pinturas', icon: '🎨' },
  'CONSTRUCCION': { name: 'Construcción', icon: '🏗️' },
  'FONTANERIA': { name: 'Plomería', icon: '🔧' },
  'JARDIN': { name: 'Jardín', icon: '🌿' },
  'AUTOMOTRIZ': { name: 'Automotriz', icon: '🚗' },
  'CERRAJERIA': { name: 'Cerrajería', icon: '🔐' },
  'SOLDADURA': { name: 'Soldadura', icon: '⚡' },
  'LIMPIEZA': { name: 'Limpieza', icon: '🧹' },
  'EPIS': { name: 'Protección Personal', icon: '🦺' },
  'AGRICOLA': { name: 'Agrícola', icon: '🌾' },
};

const getFriendlyCategory = (apiCategory: string): string => {
  if (!apiCategory) return 'OTROS';
  const mapped = categoryMap[apiCategory.toUpperCase()];
  return mapped ? mapped.name.toUpperCase() : apiCategory.toUpperCase();
};

const getCategoryIcon = (apiCategory: string): string => {
  if (!apiCategory) return '📦';
  const mapped = categoryMap[apiCategory.toUpperCase()];
  return mapped ? mapped.icon : '📦';
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
  } catch {}
};

const getCachedCategories = (): string[] | null => {
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
  } catch {}
};

export const products: Product[] = [];

let categoriesList: { id: string; name: string; icon: string }[] = [{ id: "all", name: "Todo", icon: "🏠" }];

export const categories = categoriesList;

export const getCategories = () => categoriesList;

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
  return products.filter(p => p.isActive && p.discount && p.discount > 0);
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
    return apiProducts;
  }
  
  try {
    const data = await productService.getProducts();
    
    if (Array.isArray(data)) {
      apiProducts = data.map((item: any, index: number) => {
        const categoria = item.categoria || item.descripcionCategoria || 'OTROS';
        
        return {
          id: String(item.idItem || index + 1),
          code: String(item.codigoInterno || item.codigoBarras || ''),
          name: item.descripcionItem || '',
          description: item.descripcionItem || '',
          brand: item.descripcionMarca || '',
          unit: item.descripcionUnidad || 'UNIDAD',
          stock: 0,
          price: Number(item.precioVentaConImpuestos || item.precioVentaSinImpuestos || 0),
          originalPrice: undefined,
          discount: undefined,
          category: getFriendlyCategory(categoria),
          type: item.tipo || categoria || 'OTROS',
          image: item.imagen || item.image || `https://placehold.co/400x400?text=${encodeURIComponent(item.descripcionItem || 'Producto')}`,
          isActive: item.estado === 'A',
          sold: 0,
        };
      });

      setCachedProducts(apiProducts);

      const uniqueCategories = [...new Set(data.map((item: any) => item.categoria || item.descripcionCategoria).filter(Boolean))] as string[];
      setCategories(uniqueCategories);
      
      return apiProducts;
    }
    
    return products;
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
