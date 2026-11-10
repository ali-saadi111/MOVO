import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { sync } from '@/data';
import { useLocalized, useT } from '@/i18n';
import { formatMoney } from '@/lib/money';
import { ltr } from '@/lib/rtl';
import { layout, space } from '@/theme';
import { Button, ChipWrap, ListRow, PaymentMethodPicker, Section, Sheet, Switch, Text, TextField, go, type PayMethod } from '@/ui';

export default function Donate() {
  const { campaign } = useLocalSearchParams<{ campaign: string }>();
  const tr = useT();
  const loc = useLocalized();
  const c = sync.campaign(campaign)!;
  const [amt, setAmt] = useState<string>('25');
  const [other, setOther] = useState('');
  const [showName, setShowName] = useState(false);
  const [m, setM] = useState<PayMethod>('whish');
  const dollars = amt === 'other' ? Number(other || 0) : Number(amt);
  const tooLow = dollars < 5;
  const label = tr('checkout.payWith', 'Pay {{total}} with {{m}}', { total: ltr(formatMoney(dollars * 100)), m: m === 'card' ? tr('pay.card', 'Card') : m === 'omt' ? 'OMT' : 'Whish' });
  return (
    <Sheet title={tr('donate.title', 'Donate')} detent={0.85}
      footer={<><Text variant="caption1" color="textSecondary" align="center">{tr('donate.keepsNothing', 'Movo keeps nothing from donations.')}</Text><Button label={label} disabledReason={tooLow ? tr('donate.min', 'The smallest gift is $5') : null} onPress={() => { go.back(); go.push(`/covers/payment?flow=donation&campaign=${c.id}&method=${m}&total=${dollars * 100}`); }} /></>}>
      <Text variant="subheadline" color="textSecondary" style={{ marginHorizontal: layout.margin, marginBottom: space.lg }}>{loc(c.title)} · {c.ngo}</Text>
      <View style={{ paddingHorizontal: layout.margin, gap: space.md, marginBottom: space.xl }}>
        <ChipWrap options={[{ value: '10', label: '$10' }, { value: '25', label: '$25' }, { value: '50', label: '$50' }, { value: 'other', label: tr('donate.other', 'Other') }]} value={amt} onChange={setAmt} />
        {amt === 'other' ? <TextField label={tr('donate.amount', 'Amount in dollars')} value={other} onChangeText={(v) => setOther(v.replace(/[^0-9]/g, ''))} keyboardType="number-pad" helper={tr('donate.min', 'The smallest gift is $5')} /> : null}
      </View>
      <Section footer={tr('donate.nameHint', 'Off by default. Your name appears on the campaign page only if you turn this on.')}>
        <ListRow title={tr('donate.showName', 'Show my name')} trailing={{ type: 'node', node: <Switch value={showName} onValueChange={setShowName} label={tr('donate.showName', 'Show my name')} /> }} />
      </Section>
      <PaymentMethodPicker value={m} onChange={setM} allowCash={false} />
    </Sheet>
  );
}
