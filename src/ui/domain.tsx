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
import { navyCard, pinColors } from '@/theme/colors';
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
export function RatingBadge({ level, size = 'small' }: { level: RatingLevel; size?: 'small' | 'large' | 'mini' | 'pill' | 'pillLarge' }) {
  const t = useTheme();
  const tr = useT();
  const color = { accessible: t.colors.ratingAccessible, partly: t.colors.ratingPartly, not: t.colors.ratingNot }[level];
  const label = ratingLabel(tr, level);
  if (size === 'pill' || size === 'pillLarge') {
    // Compact capsule for rows and cards: same colours and glyphs as the pins, tinted ground.
    const big = size === 'pillLarge';
    const short = level === 'partly' && !big ? tr('rating.partlyShort', 'Partly') : label;
    const ink = level === 'accessible' ? t.colors.accentText : color;
    return (
      <View accessible accessibilityRole="text" accessibilityLabel={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', height: big ? 32 : 26, borderRadius: 16, paddingStart: 3, paddingEnd: big ? 12 : 9, backgroundColor: `${color}${t.scheme === 'dark' ? '33' : '24'}` }}>
        <RatingFace level={level} size={big ? 26 : 22} />
        <Text variant={big ? 'subheadline' : 'caption1'} weight="600" style={{ color: ink }} numberOfLines={1}>{short}</Text>
      </View>
    );
  }
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
  const t = useTheme();
  const tr = useT();
  const loc = useLocalized();
  const big = isLargeText();
  return (
    <View accessible accessibilityLabel={`${checklistLabel(tr, item.key)}: ${loc(item.value)}, ${ratingLabel(tr, item.level)}`} style={{ flexDirection: big ? 'column' : 'row', alignItems: big ? 'flex-start' : 'center', gap: space.sm, minHeight: layout.rowWithSubtitle, paddingVertical: space.sm }}>
      {/* Soft sky tile (Map's colour); the badge on the right keeps the rating colour. */}
      <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: t.tints.sky.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={checklistIcon[item.key]} size={18} color={{ raw: t.tints.sky.ink }} rendering="hierarchical" />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="body" weight="600">{checklistLabel(tr, item.key)}</Text>
        <Text variant="subheadline" color="textSecondary">{loc(item.value)}</Text>
      </View>
      <RatingBadge level={item.level} size="mini" />
    </View>
  );
}

/* ---------------------------------------------------------------- map pins */

const PIN = 36;
const PIN_SELECTED = 1.3;

/** Mood artwork (assets/moods): glossy rounded faces, 256 pt with @2x and @3x. */
const MOOD: Record<RatingLevel, number> = {
  accessible: require('../../assets/moods/happy.png'),
  partly: require('../../assets/moods/neutral.png'),
  not: require('../../assets/moods/sad.png'),
};

/**
 * A rating as a face: happy green, neutral yellow, sad red. Used for the map pins and for
 * legends such as the map filters. `lifted` adds a soft shadow so it stands off the map.
 */
export function RatingFace({ level, size = 26, lifted }: { level: RatingLevel; size?: number; lifted?: boolean }) {
  return (
    <View style={{ width: size, height: size }}>
      {/* The artwork has a transparent margin, so the shadow is cast by a shape matching the face itself. */}
      {lifted ? <View style={{ position: 'absolute', top: size * 0.1, bottom: size * 0.08, left: size * 0.09, right: size * 0.09, borderRadius: size * 0.2, backgroundColor: pinColors[level], boxShadow: '0 2px 5px rgba(1,52,71,0.38)' }} /> : null}
      <Image source={MOOD[level]} style={{ width: size, height: size }} contentFit="contain" />
    </View>
  );
}

/** Three faces, so the rating reads by expression as well as colour: smiling, poker, sad. */
export function MapPin({ level, selected }: { level: RatingLevel; selected?: boolean }) {
  const t = useTheme();
  const s = useSharedValue(selected ? PIN_SELECTED : 1);
  useEffect(() => {
    s.value = t.reduceMotion ? (selected ? PIN_SELECTED : 1) : withSpring(selected ? PIN_SELECTED : 1, springs.bouncy);
  }, [selected, s, t.reduceMotion]);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <View style={{ width: 48, height: 64, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 10 }} pointerEvents="none">
      {/* Scales from its foot so the selected pin grows upward and stays on its spot. */}
      <Animated.View style={[{ alignItems: 'center', transformOrigin: 'bottom' }, st]}>
        <RatingFace level={level} size={PIN} lifted />
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

export function PlaceRow({ place, onPress, onLongPress, tag, index = 0 }: { place: Place; onPress: () => void; onLongPress?: () => void; tag?: ReactNode; index?: number }) {
  const tr = useT();
  const loc = useLocalized();
  const t = useTheme();
  const d = formatDistance(distanceKm(HERE, place));
  // Compact list row: 52pt photo, name, type and distance, rating pill trailing (about 68pt tall).
  return (
    <Animated.View entering={t.reduceMotion ? undefined : FadeInDown.delay(Math.min(index, 8) * 40).springify().damping(26).stiffness(170)}>
      <Pressable feedback="highlight" onPress={onPress} onLongPress={onLongPress} accessibilityRole="button" accessibilityLabel={`${loc(place.name)}, ${ratingLabel(tr, place.rating.level)}, ${d}`} style={{ flexDirection: 'row', gap: space.sm, paddingVertical: space.xs, paddingHorizontal: layout.margin, alignItems: 'center', minHeight: 68 }}>
        <View style={{ width: 52, borderRadius: radii.thumb, overflow: 'hidden' }}>
          <ArtImage image={place.hero} aspect={1} radius={radii.thumb} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          {tag ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs, flexWrap: 'wrap' }}><Text variant="headline" numberOfLines={1}>{loc(place.name)}</Text>{tag}</View> : <Text variant="headline" numberOfLines={1}>{loc(place.name)}</Text>}
          <Text variant="footnote" color="textSecondary" numberOfLines={1}>{placeTypeLabel(tr, place.category)} · {ltr(d)}</Text>
        </View>
        {/* Face only: the row's accessibility label already speaks the rating. */}
        <RatingFace level={place.rating.level} size={34} />
      </Pressable>
    </Animated.View>
  );
}

