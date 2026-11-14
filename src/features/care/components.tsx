import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { serviceArt, serviceTint, TINT_ROTATION } from '@/art/colorPass';
import { specialistPhoto } from '@/art/people';
import { sync, type ServiceKind, type Specialist } from '@/data';
import { requireAccount } from '@/features/shell/auth';
import { serviceIcon, serviceLabel } from '@/features/labels';
import { useLang, useLocalized, useT } from '@/i18n';
import { fmtDay, fmtTime, fmtWeekday, useNow } from '@/lib/dates';
import { formatMoney } from '@/lib/money';
import { ltr } from '@/lib/rtl';
import { continuous, layout, radii, space, useTheme } from '@/theme';
import { Avatar, Icon, Pressable, Skeleton, Tag, Text, useTabNav } from '@/ui';

import { PLAN, sameDay, serviceFor, useNextFree, type Where } from './booking';

/** Open "Choose a time", optionally with a time and service already picked. Asks to sign in first. */
export function useOpenBooking() {
  const { push } = useTabNav();
  return (id: string, o: { at?: string; service?: string; where?: Where } = {}) => {
    const q = [o.where ? `where=${o.where}` : '', o.at ? `at=${encodeURIComponent(o.at)}` : '', o.service ? `service=${o.service}` : ''].filter(Boolean).join('&');
    const path = `/book/${id}${q ? `?${q}` : ''}`;
    if (requireAccount('book', path)) push(path);
  };
}

/** Thin segmented bar: one segment per session in the plan. */
export function PlanBars({ done, total, onDark, on, off, height = 5 }: { done: number; total: number; onDark?: boolean; on?: string; off?: string; height?: number }) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, flexDirection: 'row', gap: 4 }}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={{ flex: 1, height, borderRadius: height / 2, backgroundColor: i < done ? (on ?? t.colors.accent) : (off ?? (onDark ? 'rgba(255,255,255,0.22)' : t.colors.fill)) }} />
      ))}
    </View>
  );
}

