import { Product } from '@/domain/product';

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'brand' | 'code';
  product?: Product;
  price?: number;
  score: number;
}

const normalize = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const levenshteinDistance = (a: string, b: string): number => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix: number[][] = Array.from({ length: b.length + 1 }, () => []);
  for (let i = 0; i <= b.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[b.length][a.length];
};

const getFuzzyScore = (query: string, target: string): number => {
  if (!query || !target) return 0;
  if (target === query) return 120;
  if (target.startsWith(query)) return 100;
  if (target.includes(query)) return 85;

  const words = target.split(/\s+/);
  if (words.some((w) => w.startsWith(query))) return 75;

  if (query.length >= 4) {
    const distance = levenshteinDistance(query, target.slice(0, Math.max(query.length, 6)));
    if (distance <= 2) return 65 - distance * 10;
  }

  return 0;
};

export const buildSearchSuggestions = (
  products: Product[],
  rawQuery: string,
  limit: number = 10
): SearchSuggestion[] => {
  const query = normalize(rawQuery);
  if (!query || query.length < 2) return [];

  const seen = new Set<string>();
  const suggestions: SearchSuggestion[] = [];

  for (const product of products) {
    const normalizedName = normalize(product.name);
    const normalizedCategory = normalize(product.category || '');
    const normalizedBrand = normalize(product.brand || '');
    const normalizedCode = normalize(product.code || '');

    const nameScore = getFuzzyScore(query, normalizedName);
    if (nameScore > 0 && !seen.has(`product:${product.id}`)) {
      seen.add(`product:${product.id}`);
      suggestions.push({
        id: `product:${product.id}`,
        text: product.name,
        type: 'product',
        product,
        price: product.puntoPasPrice || product.pvpPrice || product.price,
        score: nameScore,
      });
    }

    const categoryScore = getFuzzyScore(query, normalizedCategory);
    if (categoryScore > 0 && product.category && !seen.has(`category:${normalizedCategory}`)) {
      seen.add(`category:${normalizedCategory}`);
      suggestions.push({
        id: `category:${normalizedCategory}`,
        text: product.category,
        type: 'category',
        score: categoryScore,
      });
    }

    const brandScore = getFuzzyScore(query, normalizedBrand);
    if (brandScore > 0 && product.brand && !seen.has(`brand:${normalizedBrand}`)) {
      seen.add(`brand:${normalizedBrand}`);
      suggestions.push({
        id: `brand:${normalizedBrand}`,
        text: product.brand,
        type: 'brand',
        score: brandScore,
      });
    }

    const codeScore = getFuzzyScore(query, normalizedCode);
    if (codeScore > 0 && product.code && !seen.has(`code:${normalizedCode}`)) {
      seen.add(`code:${normalizedCode}`);
      suggestions.push({
        id: `code:${normalizedCode}`,
        text: product.code,
        type: 'code',
        product,
        price: product.puntoPasPrice || product.pvpPrice || product.price,
        score: codeScore,
      });
    }
  }

  return suggestions.sort((a, b) => b.score - a.score).slice(0, limit);
};
