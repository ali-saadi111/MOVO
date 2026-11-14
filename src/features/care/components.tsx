import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { specialistPhoto } from '@/art/people';
import { sync, type ServiceKind, type Specialist } from '@/data';
import { requireAccount } from '@/features/shell/auth';
import { serviceIcon, serviceLabel } from '@/features/labels';
import { useLang, useLocalized, useT } from '@/i18n';
import { fmtDay, fmtTime, fmtWeekday, useNow } from '@/lib/dates';
import { formatMoney } from '@/lib/money';
import { ltr } from '@/lib/rtl';
import { continuous, layout, radii, space, useTheme } from '@/theme';
import { Avatar, Icon, Pressable, Skeleton, Tag, Text, toneColors, TONES, useTabNav } from '@/ui';

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
export function PlanBars({ done, total, onDark }: { done: number; total: number; onDark?: boolean }) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, flexDirection: 'row', gap: 4 }}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: i < done ? t.colors.accent : onDark ? 'rgba(255,255,255,0.22)' : t.colors.fill }} />
      ))}
    </View>
  );
}

/** Compact navy ticket for the next session, with the plan progress inside it. */
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
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${tr('care.next', 'Your next session')}, ${date}, ${name}, ${place}. ${session}`}
      style={{ marginHorizontal: layout.margin, borderRadius: radii.hero, ...continuous, backgroundColor: t.colors.blockNavy, padding: space.md, gap: space.sm }}>
      <Text variant="caption1" weight="700" style={{ color: t.colors.accent, letterSpacing: 0.6 }}>{`${tr('care.nextShort', 'Next session')} · ${when}`.toUpperCase()}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <Avatar name={sp?.name ?? ''} size={46} photo={specialistPhoto(specialistId)} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="title3" weight="800" tabular style={{ color: '#FFFFFF' }} numberOfLines={1} adjustsFontSizeToFit>{date}</Text>
          <Text variant="footnote" style={{ color: 'rgba(255,255,255,0.75)' }} numberOfLines={1}>{name} · {place}</Text>
        </View>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: t.colors.accent, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chevron.right" size={16} weight="bold" color={{ raw: '#013447' }} mirrorInRTL />
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <Text variant="caption1" style={{ color: 'rgba(255,255,255,0.85)' }} tabular>{session}</Text>
        <PlanBars done={PLAN.done} total={PLAN.total} onDark />
      </View>
    </Pressable>
  );
}

/** Six services in a tight 3×2 grid of small tiles. */
export function ServiceGrid({ kinds, onPress }: { kinds: ServiceKind[]; onPress: (k: ServiceKind) => void }) {
  const t = useTheme();
  const tr = useT();
  const [w, setW] = useState(0);
  const tileW = Math.floor((w - layout.margin * 2 - space.xs * 2) / 3);
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs, paddingHorizontal: layout.margin, minHeight: 176 }}>
      {kinds.map((k, i) => {
        const c = toneColors(t.colors, TONES[i % 4]);
        return (
          <Animated.View key={k} entering={t.reduceMotion ? undefined : FadeInDown.delay(i * 30).springify().damping(22).stiffness(200)} style={{ width: tileW, opacity: w ? 1 : 0 }}>
            <Pressable feedback="scale" onPress={() => onPress(k)} accessibilityRole="button" accessibilityLabel={serviceLabel(tr, k)}
              style={{ minHeight: 84, borderRadius: 18, ...continuous, backgroundColor: t.colors.bgElevated, borderWidth: 1, borderColor: t.colors.separator, padding: 10, gap: 8 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={serviceIcon[k]} size={16} color={{ raw: c.ink }} fill />
              </View>
              <Text variant="caption1" weight="700" numberOfLines={2} style={{ lineHeight: 15 }}>{serviceLabel(tr, k)}</Text>
            </Pressable>
          </Animated.View>
        );
      })}
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
  if (loading) return <View style={{ flexDirection: 'row', gap: space.md, paddingHorizontal: layout.margin }}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} shape="circle" width={64} height={64} />)}</View>;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: layout.margin, gap: space.sm }}>
      {people.map((s) => {
        const name = lang === 'ar' ? s.nameAr : s.name;
        const short = name.replace(/^(Dr\.|د\.)\s*/, '').split(' ')[0];
        return (
          <View key={s.id} style={{ width: 88, alignItems: 'center', gap: 6 }}>
            <Pressable feedback="scale" onPress={() => push(`/specialist/${s.id}`)} accessibilityRole="button" accessibilityLabel={name} style={{ alignItems: 'center', gap: 4 }}>
              <Avatar name={s.name} hue={s.avatarHue} size={64} photo={specialistPhoto(s.id)} />
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