/** Lilac (Care's colour) card for the next session: countdown pill, date, who and where, plan progress. */
export function NextSessionCard({ startsAt, specialistId, where, onPress }: { startsAt: string; specialistId: string; where: Where; onPress: () => void }) {
  const t = useTheme();
  const tr = useT();
  const lang = useLang();
  const now = useNow();
  const sp = sync.specialist(specialistId);
  const name = (lang === 'ar' ? sp?.nameAr : sp?.name) ?? '';
  const days = Math.max(0, Math.round((new Date(startsAt).setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0)) / 864e5));
  const when = days === 0 ? tr('care.today', 'Today') : days === 1 ? tr('care.tomorrow', 'Tomorrow') : tr('care.inDays', 'In {{n}} days', { n: days });
  const date = `${fmtDay(startsAt, lang)} · ${fmtTime(startsAt, lang)}`;
  const place = where === 'home' ? tr('care.atHome', 'At your home') : tr('care.atClinic', 'At the clinic');
  const session = tr('care.sessionOf', 'Session {{n}} of {{total}}', { n: PLAN.done + 1, total: PLAN.total });
  const c = t.tints.lilac;
  const darkMode = t.scheme === 'dark';
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${tr('care.next', 'Your next session')}, ${when}, ${date}, ${name}, ${place}. ${session}`}
      style={{ marginHorizontal: layout.margin, borderRadius: radii.hero, ...continuous, backgroundColor: c.bg, paddingHorizontal: 14, paddingVertical: space.md, gap: space.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
        <Text variant="caption1" weight="800" style={{ letterSpacing: 0.6 }}>{tr('care.nextShort', 'Next session').toUpperCase()}</Text>
        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: darkMode ? 'rgba(195,177,255,0.18)' : 'rgba(85,52,192,0.12)' }}>
          <Text variant="caption1" weight="800" style={{ color: c.ink, letterSpacing: 0.6 }}>{when.toUpperCase()}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ borderRadius: 28, borderWidth: 2.5, borderColor: darkMode ? 'rgba(255,255,255,0.9)' : '#FFFFFF' }}><Avatar name={sp?.name ?? ''} size={44} photo={specialistPhoto(specialistId)} /></View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text variant="title3" weight="800" tabular numberOfLines={1} adjustsFontSizeToFit>{date}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="stethoscope" size={14} color={{ raw: c.ink }} />
            <Text variant="footnote" numberOfLines={1} style={{ flexShrink: 1 }}>{name}</Text>
            <View style={{ width: 1, height: 12, marginHorizontal: 2, backgroundColor: darkMode ? 'rgba(255,255,255,0.25)' : 'rgba(85,52,192,0.3)' }} />
            <Icon name={where === 'home' ? 'house' : 'cross.case'} size={14} color={{ raw: c.ink }} />
            <Text variant="footnote" numberOfLines={1} style={{ flexShrink: 1 }}>{place}</Text>
          </View>
        </View>
        <View style={{ width: 42, height: 42, borderRadius: 14, ...continuous, backgroundColor: t.colors.buttonPrimaryBg, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="arrow.right" size={20} weight="semibold" color={{ raw: t.colors.buttonPrimaryFg }} mirrorInRTL />
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: 2 }}>
        <Text variant="subheadline" weight="600" tabular>{session}</Text>
        <PlanBars done={PLAN.done} total={PLAN.total} height={7} on={c.ink} off={darkMode ? 'rgba(255,255,255,0.14)' : 'rgba(85,52,192,0.18)'} />
      </View>
    </Pressable>
  );
}

/** Labels that fit a third of a phone width without breaking a word. */
const shortServiceLabel = (tr: ReturnType<typeof useT>, k: ServiceKind) =>
  ({ physio: tr('care.short.physio', 'Physio'), nursing: tr('care.short.nursing', 'Home nursing'), ot: tr('care.short.ot', 'Occupational therapy'), prosthetics: tr('care.short.prosthetics', 'Prosthetics'), repair: tr('care.short.repair', 'Wheelchair repair'), transport: tr('care.short.transport', 'Transport') })[k];

/** Six services in a 3×2 grid of small tiles. The rows stretch (up to a point) to fill a tall screen. */
export function ServiceGrid({ kinds, onPress, style }: { kinds: ServiceKind[]; onPress: (k: ServiceKind) => void; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const tr = useT();
  const rows = [kinds.slice(0, 3), kinds.slice(3, 6)];
  return (
    <View style={[{ gap: space.xs, paddingHorizontal: layout.margin }, style]}>
      {rows.map((row, r) => (
        <View key={r} style={{ flex: 1, flexDirection: 'row', gap: space.xs, minHeight: 76, maxHeight: 128 }}>
          {row.map((k, j) => {
            const i = r * 3 + j;
            const c = t.tints[serviceTint[k]];
            const art = serviceArt[k];
            return (
              <Animated.View key={k} entering={t.reduceMotion ? undefined : FadeInDown.delay(i * 30).springify().damping(22).stiffness(200)} style={{ flex: 1 }}>
                <Pressable feedback="scale" onPress={() => onPress(k)} accessibilityRole="button" accessibilityLabel={serviceLabel(tr, k)}
                  style={{ flex: 1, borderRadius: 20, ...continuous, overflow: 'hidden', backgroundColor: t.scheme === 'dark' ? c.bg : art.bg, padding: 6, paddingBottom: 9, gap: 5 }}>
                  <View style={{ flex: 1, minHeight: 36, borderRadius: 14, overflow: 'hidden', backgroundColor: art.bg }}>
                    <Image source={art.photo} contentFit="contain" transition={0} accessible={false} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} />
                  </View>
                  <Text variant="caption1" weight="700" numberOfLines={2} style={{ lineHeight: 15, paddingHorizontal: 4, color: t.scheme === 'dark' ? t.colors.textPrimary : '#15191B' }}>{shortServiceLabel(tr, k)}</Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

/** Specialists you've seen, as a row of faces with "Book again". */
export function FacesRail({ people, loading }: { people: Specialist[]; loading?: boolean }) {
  const tr = useT();
  const lang = useLang();
  const t = useTheme();
  const { push } = useTabNav();
  const book = useOpenBooking();
  if (loading) return <View style={{ flexDirection: 'row', gap: space.md, paddingHorizontal: layout.margin }}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} shape="circle" width={56} height={56} />)}</View>;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: layout.margin, gap: space.sm }}>
      {people.map((s, i) => {
        const name = lang === 'ar' ? s.nameAr : s.name;
        const short = name.replace(/^(Dr\.|د\.)\s*/, '').split(' ')[0];
        return (
          <View key={s.id} style={{ width: 88, alignItems: 'center', gap: 6 }}>
            <Pressable feedback="scale" onPress={() => push(`/specialist/${s.id}`)} accessibilityRole="button" accessibilityLabel={name} style={{ alignItems: 'center', gap: 4 }}>
              <View style={{ padding: 3, borderRadius: 34, borderWidth: 3, borderColor: t.tints[TINT_ROTATION[i % TINT_ROTATION.length]].soft }}><Avatar name={s.name} hue={s.avatarHue} size={52} photo={specialistPhoto(s.id)} /></View>
              <Text variant="footnote" weight="600" numberOfLines={1}>{short}</Text>
            </Pressable>
            <Pressable feedback="scale" onPress={() => book(s.id)} accessibilityRole="button" accessibilityLabel={tr('care.bookAgainA11y', 'Book {{name}} again', { name })}
              style={{ alignSelf: 'center', paddingHorizontal: 10, height: 26, borderRadius: 13, backgroundColor: t.colors.bgSelected, justifyContent: 'center' }}>
              <Text variant="caption1" weight="700" color="accentText" numberOfLines={1}>{tr('care.bookAgain', 'Book again')}</Text>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}

/** A specialist in a list, with their next free times as buttons that start a booking. */
export function SpecialistSlotsRow({ s, where, onOpen, index = 0 }: { s: Specialist; where: Where; onOpen: () => void; index?: number }) {
  const t = useTheme();
  const tr = useT();
  const lang = useLang();
  const loc = useLocalized();
  const book = useOpenBooking();
  const free = useNextFree(s.id, 6).data;
  const first = free?.[0];
  const today = free ? free.filter((x) => first && sameDay(x, first)).slice(0, 3) : [];
  const svc = serviceFor(s);
  const name = lang === 'ar' ? s.nameAr : s.name;
  return (
    <Animated.View entering={t.reduceMotion ? undefined : FadeInDown.delay(Math.min(index, 8) * 40).springify().damping(26).stiffness(170)}
      style={{ paddingHorizontal: layout.margin, paddingVertical: space.sm, gap: space.xs }}>
      <Pressable feedback="highlight" onPress={onOpen} accessibilityRole="button" accessibilityLabel={`${name}, ${loc(s.profession)}, ${s.stars.toFixed(1)}, ${formatMoney(svc.priceCents)}`}
        style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <Avatar name={s.name} hue={s.avatarHue} size={52} photo={specialistPhoto(s.id)} />
        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text variant="headline" numberOfLines={1} style={{ flexShrink: 1 }}>{name}</Text>
            {s.sponsored ? <Tag label={tr('care.sponsored', 'Sponsored')} /> : null}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="star.fill" size={12} color="accent" />
            <Text variant="footnote" tabular>{s.stars.toFixed(1)}</Text>
            <Text variant="footnote" color="textSecondary" tabular numberOfLines={1}>({s.reviewCount}) · {tr('care.years', '{{n}} yrs', { n: s.years })}</Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="headline" tabular>{ltr(formatMoney(svc.priceCents))}</Text>
          <Text variant="caption1" color="textSecondary" tabular>{tr('care.minutes', '{{n}} min', { n: svc.minutes })}</Text>
        </View>
      </Pressable>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginStart: 52 + space.sm }}>
        {!free ? <Skeleton width={180} height={32} radius={16} /> : !first ? (
          <Text variant="footnote" color="textSecondary">{tr('care.noTimes', 'No free times this week')}</Text>
        ) : (
          <>
            <Text variant="footnote" color="textSecondary" style={{ minWidth: 30 }}>{fmtWeekday(first, lang)}</Text>
            {today.map((at) => (
              <Pressable key={at} feedback="scale" onPress={() => book(s.id, { at, where })} accessibilityRole="button" accessibilityLabel={tr('care.bookAt', 'Book {{name}} at {{time}}', { name, time: `${fmtWeekday(at, lang)} ${fmtTime(at, lang)}` })}
                style={{ height: 32, paddingHorizontal: 11, borderRadius: 16, borderWidth: 1, borderColor: t.colors.separator, backgroundColor: t.colors.bgElevated, justifyContent: 'center' }}>
                <Text variant="footnote" weight="600" tabular>{fmtTime(at, lang)}</Text>
              </Pressable>
            ))}
            <Pressable feedback="highlight" onPress={() => book(s.id, { where })} accessibilityRole="button" style={{ height: 32, paddingHorizontal: 6, justifyContent: 'center' }}>
              <Text variant="footnote" weight="600" color="accentText">{tr('care.more', 'More')}</Text>
            </Pressable>
          </>
        )}
      </View>
    </Animated.View>
  );
}

/** Where visits go, top right of the list: tap to change the address. */
export function LocationPill({ label, onPress }: { label: string; onPress: () => void }) {
  const t = useTheme();
  const tr = useT();
  return (
    <Pressable feedback="scale" onPress={onPress} accessibilityRole="button" accessibilityLabel={`${tr('care.visitsTo', 'Visits to')} ${label}. ${tr('common.change', 'Change')}`}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 4, height: 34, paddingHorizontal: 10, borderRadius: 17, backgroundColor: t.colors.fill, marginEnd: 4 }}>
      <Icon name="mappin" size={14} color="accentText" fill />
      <Text variant="subheadline" weight="600" numberOfLines={1} style={{ maxWidth: 110 }}>{label}</Text>
      <Icon name="chevron.down" size={11} weight="bold" color="textSecondary" />
    </Pressable>
  );
}
