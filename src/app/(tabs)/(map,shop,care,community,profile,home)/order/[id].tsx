import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { sync } from '@/data';
import { paymentLabel } from '@/features/labels';
import { useLang, useLocalized, useT } from '@/i18n';
import { fmtDay, fmtTime } from '@/lib/dates';
import { formatMoney } from '@/lib/money';
import { ltr } from '@/lib/rtl';
import { call } from '@/lib/whatsapp';
import { useActivity } from '@/stores/activity';
import { layout, radii, space } from '@/theme';
import { ArtImage, Button, EmptyState, OrderTimeline, Screen, Section, SummaryRow, Text, go, useTabNav } from '@/ui';

export default function OrderPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tr = useT();
  const lang = useLang();
  const loc = useLocalized();
  const { push } = useTabNav();
  const o = useActivity((s) => s.orders.find((x) => x.id === id));
  if (!o) return <Screen title={tr('order.title', 'Order')}><EmptyState symbol="shippingbox" message={tr('order.missing', 'We couldn’t find this order.')} /></Screen>;
  const placed = new Date(o.placedAt);
  const at = (h: number) => { const d = new Date(placed.getTime() + h * 3600e3); return `${fmtDay(d.toISOString(), lang)} · ${fmtTime(d.toISOString(), lang)}`; };
  const order = ['confirmed', 'packed', 'onTheWay', 'delivered'];
  const idx = order.indexOf(o.status);
  const delivered = o.status === 'delivered';
  return (
    <Screen title={tr('order.titleN', 'Order {{id}}', { id: ltr(o.id) })} variant="detail" grouped>
      <View style={{ height: space.lg }} />
      <OrderTimeline steps={[
        { title: tr('order.confirmed', 'Confirmed'), at: at(0), done: idx >= 0 },
        { title: tr('order.packed', 'Packed'), at: idx >= 1 ? at(5) : undefined, done: idx >= 1, current: idx === 0 },
        { title: tr('order.onTheWay', 'On the way'), at: idx >= 2 ? at(22) : undefined, done: idx >= 2, current: idx === 1,
          extra: idx === 2 ? <View style={{ marginTop: space.xs }}><Text variant="subheadline" color="textSecondary">{tr('order.driver', 'Ali is bringing it')}</Text><Button label={tr('order.callDriver', 'Call the driver')} variant="secondary" size="medium" icon="phone" fullWidth={false} onPress={() => call('+96170123456')} /></View> : undefined },
        { title: tr('order.delivered', 'Delivered'), at: delivered ? at(26) : undefined, done: delivered, current: idx === 2 },
      ]} />
      <Section header={tr('order.items', 'Items')}>
        {o.lines.map((l) => {
          const p = sync.product(l.productId);
          if (!p) return null;
          return (
            <View key={l.productId} style={{ flexDirection: 'row', gap: space.sm, padding: space.sm, alignItems: 'center' }}>
              <View style={{ width: 56 }}><ArtImage image={p.images[0]} aspect={1} tile radius={radii.thumb} /></View>
              <Text variant="body" style={{ flex: 1 }} numberOfLines={2}>{l.qty} × {loc(p.name)}</Text>
            </View>
          );
        })}
      </Section>
      <Section>
        <View style={{ paddingHorizontal: space.md, paddingVertical: space.xs }}>
          <SummaryRow label={tr('pay.header', 'Payment')} value={paymentLabel(tr, o.payment)} />
          <SummaryRow label={tr('cart.total', 'Total')} value={ltr(formatMoney(o.totalCents))} strong />
        </View>
      </Section>
      {delivered ? (
        <View style={{ marginHorizontal: layout.margin, gap: space.xs }}>
          <Button label={tr('order.buyAgain', 'Buy again')} onPress={() => push(`/product/${o.lines[0].productId}`)} />
          <Button label={tr('order.rate', 'Rate this product')} variant="secondary" onPress={() => go.push(`/sheets/review?product=${o.lines[0].productId}`)} />
          <Button label={tr('order.return', 'Request a return')} variant="plain" onPress={() => go.push(`/sheets/return-request?order=${o.id}`)} />
        </View>
      ) : null}
    </Screen>
  );
}
