import { useEffect, useRef, useState } from 'react';
import { ScrollView, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollViewInstance, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { eventArt } from '@/art/colorPass';
import { MovoObject } from '@/art/objects';
import { sync, type Campaign, type ImageRef, type MovoEvent } from '@/data';
import { useLang, useLocalized, useT } from '@/i18n';
import { fmtTime } from '@/lib/dates';
import { formatMoney } from '@/lib/money';
import { ltr } from '@/lib/rtl';
import { paymentLabel } from '@/features/labels';
import { continuous, layout, space, useTheme } from '@/theme';
import { ArtImage, Icon, PaymentMethodPicker, ProgressBar, Pressable, RatingBadge, Text, type IconName, type PayMethod } from '@/ui';
import { PayLogo } from '@/ui/flows';

const DAY = 86_400_000;

/** Rolling groups: the next 7 days, the 7 after, then everything later. */
export function groupByWeek(events: MovoEvent[]) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const groups: { key: 'week' | 'next' | 'later'; items: MovoEvent[] }[] = [{ key: 'week', items: [] }, { key: 'next', items: [] }, { key: 'later', items: [] }];
  for (const e of [...events].sort((a, b) => a.startsAt.localeCompare(b.startsAt))) {
    const d = (new Date(e.startsAt).getTime() - start.getTime()) / DAY;
    groups[d < 7 ? 0 : d < 14 ? 1 : 2].items.push(e);
  }
  return groups.filter((g) => g.items.length);
}

export const isThisWeek = (e: MovoEvent) => new Date(e.startsAt).getTime() - Date.now() < 7 * DAY;

/**
 * One activity as a row, in the same shape as a campaign row: square picture with the
 * date on it, title, time · area · price with the access tick, a spots bar, and Join.
 */
