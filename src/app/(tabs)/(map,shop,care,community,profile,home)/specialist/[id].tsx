import { useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { specialistPhoto } from '@/art/people';
import { sync } from '@/data';
import { specialistExtras } from '@/data/fixtures/specialistExtras';
import { useSpecialist } from '@/data/queries';
import { serviceFor, useCareDraft, useNextFree, whereFor, type Where } from '@/features/care/booking';
import { useOpenBooking } from '@/features/care/components';
import { useLang, useLocalized, useT } from '@/i18n';
import { fmtTime, fmtWeekday } from '@/lib/dates';
import { haptic } from '@/lib/haptics';
import { formatMoney } from '@/lib/money';
import { ltr } from '@/lib/rtl';
import { continuous, layout, space, useTheme } from '@/theme';
import { Avatar, Button, ErrorState, Icon, ListRow, Pressable, Screen, Section, Skeleton, StickyCTA, STICKY_CTA_SPACE, Text, go } from '@/ui';

/** Specialist profile on about one screen: who, which service, when they're free. Longer details open in sheets. */
export default function SpecialistProfile() {
  const { id, where: whereParam } = useLocalSearchParams<{ id: string; where?: Where }>();
  const t = useTheme();
  const tr = useT();
  const lang = useLang();
  const loc = useLocalized();
  const q = useSpecialist(id);
  const [draft, setDraft] = useCareDraft();
  const free = useNextFree(id, 6).data;
  const book = useOpenBooking();
  const s = q.data;
  if (q.isError) return <Screen title=""><ErrorState onRetry={() => q.refetch()} /></Screen>;
  if (!s) return <Screen title=""><View style={{ alignItems: 'center', gap: 12, paddingTop: 24 }}><Skeleton shape="circle" width={84} height={84} /><Skeleton shape="text" width={180} height={24} /></View></Screen>;
  const x = specialistExtras(s);
  const clinic = s.clinic ? sync.place(s.clinic.placeId) : null;
  const name = lang === 'ar' ? s.nameAr : s.name;
  const first = name.replace(/^(Dr\.|د\.)\s*/, '').split(' ')[0];
  const svc = serviceFor(s, draft.service);
  const where = whereFor(s, whereParam ?? draft.where);
  const open = (kind: string) => go.push(`/sheets/specialist-info?id=${s.id}&kind=${kind}`);
  const pickService = (sid: string) => { haptic.selection(); setDraft({ service: sid }); };
  const placeLine = [s.homeVisit ? tr('care.visits', 'Home visits') : null, clinic ? loc(clinic.name) : null].filter(Boolean).join(' · ');
  const enter = (i: number) => (t.reduceMotion ? undefined : FadeInDown.delay(i * 40).springify().damping(24).stiffness(180));

  return (
    <Screen title={name} variant="detail" grouped contentBottom={STICKY_CTA_SPACE}
      footer={
        <StickyCTA>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <View>
              <Text variant="title3" weight="800" tabular>{ltr(formatMoney(svc.priceCents))}</Text>
              <Text variant="caption1" color="textSecondary">{tr('care.minutes', '{{n}} min', { n: svc.minutes })}</Text>
            </View>
            <View style={{ flex: 1 }}><Button label={tr('care.chooseTime', 'Choose a time')} onPress={() => book(s.id, { service: svc.id, where })} /></View>
          </View>
        </StickyCTA>
      }>
      {/* Who */}
      <Animated.View entering={enter(0)} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: layout.margin, paddingTop: space.md }}>
        <Avatar name={s.name} hue={s.avatarHue} size={84} photo={specialistPhoto(s.id)} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="title2" weight="800" numberOfLines={2}>{name}</Text>
          <Text variant="subheadline" color="textSecondary" numberOfLines={1}>{loc(s.profession)} · {s.areas.slice(0, 2).join(', ')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginTop: 4, backgroundColor: t.colors.bgSelected, paddingHorizontal: 8, height: 24, borderRadius: 12 }}>
            <Icon name="checkmark.seal.fill" size={13} color="accentText" />
            <Text variant="caption1" weight="700" color="accentText">{tr('care.verified', 'Verified by Movo')}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Facts */}
      <Animated.View entering={enter(1)} style={{ flexDirection: 'row', marginHorizontal: layout.margin, marginTop: space.md, paddingVertical: space.sm, borderRadius: 18, ...continuous, backgroundColor: t.colors.bgElevated }}>
        {([
          [s.stars.toFixed(1), tr('care.reviewsShort', '{{n}} reviews', { n: s.reviewCount }), true],
          [String(s.years), tr('care.yearsShort', 'years'), false],
          [`${(Math.round(x.patients / 10) * 10).toLocaleString('en')}+`, tr('care.helpedShort', 'people helped'), false],
        ] as [string, string, boolean][]).map(([v, l, star], i) => (
          <Pressable key={l} feedback={star ? 'highlight' : 'none'} onPress={star ? () => open('reviews') : undefined} disabled={!star} accessibilityLabel={`${v} ${l}`}
            style={{ flex: 1, alignItems: 'center', gap: 1, borderStartWidth: i ? 1 : 0, borderColor: t.colors.separator }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {star ? <Icon name="star.fill" size={14} color="accent" /> : null}
              <Text variant="headline" weight="800" tabular>{v}</Text>
            </View>
            <Text variant="caption1" color="textSecondary" numberOfLines={1}>{l}</Text>
          </Pressable>
        ))}
      </Animated.View>

      <Animated.View entering={enter(2)} style={{ paddingHorizontal: layout.margin, paddingTop: space.md, gap: space.sm }}>
        <Text variant="headline">{loc(x.tagline)}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {x.focus.map((f) => (
            <View key={f.label.en} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, height: 28, borderRadius: 14, backgroundColor: t.colors.bgSelected }}>
              <Icon name={f.icon} size={13} color="accentText" fill />
              <Text variant="caption1" weight="600" color="accentText">{loc(f.label)}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Which service */}
      <Section header={tr('care.serviceTitle', 'Service')} style={{ marginTop: space.lg, marginBottom: space.lg }}>
        {s.services.map((sv) => {
          const on = sv.id === svc.id;
          return (
            <ListRow key={sv.id} title={loc(sv.name)} subtitle={tr('care.minutes', '{{n}} min', { n: sv.minutes })} onPress={() => pickService(sv.id)}
              accessibilityLabel={`${loc(sv.name)}, ${sv.minutes} min, ${formatMoney(sv.priceCents)}`}
              leading={<View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: on ? 7 : 2, borderColor: on ? t.colors.accent : t.colors.separator }} />}
              trailing={{ type: 'node', node: <Text variant="headline" tabular>{ltr(formatMoney(sv.priceCents))}</Text> }} />
          );
        })}
      </Section>

      {/* When */}
      <Text variant="footnote" color="textSecondary" style={{ marginHorizontal: layout.margin + space.md, marginBottom: 6, textTransform: t.rtl ? 'none' : 'uppercase' }}>{tr('care.nextFree', 'Next free')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: layout.margin, gap: space.xs }}>
        {!free ? [0, 1, 2, 3].map((i) => <Skeleton key={i} width={64} height={52} radius={14} />) : free.length ? free.map((at) => (
          <Pressable key={at} feedback="scale" onPress={() => book(s.id, { at, service: svc.id, where })} accessibilityRole="button" accessibilityLabel={tr('care.bookAt', 'Book {{name}} at {{time}}', { name, time: `${fmtWeekday(at, lang)} ${fmtTime(at, lang)}` })}
            style={{ minWidth: 64, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14, ...continuous, backgroundColor: t.colors.bgElevated, alignItems: 'center' }}>
            <Text variant="headline" tabular>{fmtTime(at, lang)}</Text>
            <Text variant="caption1" color="textSecondary">{fmtWeekday(at, lang)}</Text>
          </Pressable>
        )) : <Text variant="subheadline" color="textSecondary">{tr('care.noTimes', 'No free times this week')}</Text>}
      </ScrollView>

      {/* Details, each in a sheet */}
      <Section style={{ marginTop: space.lg }}>
        <ListRow icon="info.circle" title={tr('care.aboutName', 'About {{name}}', { name: first })} subtitle={loc(s.bio)} subtitleLines={1} onPress={() => open('about')} />
        <ListRow icon="list.bullet" title={tr('care.howItGoes', 'How a session goes')} subtitle={x.steps.map(([h]) => loc(h)).join(', ')} subtitleLines={1} onPress={() => open('steps')} />
        <ListRow icon="mappin" title={tr('care.whereSees', 'Where {{name}} sees you', { name: first })} subtitle={placeLine} subtitleLines={1} onPress={() => open('where')} />
        <ListRow icon="graduationcap.fill" title={tr('care.credentials', 'Credentials')} subtitle={loc(x.degree)} subtitleLines={1} onPress={() => open('credentials')} />
        <ListRow icon="quote.opening" title={tr('place.reviews', 'Reviews')} subtitle={`${s.stars.toFixed(1)} · “${s.reviews[0]?.text ?? ''}”`} subtitleLines={1} onPress={() => open('reviews')} />
      </Section>
    </Screen>
  );
}
