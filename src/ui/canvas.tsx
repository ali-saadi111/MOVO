import { useEffect, useState, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { useLang, useT } from '@/i18n';
import { fmtLongDay } from '@/lib/dates';
import { haptic } from '@/lib/haptics';
import { useSession } from '@/stores/session';
import { continuous, layout, radii, space, springs, useTheme, type ColorTokens } from '@/theme';
import { ArtImage } from './Art';
import { Avatar } from './domain';
import { CountUp } from './feedback';
import { Icon } from './Icon';
import { Pressable } from './Pressable';
import type { IconName } from './symbols';
import { Text } from './Text';
import { edges } from '@/lib/rtl';
import type { ImageRef } from '@/data/models';

export type Tone = 'mint' | 'mist' | 'sand' | 'navy';

export function toneColors(c: ColorTokens, tone: Tone) {
  return {
    mint: { bg: c.blockMint, ink: c.blockMintInk, soft: 'rgba(1,52,71,0.10)' },
    mist: { bg: c.blockMist, ink: c.blockMistInk, soft: 'rgba(1,52,71,0.07)' },
    sand: { bg: c.blockSand, ink: c.blockSandInk, soft: 'rgba(107,51,5,0.09)' },
    navy: { bg: c.blockNavy, ink: c.blockNavyInk, soft: 'rgba(255,255,255,0.12)' },
  }[tone];
}

/** A round icon button on the canvas header (bell, cart). */
export function RoundButton({ icon, label, onPress, dot, count, shake }: { icon: IconName; label: string; onPress: () => void; dot?: boolean; count?: number; shake?: boolean }) {
  const t = useTheme();
  const r = useSharedValue(0);
  useEffect(() => {
    if (!shake || t.reduceMotion) return;
    r.value = withDelay(700, withRepeat(withSequence(withTiming(-14, { duration: 70 }), withTiming(12, { duration: 90 }), withTiming(-8, { duration: 80 }), withTiming(6, { duration: 70 }), withTiming(0, { duration: 80 }), withTiming(0, { duration: 2600 })), 2));
  }, [shake, r, t.reduceMotion]);
  const s = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }));
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: t.colors.bgElevated, alignItems: 'center', justifyContent: 'center', boxShadow: t.scheme === 'dark' ? undefined : '0 4px 14px rgba(1,52,71,0.08)' }}>
      <Animated.View style={s}><Icon name={icon} size={20} weight="medium" color="textPrimary" /></Animated.View>
      {count ? (
        <View style={{ position: 'absolute', top: 4, ...edges(t.rtl, { end: 2 }), minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, backgroundColor: t.colors.blockSand, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="caption2" weight="700" tabular style={{ color: t.colors.blockSandInk }} maxFontSizeMultiplier={1.2}>{count}</Text>
        </View>
      ) : dot ? <View style={{ position: 'absolute', top: 12, ...edges(t.rtl, { end: 13 }), width: 9, height: 9, borderRadius: 5, backgroundColor: t.colors.accent, borderWidth: 1.5, borderColor: t.colors.bgElevated }} /> : null}
    </Pressable>
  );
}

/** Tab-root header: avatar and greeting, round actions, then a big display title. */
export function CanvasHeader({ title, actions, below }: { title: string; actions?: ReactNode; below?: ReactNode }) {
  const t = useTheme();
  const tr = useT();
  const lang = useLang();
  const user = useSession((s) => s.user);
  const today = new Date().toISOString();
  return (
    <View style={{ paddingHorizontal: layout.margin, gap: space.lg, marginBottom: space.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 48 }}>
        {user ? <Avatar name={user.fullName} size={44} /> : (
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: t.colors.blockNavy, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="hand.wave" size={20} color={{ raw: t.colors.accent }} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text variant="headline" numberOfLines={1}>{user ? tr('canvas.hi', 'Hi, {{name}}', { name: user.firstName }) : tr('canvas.hiGuest', 'Hi there')}</Text>
          <Text variant="footnote" color="textSecondary" numberOfLines={1}>{fmtLongDay(today, lang)}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: space.xs }}>{actions}</View>
      </View>
      <Text variant="largeTitle" display accessibilityRole="header" style={{ fontSize: 38, lineHeight: 44, letterSpacing: -0.6, fontWeight: '800' }}>{title}</Text>
      {below}
    </View>
  );
}

