import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import type { ProductCategory } from '@/data';
import { sync } from '@/data';
import { applyShopFilters } from '@/features/shell/useFilteredProducts';
import { useT } from '@/i18n';
import { useFilters } from '@/stores/filters';
import { layout, space } from '@/theme';
import { Button, ChipWrap, ListRow, Section, Sheet, Switch, Text, go } from '@/ui';

export default function ShopFilters() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const tr = useT();
  const f = useFilters((s) => s.shop);
  const set = useFilters((s) => s.setShop);
  const clear = useFilters((s) => s.clearShop);
  const n = useMemo(() => applyShopFilters(sync.allProducts().filter((p) => !category || category === 'search' || p.category === (category as ProductCategory)), f).length, [f, category]);
  const mobility = !category || category === 'mobility';
  const sorts = [['recommended', tr('sort.recommended', 'Recommended')], ['priceAsc', tr('sort.priceAsc', 'Price low–high')], ['priceDesc', tr('sort.priceDesc', 'Price high–low')], ['newest', tr('sort.newest', 'Newest')]] as const;
  return (
    <Sheet title={tr('map.filters', 'Filters')} detent={0.85}
      footer={<Button label={n ? tr('shop.showN', 'Show {{n}} products', { n }) : tr('shop.noneMatch', 'No products match')} disabledReason={n ? null : tr('shop.noneMatch', 'No products match')} onPress={go.back} />}>
      <View style={{ height: space.sm }} />
      <Section header={tr('shop.sort', 'Sort')}>
        {sorts.map(([k, l]) => <ListRow key={k} title={l} trailing={{ type: 'check', on: f.sort === k }} onPress={() => set({ sort: k })} />)}
      </Section>
      <View style={{ paddingHorizontal: layout.margin, gap: space.xl }}>
        <Group title={tr('filter.price', 'Price')}>
          <ChipWrap options={[{ value: 'under300', label: tr('filter.under300', 'Under $300') }, { value: '300to600', label: '$300–600' }, { value: 'over600', label: tr('filter.over600', 'Over $600') }]} value={f.price} onChange={(v) => set({ price: f.price === v ? null : v })} />
        </Group>
        {mobility ? (
          <>
            <Group title={tr('filter.weight', 'Weight limit')}>
              <ChipWrap options={[100, 120, 150].map((w) => ({ value: String(w), label: `${w} kg+` }))} value={f.weightLimit ? String(f.weightLimit) : null} onChange={(v) => set({ weightLimit: f.weightLimit === Number(v) ? null : Number(v) })} />
            </Group>
            <Group title={tr('filter.seat', 'Seat width')}>
              <ChipWrap options={['40-44', '45-49', '50+'].map((w) => ({ value: w, label: `${w.replace('-', '–')} cm` }))} value={f.seatWidth} onChange={(v) => set({ seatWidth: f.seatWidth === v ? null : v })} />
            </Group>
          </>
        ) : null}
      </View>
      <View style={{ height: space.xl }} />
      <Section>
        {mobility ? <ListRow title={tr('filter.folds', 'Folds for the car')} trailing={{ type: 'node', node: <Switch value={f.folds} onValueChange={(v) => set({ folds: v })} label={tr('filter.folds', 'Folds for the car')} /> }} /> : null}
        <ListRow title={tr('filter.inStock', 'In stock only')} trailing={{ type: 'node', node: <Switch value={f.inStock} onValueChange={(v) => set({ inStock: v })} label={tr('filter.inStock', 'In stock only')} /> }} />
      </Section>
      <Button label={tr('shop.clear', 'Clear filters')} variant="plain" onPress={clear} />
    </Sheet>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={{ gap: space.sm }}><Text variant="headline">{title}</Text>{children}</View>;
}
