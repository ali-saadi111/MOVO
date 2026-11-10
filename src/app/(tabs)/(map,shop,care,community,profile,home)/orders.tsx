import { useState } from 'react';
import { View } from 'react-native';

import { useLang, useT } from '@/i18n';
import { fmtDay } from '@/lib/dates';
import { formatMoney } from '@/lib/money';
import { ltr } from '@/lib/rtl';
import { useActivity } from '@/stores/activity';
import { layout, space } from '@/theme';
import { EmptyState, ListRow, Screen, Section, Segmented, go, useTabNav } from '@/ui';

export default function Orders() {
  const tr = useT();
  const lang = useLang();
  const { push } = useTabNav();
  const [seg, setSeg] = useState(0);
  const orders = useActivity((s) => s.orders).filter((o) => (seg === 0 ? o.status !== 'delivered' : o.status === 'delivered'));
  const status = { confirmed: tr('order.confirmed', 'Confirmed'), packed: tr('order.packed', 'Packed'), onTheWay: tr('order.onTheWay', 'On the way'), delivered: tr('order.delivered', 'Delivered') };
  return (
    <Screen title={tr('profile.orders', 'My orders')} variant="root" grouped>
      <View style={{ paddingHorizontal: layout.margin, marginBottom: space.lg }}><Segmented values={[tr('seg.upcoming', 'Current'), tr('seg.past', 'Past')]} index={seg} onChange={setSeg} /></View>
      {!orders.length ? <EmptyState symbol="shippingbox" message={tr('orders.empty', 'No orders here yet.')} actionLabel={tr('cart.browse', 'Browse the shop')} onAction={() => go.push('/(tabs)/(shop)/shop')} /> : (
        <Section>{orders.map((o) => <ListRow key={o.id} icon="shippingbox" title={ltr(o.id)} subtitle={`${status[o.status]} · ${fmtDay(o.placedAt, lang)}`} trailing={{ type: 'value', text: ltr(formatMoney(o.totalCents)) }} onPress={() => push(`/order/${o.id}`)} />)}</Section>
      )}
    </Screen>
  );
}