/** Big-number tile in a colour block. */
export function StatTile({ value, label, icon, tone = 'mist', format = String, index = 0, onPress, style }: { value: number; label: string; icon: IconName; tone?: Tone; format?: (n: number) => string; index?: number; onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const c = toneColors(t.colors, tone);
  const body = (
    <View style={{ flex: 1, minHeight: 124, borderRadius: radii.tile, ...continuous, backgroundColor: t.colors.bgElevated, borderWidth: 1, borderColor: t.colors.separator, padding: space.md, justifyContent: 'space-between', gap: space.sm }}>
      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={16} weight="semibold" color={{ raw: c.ink }} />
      </View>
      <View>
        <CountUp to={value} format={format} variant="largeTitle" style={{ color: t.colors.textPrimary, fontSize: 32, lineHeight: 36, fontWeight: '800', letterSpacing: -0.5 }} />
        <Text variant="footnote" weight="500" color="textSecondary" numberOfLines={2}>{label}</Text>
      </View>
    </View>
  );
  return (
    <Animated.View entering={FadeInDown.delay(80 + index * 70).springify().damping(18).stiffness(180)} style={[{ flex: 1 }, style]}>
      {onPress ? <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${format(value)} ${label}`} style={{ flex: 1 }}>{body}</Pressable> : body}
    </Animated.View>
  );
}

/** Round arrow used as the action on hero blocks. */
export function ArrowDot({ tone = 'navy', size = 52 }: { tone?: 'navy' | 'light' | 'mint'; size?: number }) {
  const t = useTheme();
  const bg = tone === 'navy' ? t.colors.blockNavy : tone === 'mint' ? t.colors.blockMint : '#FFFFFF';
  const fg = tone === 'navy' ? '#FFFFFF' : t.colors.blockNavy === '#0B3A4C' && tone === 'light' ? '#013447' : '#013447';
  const x = useSharedValue(0);
  useEffect(() => {
    if (t.reduceMotion) return;
    x.value = withDelay(1200, withRepeat(withSequence(withTiming(4, { duration: 260 }), withSpring(0, springs.bouncy), withTiming(0, { duration: 2400 })), -1));
  }, [x, t.reduceMotion]);
  const s = useAnimatedStyle(() => ({ transform: [{ translateX: t.rtl ? -x.value : x.value }] }));
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={s}><Icon name="arrow.right" size={20} weight="semibold" color={{ raw: fg }} mirrorInRTL /></Animated.View>
    </View>
  );
}

/**
 * Colour-block hero card with a drawn illustration. The art sits on the trailing
 * side and bleeds off the edge; a round arrow invites the tap.
 */
export function BlockCard({ tone, eyebrow, title, body, art, onPress, footer, index = 0, minHeight = 196, accessibilityLabel }: { tone: Tone; eyebrow?: string; title: string; body?: string; art?: ReactNode; onPress?: () => void; footer?: ReactNode; index?: number; minHeight?: number; accessibilityLabel?: string }) {
  const t = useTheme();
  const c = toneColors(t.colors, tone);
  const inner = (
    <View style={{ minHeight, borderRadius: radii.hero, ...continuous, backgroundColor: c.bg, overflow: 'hidden', padding: space.lg, justifyContent: 'space-between', gap: space.md }}>
      {art ? <View pointerEvents="none" style={{ position: 'absolute', ...edges(t.rtl, { end: -16 }), bottom: -10, width: '58%', height: '100%', alignItems: 'flex-end', justifyContent: 'flex-end' }}>{art}</View> : null}
      <View style={{ gap: 6, maxWidth: art ? '62%' : '100%' }}>
        {eyebrow ? <Text variant="footnote" weight="600" style={{ color: c.ink, opacity: 0.8 }}>{eyebrow}</Text> : null}
        <Text variant="title2" style={{ color: c.ink, fontWeight: '800', letterSpacing: -0.3 }}>{title}</Text>
        {body ? <Text variant="subheadline" style={{ color: c.ink, opacity: 0.82 }}>{body}</Text> : null}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        {onPress ? <ArrowDot tone={tone === 'navy' ? 'mint' : 'navy'} /> : null}
        {footer}
      </View>
    </View>
  );
  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify().damping(18).stiffness(160)} style={{ marginHorizontal: layout.margin }}>
      {onPress ? <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? title}>{inner}</Pressable> : inner}
    </Animated.View>
  );
}

/** Rounded colour tile for a category or service, icon in a circle. */
export function BlockTile({ tone, icon, label, sub, onPress, index = 0 }: { tone: Tone; icon: IconName; label: string; sub?: string; onPress: () => void; index?: number }) {
  const t = useTheme();
  const c = toneColors(t.colors, tone);
  return (
    <Animated.View entering={FadeInDown.delay(120 + index * 50).springify().damping(18).stiffness(180)} style={{ width: '48%', flexGrow: 1 }}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={{ minHeight: 128, borderRadius: radii.tile, ...continuous, backgroundColor: t.colors.bgElevated, borderWidth: 1, borderColor: t.colors.separator, padding: space.md, justifyContent: 'space-between', gap: space.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={icon} size={21} weight="semibold" color={{ raw: c.ink }} />
          </View>
          <Icon name="arrow.up.right" size={15} weight="semibold" color="textSecondary" mirrorInRTL />
        </View>
        <View>
          <Text variant="headline" weight="700" numberOfLines={2}>{label}</Text>
          {sub ? <Text variant="footnote" color="textSecondary" numberOfLines={1}>{sub}</Text> : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export const TONES: Tone[] = ['mint', 'sand', 'mist', 'navy'];

/** Two to four options in a capsule; the selected one sits on a navy pill that springs across. */
export function PillToggle({ values, index, onChange }: { values: string[]; index: number; onChange: (i: number) => void }) {
  const t = useTheme();
  const [w, setW] = useState(0);
  const x = useSharedValue(index);
  useEffect(() => { x.value = t.reduceMotion ? index : withSpring(index, springs.snappy); }, [index, x, t.reduceMotion]);
  const seg = w ? (w - 8) / values.length : 0;
  const pill = useAnimatedStyle(() => ({ width: seg, transform: [{ translateX: (t.rtl ? -1 : 1) * x.value * seg }] }));
  return (
    <View accessibilityRole="tablist" onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height: 52, borderRadius: 26, backgroundColor: t.colors.bgElevated, padding: 4, flexDirection: 'row', borderWidth: 1, borderColor: t.colors.separator }}>
      {w ? <Animated.View style={[{ position: 'absolute', top: 4, bottom: 4, ...edges(t.rtl, { start: 4 }), borderRadius: 22, backgroundColor: t.colors.buttonPrimaryBg }, pill]} /> : null}
      {values.map((v, i) => (
        <Pressable key={v} feedback="none" onPress={() => { haptic.selection(); onChange(i); }} accessibilityRole="tab" accessibilityState={{ selected: i === index }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="subheadline" weight="700" style={{ color: i === index ? t.colors.buttonPrimaryFg : t.colors.textSecondary }}>{v}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** A wide promo banner with its picture shown whole, and a caption row under it. */
export function PromoBanner({ image, eyebrow, title, meta, onPress, index = 0 }: { image: ImageRef; eyebrow?: string; title: string; meta?: string; onPress?: () => void; index?: number }) {
  const t = useTheme();
  const inner = (
    <View style={{ borderRadius: 24, ...continuous, backgroundColor: t.colors.bgElevated, borderWidth: 1, borderColor: t.colors.separator, overflow: 'hidden' }}>
      <ArtImage image={image} aspect={16 / 9} radius={0} edge={false} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.md }}>
        <View style={{ flex: 1, gap: 2 }}>
          {eyebrow ? <Text variant="caption1" weight="700" color="accentText">{eyebrow}</Text> : null}
          <Text variant="headline" weight="800" numberOfLines={1}>{title}</Text>
          {meta ? <Text variant="footnote" color="textSecondary">{meta}</Text> : null}
        </View>
        {onPress ? <ArrowDot tone="navy" size={40} /> : null}
      </View>
    </View>
  );
  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify().damping(18).stiffness(160)} style={{ marginHorizontal: layout.margin }}>
      {onPress ? <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title}>{inner}</Pressable> : inner}
    </Animated.View>
  );
}
