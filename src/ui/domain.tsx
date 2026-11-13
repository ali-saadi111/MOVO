import { Image } from 'expo-image';
import { useEffect, useState, type ReactNode } from 'react';
import { specialistPhoto } from '@/art/people';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { sync, type MovoEvent, type Campaign, type Place, type Product, type RatingLevel, type Specialist } from '@/data';
import { checklistIcon, checklistLabel, mobilityLabel, ratingIcon, ratingLabel, placeTypeLabel, type MobilityKey } from '@/features/labels';
import { useLang, useLocalized, useT } from '@/i18n';
import { fmtDay, fmtDayTime, fmtTime, useNow } from '@/lib/dates';
import { HERE, distanceKm, formatDistance } from '@/lib/geo';
import { formatMoney } from '@/lib/money';
import { ltr, edges } from '@/lib/rtl';
import { announce } from '@/lib/a11y';
import { haptic } from '@/lib/haptics';
import { useActingPerson } from '@/stores/caregiver';
import { useCart } from '@/stores/cart';
import { useSession } from '@/stores/session';
import { primaryMobility, useSettings } from '@/stores/settings';
import { continuous, isLargeText, layout, radii, space, springs, useTheme } from '@/theme';
import { pinColors } from '@/theme/colors';
import { ArtImage } from './Art';
import { Divider, Tag } from './basics';
import { ProgressBar } from './feedback';
import { GlassSurface } from './GlassSurface';
import { Icon } from './Icon';
import { go, useFooterInset } from './nav';
import { Pressable } from './Pressable';
import { ArrowDot } from './canvas';
import { HeroArt } from '@/art/HeroArt';
import { Text } from './Text';

/* ---------------------------------------------------------------- ratings */

/** Colour + icon + word, in that order. Never colour alone. */
export function RatingBadge({ level, size = 'small' }: { level: RatingLevel; size?: 'small' | 'large' | 'mini' }) {
  const t = useTheme();
  const tr = useT();
  const color = { accessible: t.colors.ratingAccessible, partly: t.colors.ratingPartly, not: t.colors.ratingNot }[level];
  const label = ratingLabel(tr, level);
  if (size === 'mini') {
    return (
      <View accessible accessibilityLabel={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Glyph level={level} size={16} />
      </View>
    );
  }
  const large = size === 'large';
  return (
    <View accessible accessibilityRole="text" accessibilityLabel={label} style={{ flexDirection: 'row', alignItems: 'center', gap: large ? 8 : 6, alignSelf: 'flex-start' }}>
      <Glyph level={level} size={large ? 28 : 18} />
      <Text variant={large ? 'title3' : 'subheadline'} weight="600" style={{ color: level === 'accessible' ? t.colors.textPrimary : color }}>{label}</Text>
    </View>
  );
}

function Glyph({ level, size }: { level: RatingLevel; size: number }) {
  const t = useTheme();
  const bg = { accessible: t.colors.ratingAccessible, partly: t.colors.ratingPartly, not: t.colors.ratingNot }[level];
  const fg = level === 'accessible' ? t.colors.ratingAccessibleGlyph : t.colors.ratingGlyphOnColor;
  const icon = { accessible: 'checkmark', partly: 'minus', not: 'xmark' } as const;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon[level]} size={size * 0.56} weight="heavy" color={{ raw: fg }} />
    </View>
  );
}

