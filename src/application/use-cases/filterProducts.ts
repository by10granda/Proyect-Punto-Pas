import { Product } from '@/domain/product';

const normalizeText = (value: string | undefined | null) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

const laptopSynonyms = ['LAPTOP', 'LAPTOPS', 'COMPUTADORA', 'COMPUTADORAS', 'COMPUTER', 'COMPUTERS'];

const containsWholeWord = (text: string, term: string) => {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(^|[^A-Z0-9])${escaped}([^A-Z0-9]|$)`);
  return regex.test(text);
};

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
    const queryTerms = query.split(' ').filter(Boolean);
    const laptopIntent = hasLaptopIntent(query);
    filtered = filtered.filter(
      (p) => {
        const normalizedName = normalizeText(p.name);
        const normalizedCode = normalizeText(p.code);
        const normalizedDescription = normalizeText(p.description);
        const searchableText = [
          normalizedName,
          normalizedDescription,
          normalizedCode,
        ].join(' ');

        const hasAllQueryFragments =
          queryTerms.length > 0 &&
          queryTerms.every((term) => searchableText.includes(term));

        const directMatch =
          hasAllQueryFragments;

        if (directMatch) return true;

        if (!laptopIntent) return false;

        return (
          laptopSynonyms.some((term) => containsWholeWord(normalizedName, term)) ||
          laptopSynonyms.some((term) => containsWholeWord(normalizedCategory, term)) ||
          laptopSynonyms.some((term) => containsWholeWord(normalizedType, term))
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
