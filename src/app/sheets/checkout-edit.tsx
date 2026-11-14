import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { SAVED_ADDRESSES, useCheckoutDraft } from '@/features/shop/checkout';
import { useT } from '@/i18n';
import { haptic } from '@/lib/haptics';
import { layout, space } from '@/theme';
import { ChipWrap, ListRow, PaymentMethodPicker, Section, Sheet, Text, TextField, go } from '@/ui';

type Kind = 'address' | 'phone' | 'note' | 'pay';

/** Change one checkout choice. Every edit saves straight away, so Done only closes. */
export default function CheckoutEdit() {
  const { kind = 'address' } = useLocalSearchParams<{ kind?: Kind }>();
  const tr = useT();
  const [d, set] = useCheckoutDraft();
  const title = { address: tr('checkout.deliverTo', 'Deliver to'), phone: tr('checkout.phone', 'Delivery phone'), note: tr('checkout.noteLabel', 'Note for the driver'), pay: tr('checkout.payWithHeader', 'Pay with') }[kind];
  const pick = (patch: Parameters<typeof set>[0], close = true) => { haptic.selection(); set(patch); if (close) go.back(); };

  return (
    <Sheet title={title} dismissLabel="done" detent={kind === 'address' && d.addr === 'new' ? 0.85 : kind === 'pay' ? 0.62 : 0.5}>
      {kind === 'address' ? (
        <>
          <Section>
            {SAVED_ADDRESSES.map((a) => <ListRow key={a.id} icon="house" title={a.title} subtitle={a.sub} trailing={{ type: 'check', on: d.addr === a.id }} onPress={() => pick({ addr: a.id })} />)}
            <ListRow icon="plus" title={tr('checkout.addAddress', 'Add an address')} trailing={{ type: 'check', on: d.addr === 'new' }} onPress={() => pick({ addr: 'new' }, false)} />
          </Section>
          {d.addr === 'new' ? (
            <View style={{ marginHorizontal: layout.margin, gap: space.md }}>
              <Text variant="subheadline" weight="600">{tr('checkout.area', 'Area')}</Text>
              <ChipWrap options={['Hamra', 'Verdun', 'Achrafieh', 'Saida'].map((x) => ({ value: x, label: x }))} value={d.area} onChange={(v) => set({ area: v })} />
              <TextField label={tr('checkout.street', 'Street and building')} value={d.street} onChangeText={(v) => set({ street: v })} />
              <TextField label={tr('checkout.floor', 'Floor')} value={d.floor} onChangeText={(v) => set({ floor: v })} keyboardType="number-pad" />
            </View>
          ) : null}
        </>
      ) : kind === 'phone' ? (
        <View style={{ marginHorizontal: layout.margin }}>
          <TextField label={tr('checkout.phone', 'Delivery phone')} value={d.phone} onChangeText={(v) => set({ phone: v })} keyboardType="phone-pad" textContentType="telephoneNumber" helper={tr('checkout.phoneHelp', 'The driver calls this number when they arrive.')} />
        </View>
      ) : kind === 'note' ? (
        <View style={{ marginHorizontal: layout.margin }}>
          <TextField label={tr('checkout.notes', 'Notes for the driver (optional)')} value={d.notes} onChangeText={(v) => set({ notes: v })} multiline maxLength={200} placeholder={tr('checkout.notesPh', 'For example: ramp at the side entrance')} />
        </View>
      ) : (
        <PaymentMethodPicker value={d.pay} onChange={(m) => pick({ pay: m })} cashLabel={tr('pay.cashDelivery', 'Cash on delivery')} />
      )}
    </Sheet>
  );
}