export function FitsLine({ place }: { place: Place }) {
  const tr = useT();
  const mine = useMobilityFor();
  const keys: MobilityKey[] = mine ? [mine] : ['manual', 'power'];
  return (
    <View style={{ gap: 4 }}>
      {keys.map((k) => {
        const fits = place.rating.fits[k];
        return (
          <View key={k} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Icon name={fits ? 'checkmark' : 'exclamationmark.triangle'} size={15} weight="semibold" color={fits ? 'accentText' : 'ratingPartly'} />
            <Text variant="subheadline" style={{ flex: 1 }}>
              {fits ? tr('place.fits', 'Fits {{m}}', { m: mobilityLabel(tr, k).toLowerCase() }) : tr('place.mayNotFit', 'May not fit {{m}}', { m: mobilityLabel(tr, k).toLowerCase() })}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function useMobilityFor(): MobilityKey | null {
  const acting = useActingPerson();
  const mine = useSettings((s) => s.mobility);
  return primaryMobility(acting ? acting.mobility : mine) as MobilityKey | null;
}

export function ChecklistRow({ item }: { item: Place['rating']['checklist'][number] }) {
  const tr = useT();
  const loc = useLocalized();
  const big = isLargeText();
  return (
    <View accessible accessibilityLabel={`${checklistLabel(tr, item.key)}: ${loc(item.value)}, ${ratingLabel(tr, item.level)}`} style={{ flexDirection: big ? 'column' : 'row', alignItems: big ? 'flex-start' : 'center', gap: space.sm, minHeight: layout.rowWithSubtitle, paddingVertical: space.sm }}>
      <Icon name={checklistIcon[item.key]} size={20} color="textSecondary" rendering="hierarchical" />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="body">{checklistLabel(tr, item.key)}</Text>
        <Text variant="subheadline" color="textSecondary">{loc(item.value)}</Text>
      </View>
      <RatingBadge level={item.level} size="mini" />
    </View>
  );
}

/* ---------------------------------------------------------------- map pins */

export function MapPin({ level, selected }: { level: RatingLevel; selected?: boolean }) {
  const t = useTheme();
  const s = useSharedValue(selected ? 44 / 30 : 1);
  useEffect(() => {
    s.value = t.reduceMotion ? (selected ? 44 / 30 : 1) : withSpring(selected ? 44 / 30 : 1, springs.bouncy);
  }, [selected, s, t.reduceMotion]);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  const bg = pinColors[level];
  const fg = level === 'accessible' ? pinColors.accessibleGlyph : pinColors.onColorGlyph;
  const icon = { accessible: 'checkmark', partly: 'minus', not: 'xmark' } as const;
  return (
    <View style={{ width: 48, height: 64, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 10 }} pointerEvents="none">
      <Animated.View style={[{ alignItems: 'center' }, st]}>
        <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: bg, borderWidth: 2, borderColor: pinColors.ring, alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(1,52,71,0.25)' }}>
          <Icon name={icon[level]} size={15} weight="heavy" color={{ raw: fg }} />
        </View>
        {selected ? <View style={{ width: 0, height: 0, borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 6, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: pinColors.ring, marginTop: -1 }} /> : null}
      </Animated.View>
    </View>
  );
}

export function ClusterPin({ count }: { count: number }) {
  const t = useTheme();
  return (
    <View pointerEvents="none" style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: t.scheme === 'dark' ? t.colors.bgElevated2 : pinColors.cluster, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
        <Text variant="footnote" weight="700" tabular style={{ color: '#fff' }} maxFontSizeMultiplier={1.2}>{count}</Text>
      </View>
    </View>
  );
}

/* ---------------------------------------------------------------- places */

export function PlaceRow({ place, onPress, index = 0 }: { place: Place; onPress: () => void; index?: number }) {
  const tr = useT();
  const loc = useLocalized();
  const t = useTheme();
  const d = formatDistance(distanceKm(HERE, place));
  return (
    <Animated.View entering={t.reduceMotion ? undefined : FadeInDown.delay(Math.min(index, 8) * 40).springify().damping(26).stiffness(170)}>
      <Pressable feedback="highlight" onPress={onPress} accessibilityRole="button" accessibilityLabel={`${loc(place.name)}, ${ratingLabel(tr, place.rating.level)}, ${d}`} style={{ flexDirection: 'row', gap: space.sm, paddingVertical: space.sm, paddingHorizontal: layout.margin, alignItems: 'center' }}>
        <View style={{ width: 64, borderRadius: radii.thumb, overflow: 'hidden' }}>
          <ArtImage image={place.hero} aspect={1} radius={radii.thumb} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="headline" numberOfLines={2}>{loc(place.name)}</Text>
          <Text variant="footnote" color="textSecondary" numberOfLines={1}>{placeTypeLabel(tr, place.category)} · {ltr(d)}</Text>
          <RatingBadge level={place.rating.level} />
        </View>
        <Icon name="chevron.right" size={14} weight="semibold" color="textTertiary" mirrorInRTL />
      </Pressable>
    </Animated.View>
  );
}

/* ---------------------------------------------------------------- products */

export function PriceText({ cents, compareAt, variant = 'headline' }: { cents: number; compareAt?: number; variant?: 'headline' | 'title3' }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
      <Text variant={variant} tabular weight={variant === 'title3' ? '400' : '600'}>{ltr(formatMoney(cents))}</Text>
      {compareAt ? <Text variant="footnote" color="textSecondary" tabular style={{ textDecorationLine: 'line-through' }}>{ltr(formatMoney(compareAt))}</Text> : null}
    </View>
  );
}

export function StockLabel({ stock, always, small }: { stock: Product['stock']; always?: boolean; small?: boolean }) {
  const tr = useT();
  const v = small ? 'caption1' : 'subheadline';
  if (stock.status === 'in' && !always) return null;
  if (stock.status === 'in') return <Text variant={v} weight="600" color="accentText">{tr('stock.in', 'In stock')}</Text>;
  if (stock.status === 'low') return <Text variant={v} weight="600" color="ratingPartly">{tr('stock.low', '{{n}} left', { n: stock.quantity })}</Text>;
  return <Text variant={v} weight="600" color="textSecondary">{tr('stock.out', 'Out of stock')}</Text>;
}

export function specValue(s: Product['keySpecs'][number], tr: (k: string, e: string) => string) {
  if (typeof s.value === 'boolean') return s.value ? tr('common.yes', 'Yes') : tr('common.no', 'No');
  return `${s.value}${s.unit ? ' ' + s.unit : ''}`;
}

export function ProductCard({ product, layout: lay = 'grid', onPress, index = 0 }: { product: Product; layout?: 'grid' | 'rail'; onPress: () => void; index?: number }) {
  const loc = useLocalized();
  const t = useTheme();
  const rail = lay === 'rail';
  return (
    <Animated.View entering={t.reduceMotion ? undefined : FadeInDown.delay(Math.min(index, 6) * 40).springify().damping(26).stiffness(170)} style={rail ? { width: 140 } : { flex: 1 }}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${loc(product.name)}, ${formatMoney(product.priceCents)}`} style={{ gap: 6 }}>
        <ArtImage image={product.images[0]} aspect={rail ? 140 / 124 : 1} tile radius={radii.tile} />
        <View style={{ gap: 1, paddingHorizontal: 2 }}>
          <Text variant={rail ? 'footnote' : 'subheadline'} numberOfLines={rail ? 1 : 2}>{loc(product.name)}</Text>
          <PriceText cents={product.priceCents} compareAt={product.compareAtCents} />
          <StockLabel stock={product.stock} small />
        </View>
      </Pressable>
      {product.stock.status !== 'out' ? (
        <View pointerEvents="box-none" style={{ position: 'absolute', top: 0, start: 0, end: 0, aspectRatio: rail ? 140 / 124 : 1 }}>
          <QuickAdd product={product} />
        </View>
      ) : null}
    </Animated.View>
  );
}

/** Round + on a product photo: adds one to the cart without opening the product. */
export function QuickAdd({ product }: { product: Product }) {
  const t = useTheme();
  const tr = useT();
  const loc = useLocalized();
  const add = useCart((s) => s.add);
  const user = useSession((s) => s.user);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => setDone(false), 1400);
    return () => clearTimeout(id);
  }, [done]);
  const onPress = () => {
    if (!user) { go.push(`/auth/gate?action=cart&resume=${encodeURIComponent(`/product/${product.id}`)}`); return; }
    haptic.light();
    add(product.id);
    announce(tr('product.addedA11y', 'Added to cart'));
    setDone(true);
  };
  return (
    <Pressable onPress={onPress} hitSlop={6} feedback="scale" accessibilityRole="button" accessibilityLabel={tr('product.quickAdd', 'Add {{name}} to cart', { name: loc(product.name) })}
      style={{ position: 'absolute', bottom: 8, end: 8, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? t.colors.accent : '#013447', boxShadow: '0 3px 8px rgba(1,52,71,0.22)' }}>
      <Icon name={done ? 'checkmark' : 'plus'} size={16} weight="bold" color={{ raw: done ? '#013447' : '#FFFFFF' }} />
    </Pressable>
  );
}

/** Hairline 2×2 grid; stacks at large text. */
export function KeySpecsTable({ specs }: { specs: Product['keySpecs'] }) {
  const t = useTheme();
  const tr = useT();
  const loc = useLocalized();
  const big = isLargeText(t.textScale);
  const items = specs.slice(0, 4);
  const rows = big ? items.map((s) => [s]) : [items.slice(0, 2), items.slice(2, 4)].filter((r) => r.length);
  return (
    <View>
      {rows.map((row, r) => (
        <View key={r}>
          {r > 0 ? <Divider /> : null}
          <View style={{ flexDirection: 'row' }}>
            {row.map((s, i) => (
              <View key={s.key} style={{ flex: 1, paddingVertical: space.md, paddingStart: i === 1 ? space.md : 0, borderStartWidth: i === 1 ? StyleSheet.hairlineWidth : 0, borderColor: t.colors.separator, gap: 2 }}>
                <Text variant="title3" tabular>{ltr(specValue(s, tr))}</Text>
                <Text variant="footnote" color="textSecondary">{loc(s.label)}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

/* ---------------------------------------------------------------- care */

export function Avatar({ name, hue = 0, size = 56, photo }: { name: string; hue?: number; size?: number; photo?: number }) {
  const t = useTheme();
  const initials = name.replace(/^Dr\.\s*/, '').split(/\s+/).map((w) => w[0]).slice(0, 2).join('');
  const tones = [t.colors.bgSelected, t.colors.fill, t.scheme === 'dark' ? '#173640' : '#DCEAF0'];
  if (photo) return <Image source={photo} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: tones[hue % 3] }} contentFit="cover" contentPosition="top" accessibilityElementsHidden />;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: tones[hue % 3], alignItems: 'center', justifyContent: 'center' }} accessibilityElementsHidden>
      <Text variant={size > 60 ? 'title2' : 'headline'} weight="600">{initials}</Text>
    </View>
  );
}

export function SpecialistRow({ s, onPress, index = 0 }: { s: Specialist; onPress: () => void; index?: number }) {
  const now = useNow();
  const tr = useT();
  const lang = useLang();
  const loc = useLocalized();
  const t = useTheme();
  const next = new Date(now + s.nextFreeInHours * 3600e3);
  next.setMinutes(0);
  // Specialists work 9:00–18:00; roll anything outside that to the next morning.
  if (next.getHours() >= 18) { next.setDate(next.getDate() + 1); next.setHours(9); } else if (next.getHours() < 9) next.setHours(9);
  const name = lang === 'ar' ? s.nameAr : s.name;
  return (
    <Animated.View entering={t.reduceMotion ? undefined : FadeInDown.delay(Math.min(index, 8) * 40).springify().damping(26).stiffness(170)}>
      <Pressable feedback="highlight" onPress={onPress} accessibilityRole="button" style={{ flexDirection: 'row', gap: space.sm, paddingHorizontal: layout.margin, paddingVertical: space.sm, alignItems: 'center' }}>
        <Avatar name={s.name} hue={s.avatarHue} photo={specialistPhoto(s.id)} />
        <View style={{ flex: 1, gap: 3 }}>
          {s.sponsored ? <Tag label={tr('care.sponsored', 'Sponsored')} /> : null}
          <Text variant="headline" numberOfLines={1}>{name}</Text>
          <Text variant="subheadline" color="textSecondary" numberOfLines={1}>{loc(s.profession)} · {tr('care.years', '{{n}} yrs', { n: s.years })}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="star.fill" size={13} color="accent" />
            <Text variant="footnote" tabular>{s.stars.toFixed(1)}</Text>
            <Text variant="footnote" color="textSecondary" tabular>({s.reviewCount})</Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Text variant="headline" tabular>{ltr(formatMoney(s.priceCents))}</Text>
          <Text variant="footnote" color="accentText" weight="600" tabular>{fmtDayTime(next.toISOString(), lang)}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/** The only Navy surface on the Care screen. */
export function BookingHeroCard({ startsAt, specialistId, where, onPress, actionLabel }: { startsAt: string; specialistId: string; where: 'home' | 'clinic'; onPress: () => void; onAction?: () => void; actionLabel: string }) {
  const t = useTheme();
  const tr = useT();
  const lang = useLang();
  const now = useNow();
  const sp = sync.specialist(specialistId);
  const d = new Date(startsAt);
  const loc = lang === 'ar' ? 'ar-LB-u-nu-latn' : 'en-GB';
  const days = Math.max(0, Math.round((new Date(startsAt).setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0)) / 864e5));
  const when = days === 0 ? tr('care.today', 'Today') : days === 1 ? tr('care.tomorrow', 'Tomorrow') : tr('care.inDays', 'In {{n}} days', { n: days });
  const name = (lang === 'ar' ? sp?.nameAr : sp?.name) ?? '';
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${tr('care.next', 'Your next session')}, ${fmtDay(startsAt, lang)} ${fmtTime(startsAt, lang)}, ${name}. ${actionLabel}`}
      style={{ marginHorizontal: layout.margin, borderRadius: radii.hero, ...continuous, backgroundColor: t.colors.blockNavy, padding: space.lg, gap: space.md, overflow: 'hidden' }}>
      <View pointerEvents="none" style={{ position: 'absolute', top: 6, ...edges(t.rtl, { end: -10 }) }}><HeroArt name="calendar" size={122} /></View>
      <Text variant="footnote" weight="700" style={{ color: t.colors.accent, letterSpacing: 0.3 }}>{tr('care.next', 'Your next session').toUpperCase()}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.sm }}>
        <Text tabular style={{ color: '#FFFFFF', fontSize: 64, lineHeight: 66, fontWeight: '800', letterSpacing: -2 }} maxFontSizeMultiplier={1.4}>{d.getDate()}</Text>
        <View style={{ paddingBottom: 8 }}>
          <Text variant="headline" style={{ color: '#FFFFFF' }}>{new Intl.DateTimeFormat(loc, { weekday: 'long' }).format(d)}</Text>
          <Text variant="subheadline" style={{ color: 'rgba(255,255,255,0.72)' }}>{new Intl.DateTimeFormat(loc, { month: 'long' }).format(d)} · {fmtTime(startsAt, lang)}</Text>
        </View>
      </View>
      <Text variant="subheadline" style={{ color: 'rgba(255,255,255,0.85)' }}>{name} · {where === 'home' ? tr('care.atHome', 'At your home') : tr('care.atClinic', 'At the clinic')}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, height: 34, borderRadius: 17, backgroundColor: 'rgba(34,211,156,0.18)' }}>
          <Icon name="clock" size={14} weight="semibold" color={{ raw: t.colors.accent }} />
          <Text variant="subheadline" weight="600" style={{ color: t.colors.accent }}>{when}</Text>
        </View>
        <ArrowDot tone="mint" />
      </View>
    </Pressable>
  );
}

