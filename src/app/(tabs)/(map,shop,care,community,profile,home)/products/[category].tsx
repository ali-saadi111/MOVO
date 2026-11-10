import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

import type { ProductCategory } from '@/data';
import { useProducts } from '@/data/queries';
import { CartButton } from '@/features/shell/HeaderButtons';
import { useFilteredProducts } from '@/features/shell/useFilteredProducts';
import { productCategoryLabel, subcategoryLabel } from '@/features/labels';
import { useT } from '@/i18n';
import { shopFilterCount, useFilters } from '@/stores/filters';
import { layout, radii, space, useTheme } from '@/theme';
import { bodyFont } from '@/theme/fonts';
import { Chip, ChipRow, EmptyState, ErrorState, Icon, ProductCard, Screen, Skeleton, Text, go, useTabNav } from '@/ui';

export default function ProductList() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const isSearch = category === 'search';
  const t = useTheme();
  const tr = useT();
  const { push } = useTabNav();
  const [search, setSearch] = useState('');
  const q = useProducts(isSearch ? { search: search || undefined } : { category: category as ProductCategory });
  const [sub, setSub] = useState<string | null>(null);
  const items = useFilteredProducts(isSearch && !search ? [] : q.data, sub);
  const f = useFilters((s) => s.shop);
  const clear = useFilters((s) => s.clearShop);
  const subs = [...new Set((q.data ?? []).map((p) => p.subcategory))];
  const count = shopFilterCount(f);
  const sortLabel = { recommended: tr('sort.recommended', 'Recommended'), priceAsc: tr('sort.priceAsc', 'Price low–high'), priceDesc: tr('sort.priceDesc', 'Price high–low'), newest: tr('sort.newest', 'Newest') }[f.sort];
  const title = isSearch ? tr('shop.searchTitle', 'Search') : productCategoryLabel(tr, category as ProductCategory);
  const rows: (typeof items)[] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));

  return (
    <Screen title={title} variant="root" headerRight={() => <CartButton />} refreshing={q.isRefetching} onRefresh={() => q.refetch()}>
      {isSearch ? (
        <View style={{ marginHorizontal: layout.margin, height: 44, borderRadius: radii.cell, backgroundColor: t.colors.fill, flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.sm, gap: space.xs, marginBottom: space.md }}>
          <Icon name="magnifyingglass" size={17} color="textSecondary" />
          <TextInput autoFocus value={search} onChangeText={setSearch} placeholder={tr('shop.search', 'Search wheelchairs, walkers…')} placeholderTextColor={t.colors.textSecondary} style={{ flex: 1, fontSize: 17, fontFamily: bodyFont(t.rtl), color: t.colors.textPrimary, outlineStyle: 'none' } as never} />
        </View>
      ) : (
        <Text variant="subheadline" color="textSecondary" tabular style={{ marginHorizontal: layout.margin, marginTop: -4, marginBottom: space.md }}>{tr('shop.count', '{{n}} products', { n: items.length })}</Text>
      )}
      {!isSearch && subs.length > 1 ? (
        <ChipRow options={[{ value: '__all', label: tr('map.cat.all', 'All') }, ...subs.map((s) => ({ value: s, label: subcategoryLabel(tr, s) }))]} value={sub ?? '__all'} onChange={(v) => setSub(v === '__all' ? null : v)} style={{ marginBottom: space.xs }} />
      ) : null}
      <View style={{ flexDirection: 'row', gap: space.xs, paddingHorizontal: layout.margin, marginBottom: space.lg }}>
        <Chip label={count ? tr('shop.filtersN', 'Filters · {{n}}', { n: count }) : tr('map.filters', 'Filters')} selected={count > 0} icon={<Icon name="line.3.horizontal.decrease" size={15} />} onPress={() => go.push(`/sheets/shop-filters?category=${category}`)} />
        <Chip label={tr('shop.sortBy', 'Sort: {{s}}', { s: sortLabel })} icon={<Icon name="arrow.up.arrow.down" size={15} />} onPress={() => go.push(`/sheets/shop-filters?category=${category}&focus=sort`)} />
      </View>
      {q.isLoading ? (
        <View style={{ flexDirection: 'row', gap: space.sm, paddingHorizontal: layout.margin }}>
          {[0, 1].map((i) => <View key={i} style={{ flex: 1, gap: 8 }}><Skeleton height={170} radius={16} /><Skeleton shape="text" width="80%" /><Skeleton shape="text" width="40%" /></View>)}
        </View>
      ) : q.isError && !q.data ? (
        <ErrorState onRetry={() => q.refetch()} />
      ) : !items.length ? (
        isSearch && !search ? <EmptyState symbol="magnifyingglass" message={tr('shop.searchHint', 'Search by name, like “rollator” or “cushion”.')} /> :
        <EmptyState symbol="line.3.horizontal.decrease" message={tr('shop.noMatch', 'No products match these filters.')} actionLabel={tr('shop.clear', 'Clear filters')} onAction={() => { clear(); setSub(null); }} />
      ) : (
        <View style={{ paddingHorizontal: layout.margin, gap: space.xl }}>
          {rows.map((r, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: layout.gridGutter }}>
              {r.map((p, j) => <ProductCard key={p.id} product={p} index={i * 2 + j} onPress={() => push(`/product/${p.id}`)} />)}
              {r.length === 1 ? <View style={{ flex: 1 }} /> : null}
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}
