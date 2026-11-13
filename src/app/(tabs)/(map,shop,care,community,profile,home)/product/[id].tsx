import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useProduct, useProducts } from '@/data/queries';
import { CartButton } from '@/features/shell/HeaderButtons';
import { useLocalized, useT } from '@/i18n';
import { announce } from '@/lib/a11y';
import { haptic } from '@/lib/haptics';
import { formatMoney } from '@/lib/money';
import { ltr } from '@/lib/rtl';
import { openWhatsApp } from '@/lib/whatsapp';
import { cartCount, useCart } from '@/stores/cart';
import { useSession } from '@/stores/session';
import { durations, layout, space, useTheme } from '@/theme';
import {
  Button, ErrorState, Icon, ImagePager, ListRow, Pressable, ProductCard, Screen, SectionHeader, Skeleton, StarRating, Stepper, StickyCTA, STICKY_CTA_SPACE, StockLabel, Text, go, specValue, useTabNav,
} from '@/ui';

const HERO_ASPECT = 393 / 330;

export default function ProductPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const tr = useT();
  const loc = useLocalized();
  const { push } = useTabNav();
  const q = useProduct(id);
  const p = q.data;
  const similar = useProducts(p ? { category: p.category, subcategory: p.subcategory } : {});
  const add = useCart((s) => s.add);
  const count = useCart((s) => cartCount(s.lines));
  const user = useSession((s) => s.user);
  const [qty, setQty] = useState(1);
  const [phase, setPhase] = useState<'idle' | 'added' | 'settled'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  if (q.isError) return <Screen title="" variant="detail"><ErrorState onRetry={() => q.refetch()} /></Screen>;
  if (!p) {
    return (
      <Screen title="" variant="hero">
        <Skeleton height={330} radius={0} />
        <View style={{ padding: layout.margin, gap: 12 }}><Skeleton shape="text" width="80%" height={28} /><Skeleton shape="text" width="30%" height={22} /></View>
      </Screen>
    );
  }

  /** §2.9 moment 4: label cross-fades to "✓ Added to cart", then settles as "View cart · n items". */
  const onAdd = () => {
    if (!user) { go.push(`/auth/gate?action=cart&resume=${encodeURIComponent(`/product/${p.id}`)}`); return; }
    haptic.light();
    add(p.id, qty);
    announce(tr('product.addedA11y', 'Added to cart'));
    setPhase('added');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPhase('settled'), durations.settle);
  };
  const out = p.stock.status === 'out';
  const name = loc(p.name);
  const info = (kind: string) => go.push(`/sheets/product-info?id=${p.id}&kind=${kind}`);
  const ask = () => openWhatsApp(`Question about: ${p.name.en}`);
  const specs = p.keySpecs.slice(0, 4);
  const others = (similar.data ?? []).filter((x) => x.id !== p.id).slice(0, 8);

  return (
    <Screen
      title={name}
      variant="hero"
      heroHeight={330}
      headerRight={() => <CartButton />}
      contentBottom={STICKY_CTA_SPACE}
      footer={
        <StickyCTA>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
            <Pressable onPress={ask} feedback="scale" accessibilityRole="button" accessibilityLabel={tr('product.ask', 'Ask us on WhatsApp')}
              style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: t.colors.bgSelected, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="message.fill" size={21} color="accentText" />
            </Pressable>
            {out ? (
              <View style={{ flex: 1 }}><Button label={tr('product.notify', 'Notify me when it’s back')} icon="bell" onPress={() => { haptic.light(); announce(tr('product.notifyOn', 'We’ll let you know')); }} /></View>
            ) : phase === 'idle' ? (
              <>
                <View style={{ backgroundColor: t.colors.fill, borderRadius: 25 }}>
                  <Stepper value={qty} label={tr('cart.qty', 'Quantity')} onChange={setQty} max={Math.min(10, p.stock.quantity || 10)} />
                </View>
                <View style={{ flex: 1 }}><Button label={tr('product.addShort', 'Add · {{price}}', { price: ltr(formatMoney(p.priceCents * qty)) })} onPress={onAdd} /></View>
              </>
            ) : (
              <View style={{ flex: 1 }}>
                {phase === 'added' ? (
                  <Button label={tr('product.added', '✓ Added to cart')} variant="secondary" onPress={() => push('/cart')} />
                ) : (
                  <Button label={(count === 1 ? tr('product.viewCartOne', 'View cart · 1 item') : tr('product.viewCart', 'View cart · {{n}} items', { n: count }))} variant="secondary" icon="cart" onPress={() => push('/cart')} />
                )}
              </View>
            )}
          </View>
        </StickyCTA>
      }
    >
      <ImagePager images={p.images} aspect={HERO_ASPECT} overlayDots={36} onOpen={(i) => go.push(`/covers/photos?product=${p.id}&i=${i}`)} />

      <Animated.View entering={FadeIn.duration(200)} style={{ marginTop: -24, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: t.colors.bgPrimary, paddingHorizontal: layout.margin, paddingTop: space.lg, gap: 4, boxShadow: t.scheme === 'dark' ? undefined : '0 -8px 18px rgba(1,52,71,0.07)' }}>
        <Text variant="footnote" color="textSecondary">{p.brand}</Text>
        <Text variant="title2" weight="700">{name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap', marginTop: 6 }}>
          <Text variant="title2" weight="800" tabular>{ltr(formatMoney(p.priceCents))}</Text>
          {p.compareAtCents ? <Text variant="subheadline" color="textSecondary" tabular style={{ textDecorationLine: 'line-through' }}>{ltr(formatMoney(p.compareAtCents))}</Text> : null}
          <View style={{ backgroundColor: out ? t.colors.fill : t.colors.bgSelected, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}><StockLabel stock={p.stock} always small /></View>
          <View style={{ flex: 1 }} />
          {p.rating.count ? (
            <Pressable onPress={() => info('reviews')} hitSlop={8} accessibilityRole="button" accessibilityLabel={tr('product.ratingA11y', 'Rated {{r}} from {{n}} reviews', { r: p.rating.average.toFixed(1), n: p.rating.count })} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <StarRating value={Math.round(p.rating.average)} size={13} label="" />
              <Text variant="footnote" weight="600" tabular>{p.rating.average.toFixed(1)}</Text>
              <Text variant="footnote" color="textSecondary" tabular>({p.rating.count})</Text>
            </Pressable>
          ) : null}
        </View>

        {specs.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -layout.margin, marginTop: space.md }} contentContainerStyle={{ paddingHorizontal: layout.margin, gap: space.xs }}>
            {specs.map((s) => (
              <View key={s.key} style={{ minWidth: 80, borderRadius: 14, backgroundColor: t.colors.fill, paddingHorizontal: 12, paddingVertical: 10, gap: 1 }}>
                <Text variant="headline" weight="700" tabular numberOfLines={1}>{ltr(specValue(s, tr))}</Text>
                <Text variant="caption1" color="textSecondary" numberOfLines={1}>{loc(s.label)}</Text>
              </View>
            ))}
          </ScrollView>
        ) : null}
      </Animated.View>

      <View style={{ marginHorizontal: layout.margin, marginTop: space.lg, borderRadius: 16, backgroundColor: t.colors.fill, overflow: 'hidden' }}>
        <ListRow icon="doc.text" title={tr('product.about', 'About')} subtitle={loc(p.description)} subtitleLines={1} onPress={() => info('about')} />
        <ListRow icon="shippingbox" title={tr('product.deliveryShort', 'Delivery')} subtitle={tr('product.deliverySub', 'Beirut 1–2 days · $5')} onPress={() => info('delivery')} />
        <ListRow icon="arrow.uturn.backward" title={tr('product.returnsShort', 'Returns')} subtitle={p.returnable ? tr('product.returns', '14 days if unused') : tr('product.noReturnsShort', 'Hygiene item, no returns once opened')} onPress={() => info('delivery')} />
        <ListRow icon="star.fill" title={tr('product.reviewsShort', 'Reviews')} subtitle={p.rating.count ? tr('product.reviews', '{{n}} reviews', { n: p.rating.count }) : tr('product.noReviewsShort', 'No reviews yet')} onPress={() => info('reviews')} />
      </View>

      {others.length ? (
        <View style={{ marginTop: space.xl }}>
          <SectionHeader title={out ? tr('product.similar', 'See similar products') : tr('product.similarShort', 'Similar')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: layout.margin, gap: space.sm }}>
            {others.map((x, i) => <ProductCard key={x.id} product={x} layout="rail" index={i} onPress={() => push(`/product/${x.id}`)} />)}
          </ScrollView>
        </View>
      ) : null}
    </Screen>
  );
}
