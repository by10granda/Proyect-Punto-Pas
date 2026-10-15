import { expect, it } from 'vitest';
import { filterProductsUseCase } from '@/application/use-cases/filterProducts';
import { Product } from '@/domain/product';

it('matches laptop synonyms through category and type without throwing', () => {
  const sourceProducts = [
    { id: '1', name: 'Equipo A', category: 'Laptops', type: 'Portatil' },
    { id: '2', name: 'Equipo B', category: 'Electronica', type: 'Computadoras' },
    { id: '3', name: 'Mesa', category: 'Muebles', type: 'Mesa' },
  ].map((product) => ({ ...product, isActive: true, stock: 1 } as Product));
  const result = filterProductsUseCase({
    sourceProducts, selectedCategory: 'all', selectedType: 'all', selectedBrand: 'all',
    searchQuery: 'computer', carouselCategory: 'all',
  });
  expect(result.map((product) => product.id)).toEqual(['1', '2']);
});