export function PlanProgress({ done, total }: { done: number; total: number }) {
  const t = useTheme();
  const tr = useT();
  return (
    <View style={{ gap: space.xs }}>
      <View style={{ flexDirection: 'row', gap: 6 }} accessibilityLabel={tr('plan.a11y', '{{done}} sessions done, {{left}} to go', { done, left: total - done })}>
        {Array.from({ length: total }, (_, i) => (
          <Animated.View key={i} entering={t.reduceMotion ? undefined : FadeInDown.delay(i * 40).springify()} style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: i < done ? t.colors.accent : t.colors.fill }} />
        ))}
      </View>
      <Text variant="subheadline" color="textSecondary" tabular>{tr('plan.label', '{{done}} done · {{left}} to go', { done, left: total - done })}</Text>
    </View>
  );
}

/* ---------------------------------------------------------------- community */

/** Big day number on a white tile, used over event art. */
export function DateBadge({ iso }: { iso: string }) {
  const lang = useLang();
  const d = new Date(iso);
  const loc = lang === 'ar' ? 'ar-LB-u-nu-latn' : 'en-GB';
  return (
    <View style={{ width: 58, paddingVertical: 6, borderRadius: 18, ...continuous, backgroundColor: '#FFFFFF', alignItems: 'center', boxShadow: '0 6px 16px rgba(1,52,71,0.18)' }}>
      <Text tabular style={{ color: '#013447', fontSize: 26, lineHeight: 28, fontWeight: '800' }} maxFontSizeMultiplier={1.3}>{d.getDate()}</Text>
      <Text variant="caption2" weight="700" style={{ color: '#0E7A58' }} maxFontSizeMultiplier={1.3}>{new Intl.DateTimeFormat(loc, { month: 'short' }).format(d).toUpperCase()}</Text>
    </View>
  );
}

