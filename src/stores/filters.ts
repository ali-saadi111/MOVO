import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { RatingLevel } from '@/data/models';
import { persistStorage } from './storage';

export type MustHave = 'stepFree' | 'toilet' | 'parking' | 'elevator';

type FiltersState = {
  map: { ratings: RatingLevel[]; fitsMe: boolean; mustHave: MustHave[]; category: string };
  shop: { price: string | null; weightLimit: number | null; seatWidth: string | null; folds: boolean; inStock: boolean; sort: 'recommended' | 'priceAsc' | 'priceDesc' | 'newest' };
  setMap: (p: Partial<FiltersState['map']>) => void;
  setShop: (p: Partial<FiltersState['shop']>) => void;
  clearShop: () => void;
  clearMap: () => void;
};

const shopDefault: FiltersState['shop'] = { price: null, weightLimit: null, seatWidth: null, folds: false, inStock: false, sort: 'recommended' };
const mapDefault: FiltersState['map'] = { ratings: [], fitsMe: true, mustHave: [], category: 'all' };

export const useFilters = create<FiltersState>()(
  persist(
    (set) => ({
      map: mapDefault,
      shop: shopDefault,
      setMap: (p) => set((s) => ({ map: { ...s.map, ...p } })),
      setShop: (p) => set((s) => ({ shop: { ...s.shop, ...p } })),
      clearShop: () => set((s) => ({ shop: { ...shopDefault, sort: s.shop.sort } })),
      clearMap: () => set((s) => ({ map: { ...mapDefault, category: s.map.category } })),
    }),
    { name: 'movo.filters', storage: persistStorage },
  ),
);

export const mapFilterCount = (m: FiltersState['map']) => m.ratings.length + m.mustHave.length;
export const shopFilterCount = (s: FiltersState['shop']) =>
  [s.price, s.weightLimit, s.seatWidth].filter(Boolean).length + (s.folds ? 1 : 0) + (s.inStock ? 1 : 0);
