import { useMemo } from 'react';

import type { Product } from '@/data';
import { useFilters } from '@/stores/filters';

export function applyShopFilters(list: Product[], f: ReturnType<typeof useFilters.getState>['shop']) {
  const r = list.filter((p) => {
    const price = p.priceCents / 100;
    if (f.price === 'under300' && price >= 300) return false;
    if (f.price === '300to600' && (price < 300 || price > 600)) return false;
    if (f.price === 'over600' && price <= 600) return false;
    if (f.weightLimit && Number(p.attributes.weightLimitKg ?? 0) < f.weightLimit) return false;
    const sw = Number(p.attributes.seatWidthCm ?? 0);
    if (f.seatWidth === '40-44' && !(sw >= 40 && sw <= 44)) return false;
    if (f.seatWidth === '45-49' && !(sw >= 45 && sw <= 49)) return false;
    if (f.seatWidth === '50+' && sw < 50) return false;
    if (f.folds && !p.attributes.foldsForCar) return false;
    if (f.inStock && p.stock.status === 'out') return false;
    return true;
  });
  const sorted = [...r].sort((a, b) => {
    if (f.sort === 'priceAsc') return a.priceCents - b.priceCents;
    if (f.sort === 'priceDesc') return b.priceCents - a.priceCents;
    if (f.sort === 'newest') return b.createdAt.localeCompare(a.createdAt);
    return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0) || b.rating.count - a.rating.count;
  });
  // Out-of-stock items sort last.
  return [...sorted.filter((p) => p.stock.status !== 'out'), ...sorted.filter((p) => p.stock.status === 'out')];
}

export function useFilteredProducts(list: Product[] | undefined, sub: string | null) {
  const f = useFilters((s) => s.shop);
  return useMemo(() => applyShopFilters((list ?? []).filter((p) => !sub || p.subcategory === sub), f), [list, f, sub]);
}
