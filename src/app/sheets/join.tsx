import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { sync } from '@/data';
import { useLang, useLocalized, useT } from '@/i18n';
import { fmtLongDay, fmtTime } from '@/lib/dates';
import { formatMoney } from '@/lib/money';
import { ltr } from '@/lib/rtl';
import { layout, space } from '@/theme';
import { Button, ListRow, PaymentMethodPicker, Section, Sheet, Stepper, Switch, Text, go, type PayMethod } from '@/ui';

export default function Join() {
  const { event } = useLocalSearchParams<{ event: string }>();
  const tr = useT();
  const lang = useLang();
  const loc = useLocalized();
  const e = sync.event(event)!;
  const [companion, setCompanion] = useState(false);
  const [taxi, setTaxi] = useState(false);
  const [tickets, setTickets] = useState(1);
  const [m, setM] = useState<PayMethod>('whish');
  const full = e.spots - e.taken <= 0;
  const spots = e.priceCents ? tickets : companion ? 2 : 1;
  const total = e.priceCents * tickets;
  const cta = full ? tr('event.joinWait', 'Join the waiting list') : e.priceCents ? tr('checkout.payWith', 'Pay {{total}} with {{m}}', { total: ltr(formatMoney(total)), m: m === 'card' ? tr('pay.card', 'Card') : m === 'omt' ? 'OMT' : 'Whish' }) : (spots === 1 ? tr('join.ctaOne', 'Join · 1 spot') : tr('join.cta', 'Join · {{n}} spots', { n: spots }));
  return (
    <Sheet title={loc(e.title)} detent={0.75}
      footer={<Button label={cta} onPress={() => { go.back(); go.push(`/covers/payment?flow=event&event=${e.id}&spots=${spots}&method=${e.priceCents ? m : 'cash'}&total=${total}`); }} />}>
      <Text variant="subheadline" color="textSecondary" style={{ marginHorizontal: layout.margin, marginBottom: space.lg }}>{fmtLongDay(e.startsAt, lang)} · {fmtTime(e.startsAt, lang)} · {loc(e.area)}</Text>
      {e.priceCents ? (
        <>
          <View style={{ marginHorizontal: layout.margin, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.xl }}>
            <Text variant="headline">{tr('join.tickets', 'Tickets')}</Text>
            <Stepper value={tickets} onChange={setTickets} max={4} label={tr('join.tickets', 'Tickets')} />
          </View>
          <PaymentMethodPicker value={m} onChange={setM} allowCash={false} />
        </>
      ) : (
        <Section>
          <ListRow icon="person.2" title={tr('join.companion', 'I’m bringing a companion')} trailing={{ type: 'node', node: <Switch value={companion} onValueChange={setCompanion} label={tr('join.companion', 'I’m bringing a companion')} /> }} />
          <ListRow icon="car" title={tr('join.taxi', 'I need an accessible taxi')} trailing={{ type: 'node', node: <Switch value={taxi} onValueChange={setTaxi} label={tr('join.taxi', 'I need an accessible taxi')} /> }} />
        </Section>
      )}
    </Sheet>
  );
}