export function EventRow({ ev, onPress, onJoin, joined, first, index = 0 }: { ev: MovoEvent; onPress: () => void; onJoin?: () => void; joined?: boolean; first?: boolean; index?: number }) {
  const t = useTheme();
  const tr = useT();
  const lang = useLang();
  const loc = useLocalized();
  const venue = sync.place(ev.venuePlaceId);
  const left = Math.max(0, ev.spots - ev.taken);
  const full = left <= 0;
  const warm = !full && left <= 12;
  const price = ev.priceCents ? ltr(formatMoney(ev.priceCents)) : tr('event.free', 'Free');
  const d = new Date(ev.startsAt);
  const dayFmt = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-LB-u-nu-latn' : 'en-GB', { weekday: 'short' });
  const art = eventArt(ev.id);
  return (
    <Animated.View entering={t.reduceMotion ? undefined : FadeInDown.delay(Math.min(index, 8) * 35).springify().damping(20).stiffness(190)}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: layout.margin }}>
      <Pressable onPress={onPress} feedback="highlight" accessibilityRole="button"
        accessibilityLabel={`${loc(ev.title)}, ${fmtLongDayShort(ev.startsAt, lang)} ${fmtTime(ev.startsAt, lang)}, ${loc(ev.area)}, ${price}, ${full ? tr('event.fullShort', 'Full') : tr('comm.left', '{{n}} left', { n: left })}`}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: 10 }}>
        <View style={{ width: 72, height: 72, borderRadius: 16, overflow: 'hidden', backgroundColor: art ? t.tints[art.tint].bg : undefined, alignItems: 'center', justifyContent: 'center' }}>
          {art ? <View style={{ marginTop: 12 }}><MovoObject name={art.object} size={44} ink={t.tints[art.tint].ink} cut={t.tints[art.tint].bg} /></View> : <ArtImage image={ev.image} aspect={1} radius={16} />}
          <View style={{ position: 'absolute', top: 5, start: 5, minWidth: 30, paddingHorizontal: 4, paddingVertical: 2, borderRadius: 8, backgroundColor: '#FFFFFF', alignItems: 'center', boxShadow: '0 2px 6px rgba(1,52,71,0.18)' }}>
            <Text tabular style={{ color: '#0E7A58', fontSize: 9, lineHeight: 11, fontWeight: '700' }} maxFontSizeMultiplier={1.2}>{dayFmt.format(d).toUpperCase()}</Text>
            <Text tabular style={{ color: '#15191B', fontSize: 15, lineHeight: 17, fontWeight: '800' }} maxFontSizeMultiplier={1.2}>{d.getDate()}</Text>
          </View>
        </View>
        <View style={{ flex: 1, gap: 3, alignSelf: 'stretch', justifyContent: 'center', borderTopWidth: first ? 0 : 1, borderColor: t.colors.separator, marginTop: -10, paddingTop: 10, marginBottom: -10, paddingBottom: 10 }}>
          <Text variant="headline" weight="600" numberOfLines={1}>{loc(ev.title)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Text variant="footnote" color="textSecondary" numberOfLines={1} tabular style={{ flexShrink: 1 }}>{fmtTime(ev.startsAt, lang)} · {loc(ev.area)} · <Text variant="footnote" weight="700">{price}</Text></Text>
            {venue ? <RatingBadge level={venue.rating.level} size="mini" /> : null}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs, marginTop: 2 }}>
            <ProgressBar value={ev.taken / ev.spots} height={6} color={art ? t.tints[art.tint].ink : undefined} label={tr('event.spotsTaken', 'Spots taken')} style={{ flex: 1 }} />
            <Text variant="caption1" weight="700" tabular style={{ color: full || warm ? t.colors.ratingPartly : t.colors.textSecondary }}>{full ? tr('event.fullShort', 'Full') : tr('comm.left', '{{n}} left', { n: left })}</Text>
          </View>
        </View>
        </Pressable>
        <View style={{ alignSelf: 'stretch', justifyContent: 'center', paddingStart: space.sm, borderTopWidth: first ? 0 : 1, borderColor: t.colors.separator }}>
        {joined ? (
          <View style={{ height: 34, borderRadius: 17, paddingHorizontal: 12, backgroundColor: t.colors.bgSelected, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="checkmark" size={11} weight="bold" color="accentText" />
            <Text variant="subheadline" weight="700" color="accentText">{tr('comm.goingShort', 'Going')}</Text>
          </View>
        ) : onJoin ? (
          <Pressable onPress={onJoin} feedback="scale" hitSlop={6} accessibilityRole="button" accessibilityLabel={full ? tr('event.joinWait', 'Join the waiting list') : tr('comm.joinTo', 'Join {{e}}', { e: loc(ev.title) })}
            style={{ height: 34, borderRadius: 17, paddingHorizontal: 14, backgroundColor: full ? t.colors.fill : t.colors.bgSelected, justifyContent: 'center' }}>
            <Text variant="subheadline" weight="700" style={{ color: full ? t.colors.textPrimary : t.colors.accentText }}>{full ? tr('comm.waitlist', 'Waitlist') : tr('event.join', 'Join')}</Text>
          </Pressable>
        ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

const fmtLongDayShort = (iso: string, lang: 'en' | 'ar') => new Intl.DateTimeFormat(lang === 'ar' ? 'ar-LB-u-nu-latn' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(iso));

/** Your next activity once you've joined one: a small navy ticket stub with the spot code. */
export function GoingStub({ ev, code, onPress }: { ev: MovoEvent; code: string; onPress: () => void }) {
  const t = useTheme();
  const tr = useT();
  const lang = useLang();
  const loc = useLocalized();
  const d = new Date(ev.startsAt);
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={tr('comm.goingA11y', 'You’re going to {{e}}. Show ticket', { e: loc(ev.title) })}
      style={{ marginHorizontal: layout.margin, marginBottom: space.md, borderRadius: 18, ...continuous, backgroundColor: t.colors.blockNavy, flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: 10 }}>
      <View style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: t.colors.accent, alignItems: 'center', justifyContent: 'center' }}>
        <Text variant="caption2" weight="700" style={{ color: '#013447' }}>{new Intl.DateTimeFormat(lang === 'ar' ? 'ar-LB-u-nu-latn' : 'en-GB', { weekday: 'short' }).format(d).toUpperCase()}</Text>
        <Text tabular style={{ color: '#013447', fontSize: 19, lineHeight: 21, fontWeight: '800' }}>{d.getDate()}</Text>
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <Text variant="subheadline" weight="600" numberOfLines={1} style={{ color: '#FFFFFF' }}>{loc(ev.title)}</Text>
        <Text variant="caption1" numberOfLines={1} style={{ color: 'rgba(255,255,255,0.75)' }}>{tr('comm.going', 'You’re going')} · {fmtTime(ev.startsAt, lang)} · {loc(ev.area)}</Text>
      </View>
      <View style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.45)', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4 }}>
        <Text variant="caption1" weight="700" tabular style={{ color: '#FFFFFF' }}>{ltr(code)}</Text>
      </View>
    </Pressable>
  );
}

