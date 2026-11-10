import { tabRoot } from '@/ui/TabRoot';
import { ScrollView, View } from 'react-native';

import { useProducts } from '@/data/queries';
import type { ProductCategory } from '@/data';
import { photoByKey, photoFor } from '@/art/photos';
import { CanvasActions } from '@/features/shell/HeaderButtons';
import { mobilityLabel, productCategoryIcon, productCategoryLabel, subcategoryLabel } from '@/features/labels';
import { useT } from '@/i18n';
import { useCaregiver } from '@/stores/caregiver';
import { useDev } from '@/stores/dev';
import { layout, space, useTheme } from '@/theme';
import {
  ActingForBar, BlockTile, Button, CanvasHeader, EmptyState, TONES, ErrorState, Icon, OfflinePill, ProductCard, PromoCarousel, Pressable, RoundCategories, Screen, SectionHeader, Skeleton, Text, go, useMobilityFor, useTabNav,
} from '@/ui';

/** Photo key, sub-category label key, and the category it opens. */
const TYPES: [string, string, ProductCategory][] = [
  ['wheelchair-light-0', 'wheelchairs', 'mobility'], ['rollator-0', 'rollators', 'mobility'], ['cane-0', 'canes', 'mobility'],
  ['shower-chair-0', 'shower-chairs', 'bathroom-safety'], ['grab-bar-0', 'grab-bars', 'home-adaptations'], ['reacher-0', 'reachers', 'daily-living'],
  ['cushion-0', 'cushions', 'medical-supplies'], ['first-aid-0', 'first-aid', 'medical-supplies'],
];

const CATS: ProductCategory[] = ['mobility', 'bathroom-safety', 'daily-living', 'medical-supplies', 'home-adaptations', 'parts-accessories'];

