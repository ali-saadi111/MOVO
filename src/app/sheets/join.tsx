import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { sync } from '@/data';
import { PayChoice } from '@/features/community/components';
import { useLang, useLocalized, useT } from '@/i18n';
import { fmtDay, fmtTime } from '@/lib/dates';
import { formatMoney } from '@/lib/money';
import { ltr } from '@/lib/rtl';
import { layout, space } from '@/theme';
import { Button, ListRow, Section, Segmented, Sheet, Stepper, Switch, Text, go, type PayMethod } from '@/ui';

/** Join in one short sheet: who's coming (or tickets), a taxi if needed, then Join. */
export default function Join() {
  const { event } = useLocalSearchParams<{ event: string }>();
  const tr = useT();
  const lang = useLang();
  const loc = useLocalized();
  const e = sync.event(event)!;
  const [companion, setCompanion] = useState(0);
  const [taxi, setTaxi] = useState(false);
  const [tickets, setTickets] = useState(1);
  const [m, setM] = useState<PayMethod>('whish');
  const full = e.spots - e.taken <= 0;
  const venue = sync.place(e.venuePlaceId);
  const spots = e.priceCents ? tickets : companion ? 2 : 1;
  const total = e.priceCents * tickets;
  const cta = full ? tr('event.joinWait', 'Join the waiting list') : e.priceCents ? tr('checkout.payWith', 'Pay {{total}} with {{m}}', { total: ltr(formatMoney(total)), m: m === 'card' ? tr('pay.card', 'Card') : m === 'omt' ? 'OMT' : 'Whish' }) : (spots === 1 ? tr('join.ctaOne', 'Join · 1 spot') : tr('join.cta', 'Join · {{n}} spots', { n: spots }));
  const where = venue ? loc(venue.name) : loc(e.area);
  return (
    <Sheet title={loc(e.title)} detent={e.priceCents ? 0.56 : 0.44} scroll={!!e.priceCents}
      footer={<Button label={cta} onPress={() => { go.back(); go.push(`/covers/payment?flow=event&event=${e.id}&spots=${spots}&method=${e.priceCents ? m : 'cash'}&total=${total}`); }} />}>
      <Text variant="subheadline" color="textSecondary" numberOfLines={1} style={{ marginHorizontal: layout.margin, marginBottom: space.md }}>
        {fmtDay(e.startsAt, lang)} · {fmtTime(e.startsAt, lang)} · {where} · {e.priceCents ? ltr(formatMoney(e.priceCents)) : tr('event.free', 'Free')}
      </Text>
      {e.priceCents ? (
        <View style={{ gap: space.md }}>
          <View style={{ marginHorizontal: layout.margin, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="headline">{tr('join.tickets', 'Tickets')}</Text>
            <Stepper value={tickets} onChange={setTickets} max={4} label={tr('join.tickets', 'Tickets')} />
          </View>
          <PayChoice value={m} onChange={setM} />
        </View>
      ) : (
        <>
          <Segmented values={[tr('join.justMe', 'Just me'), tr('join.withCompanion', 'Me + companion')]} icons={['person.fill', 'person.2.fill']} index={companion} onChange={setCompanion} style={{ marginHorizontal: layout.margin, marginBottom: space.sm }} />
          <Section>
            <ListRow icon="car" title={tr('join.taxiShort', 'Accessible taxi')} subtitle={tr('join.taxiSub', 'We’ll book one to the start')} trailing={{ type: 'node', node: <Switch value={taxi} onValueChange={setTaxi} label={tr('join.taxi', 'I need an accessible taxi')} /> }} />
          </Section>
        </>
      )}
    </Sheet>
  );
}
