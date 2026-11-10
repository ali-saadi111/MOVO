import { useState } from 'react';
import { View } from 'react-native';

import { useCartTotals } from '@/features/shop/cart';
import { paymentLabel } from '@/features/labels';
import { useLocalized, useT } from '@/i18n';
import { formatMoney } from '@/lib/money';
import { ltr } from '@/lib/rtl';
import { layout, space } from '@/theme';
import { Button, Divider, PaymentMethodPicker, Screen, StickyCTA, STICKY_CTA_SPACE, SummaryRow, Text, go, type PayMethod } from '@/ui';

export default function Payment() {
  const tr = useT();
  const loc = useLocalized();
  const { items, subtotal, delivery, total } = useCartTotals();
  const [m, setM] = useState<PayMethod>('cash');
  const price = ltr(formatMoney(total));
  const label = m === 'cash' ? tr('checkout.place', 'Place order · {{total}}', { total: price }) : tr('checkout.payWith', 'Pay {{total}} with {{m}}', { total: price, m: paymentLabel(tr, m) });
  return (
    <Screen title={tr('checkout.payment', 'Payment')} variant="detail" grouped contentBottom={STICKY_CTA_SPACE}
      footer={<StickyCTA><Button label={label} onPress={() => go.push(`/covers/payment?flow=order&method=${m}&total=${total}`)} /></StickyCTA>}>
      <Text variant="subheadline" color="textSecondary" style={{ marginHorizontal: layout.margin + space.md, marginTop: space.md, marginBottom: space.md }}>{tr('checkout.step2', 'Step 2 of 2')}</Text>
      <PaymentMethodPicker value={m} onChange={setM} cashLabel={tr('pay.cashDelivery', 'Cash on delivery')} />
      <View style={{ marginHorizontal: layout.margin + space.md }}>
        <Text variant="footnote" color="textSecondary" style={{ marginBottom: space.xs }}>{tr('checkout.summary', 'ORDER SUMMARY')}</Text>
        {items.map((x) => <SummaryRow key={x.productId} label={`${x.qty} × ${loc(x.p.name)}`} value={ltr(formatMoney(x.p.priceCents * x.qty))} />)}
        <Divider style={{ marginVertical: space.xs }} />
        <SummaryRow label={tr('cart.subtotal', 'Subtotal')} value={ltr(formatMoney(subtotal))} />
        <SummaryRow label={tr('cart.delivery', 'Delivery')} value={ltr(formatMoney(delivery))} />
        <SummaryRow label={tr('cart.total', 'Total')} value={price} strong />
      </View>
    </Screen>
  );
}
