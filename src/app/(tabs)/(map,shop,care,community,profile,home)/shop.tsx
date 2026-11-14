import { tabRoot } from '@/ui/TabRoot';
import { Image } from 'expo-image';
import { useMemo, useRef, useState } from 'react';
import { ScrollView, View, type NativeScrollEvent } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Product, ProductCategory } from '@/data';
import { useProducts } from '@/data/queries';
import { photoByKey, photoFor } from '@/art/photos';
import { CanvasActions } from '@/features/shell/HeaderButtons';
import { mobilityLabel, productCategoryLabel } from '@/features/labels';
import { useT } from '@/i18n';
import { haptic } from '@/lib/haptics';
import { cartCount, useCart } from '@/stores/cart';
import { useCaregiver } from '@/stores/caregiver';
import { useDev } from '@/stores/dev';
import { layout, space, useTheme } from '@/theme';
import {
  ActingForBar, CanvasHeader, EmptyState, ErrorState, GlassSurface, Icon, OfflinePill, ProductCard, PromoCarousel, Pressable, RoundButton, Screen, SectionHeader, Segmented, Skeleton, Text, go, useMobilityFor, useTabNav,
} from '@/ui';

/** Category pills: each filters the grid on this screen. */
const CATS: [ProductCategory, string][] = [
  ['mobility', 'p:wheelchair-light-0'], ['bathroom-safety', 'p:shower-chair-0'], ['daily-living', 'p:reacher-0'],
  ['medical-supplies', 'p:first-aid-0'], ['home-adaptations', 'p:grab-bar-0'], ['parts-accessories', 'p:armrest-0'],
];

const PAGE = 12;
type Sort = 0 | 1 | 2; // popular, new, deals

const popular = (a: Product, b: Product) => Number(b.isBestSeller) - Number(a.isBestSeller) || b.rating.count - a.rating.count;
const inStockFirst = (a: Product, b: Product) => Number(a.stock.status === 'out') - Number(b.stock.status === 'out');