/* ---------------------------------------------------------------- products */

/** `onNavy` is for text sitting on the navy card, which is the same colour in light and dark. */
export function PriceText({ cents, compareAt, variant = 'headline', onNavy }: { cents: number; compareAt?: number; variant?: 'headline' | 'title3'; onNavy?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
      <Text variant={variant} tabular weight={variant === 'title3' ? '400' : '600'} style={onNavy ? { color: navyCard.text } : undefined}>{ltr(formatMoney(cents))}</Text>
      {compareAt ? <Text variant="footnote" color="textSecondary" tabular style={[{ textDecorationLine: 'line-through' }, onNavy ? { color: navyCard.dim } : null]}>{ltr(formatMoney(compareAt))}</Text> : null}
    </View>
  );
}

export function StockLabel({ stock, always, small, onNavy }: { stock: Product['stock']; always?: boolean; small?: boolean; onNavy?: boolean }) {
  const tr = useT();
  const v = small ? 'caption1' : 'subheadline';
  if (stock.status === 'in' && !always) return null;
  if (stock.status === 'in') return <Text variant={v} weight="600" color="accentText" style={onNavy ? { color: navyCard.mint } : undefined}>{tr('stock.in', 'In stock')}</Text>;
  if (stock.status === 'low') return <Text variant={v} weight="600" color="ratingPartly" style={onNavy ? { color: navyCard.warn } : undefined}>{tr('stock.low', '{{n}} left', { n: stock.quantity })}</Text>;
  return <Text variant={v} weight="600" color="textSecondary" style={onNavy ? { color: navyCard.dim } : undefined}>{tr('stock.out', 'Out of stock')}</Text>;
}

export function specValue(s: Product['keySpecs'][number], tr: (k: string, e: string) => string) {
  if (typeof s.value === 'boolean') return s.value ? tr('common.yes', 'Yes') : tr('common.no', 'No');
  return `${s.value}${s.unit ? ' ' + s.unit : ''}`;
}

export function ProductCard({ product, layout: lay = 'grid', onPress, index = 0 }: { product: Product; layout?: 'grid' | 'rail'; onPress: () => void; index?: number }) {
  const loc = useLocalized();
  const t = useTheme();
  const rail = lay === 'rail';
  // The navy card Care uses for its tiles: photo on a white panel, white type underneath.
  const pad = 6;
  return (
    <Animated.View entering={t.reduceMotion ? undefined : FadeInDown.delay(Math.min(index, 6) * 40).springify().damping(26).stiffness(170)} style={rail ? { width: 150 } : { flex: 1 }}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${loc(product.name)}, ${formatMoney(product.priceCents)}`}
        style={{ flex: 1, gap: 6, padding: pad, paddingBottom: 10, borderRadius: 20, ...continuous, backgroundColor: navyCard.bg, borderWidth: 1, borderColor: navyCard.line }}>
        <View>
          <ArtImage image={product.images[0]} aspect={rail ? 140 / 124 : 1} tile radius={14} edge={false} />
          {product.compareAtCents && product.compareAtCents > product.priceCents ? (
            // Deals are peach (Shop's colour); the photo itself stays on white.
            <View style={{ position: 'absolute', top: 8, start: 8, paddingHorizontal: 8, height: 22, borderRadius: 11, justifyContent: 'center', backgroundColor: '#FFE6D5' }}>
              <Text variant="caption2" weight="800" tabular style={{ color: '#A3401B' }} maxFontSizeMultiplier={1.2}>{`-${Math.round((1 - product.priceCents / product.compareAtCents) * 100)}%`}</Text>
            </View>
          ) : null}
        </View>
        <View style={{ gap: 1, paddingHorizontal: 4 }}>
          <Text variant={rail ? 'footnote' : 'subheadline'} numberOfLines={rail ? 1 : 2} style={{ color: navyCard.soft }}>{loc(product.name)}</Text>
          <PriceText cents={product.priceCents} compareAt={product.compareAtCents} onNavy />
          <StockLabel stock={product.stock} small onNavy />
        </View>
      </Pressable>
      {product.stock.status !== 'out' ? (
        <View pointerEvents="box-none" style={{ position: 'absolute', top: pad + 1, start: pad + 1, end: pad + 1, aspectRatio: rail ? 140 / 124 : 1 }}>
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
