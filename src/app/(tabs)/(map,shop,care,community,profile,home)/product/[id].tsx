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
import { durations, layout, space } from '@/theme';
import {
  Button, Divider, ErrorState, ImagePager, KeySpecsTable, ListRow, ProductCard, Screen, Skeleton, StarRating, StickyCTA, STICKY_CTA_SPACE, StockLabel, Text, go, useTabNav,
} from '@/ui';

export default function ProductPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tr = useT();
  const loc = useLocalized();
  const { push } = useTabNav();
  const q = useProduct(id);
  const p = q.data;
  const similar = useProducts(p ? { category: p.category, subcategory: p.subcategory } : {});
  const add = useCart((s) => s.add);
  const count = useCart((s) => cartCount(s.lines));
  const user = useSession((s) => s.user);
  const [phase, setPhase] = useState<'idle' | 'added' | 'settled'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  if (q.isError) return <Screen title="" variant="detail"><ErrorState onRetry={() => q.refetch()} /></Screen>;
  if (!p) {
    return (
      <Screen title="" variant="hero">
        <Skeleton height={393} radius={0} />
        <View style={{ padding: layout.margin, gap: 12 }}><Skeleton shape="text" width="80%" height={28} /><Skeleton shape="text" width="30%" height={22} /></View>
      </Screen>
    );
  }

  /** §2.9 moment 4: label cross-fades to "✓ Added to cart", then settles as "View cart · n items". */
  const onAdd = () => {
    if (!user) { go.push(`/auth/gate?action=cart&resume=${encodeURIComponent(`/product/${p.id}`)}`); return; }
    haptic.light();
    add(p.id);
    announce(tr('product.addedA11y', 'Added to cart'));
    setPhase('added');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPhase('settled'), durations.settle);
  };
  const out = p.stock.status === 'out';
  const name = loc(p.name);

  return (
    <Screen
      title={name}
      variant="hero"
      heroHeight={393}
      headerRight={() => <CartButton />}
      contentBottom={STICKY_CTA_SPACE}
      footer={
        <StickyCTA>
          {out ? (
            <Button label={tr('product.notify', 'Notify me when it’s back')} icon="bell" onPress={() => { haptic.light(); announce(tr('product.notifyOn', 'We’ll let you know')); }} />
          ) : phase === 'idle' ? (
            <Button label={tr('product.add', 'Add to cart · {{price}}', { price: ltr(formatMoney(p.priceCents)) })} onPress={onAdd} />
          ) : phase === 'added' ? (
            <Button label={tr('product.added', '✓ Added to cart')} variant="secondary" onPress={() => push('/cart')} />
          ) : (
            <Button label={(count === 1 ? tr('product.viewCartOne', 'View cart · 1 item') : tr('product.viewCart', 'View cart · {{n}} items', { n: count }))} variant="secondary" icon="cart" onPress={() => push('/cart')} />
          )}
        </StickyCTA>
      }
    >
      <View style={{ paddingTop: 0 }}>
        <ImagePager images={p.images} onOpen={(i) => go.push(`/covers/photos?product=${p.id}&i=${i}`)} />
      </View>
      <Animated.View entering={FadeIn.duration(200)} style={{ paddingHorizontal: layout.margin, gap: space.xs, marginTop: space.md }}>
        <Text variant="footnote" color="textSecondary">{p.brand}</Text>
        <Text variant="title1">{name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' }}>
          <Text variant="title3" weight="400" tabular>{ltr(formatMoney(p.priceCents))}</Text>
          {p.compareAtCents ? <Text variant="subheadline" color="textSecondary" style={{ textDecorationLine: 'line-through' }}>{ltr(formatMoney(p.compareAtCents))}</Text> : null}
          <StockLabel stock={p.stock} always />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <StarRating value={p.rating.average} size={14} label={tr('product.rating', 'Rating')} />
          <Text variant="footnote" color="textSecondary" tabular>{p.rating.average.toFixed(1)} · {tr('product.reviews', '{{n}} reviews', { n: p.rating.count })}</Text>
        </View>
      </Animated.View>

      <View style={{ paddingHorizontal: layout.margin, marginTop: space.xl }}>
        <Text variant="title3" style={{ marginBottom: space.xs }}>{tr('product.keySpecs', 'Key specs')}</Text>
        <KeySpecsTable specs={p.keySpecs} />
      </View>

      <Block title={tr('product.about', 'About')}><Text variant="body">{loc(p.description)}</Text></Block>
      <Block title={tr('product.delivery', 'Delivery and returns')} flush>
        <ListRow icon="shippingbox" title={tr('product.deliveryBeirut', 'Beirut 1–2 days · Other areas 2–4 days')} subtitle={tr('product.deliveryFee', '$5 delivery in Beirut')} trailing={{ type: 'none' }} />
        <ListRow icon="arrow.uturn.backward" title={p.returnable ? tr('product.returns', '14 days if unused') : tr('product.noReturns', 'Hygiene item, can’t be returned once opened')} trailing={{ type: 'none' }} />
      </Block>
      <Block title={tr('product.askTitle', 'Not sure it fits?')}>
        <Text variant="body" color="textSecondary" style={{ marginBottom: space.sm }}>{tr('product.askBody', 'Send us your measurements or a photo and the team will tell you.')}</Text>
        <Button variant="secondary" icon="message" label={tr('product.ask', 'Ask us on WhatsApp')} onPress={() => openWhatsApp(`Question about: ${p.name.en}`)} />
      </Block>
      <Block title={tr('product.reviewsTitle', 'Reviews from buyers')}>
        {p.rating.count ? (
          [['Rania K.', 'Folds easily into my small car. Customer service called to check it fit.'], ['Hadi M.', 'Good value. The seat cushion could be thicker.']].map(([a, b], i) => (
            <View key={i} style={{ gap: 4, paddingVertical: space.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text variant="headline">{a}</Text><StarRating value={5 - i} size={13} label="" /></View>
              <Text variant="body" color="textSecondary">{b}</Text>
            </View>
          ))
        ) : <Text variant="body" color="textSecondary">{tr('product.noReviews', 'No reviews yet. Buyers can review after delivery.')}</Text>}
      </Block>
      {out || similar.data?.length ? (
        <View style={{ marginTop: space.xxl }}>
          <Text variant="title3" style={{ marginHorizontal: layout.margin, marginBottom: space.sm }}>{tr('product.similar', 'See similar products')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: layout.margin, gap: space.sm }}>
            {(similar.data ?? []).filter((x) => x.id !== p.id).slice(0, 8).map((x, i) => <ProductCard key={x.id} product={x} layout="rail" index={i} onPress={() => push(`/product/${x.id}`)} />)}
          </ScrollView>
        </View>
      ) : null}
    </Screen>
  );
}

function Block({ title, children, flush }: { title: string; children: React.ReactNode; flush?: boolean }) {
  return (
    <View style={{ marginTop: space.xxl }}>
      <Divider style={{ marginHorizontal: layout.margin, marginBottom: space.xl }} />
      <Text variant="title3" style={{ marginHorizontal: layout.margin, marginBottom: space.sm }}>{title}</Text>
      <View style={flush ? { marginHorizontal: 0 } : { marginHorizontal: layout.margin }}>{children}</View>
    </View>
  );
}
