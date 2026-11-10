import { useLocalSearchParams } from 'expo-router';
import { specialistPhoto } from '@/art/people';
import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOutDown } from 'react-native-reanimated';

import { useSlots, useSpecialist } from '@/data/queries';
import { paymentLabel } from '@/features/labels';
import { useLang, useLocalized, useT } from '@/i18n';
import { fmtDay, fmtDayTime, fmtTime } from '@/lib/dates';
import { haptic } from '@/lib/haptics';
import { formatMoney } from '@/lib/money';
import { ltr } from '@/lib/rtl';
import { useDev } from '@/stores/dev';
import { continuous, layout, radii, space, useTheme } from '@/theme';
import { Avatar, Button, DayStrip, Icon, PaymentMethodPicker, Screen, SectionHeader, Skeleton, StickyCTA, STICKY_CTA_SPACE, Text, TimeSlotGrid, go, type PayMethod } from '@/ui';

export default function BookTime() {
  const { id, where = 'home' } = useLocalSearchParams<{ id: string; where?: string }>();
  const t = useTheme();
  const tr = useT();
  const lang = useLang();
  const loc = useLocalized();
  const s = useSpecialist(id).data;
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(0, 0, 0, 0);
  const [day, setDay] = useState(tomorrow.toISOString());
  const [slot, setSlot] = useState<string | null>(null);
  const [m, setM] = useState<PayMethod>('cash');
  const [justTaken, setJustTaken] = useState(false);
  const slots = useSlots(id, day);
  const slotTaken = useDev((x) => x.slotTaken);
  const svc = s?.services[0];
  const price = svc ? ltr(formatMoney(svc.priceCents)) : '';
  const confirm = () => {
    if (!slot || !svc) return;
    if (slotTaken && !justTaken) { haptic.error(); setJustTaken(true); setSlot(null); return; }
    go.push(`/covers/payment?flow=booking&method=${m}&total=${svc.priceCents}&specialist=${id}&service=${svc.id}&at=${encodeURIComponent(slot)}&where=${where}`);
  };
  const label = slot ? (m === 'cash' ? tr('book.cta', 'Book {{when}}', { when: fmtDayTime(slot, lang) }) : tr('checkout.payWith', 'Pay {{total}} with {{m}}', { total: price, m: paymentLabel(tr, m) })) : '';
  return (
    <Screen title={tr('book.title', 'Choose a time')} variant="detail" grouped contentBottom={STICKY_CTA_SPACE}
      footer={<StickyCTA><Button label={label} disabledReason={slot ? null : tr('care.chooseTime', 'Choose a time')} onPress={confirm} /></StickyCTA>}>
      {s ? (
        <Animated.View entering={FadeInDown.springify().damping(18).stiffness(160)} style={{ marginHorizontal: layout.margin, marginTop: space.md, borderRadius: radii.hero, ...continuous, backgroundColor: t.colors.blockNavy, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md }}>
            <Avatar name={s.name} size={48} photo={specialistPhoto(s.id)} />
            <View style={{ flex: 1 }}>
              <Text variant="headline" style={{ color: '#FFFFFF' }}>{lang === 'ar' ? s.nameAr : s.name}</Text>
              <Text variant="footnote" style={{ color: 'rgba(255,255,255,0.72)' }}>{svc ? loc(svc.name) : ''} · {where === 'home' ? tr('care.homeVisit', 'Home visit') : tr('care.atClinic', 'At the clinic')}</Text>
            </View>
            <View style={{ paddingHorizontal: 12, height: 34, borderRadius: 17, backgroundColor: t.colors.accent, justifyContent: 'center' }}><Text variant="subheadline" weight="800" tabular style={{ color: '#013447' }}>{price}</Text></View>
          </View>
          {/* ticket perforation */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: t.colors.bgGrouped, marginStart: -11 }} />
            <View style={{ flex: 1, height: 0, borderTopWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.22)' }} />
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: t.colors.bgGrouped, marginEnd: -11 }} />
          </View>
          <View style={{ flexDirection: 'row', padding: space.md, paddingTop: space.sm, gap: space.md }}>
            <TicketField label={tr('book.day', 'Day')} value={fmtDay(day, lang)} k={day} />
            <TicketField label={tr('book.time', 'Time')} value={slot ? fmtTime(slot, lang) : '— : —'} k={slot ?? 'none'} highlight={!!slot} />
          </View>
        </Animated.View>
      ) : null}
      {justTaken ? (
        <Animated.View entering={FadeIn.duration(200)} style={{ marginHorizontal: layout.margin, marginTop: space.md, flexDirection: 'row', gap: space.sm, padding: space.md, borderRadius: radii.card, backgroundColor: t.scheme === 'dark' ? 'rgba(248,113,113,0.14)' : 'rgba(197,48,48,0.07)' }}>
          <Icon name="exclamationmark.triangle" size={18} color="danger" />
          <Text variant="subheadline" style={{ flex: 1 }}>{tr('book.taken', 'That time was just taken. Choose another one.')}</Text>
        </Animated.View>
      ) : null}
      <View style={{ marginTop: space.lg }}>
        <SectionHeader title={tr('book.day', 'Day')} />
        <DayStrip value={day} onChange={(d) => { setDay(d); setSlot(null); }} />
      </View>
      <View style={{ marginTop: space.xl, marginBottom: space.xl }}>
        <SectionHeader title={tr('book.time', 'Time')} />
        {slots.isLoading ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: layout.margin }}>{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} width="31.5%" height={48} radius={24} />)}</View>
          : <TimeSlotGrid slots={slots.data ?? []} value={slot} onChange={setSlot} />}
      </View>
      <PaymentMethodPicker value={m} onChange={setM} cashLabel={tr('pay.cashSession', 'Pay cash at the session')} />
    </Screen>
  );
}

/** A value on the booking ticket that flips in from below whenever it changes. */
function TicketField({ label, value, k, highlight }: { label: string; value: string; k: string; highlight?: boolean }) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, gap: 2, overflow: 'hidden' }}>
      <Text variant="caption1" weight="600" style={{ color: 'rgba(255,255,255,0.6)' }}>{label.toUpperCase()}</Text>
      <Animated.View key={k} entering={t.reduceMotion ? undefined : FadeInUp.springify().damping(16).stiffness(200)} exiting={t.reduceMotion ? undefined : FadeOutDown.duration(120)}>
        <Text tabular style={{ color: highlight ? t.colors.accent : '#FFFFFF', fontSize: 24, lineHeight: 30, fontWeight: '800' }}>{value}</Text>
      </Animated.View>
    </View>
  );
}
