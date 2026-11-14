import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { specialistPhoto } from '@/art/people';
import { sync } from '@/data';
import { useSlots, useSpecialist } from '@/data/queries';
import { careAddress, dayOf, serviceFor, useCareDraft, whereFor, type Where } from '@/features/care/booking';
import { paymentLabel } from '@/features/labels';
import { useLang, useLocalized, useT } from '@/i18n';
import { fmtDay, fmtTime } from '@/lib/dates';
import { haptic } from '@/lib/haptics';
import { formatMoney } from '@/lib/money';
import { ltr } from '@/lib/rtl';
import { useDev } from '@/stores/dev';
import { continuous, layout, radii, space, useTheme } from '@/theme';
import { Avatar, Button, DayStrip, Icon, ListRow, PayLogo, Pressable, Screen, Section, Skeleton, StickyCTA, STICKY_CTA_SPACE, Text, TimeSlotGrid, go } from '@/ui';

/** One screen: day, time, then where and how to pay as tap-to-change rows. The bar sums it up above Book. */
export default function BookTime() {
  const p = useLocalSearchParams<{ id: string; where?: Where; at?: string; service?: string }>();
  const id = p.id;
  const t = useTheme();
  const tr = useT();
  const lang = useLang();
  const loc = useLocalized();
  const s = useSpecialist(id).data;
  const [d, setDraft] = useCareDraft();
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(0, 0, 0, 0);
  const [day, setDay] = useState(p.at ? dayOf(p.at) : tomorrow.toISOString());
  const [slot, setSlot] = useState<string | null>(p.at ?? null);
  const [justTaken, setJustTaken] = useState(false);
  const slots = useSlots(id, day);
  const slotTaken = useDev((x) => x.slotTaken);
  // A link can carry the service and where; remember them so the sheets and the profile agree.
  useEffect(() => {
    const patch: Partial<typeof d> = {};
    if (p.service) patch.service = p.service;
    if (p.where) patch.where = p.where;
    if (Object.keys(patch).length) setDraft(patch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.service, p.where]);
  if (!s) return <Screen title={tr('book.title', 'Choose a time')}><View style={{ padding: layout.margin, gap: space.md }}><Skeleton height={64} radius={16} /><Skeleton height={84} radius={30} /></View></Screen>;

  const svc = serviceFor(s, p.service ?? d.service);
  const where = whereFor(s, p.where ?? d.where);
  const clinic = s.clinic ? sync.place(s.clinic.placeId) : null;
  const addr = careAddress(d.addr);
  const price = ltr(formatMoney(svc.priceCents));
  const name = lang === 'ar' ? s.nameAr : s.name;
  const list = slots.data ?? [];
  const morning = list.filter((x) => new Date(x.startsAt).getHours() < 12);
  const afternoon = list.filter((x) => new Date(x.startsAt).getHours() >= 12);
  const edit = (kind: string) => go.push(`/sheets/care-edit?kind=${kind}&id=${s.id}`);
  const paySub = { cash: tr('pay.cashSession', 'Pay cash at the session'), whish: tr('pay.whishSub', 'Finish in the Whish app'), omt: tr('pay.omtSub', 'Pay at any OMT branch with a code'), card: tr('pay.cardSub', 'Visa or Mastercard') }[d.pay];

  const confirm = () => {
    if (!slot) return;
    if (slotTaken && !justTaken) { haptic.error(); setJustTaken(true); setSlot(null); return; }
    go.push(`/covers/payment?flow=booking&method=${d.pay}&total=${svc.priceCents}&specialist=${id}&service=${svc.id}&at=${encodeURIComponent(slot)}&where=${where}`);
  };
  const label = d.pay === 'cash' ? tr('book.ctaShort', 'Book') : tr('checkout.payWith', 'Pay {{total}} with {{m}}', { total: price, m: paymentLabel(tr, d.pay) });
  const group = (title: string, items: typeof list, first: boolean) => (items.length ? (
    <View style={{ gap: 6, marginTop: first ? 0 : space.md }}>
      <Text variant="footnote" weight="600" color="textSecondary" style={{ marginHorizontal: layout.margin }}>{title}</Text>
      <TimeSlotGrid compact slots={items} value={slot} onChange={setSlot} />
    </View>
  ) : null);

  return (
    <Screen title={tr('book.title', 'Choose a time')} variant="detail" grouped contentBottom={STICKY_CTA_SPACE + 24}
      footer={
        <StickyCTA note={
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 4 }}>
            <Text variant="subheadline" weight={slot ? '600' : '400'} color={slot ? 'textPrimary' : 'textSecondary'} tabular numberOfLines={1} style={{ flex: 1 }}>
              {slot ? `${fmtDay(slot, lang)}, ${fmtTime(slot, lang)}` : tr('care.chooseTime', 'Choose a time')}
              <Text variant="subheadline" color="textSecondary">{` · ${tr('care.minutes', '{{n}} min', { n: svc.minutes })}`}</Text>
            </Text>
            <Text variant="headline" tabular>{price}</Text>
          </View>
        }>
          <Button label={label} disabledReason={slot ? null : tr('care.chooseTime', 'Choose a time')} onPress={confirm} />
        </StickyCTA>
      }>
      {/* Who and which service */}
      <Pressable feedback={s.services.length > 1 ? 'highlight' : 'none'} disabled={s.services.length < 2} onPress={() => edit('service')} accessibilityRole="button"
        accessibilityLabel={`${name}, ${loc(svc.name)}${s.services.length > 1 ? `. ${tr('common.change', 'Change')}` : ''}`}
        style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginHorizontal: layout.margin, marginTop: space.md, padding: space.sm, borderRadius: radii.card, ...continuous, backgroundColor: t.colors.bgElevated }}>
        <Avatar name={s.name} size={44} photo={specialistPhoto(s.id)} />
        <View style={{ flex: 1 }}>
          <Text variant="headline" numberOfLines={1}>{name}</Text>
          <Text variant="footnote" color="textSecondary" numberOfLines={1}>{loc(svc.name)} · {tr('care.minutes', '{{n}} min', { n: svc.minutes })}</Text>
        </View>
        {s.services.length > 1 ? <Text variant="subheadline" weight="600" color="accentText">{tr('common.change', 'Change')}</Text> : null}
      </Pressable>

      {justTaken ? (
        <Animated.View entering={FadeIn.duration(200)} style={{ marginHorizontal: layout.margin, marginTop: space.md, flexDirection: 'row', gap: space.sm, padding: space.md, borderRadius: radii.card, backgroundColor: t.scheme === 'dark' ? 'rgba(248,113,113,0.14)' : 'rgba(197,48,48,0.07)' }}>
          <Icon name="exclamationmark.triangle" size={18} color="danger" />
          <Text variant="subheadline" style={{ flex: 1 }}>{tr('book.taken', 'That time was just taken. Choose another one.')}</Text>
        </Animated.View>
      ) : null}

      <View style={{ marginTop: space.md }}>
        <DayStrip value={day} onChange={(v) => { setDay(v); setSlot(null); }} />
      </View>
      <View style={{ marginTop: space.md, marginBottom: space.lg }}>
        {slots.isLoading ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: layout.margin }}>{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} width="23%" height={44} radius={22} />)}</View>
        ) : (
          <>
            {group(tr('book.morning', 'Morning'), morning, true)}
            {group(tr('book.afternoon', 'Afternoon'), afternoon, !morning.length)}
          </>
        )}
      </View>

      <Section>
        {where === 'home'
          ? <ListRow icon="house.fill" title={tr('care.atHome', 'At your home')} subtitle={addr.sub} subtitleLines={1} onPress={() => edit('where')} />
          : <ListRow icon="building.2" title={clinic ? loc(clinic.name) : tr('care.atClinic', 'At the clinic')} subtitle={clinic ? `${tr('care.atClinic', 'At the clinic')} · ${loc(clinic.street)}` : undefined} subtitleLines={1} onPress={() => edit('where')} />}
        <ListRow leading={<PayLogo method={d.pay} size={32} />} title={d.pay === 'cash' ? tr('pay.cash', 'Cash') : paymentLabel(tr, d.pay)} subtitle={paySub} onPress={() => edit('pay')} />
      </Section>
    </Screen>
  );
}
