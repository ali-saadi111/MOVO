import { Image } from 'expo-image';
import { View } from 'react-native';

import { photoFor } from '@/art/photos';
import { useCartTotals } from '@/features/shop/cart';
import { addressLine, useCheckoutDraft } from '@/features/shop/checkout';
import { paymentLabel } from '@/features/labels';
import { useLocalized, useT } from '@/i18n';
import { formatMoney } from '@/lib/money';
import { ltr } from '@/lib/rtl';
import { layout, space, useTheme } from '@/theme';
import { Button, Divider, ListRow, PayLogo, Screen, Section, StickyCTA, STICKY_CTA_SPACE, SummaryRow, go } from '@/ui';

/** One screen: every choice is a row showing what's picked; tapping it opens a sheet to change it. */
export default function Checkout() {
  const t = useTheme();
  const tr = useT();
  const loc = useLocalized();
  const { items, subtotal, delivery, total } = useCartTotals();
  const [d] = useCheckoutDraft();
  const addr = addressLine(d);
  const price = ltr(formatMoney(total));
  const edit = (kind: string) => go.push(`/sheets/checkout-edit?kind=${kind}`);
  const label = d.pay === 'cash' ? tr('checkout.place', 'Place order · {{total}}', { total: price }) : tr('checkout.payWith', 'Pay {{total}} with {{m}}', { total: price, m: paymentLabel(tr, d.pay) });
  const blocked = !addr ? tr('checkout.needAddress', 'Add a delivery address') : d.phone.trim().length < 8 ? tr('checkout.needPhone', 'Add a delivery phone') : null;
  const paySub = { cash: tr('pay.cashDelivery', 'Cash on delivery'), whish: tr('pay.whishSub', 'Finish in the Whish app'), omt: tr('pay.omtSub', 'Pay at any OMT branch with a code'), card: tr('pay.cardSub', 'Visa or Mastercard') }[d.pay];
  const names = items.map((x) => (x.qty > 1 ? `${x.qty}× ${loc(x.p.name)}` : loc(x.p.name))).join(', ');

  return (
    <Screen title={tr('checkout.title', 'Checkout')} variant="detail" grouped contentBottom={STICKY_CTA_SPACE}
      footer={<StickyCTA><Button label={label} disabledReason={blocked} onPress={() => go.push(`/covers/payment?flow=order&method=${d.pay}&total=${total}`)} /></StickyCTA>}>
      <View style={{ height: space.md }} />
      <Section header={tr('checkout.delivery', 'Delivery')}>
        <ListRow icon="mappin" title={addr?.title ?? tr('checkout.addAddress', 'Add an address')} subtitle={addr?.sub} subtitleLines={1} onPress={() => edit('address')} />
        <ListRow icon="phone.fill" title={d.phone || tr('checkout.phone', 'Delivery phone')} subtitle={tr('checkout.phoneHelp', 'The driver calls this number when they arrive.')} subtitleLines={1} onPress={() => edit('phone')} />
        <ListRow icon="pencil" title={d.notes ? d.notes : tr('checkout.addNote', 'Add a note for the driver')} subtitle={d.notes ? tr('checkout.noteLabel', 'Note for the driver') : tr('checkout.notesPh', 'For example: ramp at the side entrance')} subtitleLines={1} onPress={() => edit('note')} />
      </Section>
      <Section header={tr('checkout.payWithHeader', 'Pay with')}>
        <ListRow leading={<PayLogo method={d.pay} size={32} />} title={paymentLabel(tr, d.pay)} subtitle={paySub} onPress={() => edit('pay')} />
      </Section>
      <Section header={items.length === 1 ? tr('checkout.itemsOne', '1 item') : tr('checkout.items', '{{n}} items', { n: items.length })}>
        <ListRow
          leading={
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {items.slice(0, 3).map((x) => (
                <View key={x.productId} style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: t.colors.separator, padding: 4 }}>
                  {x.p.images[0] && photoFor(x.p.images[0]) ? <Image source={photoFor(x.p.images[0])} style={{ flex: 1 }} contentFit="contain" /> : null}
                </View>
              ))}
            </View>
          }
          title={names}
          subtitleLines={1}
          accessibilityLabel={names}
          onPress={go.back}
        />
      </Section>
      <View style={{ marginHorizontal: layout.margin + space.md }}>
        <SummaryRow label={tr('cart.subtotal', 'Subtotal')} value={ltr(formatMoney(subtotal))} />
        <SummaryRow label={tr('cart.delivery', 'Delivery')} value={ltr(formatMoney(delivery))} />
        <Divider style={{ marginVertical: space.xs }} />
        <SummaryRow label={tr('cart.total', 'Total')} value={price} strong />
      </View>
    </Screen>
  );
}
