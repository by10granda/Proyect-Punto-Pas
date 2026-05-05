import { Product } from '@/domain/product';

export interface AdvancedProductFilters {
  brand: string;
  category: string;
  subcategory: string;
  availability: 'all' | 'in-stock' | 'out-of-stock';
  model: string;
  minPrice: string;
  maxPrice: string;
}

export const defaultAdvancedProductFilters: AdvancedProductFilters = {
  brand: 'all',
  category: 'all',
  subcategory: 'all',
  availability: 'all',
  model: '',
  minPrice: '',
  maxPrice: '',
};

export interface AdvancedFilterOptions {
  brands: string[];
  categories: string[];
  subcategories: string[];
}

const normalize = (value: string) => value.toUpperCase().trim();

export const getAdvancedFilterOptions = (products: Product[]): AdvancedFilterOptions => {
  const activeProducts = products.filter((p) => p.isActive);
  return {
    brands: [...new Set(activeProducts.map((p) => p.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    categories: [...new Set(activeProducts.map((p) => p.category).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    subcategories: [...new Set(activeProducts.map((p) => p.type).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
  };
};

export const applyAdvancedProductFilters = (
  products: Product[],
  filters: AdvancedProductFilters
): Product[] => {
  const min = filters.minPrice ? Number(filters.minPrice) : null;
  const max = filters.maxPrice ? Number(filters.maxPrice) : null;
  const modelQuery = filters.model.toLowerCase().trim();

  return products.filter((product) => {
    if (filters.brand !== 'all' && normalize(product.brand) !== normalize(filters.brand)) return false;
    if (filters.category !== 'all' && normalize(product.category) !== normalize(filters.category)) return false;
    if (filters.subcategory !== 'all' && normalize(product.type) !== normalize(filters.subcategory)) return false;

    if (filters.availability === 'in-stock' && product.stock <= 0) return false;
    if (filters.availability === 'out-of-stock' && product.stock > 0) return false;

    const price = product.puntoPasPrice || product.pvpPrice || product.price || 0;
    if (min !== null && !Number.isNaN(min) && price < min) return false;
    if (max !== null && !Number.isNaN(max) && price > max) return false;

    if (modelQuery) {
      const haystack = `${product.code} ${product.name}`.toLowerCase();
      if (!haystack.includes(modelQuery)) return false;
    }

    return true;
  });
};
