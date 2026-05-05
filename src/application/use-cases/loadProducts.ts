import { Product } from '@/domain/product';

export interface LoadProductsResult {
  products: Product[];
  hasData: boolean;
}

export const loadProductsUseCase = async (
  loadProductsFromAPI: () => Promise<Product[]>
): Promise<LoadProductsResult> => {
  const apiProducts = await loadProductsFromAPI();
  return {
    products: apiProducts,
    hasData: Array.isArray(apiProducts) && apiProducts.length > 0,
  };
};