export function EventCard({ ev, onPress, index = 0 }: { ev: MovoEvent; onPress: () => void; index?: number }) {
  const tr = useT();
  const lang = useLang();
  const loc = useLocalized();
  const t = useTheme();
  const venue = sync.place(ev.venuePlaceId);
  const left = ev.spots - ev.taken;
  return (
    <Animated.View entering={t.reduceMotion ? undefined : FadeInDown.delay(Math.min(index, 6) * 60).springify().damping(18).stiffness(170)}>
      <Pressable onPress={onPress} accessibilityRole="button" style={{ marginHorizontal: layout.margin, borderRadius: radii.hero, ...continuous, backgroundColor: t.colors.bgElevated, padding: 10, gap: space.sm, boxShadow: t.scheme === 'dark' ? undefined : '0 8px 24px rgba(1,52,71,0.07)' }}>
        <View>
          <ArtImage image={ev.image} aspect={16 / 9} radius={radii.card} />
          <View style={{ position: 'absolute', top: 12, ...edges(t.rtl, { start: 12 }) }}><DateBadge iso={ev.startsAt} /></View>
          {left > 0 && left <= 12 ? (
            <View style={{ position: 'absolute', top: 12, ...edges(t.rtl, { end: 12 }), paddingHorizontal: 10, height: 28, borderRadius: 14, backgroundColor: t.colors.blockNavy, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Icon name="flame" size={12} color={{ raw: t.colors.accent }} />
              <Text variant="caption1" weight="700" style={{ color: '#FFFFFF' }}>{tr('event.left', '{{n}} spots left', { n: left })}</Text>
            </View>
          ) : null}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: 6, paddingBottom: 6 }}>
          <View style={{ flex: 1, gap: 3 }}>
            <Text variant="footnote" weight="600" color="accentText" tabular>{fmtTime(ev.startsAt, lang)} · {loc(ev.area)}</Text>
            <Text variant="headline">{loc(ev.title)}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap', marginTop: 2 }}>
              {venue ? <RatingBadge level={venue.rating.level} /> : null}
              <Text variant="subheadline" weight="700" tabular>{ev.priceCents ? ltr(formatMoney(ev.priceCents)) : tr('event.free', 'Free')}</Text>
              {left <= 0 ? <Tag label={tr('event.full', 'Full · waiting list')} tone="warning" /> : null}
            </View>
          </View>
          <ArrowDot tone={t.scheme === 'dark' ? 'mint' : 'navy'} size={46} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function CampaignCard({ c, onPress, index = 0 }: { c: Campaign; onPress: () => void; index?: number }) {
  const tr = useT();
  const loc = useLocalized();
  const t = useTheme();
  const reached = c.raisedCents >= c.goalCents;
  const pct = Math.min(100, Math.round((c.raisedCents / c.goalCents) * 100));
  return (
    <Animated.View entering={t.reduceMotion ? undefined : FadeInDown.delay(Math.min(index, 6) * 60).springify().damping(18).stiffness(170)}>
      <Pressable onPress={onPress} accessibilityRole="button" style={{ marginHorizontal: layout.margin, borderRadius: radii.hero, ...continuous, backgroundColor: t.colors.bgElevated, padding: 10, gap: space.sm, boxShadow: t.scheme === 'dark' ? undefined : '0 8px 24px rgba(1,52,71,0.07)' }}>
        <ArtImage image={c.image} aspect={16 / 9} radius={radii.card} />
        <View style={{ gap: space.sm, paddingHorizontal: 6, paddingBottom: 6 }}>
          <Text variant="headline">{loc(c.title)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <View>
              <Text tabular style={{ color: t.colors.textPrimary, fontSize: 30, lineHeight: 34, fontWeight: '800', letterSpacing: -0.5 }}>{ltr(formatMoney(c.raisedCents))}</Text>
              <Text variant="footnote" color="textSecondary" tabular>{tr('cmp.ofGoal', 'of {{goal}}', { goal: ltr(formatMoney(c.goalCents)) })} · {tr('cmp.donors', '{{n}} donors', { n: c.donors })}</Text>
            </View>
            {reached ? <Tag label={tr('cmp.reached', 'Goal reached')} tone="success" icon={<Icon name="checkmark" size={11} weight="bold" color="accentText" />} /> : (
              <View style={{ paddingHorizontal: 12, height: 34, borderRadius: 17, backgroundColor: t.colors.blockSand, justifyContent: 'center' }}>
                <Text variant="subheadline" weight="800" tabular style={{ color: t.colors.blockSandInk }}>{pct}%</Text>
              </View>
            )}
          </View>
          <ProgressBar value={c.raisedCents / c.goalCents} label={tr('cmp.progress', 'Raised')} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

/* ---------------------------------------------------------------- chrome */

/** GlassSurface bar with a safe-area inset. Content scrolls under it and is inset by its height. */
export function StickyCTA({ children, note }: { children: ReactNode; note?: ReactNode }) {
  const bottom = useFooterInset();
  return (
    <View style={{ position: 'absolute', start: 0, end: 0, bottom: 0 }}>
      <GlassSurface style={{ paddingHorizontal: layout.margin, paddingTop: space.sm, paddingBottom: bottom, gap: space.xs }}>
        {note}
        {children}
      </GlassSurface>
    </View>
  );
}
export const STICKY_CTA_SPACE = 120;

export function ActingForBar({ onSwitchBack }: { onSwitchBack: () => void }) {
  const t = useTheme();
  const tr = useT();
  const p = useActingPerson();
  if (!p) return null;
  return (
    <Animated.View entering={FadeInDown.springify().damping(26).stiffness(170)} style={{ marginHorizontal: layout.margin, marginBottom: space.sm, borderRadius: radii.capsule, backgroundColor: t.colors.bgSelected, flexDirection: 'row', alignItems: 'center', paddingStart: space.md, gap: space.xs, borderWidth: t.highContrast ? 1.5 : 0, borderColor: t.colors.accent }}>
      <Icon name="person.2.fill" size={15} color="tint" />
      <Text variant="subheadline" weight="600" style={{ flex: 1 }}>{tr('cg.actingFor', 'Acting for {{name}}', { name: p.firstName })}</Text>
      <Pressable onPress={onSwitchBack} accessibilityRole="button" style={{ minHeight: 40, justifyContent: 'center', paddingHorizontal: space.md }}>
        <Text variant="subheadline" color="tint" weight="600">{tr('cg.switchBack', 'Switch back')}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function useScreenWidth() {
  return useWindowDimensions().width;
}

export function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, gap: space.md }}>
      <Text variant={strong ? 'headline' : 'body'} color={strong ? 'textPrimary' : 'textSecondary'}>{label}</Text>
      <Text variant={strong ? 'headline' : 'body'} tabular style={{ flexShrink: 1, textAlign: 'right' }}>{value}</Text>
    </View>
  );
}
