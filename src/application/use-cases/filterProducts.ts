import { Product } from '@/domain/product';

const normalizeText = (value: string | undefined | null) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

const laptopSynonyms = ['LAPTOP', 'LAPTOPS', 'COMPUTADORA', 'COMPUTADORAS', 'COMPUTER', 'COMPUTERS', 'PC', 'PCS'];

const hasLaptopIntent = (query: string) => {
  return laptopSynonyms.some((term) => query.includes(term));
};

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
    const carouselUpper = normalizeText(carouselCategory);
    if (carouselUpper === 'LAVADORAS Y SECADERAS') {
      return sourceProducts.filter((p) =>
        p.isActive && (
          normalizeText(p.category).includes('LAVADORAS') ||
          normalizeText(p.category).includes('SECADERAS') ||
          normalizeText(p.type).includes('LAVADORAS') ||
          normalizeText(p.type).includes('SECADERAS')
        )
      );
    }

    return sourceProducts.filter(
      (p) =>
        p.isActive &&
        (normalizeText(p.category) === carouselUpper ||
          normalizeText(p.type) === carouselUpper)
    );
  }

  let filtered = sourceProducts.filter((p) => p.isActive);

  if (selectedCategory !== 'all') {
    const selectedUpper = normalizeText(selectedCategory);
    filtered = filtered.filter(
      (p) =>
        normalizeText(p.category) === selectedUpper ||
        normalizeText(p.type) === selectedUpper
    );
  }

  if (selectedType !== 'all') {
    const selectedTypeNormalized = normalizeText(selectedType);
    filtered = filtered.filter(
      (p) => {
        const productType = normalizeText(p.type);
        const productCategory = normalizeText(p.category);
        return (
          productType === selectedTypeNormalized ||
          productCategory === selectedTypeNormalized ||
          productType.includes(selectedTypeNormalized) ||
          selectedTypeNormalized.includes(productType) ||
          productCategory.includes(selectedTypeNormalized)
        );
      }
    );
  }

  if (selectedBrand !== 'all') {
    const selectedBrandNormalized = normalizeText(selectedBrand);
    filtered = filtered.filter(
      (p) => normalizeText(p.brand) === selectedBrandNormalized
    );
  }

  if (searchQuery) {
    const query = normalizeText(searchQuery);
    const laptopIntent = hasLaptopIntent(query);
    filtered = filtered.filter(
      (p) => {
        const normalizedName = normalizeText(p.name);
        const normalizedCode = normalizeText(p.code);
        const normalizedBrand = normalizeText(p.brand);
        const normalizedCategory = normalizeText(p.category);
        const normalizedType = normalizeText(p.type);

        const directMatch =
          normalizedName.includes(query) ||
          normalizedCode.includes(query) ||
          normalizedBrand.includes(query) ||
          normalizedCategory.includes(query) ||
          normalizedType.includes(query);

        if (directMatch) return true;

        if (!laptopIntent) return false;

        return (
          laptopSynonyms.some((term) => normalizedName.includes(term)) ||
          laptopSynonyms.some((term) => normalizedCategory.includes(term)) ||
          laptopSynonyms.some((term) => normalizedType.includes(term))
        );
      }
    );
  }

  return filtered.sort((a, b) => {
    if (a.stock === 0 && b.stock > 0) return 1;
    if (a.stock > 0 && b.stock === 0) return -1;
    return 0;
  });
};
