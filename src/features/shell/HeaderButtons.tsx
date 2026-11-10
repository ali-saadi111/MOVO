import { View } from 'react-native';

import { useT } from '@/i18n';
import { useActivity } from '@/stores/activity';
import { cartCount, useCart } from '@/stores/cart';
import { IconButton, RoundButton, useTabNav } from '@/ui';

export function BellButton() {
  const tr = useT();
  const { push } = useTabNav();
  const unread = 6 - useActivity((s) => s.readNotifications.length);
  return <IconButton icon="bell" label={unread > 0 ? tr('nav.notificationsUnread', 'Notifications, {{n}} unread', { n: unread }) : tr('nav.notifications', 'Notifications')} badge={unread > 0} size={44} onPress={() => push('/notifications')} />;
}

/** The nav-bar cart symbol bounces once as its badge counts up (§2.9 moment 4). */
export function CartButton() {
  const tr = useT();
  const { push } = useTabNav();
  const count = useCart((s) => cartCount(s.lines));
  const tick = useCart((s) => s.addTick);
  return <IconButton icon="cart" label={(count === 1 ? tr('nav.cartOne', 'Cart, 1 item') : tr('nav.cart', 'Cart, {{n}} items', { n: count }))} badge={count || undefined} effectKey={tick} size={44} onPress={() => push('/cart')} />;
}

export function HeaderButtons({ cart }: { cart?: boolean }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {cart ? <CartButton /> : null}
      <BellButton />
    </View>
  );
}

/** Round bell (and cart) for the canvas header on tab roots. The bell rings when there is news. */
export function CanvasActions({ cart }: { cart?: boolean }) {
  const tr = useT();
  const { push } = useTabNav();
  const unread = 6 - useActivity((s) => s.readNotifications.length);
  const count = useCart((s) => cartCount(s.lines));
  return (
    <>
      {cart ? <RoundButton icon="cart" label={count === 1 ? tr('nav.cartOne', 'Cart, 1 item') : tr('nav.cart', 'Cart, {{n}} items', { n: count })} count={count || undefined} onPress={() => push('/cart')} /> : null}
      <RoundButton icon="bell" label={unread > 0 ? tr('nav.notificationsUnread', 'Notifications, {{n}} unread', { n: unread }) : tr('nav.notifications', 'Notifications')} dot={unread > 0} shake={unread > 0} onPress={() => push('/notifications')} />
    </>
  );
}
