import { Product } from '@/domain/product';

export interface ProductFilterInput {
  sourceProducts: Product[];
  selectedCategory: string;
  selectedType: string;
  selectedBrand: string;
  searchQuery: string;
  carouselCategory: string;
}

export const filterProductsUseCase = ({
  sourceProducts,
  selectedCategory,
  selectedType,
  selectedBrand,
  searchQuery,
  carouselCategory,
}: ProductFilterInput): Product[] => {
  if (carouselCategory !== 'all') {
    const carouselUpper = carouselCategory.toUpperCase().trim();
    if (carouselUpper === 'LAVADORAS Y SECADERAS') {
      return sourceProducts.filter((p) =>
        p.isActive && (
          p.category?.toUpperCase().trim().includes('LAVADORAS') ||
          p.category?.toUpperCase().trim().includes('SECADERAS') ||
          p.type?.toUpperCase().trim().includes('LAVADORAS') ||
          p.type?.toUpperCase().trim().includes('SECADERAS')
        )
      );
    }

    return sourceProducts.filter(
      (p) =>
        p.isActive &&
        (p.category?.toUpperCase().trim() === carouselUpper ||
          p.type?.toUpperCase().trim() === carouselUpper)
    );
  }

  let filtered = sourceProducts.filter((p) => p.isActive);

  if (selectedCategory !== 'all') {
    const selectedUpper = selectedCategory.toUpperCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.category?.toUpperCase().trim() === selectedUpper ||
        p.type?.toUpperCase().trim() === selectedUpper
    );
  }

  if (selectedType !== 'all') {
    filtered = filtered.filter(
      (p) => p.type?.toUpperCase().trim() === selectedType.toUpperCase().trim()
    );
  }

  if (selectedBrand !== 'all') {
    filtered = filtered.filter(
      (p) => p.brand?.toUpperCase().trim() === selectedBrand.toUpperCase().trim()
    );
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.code.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
        p.type?.toLowerCase().includes(query)
    );
  }

  return filtered.sort((a, b) => {
    if (a.stock === 0 && b.stock > 0) return 1;
    if (a.stock > 0 && b.stock === 0) return -1;
    return 0;
  });
};
