import { useState } from 'react';
import { View } from 'react-native';

import { useCartTotals } from '@/features/shop/cart';
import { useT } from '@/i18n';
import { formatMoney } from '@/lib/money';
import { ltr } from '@/lib/rtl';
import { EMPTY_DRAFT, useDrafts } from '@/stores/drafts';
import { layout, space } from '@/theme';
import { Button, ChipWrap, ListRow, Screen, Section, StickyCTA, STICKY_CTA_SPACE, Text, TextField, useTabNav } from '@/ui';

const SAVED = [
  { id: 'home', title: 'Home', sub: 'Hamra, Makdessi St, Bldg 14, 3rd floor' },
  { id: 'work', title: 'Mum’s place', sub: 'Saida, Riad El Solh St, Bldg 2, ground floor' },
];

export default function Delivery() {
  const tr = useT();
  const { push } = useTabNav();
  const { total } = useCartTotals();
  const draft = useDrafts((s) => s.drafts.delivery ?? EMPTY_DRAFT) as Record<string, string>;
  const save = useDrafts((s) => s.save);
  const [addr, setAddr] = useState(draft.addr ?? 'home');
  const [phone, setPhone] = useState(draft.phone ?? '+961 70 123 456');
  const [notes, setNotes] = useState(draft.notes ?? '');
  const [area, setArea] = useState(draft.area ?? '');
  const upd = (k: string, v: string) => save('delivery', { ...draft, addr, phone, notes, area, [k]: v });
  return (
    <Screen
      title={tr('checkout.delivery', 'Delivery')}
      variant="detail"
      grouped
      contentBottom={STICKY_CTA_SPACE}
      footer={<StickyCTA><Button label={tr('checkout.continuePay', 'Continue to payment · {{total}}', { total: ltr(formatMoney(total)) })} disabledReason={phone.trim().length < 8 ? tr('checkout.needPhone', 'Add a delivery phone') : null} onPress={() => push('/checkout/payment')} /></StickyCTA>}
    >
      <Text variant="subheadline" color="textSecondary" style={{ marginHorizontal: layout.margin + space.md, marginTop: space.md, marginBottom: space.md }}>{tr('checkout.step1', 'Step 1 of 2')}</Text>
      <Section header={tr('checkout.address', 'Address')}>
        {SAVED.map((a) => <ListRow key={a.id} icon="house" title={a.title} subtitle={a.sub} trailing={{ type: 'check', on: addr === a.id }} onPress={() => { setAddr(a.id); upd('addr', a.id); }} />)}
        <ListRow icon="plus" title={tr('checkout.addAddress', 'Add an address')} trailing={{ type: 'check', on: addr === 'new' }} onPress={() => { setAddr('new'); upd('addr', 'new'); }} />
      </Section>
      {addr === 'new' ? (
        <View style={{ marginHorizontal: layout.margin, gap: space.md, marginBottom: space.xl }}>
          <Text variant="subheadline" weight="600">{tr('checkout.area', 'Area')}</Text>
          <ChipWrap options={['Hamra', 'Verdun', 'Achrafieh', 'Saida'].map((x) => ({ value: x, label: x }))} value={area} onChange={(v) => { setArea(v); upd('area', v); }} />
          <TextField label={tr('checkout.street', 'Street and building')} value={draft.street ?? ''} onChangeText={(v) => upd('street', v)} />
          <TextField label={tr('checkout.floor', 'Floor')} value={draft.floor ?? ''} onChangeText={(v) => upd('floor', v)} keyboardType="number-pad" />
        </View>
      ) : null}
      <View style={{ marginHorizontal: layout.margin, gap: space.lg }}>
        <TextField label={tr('checkout.phone', 'Delivery phone')} value={phone} onChangeText={(v) => { setPhone(v); upd('phone', v); }} keyboardType="phone-pad" textContentType="telephoneNumber" helper={tr('checkout.phoneHelp', 'The driver calls this number when they arrive.')} />
        <TextField label={tr('checkout.notes', 'Notes for the driver (optional)')} value={notes} onChangeText={(v) => { setNotes(v); upd('notes', v); }} multiline maxLength={200} placeholder={tr('checkout.notesPh', 'For example: ramp at the side entrance')} />
      </View>
    </Screen>
  );
}