export type BannerSlide = { key: string; image: ImageRef; chips: string[]; label: string; onPress: () => void };

/** The key-visual banners at the top of Community: swipe, peek of the next one, chips on the art. */
export function BannerCarousel({ slides }: { slides: BannerSlide[] }) {
  const t = useTheme();
  const { width: win } = useWindowDimensions();
  const w = Math.min(win, 600) - layout.margin * 2 - (slides.length > 1 ? 24 : 0);
  const h = Math.round(w * 0.52);
  const step = w + space.xs;
  const ref = useRef<ScrollViewInstance>(null);
  const [i, setI] = useState(0);
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (touched || t.reduceMotion || slides.length < 2) return;
    const id = setTimeout(() => {
      const n = (i + 1) % slides.length;
      ref.current?.scrollTo({ x: n * step, animated: true });
      setI(n);
    }, 5000);
    return () => clearTimeout(id);
  }, [i, touched, t.reduceMotion, slides.length, step]);
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => setI(Math.round(e.nativeEvent.contentOffset.x / step));
  return (
    <View style={{ marginBottom: space.md }}>
      <ScrollView ref={ref} horizontal showsHorizontalScrollIndicator={false} snapToInterval={step} decelerationRate="fast" disableIntervalMomentum
        onScrollBeginDrag={() => setTouched(true)} onMomentumScrollEnd={onEnd} contentContainerStyle={{ paddingHorizontal: layout.margin, gap: space.xs }}>
        {slides.map((s) => (
          <Pressable key={s.key} onPress={s.onPress} accessibilityRole="button" accessibilityLabel={s.label} feedback="scale" style={{ width: w, height: h, borderRadius: 20, ...continuous, overflow: 'hidden' }}>
            <ArtImage image={s.image} aspect={w / h} radius={20} />
            <View style={{ position: 'absolute', bottom: 10, start: 10, flexDirection: 'row', gap: 6 }}>
              {s.chips.map((c, n) => (
                <View key={c} style={{ height: 26, borderRadius: 13, paddingHorizontal: 10, justifyContent: 'center', backgroundColor: n === 1 ? t.colors.accent : 'rgba(1,52,71,0.88)' }}>
                  <Text variant="caption1" weight="700" tabular style={{ color: n === 1 ? '#013447' : '#FFFFFF' }}>{c}</Text>
                </View>
              ))}
            </View>
          </Pressable>
        ))}
      </ScrollView>
      {slides.length > 1 ? (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: space.xs }}>
          {slides.map((s, n) => <View key={s.key} style={{ width: n === i ? 16 : 6, height: 6, borderRadius: 3, backgroundColor: n === i ? t.colors.textPrimary : t.colors.separator }} />)}
        </View>
      ) : null}
    </View>
  );
}

/** One filter pill in the pinned row. */
/** Plain text pill (no icon or dot). `icon` is accepted for older callers and ignored. */
export function FilterPill({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void; icon?: IconName }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} feedback="scale" accessibilityRole="tab" accessibilityState={{ selected }} accessibilityLabel={label}
      style={{ height: 36, borderRadius: 18, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, backgroundColor: selected ? t.colors.buttonPrimaryBg : t.colors.fill }}>
      <Text variant="subheadline" weight="600" style={{ color: selected ? t.colors.buttonPrimaryFg : t.colors.textPrimary }}>{label}</Text>
    </Pressable>
  );
}

/** Small uppercase group label (This week, Open now…). */
export function GroupLabel({ label, style }: { label: string; style?: StyleProp<ViewStyle> }) {
  return <Text variant="footnote" weight="700" color="textSecondary" accessibilityRole="header" style={[{ paddingHorizontal: layout.margin, paddingTop: space.md, paddingBottom: 2, letterSpacing: 0.8, textTransform: 'uppercase' }, style]}>{label}</Text>;
}