function ShopHome() {
  const t = useTheme();
  const tr = useT();
  const { push } = useTabNav();
  const q = useProducts();
  const mob = useMobilityFor();
  const offline = useDev((s) => s.offline);
  const switchTo = useCaregiver((s) => s.switchTo);
  const all = q.data ?? [];
  const best = all.filter((p) => p.isBestSeller && p.stock.status !== 'out').slice(0, 10);
  const fresh = [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10);
  const forYou = mob ? all.filter((p) => p.fitsMobility.includes(mob) && p.category === 'mobility' && p.stock.status !== 'out').slice(0, 3) : [];

  return (
    <Screen title={tr('tab.shop', 'Shop')} variant="canvas" refreshing={q.isRefetching} onRefresh={() => q.refetch()}
      header={<CanvasHeader title={tr('shop.title', 'Gear that fits')} actions={<CanvasActions cart />} />}>
      <ActingForBar onSwitchBack={() => switchTo(null)} />
      <Pressable feedback="none" onPress={() => push('/products/search')} accessibilityRole="search" style={{ marginHorizontal: layout.margin, height: 54, borderRadius: 27, backgroundColor: t.colors.bgElevated, borderWidth: 1, borderColor: t.colors.separator, flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.md, gap: space.xs, marginBottom: space.lg }}>
        <Icon name="magnifyingglass" size={17} color="textSecondary" />
        <Text variant="body" color="textSecondary">{tr('shop.search', 'Search wheelchairs, walkers…')}</Text>
      </Pressable>
      {offline ? <OfflinePill /> : null}

      {q.isError && !q.data ? <ErrorState offline={offline} onRetry={() => q.refetch()} /> : null}

      <PromoCarousel slides={[
        ...(mob && forYou.length ? [{ key: 'foryou', tone: 'navy' as const, top: tr('shop.promo.forYouTop', 'PICKED'), bottom: tr('shop.promo.forYouBottom', 'FOR YOU'), caption: tr('shop.promo.forYouCaption', '{{n}} PICKS THAT FIT HOW YOU MOVE', { n: forYou.length }), image: forYou[0].images[0] ? photoFor(forYou[0].images[0]) : undefined, label: tr('shop.forYouTitle', 'Picked for {{m}} users', { m: mobilityLabel(tr, mob).toLowerCase() }), onPress: () => push(`/product/${forYou[0].id}`) }] : []),
        { key: 'ask', tone: 'cream' as const, top: tr('shop.promo.askTop', 'NOT SURE'), bottom: tr('shop.promo.askBottom', 'WHAT FITS?'), caption: tr('shop.promo.askCaption', 'ASK US ON WHATSAPP'), image: photoByKey('p:rollator-0'), label: tr('shop.ask', 'Not sure what fits? Ask us on WhatsApp'), onPress: () => { import('@/lib/whatsapp').then((m) => m.openWhatsApp('Hi Movo, I need help choosing equipment.')); } },
        ...(fresh[0] ? [{ key: 'new', tone: 'navy' as const, top: tr('shop.promo.newTop', 'JUST'), bottom: tr('shop.promo.newBottom', 'ARRIVED'), caption: tr('shop.promo.newCaption', 'NEW IN THE MOVO SHOP'), image: fresh[0].images[0] ? photoFor(fresh[0].images[0]) : undefined, label: tr('shop.new', 'New arrivals'), onPress: () => push(`/product/${fresh[0].id}`) }] : []),
      ]} />
      {mob && forYou.length ? (
        <View style={{ marginBottom: space.xl }}>
          <SectionHeader title={tr('shop.forYouShort', 'Picked for you')} actionLabel={tr('why.short', 'Why these?')} onAction={() => go.push('/sheets/why-this')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: layout.margin, gap: space.sm }}>
            {forYou.map((p, i) => <ProductCard key={p.id} product={p} layout="rail" index={i} onPress={() => push(`/product/${p.id}`)} />)}
          </ScrollView>
        </View>
      ) : null}

      <SectionHeader title={tr('shop.byType', 'Shop by type')} />
      <RoundCategories items={TYPES.map(([key, label, cat]) => ({ key, label: subcategoryLabel(tr, label), image: photoByKey(`p:${key}`), onPress: () => push(`/products/${cat}`) }))} />

      <SectionHeader title={tr('shop.categories', 'Categories')} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, paddingHorizontal: layout.margin, marginBottom: space.xxl }}>
        {CATS.map((c, i) => (
          <BlockTile key={c} tone={TONES[i % 4]} icon={productCategoryIcon[c]} label={productCategoryLabel(tr, c)} sub={tr('shop.count', '{{n}} products', { n: all.filter((p) => p.category === c).length })} index={i} onPress={() => push(`/products/${c}`)} />
        ))}
      </View>

      <Rail title={tr('shop.best', 'Best sellers')} loading={q.isLoading} onSeeAll={() => push('/products/mobility')}>
        {best.map((p, i) => <ProductCard key={p.id} product={p} layout="rail" index={i} onPress={() => push(`/product/${p.id}`)} />)}
      </Rail>
      <Rail title={tr('shop.new', 'New arrivals')} loading={q.isLoading} onSeeAll={() => push('/products/daily-living')}>
        {fresh.map((p, i) => <ProductCard key={p.id} product={p} layout="rail" index={i} onPress={() => push(`/product/${p.id}`)} />)}
      </Rail>
      {!q.isLoading && !all.length && !q.isError ? <EmptyState symbol="bag" message={tr('shop.empty', 'Nothing in the shop right now.')} actionLabel={tr('state.retry', 'Try again')} onAction={() => q.refetch()} /> : null}
      <View style={{ marginHorizontal: layout.margin, marginTop: space.sm }}>
        <Button variant="secondary" icon="message" label={tr('shop.ask', 'Not sure what fits? Ask us on WhatsApp')} onPress={() => import('@/lib/whatsapp').then((m) => m.openWhatsApp('Hi Movo, I need help choosing equipment.'))} />
      </View>
    </Screen>
  );
}

function Rail({ title, children, loading, onSeeAll }: { title: string; children: React.ReactNode; loading?: boolean; onSeeAll: () => void }) {
  const tr = useT();
  return (
    <View style={{ marginBottom: space.xxl }}>
      <SectionHeader title={title} actionLabel={tr('common.seeAll', 'See all')} onAction={onSeeAll} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: layout.margin, gap: space.sm }}>
        {loading ? [0, 1, 2].map((i) => (
          <View key={i} style={{ width: 156, gap: 8 }}><Skeleton width={156} height={156} radius={16} /><Skeleton shape="text" width="90%" /><Skeleton shape="text" width="50%" /></View>
        )) : children}
      </ScrollView>
    </View>
  );
}

export default tabRoot('(shop)', '/(tabs)/(shop)/shop', ShopHome);
