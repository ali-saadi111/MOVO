import { View } from 'react-native';
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated';

import { useLocalized, useT } from '@/i18n';
import { formatMoney } from '@/lib/money';
import { ltr } from '@/lib/rtl';
import { useCart } from '@/stores/cart';
import { useCartTotals } from '@/features/shop/cart';
import { useSession } from '@/stores/session';
import { layout, radii, space, springs } from '@/theme';
import { ArtImage, Button, Divider, EmptyState, IconButton, Pressable, Screen, StickyCTA, STICKY_CTA_SPACE, Stepper, SummaryRow, Text, go, useTabNav } from '@/ui';

export default function Cart() {
  const tr = useT();
  const loc = useLocalized();
  const { push } = useTabNav();
  const { items, subtotal, delivery, total } = useCartTotals();
  const setQty = useCart((s) => s.setQty);
  const user = useSession((s) => s.user);
  const askRemove = (id: string) => go.push(`/sheets/confirm?kind=removeCartItem&id=${id}`);
  return (
    <Screen
      title={tr('cart.title', 'Cart')}
      variant="root"
      contentBottom={items.length ? STICKY_CTA_SPACE : 0}
      footer={items.length ? (
        <StickyCTA>
          <Button label={tr('cart.checkout', 'Checkout · {{total}}', { total: ltr(formatMoney(total)) })} onPress={() => (user ? push('/checkout/delivery') : go.push('/auth/gate?action=checkout&resume=/checkout/delivery'))} />
        </StickyCTA>
      ) : null}
    >
      {!items.length ? (
        <EmptyState symbol="cart" message={tr('cart.empty', 'Your cart is empty.')} actionLabel={tr('cart.browse', 'Browse the shop')} onAction={() => go.push('/(tabs)/(shop)/shop')} />
      ) : (
        <>
          {items.map((x) => (
            <Animated.View key={x.productId} layout={LinearTransition.springify().damping(springs.smooth.damping).stiffness(springs.smooth.stiffness)} exiting={FadeOut.duration(200)}>
              <View style={{ flexDirection: 'row', gap: space.md, paddingHorizontal: layout.margin, paddingVertical: space.md }}>
                <Pressable onPress={() => push(`/product/${x.productId}`)} style={{ width: 88 }} accessibilityLabel={loc(x.p.name)}>
                  <ArtImage image={x.p.images[0]} aspect={1} tile radius={radii.thumb} />
                </Pressable>
                <View style={{ flex: 1, gap: space.xs }}>
                  <View style={{ flexDirection: 'row', gap: space.xs }}>
                    <Text variant="headline" numberOfLines={2} style={{ flex: 1 }}>{loc(x.p.name)}</Text>
                    <IconButton icon="trash" label={tr('cart.remove', 'Remove')} size={40} onPress={() => askRemove(x.productId)} />
                  </View>
                  <Text variant="subheadline" tabular>{ltr(formatMoney(x.p.priceCents))}</Text>
                  <Stepper value={x.qty} label={tr('cart.qty', 'Quantity')} onChange={(n) => setQty(x.productId, n)} onRemoveLast={() => askRemove(x.productId)} />
                </View>
              </View>
              <Divider inset={layout.margin + 88 + space.md} />
            </Animated.View>
          ))}
          <View style={{ paddingHorizontal: layout.margin, paddingTop: space.lg }}>
            <SummaryRow label={tr('cart.subtotal', 'Subtotal')} value={ltr(formatMoney(subtotal))} />
            <SummaryRow label={tr('cart.delivery', 'Delivery')} value={ltr(formatMoney(delivery))} />
            <Divider style={{ marginVertical: space.xs }} />
            <SummaryRow label={tr('cart.total', 'Total')} value={ltr(formatMoney(total))} strong />
          </View>
        </>
      )}
    </Screen>
  );
}