/** Total raised across campaigns, with where the money goes. */
export function RaisedStrip({ cents, donors }: { cents: number; donors: number }) {
  const t = useTheme();
  const tr = useT();
  return (
    <View style={{ marginHorizontal: layout.margin, borderRadius: 18, ...continuous, backgroundColor: t.colors.blockMint, flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: 14, paddingVertical: 12 }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text tabular style={{ color: t.colors.blockMintInk, fontSize: 26, lineHeight: 30, fontWeight: '800' }}>{ltr(formatMoney(cents))}</Text>
        <Text variant="caption1" style={{ color: t.colors.blockMintInk, opacity: 0.85 }}>{tr('comm.raisedLine', 'raised by {{n}} donors · every dollar goes to Arc en Ciel, Movo keeps nothing', { n: donors.toLocaleString('en-US') })}</Text>
      </View>
      <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: '#013447', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="heart.fill" size={22} color={{ raw: t.colors.accent }} />
      </View>
    </View>
  );
}

/** One campaign as a row: square photo, title, bar, amount; Give opens the donate sheet. */
export function CampaignRow({ c, raisedCents, onPress, onGive, first, index = 0 }: { c: Campaign; raisedCents: number; onPress: () => void; onGive?: () => void; first?: boolean; index?: number }) {
  const t = useTheme();
  const tr = useT();
  const loc = useLocalized();
  const reached = raisedCents >= c.goalCents;
  const pct = Math.min(100, Math.round((raisedCents / c.goalCents) * 100));
  return (
    <Animated.View entering={t.reduceMotion ? undefined : FadeInDown.delay(index * 50).springify().damping(20).stiffness(190)}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: layout.margin }}>
      <Pressable onPress={onPress} feedback="highlight" accessibilityRole="button" accessibilityLabel={`${loc(c.title)}, ${tr('comm.ofGoalPct', '{{raised}} of {{goal}} · {{pct}}%', { raised: ltr(formatMoney(raisedCents)), goal: ltr(formatMoney(c.goalCents)), pct })}`}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: 10 }}>
        <View style={{ width: 72, height: 72, borderRadius: 14, overflow: 'hidden' }}>
          <ArtImage image={c.image} aspect={1} radius={14} />
        </View>
        <View style={{ flex: 1, gap: 3, alignSelf: 'stretch', justifyContent: 'center', borderTopWidth: first ? 0 : 1, borderColor: t.colors.separator, marginTop: -10, paddingTop: 10, marginBottom: -10, paddingBottom: 10 }}>
          <Text variant="headline" weight="600" numberOfLines={1}>{loc(c.title)}</Text>
          {reached ? (
            <>
              <Text variant="footnote" color="textSecondary" tabular><Text variant="subheadline" weight="700" tabular>{ltr(formatMoney(raisedCents))}</Text> {tr('comm.raisedDonors', 'raised · {{n}} donors', { n: c.donors })}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Icon name="checkmark" size={11} weight="bold" color="accentText" />
                <Text variant="caption1" weight="700" color="accentText">{c.finalReport ? tr('comm.reachedReport', 'Goal reached · Read report') : tr('cmp.reached', 'Goal reached')}</Text>
              </View>
            </>
          ) : (
            <>
              <Text variant="footnote" color="textSecondary" tabular><Text variant="subheadline" weight="700" tabular>{ltr(formatMoney(raisedCents))}</Text> {tr('comm.ofPct', 'of {{goal}} · {{pct}}%', { goal: ltr(formatMoney(c.goalCents)), pct })}</Text>
              <ProgressBar value={raisedCents / c.goalCents} height={6} label={tr('cmp.progress', 'Raised')} style={{ marginTop: 3 }} />
            </>
          )}
        </View>
        </Pressable>
        <View style={{ alignSelf: 'stretch', justifyContent: 'center', paddingStart: space.sm, borderTopWidth: first ? 0 : 1, borderColor: t.colors.separator }}>
        {onGive && !reached ? (
          <Pressable onPress={onGive} feedback="scale" hitSlop={6} accessibilityRole="button" accessibilityLabel={tr('comm.giveTo', 'Give to {{c}}', { c: loc(c.title) })}
            style={{ height: 34, borderRadius: 17, paddingHorizontal: 14, backgroundColor: t.colors.bgSelected, justifyContent: 'center' }}>
            <Text variant="subheadline" weight="700" color="accentText">{tr('comm.give', 'Give')}</Text>
          </Pressable>
        ) : reached ? <Icon name="chevron.right" size={14} weight="semibold" color="textTertiary" mirrorInRTL /> : null}
        </View>
      </View>
    </Animated.View>
  );
}

