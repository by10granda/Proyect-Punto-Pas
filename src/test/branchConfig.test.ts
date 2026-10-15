import { beforeEach, expect, it } from 'vitest';
import { getApiBaseUrl, getBranchOptions, getSelectedBranchKey, setSelectedBranchKey } from '@/infrastructure/api/branchConfig';

beforeEach(() => localStorage.clear());

it('only exposes Almacen Pas in the catalog branch selector', () => {
  expect(getBranchOptions()).toEqual([
    { key: 'almacen-pas', label: 'Almacen Pas', location: 'Esmeraldas' },
  ]);
});

it.each(['variedades-pas', 'sucursal-3', 'unknown'])('replaces a previous selection of %s', (key) => {
  localStorage.setItem('puntopas_selected_branch', key);
  expect(getSelectedBranchKey()).toBe('almacen-pas');
  expect(getApiBaseUrl()).toBe('https://api.distribuidor-puntopas.com/api');
  expect(localStorage.getItem('puntopas_selected_branch')).toBe('almacen-pas');
});

it('does not allow persisting another branch', () => {
  setSelectedBranchKey('variedades-pas');
  expect(localStorage.getItem('puntopas_selected_branch')).toBe('almacen-pas');
});