function ShopHome() {
  const t = useTheme();
  const tr = useT();
  const insets = useSafeAreaInsets();
  const { push } = useTabNav();
  const q = useProducts();
  const mob = useMobilityFor();
  const offline = useDev((s) => s.offline);
  const switchTo = useCaregiver((s) => s.switchTo);
  const count = useCart((s) => cartCount(s.lines));
  const [cat, setCat] = useState<ProductCategory | null>(null);
  const [sort, setSort] = useState<Sort>(0);
  const [pages, setPages] = useState(1);
  const [pinned, setPinned] = useState(false);
  const loading = useRef(false);

  const all = useMemo(() => q.data ?? [], [q.data]);
  const fresh = useMemo(() => [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [all]);
  const forYou = mob ? all.filter((p) => p.fitsMobility.includes(mob) && p.category === 'mobility' && p.stock.status !== 'out').slice(0, 8) : [];
  const list = useMemo(() => {
    const base = cat ? all.filter((p) => p.category === cat) : all;
    const sorted = sort === 0 ? [...base].sort(popular) : sort === 1 ? [...base].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : base.filter((p) => p.compareAtCents);
    return sorted.sort(inStockFirst);
  }, [all, cat, sort]);
  const shown = list.slice(0, pages * PAGE);
  const rows: Product[][] = [];
  for (let i = 0; i < shown.length; i += 2) rows.push(shown.slice(i, i + 2));

  const pickCat = (c: ProductCategory | null) => { haptic.selection(); setCat(c); setPages(1); };
  const pickSort = (i: number) => { setSort(i as Sort); setPages(1); };
  const onScroll = (e: NativeScrollEvent) => {
    const y = e.contentOffset.y;
    if ((y > 110) !== pinned) setPinned(y > 110);
    const nearEnd = y + e.layoutMeasurement.height > e.contentSize.height - 700;
    if (nearEnd && !loading.current && shown.length < list.length) {
      loading.current = true;
      setPages((n) => n + 1);
      setTimeout(() => { loading.current = false; }, 250);
    }
  };
  const ask = () => import('@/lib/whatsapp').then((m) => m.openWhatsApp('Hi Movo, I need help choosing equipment.'));

  const search = (
    <Pressable feedback="none" onPress={() => push('/products/search')} accessibilityRole="search" accessibilityLabel={tr('shop.search', 'Search wheelchairs, walkers…')}
      style={{ flex: 1, height: 44, borderRadius: 22, backgroundColor: t.colors.fill, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: space.xs }}>
      <Icon name="magnifyingglass" size={17} color="textSecondary" />
      <Text variant="body" color="textSecondary" numberOfLines={1}>{tr('shop.search', 'Search wheelchairs, walkers…')}</Text>
    </Pressable>
  );

  return (
    <Screen title={tr('tab.shop', 'Shop')} variant="canvas" refreshing={q.isRefetching} onRefresh={() => q.refetch()} onScrollEvent={onScroll}
      header={<CanvasHeader compact title={tr('tab.shop', 'Shop')} actions={<CanvasActions cart />} below={<View style={{ flexDirection: 'row' }}>{search}</View>} />}
      overlay={pinned ? (
        <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(120)} style={{ position: 'absolute', top: 0, start: 0, end: 0 }}>
          <GlassSurface style={{ paddingTop: insets.top + 6, paddingBottom: 8, paddingHorizontal: layout.margin, flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
            {search}
            <RoundButton icon="cart" label={count === 1 ? tr('nav.cartOne', 'Cart, 1 item') : tr('nav.cart', 'Cart, {{n}} items', { n: count })} count={count || undefined} onPress={() => push('/cart')} />
          </GlassSurface>
        </Animated.View>
      ) : null}>
      <ActingForBar onSwitchBack={() => switchTo(null)} />
      {offline ? <OfflinePill /> : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: layout.margin, gap: space.xs, paddingTop: space.xs, paddingBottom: space.md }} accessibilityRole="tablist">
        <CatPill label={tr('map.cat.all', 'All')} selected={!cat} onPress={() => pickCat(null)} />
        {CATS.map(([c, img]) => <CatPill key={c} label={productCategoryLabel(tr, c)} image={photoByKey(img)} selected={cat === c} onPress={() => pickCat(c)} />)}
      </ScrollView>

      {q.isError && !q.data ? <ErrorState offline={offline} onRetry={() => q.refetch()} /> : null}

      <PromoCarousel compact slides={[
        { key: 'ask', tone: 'navy' as const, top: tr('shop.promo.askTop', 'NOT SURE'), bottom: tr('shop.promo.askBottom', 'WHAT FITS?'), caption: tr('shop.promo.askCaption', 'ASK US ON WHATSAPP'), image: photoByKey('p:rollator-0'), label: tr('shop.ask', 'Not sure what fits? Ask us on WhatsApp'), onPress: ask },
        ...(fresh[0] ? [{ key: 'new', tone: 'cream' as const, top: tr('shop.promo.newTop', 'JUST'), bottom: tr('shop.promo.newBottom', 'ARRIVED'), caption: tr('shop.promo.newCaption', 'NEW IN THE MOVO SHOP'), image: fresh[0].images[0] ? photoFor(fresh[0].images[0]) : undefined, label: tr('shop.new', 'New arrivals'), onPress: () => pickSort(1) }] : []),
      ]} />
      {mob && forYou.length ? (
        <View style={{ marginBottom: space.lg }}>
          <SectionHeader title={tr('shop.forYouShort', 'Picked for you')} actionLabel={tr('why.short', 'Why these?')} onAction={() => go.push('/sheets/why-this')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: layout.margin, gap: space.sm }} accessibilityLabel={tr('shop.forYouTitle', 'Picked for {{m}} users', { m: mobilityLabel(tr, mob).toLowerCase() })}>
            {forYou.map((p, i) => <ProductCard key={p.id} product={p} layout="rail" index={i} onPress={() => push(`/product/${p.id}`)} />)}
          </ScrollView>
        </View>
      ) : null}


      <SectionHeader
        title={cat ? productCategoryLabel(tr, cat) : tr('shop.all', 'Shop all')}
        actionLabel={cat ? tr('shop.filtersSort', 'Filter and sort') : undefined}
        onAction={cat ? () => push(`/products/${cat}`) : undefined}
      />
      <Segmented values={[tr('shop.popular', 'Popular'), tr('shop.newShort', 'New'), tr('shop.deals', 'Deals')]} index={sort} onChange={pickSort} style={{ marginHorizontal: layout.margin, marginBottom: space.md }} />

      {q.isLoading ? (
        <View style={{ flexDirection: 'row', gap: space.sm, paddingHorizontal: layout.margin }}>
          {[0, 1].map((i) => <View key={i} style={{ flex: 1, gap: 8 }}><Skeleton height={170} radius={16} /><Skeleton shape="text" width="80%" /><Skeleton shape="text" width="40%" /></View>)}
        </View>
      ) : !list.length && !q.isError ? (
        <EmptyState symbol="bag" message={all.length ? tr('shop.noDeals', 'No deals here right now.') : tr('shop.empty', 'Nothing in the shop right now.')} actionLabel={all.length ? tr('shop.showPopular', 'Show popular') : tr('state.retry', 'Try again')} onAction={() => (all.length ? pickSort(0) : q.refetch())} />
      ) : (
        <View style={{ paddingHorizontal: layout.margin, gap: space.lg }}>
          {rows.map((r, i) => (
            <View key={r[0].id} style={{ flexDirection: 'row', gap: layout.gridGutter }}>
              {r.map((p, j) => <ProductCard key={p.id} product={p} index={(i * 2 + j) % PAGE} onPress={() => push(`/product/${p.id}`)} />)}
              {r.length === 1 ? <View style={{ flex: 1 }} /> : null}
            </View>
          ))}
          {shown.length < list.length ? (
            <Pressable onPress={() => setPages((n) => n + 1)} accessibilityRole="button" style={{ alignItems: 'center', paddingVertical: space.md }}>
              <Text variant="footnote" color="textSecondary">{tr('shop.loadingMore', 'Loading more…')}</Text>
            </Pressable>
          ) : (
            <Text variant="footnote" color="textTertiary" align="center" style={{ paddingVertical: space.md }}>{tr('shop.countAll', '{{n}} products', { n: list.length })}</Text>
          )}
        </View>
      )}
    </Screen>
  );
}

function CatPill({ label, image, selected, onPress }: { label: string; image?: number | { uri: string }; selected: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} feedback="scale" accessibilityRole="tab" accessibilityState={{ selected }} accessibilityLabel={label}
      style={{ height: 40, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 7, paddingStart: image && !selected ? 5 : 15, paddingEnd: 15, backgroundColor: selected ? t.colors.buttonPrimaryBg : t.colors.bgElevated, borderWidth: selected ? 0 : 1, borderColor: t.colors.separator }}>
      {image && !selected ? <Image source={image} style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFFFFF' }} contentFit="contain" /> : null}
      <Text variant="subheadline" weight="600" style={{ color: selected ? t.colors.buttonPrimaryFg : t.colors.textPrimary }}>{label}</Text>
    </Pressable>
  );
}

export default tabRoot('(shop)', '/(tabs)/(shop)/shop', ShopHome);