/** A row of small fact tiles under a title (price, spots, area, access). */
export function FactTiles({ items }: { items: { value: string; label: string; bar?: number; accent?: boolean }[] }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: space.xs, marginTop: space.md }}>
      {items.map((f) => (
        <View key={f.label} style={{ flex: 1, minWidth: 0, borderRadius: 14, backgroundColor: t.colors.fill, paddingHorizontal: 10, paddingVertical: 9, gap: 1 }}>
          <Text variant="subheadline" weight="700" tabular numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={f.accent ? { color: t.colors.accentText } : undefined}>{f.value}</Text>
          <Text variant="caption2" color="textSecondary" numberOfLines={1}>{f.label}</Text>
          {f.bar !== undefined ? <ProgressBar value={f.bar} height={4} style={{ marginTop: 4 }} /> : null}
        </View>
      ))}
    </View>
  );
}

/** Percentage ring beside a big amount. */
export function PercentRing({ pct, size = 56 }: { pct: number; size?: number }) {
  const t = useTheme();
  const n = Math.max(0, Math.min(100, pct));
  // Two half-discs rotated: no SVG needed and it mirrors fine in RTL.
  const half = size / 2;
  const deg = (n / 100) * 360;
  return (
    <View accessible accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: n }} style={{ width: size, height: size, borderRadius: half, backgroundColor: t.colors.fillStrong, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', top: 0, left: half, width: half, height: size, overflow: 'hidden' }}>
        <View style={{ width: size, height: size, marginLeft: -half, borderRadius: half, backgroundColor: deg > 0 ? t.colors.accent : 'transparent', transform: [{ rotate: `${Math.min(deg, 180) - 180}deg` }] }} />
      </View>
      {deg > 180 ? (
        <View style={{ position: 'absolute', top: 0, left: 0, width: half, height: size, overflow: 'hidden' }}>
          <View style={{ width: size, height: size, borderRadius: half, backgroundColor: t.colors.accent, transform: [{ rotate: `${deg - 360}deg` }] }} />
        </View>
      ) : null}
      <View style={{ width: size - 12, height: size - 12, borderRadius: (size - 12) / 2, backgroundColor: t.colors.bgPrimary, alignItems: 'center', justifyContent: 'center' }}>
        <Text variant="footnote" weight="800" tabular>{n}%</Text>
      </View>
    </View>
  );
}

/** Payment as one row ("Whish · Change"); tapping it opens the full list in place. */
export function PayChoice({ value, onChange }: { value: PayMethod; onChange: (m: PayMethod) => void }) {
  const t = useTheme();
  const tr = useT();
  const [open, setOpen] = useState(false);
  if (open) return <PaymentMethodPicker value={value} onChange={(m) => { onChange(m); setOpen(false); }} allowCash={false} />;
  const sub = { whish: tr('pay.whishSub', 'Finish in the Whish app'), omt: tr('pay.omtSub', 'Pay at any OMT branch with a code'), card: tr('pay.cardSub', 'Visa or Mastercard'), cash: '' }[value];
  return (
    <Pressable onPress={() => setOpen(true)} feedback="highlight" accessibilityRole="button" accessibilityLabel={tr('pay.changeA11y', 'Pay with {{m}}. Change', { m: paymentLabel(tr, value) })}
      style={{ marginHorizontal: layout.margin, borderRadius: 14, backgroundColor: t.colors.fill, flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: 10 }}>
      <PayLogo method={value} size={34} />
      <View style={{ flex: 1 }}>
        <Text variant="headline" weight="600">{paymentLabel(tr, value)}</Text>
        <Text variant="caption1" color="textSecondary">{sub}</Text>
      </View>
      <Text variant="subheadline" weight="600" color="accentText">{tr('common.change', 'Change')}</Text>
    </Pressable>
  );
}
