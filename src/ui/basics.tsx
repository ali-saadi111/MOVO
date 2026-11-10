import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { continuous, durations, layout, radii, space, useTheme } from '@/theme';
import { Icon } from './Icon';
import { Pressable } from './Pressable';
import { Text } from './Text';

export function Divider({ inset = 0, style }: { inset?: number; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: t.colors.separator, marginStart: inset }, style]} />;
}

export function Spacer({ size = space.md }: { size?: number }) {
  return <View style={{ height: size, width: size }} />;
}

/** Skeleton with the exact geometry of the content it replaces. 1.2 s opacity sweep. */
export function Skeleton({ shape = 'rect', width = '100%', height = 16, radius, style }: { shape?: 'text' | 'rect' | 'circle'; width?: DimensionValue; height?: number; radius?: number; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const o = useSharedValue(1);
  useEffect(() => {
    if (t.reduceMotion) return;
    o.value = withRepeat(withSequence(withTiming(0.45, { duration: durations.shimmer / 2 }), withTiming(1, { duration: durations.shimmer / 2 })), -1);
  }, [t.reduceMotion, o]);
  const a = useAnimatedStyle(() => ({ opacity: o.value }));
  const r = radius ?? (shape === 'circle' ? 999 : shape === 'text' ? 6 : radii.cell);
  return <Animated.View accessibilityElementsHidden style={[{ width, height, borderRadius: r, backgroundColor: t.colors.fill, ...continuous }, a, style]} />;
}

/** The small bordered arrow circle that ends a section header, as in the reference. */
function ArrowCircle() {
  const t = useTheme();
  return (
    <View style={{ width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: t.colors.separator, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="arrow.right" size={13} weight="semibold" color="textPrimary" mirrorInRTL />
    </View>
  );
}

export function SectionHeader({ title, actionLabel, onAction, size = 'title3', style }: { title: string; actionLabel?: string; onAction?: () => void; size?: 'title2' | 'title3'; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: layout.headerToContent, paddingHorizontal: layout.margin, minHeight: 32 }, style]}>
      <Text variant={size} weight="800" accessibilityRole="header" style={{ flexShrink: 1, letterSpacing: -0.3 }}>{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onAction} accessibilityRole="button" accessibilityLabel={actionLabel} hitSlop={10} style={{ minHeight: layout.target, flexDirection: 'row', alignItems: 'center', gap: 8, paddingStart: space.sm }}>
          <Text variant="subheadline" weight="600" color="textSecondary">{actionLabel}</Text>
          <ArrowCircle />
        </Pressable>
      ) : null}
    </View>
  );
}

export function Badge({ count }: { count: number }) {
  const t = useTheme();
  if (!count) return null;
  return (
    <View style={{ minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 6, backgroundColor: t.colors.accent, alignItems: 'center', justifyContent: 'center' }}>
      <Text variant="caption1" weight="700" tabular style={{ color: '#013447' }} maxFontSizeMultiplier={1.3}>{count}</Text>
    </View>
  );
}

export function Tag({ label, tone = 'neutral', icon }: { label: string; tone?: 'neutral' | 'selected' | 'success' | 'warning' | 'brand'; icon?: ReactNode }) {
  const t = useTheme();
  const bg = { neutral: t.colors.fill, selected: t.colors.bgSelected, success: t.colors.bgSelected, warning: t.scheme === 'dark' ? 'rgba(232,163,61,0.16)' : 'rgba(180,83,9,0.10)', brand: 'rgba(34,211,156,0.18)' }[tone];
  const fg = tone === 'warning' ? t.colors.ratingPartly : tone === 'success' ? t.colors.accentText : tone === 'brand' ? t.colors.accent : t.colors.textPrimary;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: space.xs, paddingVertical: 3, borderRadius: radii.capsule, backgroundColor: bg }}>
      {icon}
      <Text variant="caption1" weight="600" style={{ color: fg }} maxFontSizeMultiplier={1.6}>{label}</Text>
    </View>
  );
}

export function PageIndicator({ count, index }: { count: number; index: number }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }} accessibilityRole="adjustable" accessibilityValue={{ min: 1, max: count, now: index + 1 }}>
      {Array.from({ length: count }, (_, i) => (
        <Dot key={i} active={i === index} color={i === index ? t.colors.textPrimary : t.colors.fillStrong} />
      ))}
    </View>
  );
}
function Dot({ active, color }: { active: boolean; color: string }) {
  const w = useSharedValue(active ? 22 : 8);
  useEffect(() => { w.value = withTiming(active ? 22 : 8, { duration: 220 }); }, [active, w]);
  const s = useAnimatedStyle(() => ({ width: w.value }));
  return <Animated.View style={[{ height: 8, borderRadius: 4, backgroundColor: color }, s]} />;
}
