import { useEffect, useState } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedProps, useAnimatedReaction, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { haptic } from '@/lib/haptics';
import { brand } from '@/theme/colors';
import { durations, radii, springs, useTheme } from '@/theme';
import { Text, type TextProps } from './Text';

const APath = Animated.createAnimatedComponent(Path);
const TICK_LEN = 64;

/**
 * The one drawn confirmation mark (§2.9 moment 5): a Mint circle scales 0.6 → 1
 * with `bouncy` while a Navy tick strokes in over 350 ms; Success haptic on completion.
 */
export function SuccessTick({ size = 96, onDone, haptics = true }: { size?: number; onDone?: () => void; haptics?: boolean }) {
  const t = useTheme();
  const scale = useSharedValue(t.reduceMotion ? 1 : 0.6);
  const opacity = useSharedValue(t.reduceMotion ? 0 : 1);
  const dash = useSharedValue(t.reduceMotion ? 0 : TICK_LEN);
  useEffect(() => {
    const done = () => { if (haptics) haptic.success(); onDone?.(); };
    if (t.reduceMotion) {
      opacity.value = withTiming(1, { duration: durations.fade }, (f) => { if (f) runOnJS(done)(); });
      return;
    }
    scale.value = withSpring(1, springs.bouncy);
    dash.value = withDelay(120, withTiming(0, { duration: durations.tickStroke, easing: Easing.out(Easing.cubic) }, (f) => { if (f) runOnJS(done)(); }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const circle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }));
  const props = useAnimatedProps(() => ({ strokeDashoffset: dash.value }));
  return (
    <Animated.View style={[{ width: size, height: size }, circle]} accessibilityElementsHidden>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Circle cx={50} cy={50} r={48} fill={brand.mint} />
        <APath d="M29 52 L44 66 L72 36" stroke={brand.navy} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray={TICK_LEN} animatedProps={props} />
      </Svg>
    </Animated.View>
  );
}

/** 8 pt capsule progress bar, accent on fill. Fills once with `smooth`. */
export function ProgressBar({ value, from = 0, height = 12, style, label, color }: { value: number; from?: number; height?: number; style?: StyleProp<ViewStyle>; label?: string; /** Fill colour; defaults to the accent. */ color?: string }) {
  const t = useTheme();
  const p = useSharedValue(t.reduceMotion ? value : from);
  useEffect(() => {
    p.value = t.reduceMotion ? withTiming(value, { duration: durations.fade }) : withSpring(value, { ...springs.smooth, overshootClamping: true } as never);
  }, [value, p, t.reduceMotion]);
  const fill = useAnimatedStyle(() => ({ width: `${Math.max(0, Math.min(1, p.value)) * 100}%` }));
  return (
    <View accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }} style={[{ height, borderRadius: radii.capsule, backgroundColor: t.colors.fill, overflow: 'hidden' }, style]}>
      <Animated.View style={[{ height, borderRadius: radii.capsule, backgroundColor: color ?? t.colors.accent }, fill]} />
    </View>
  );
}

/** Counts a number up in tabular numerals alongside a ProgressBar. */
export function CountUp({ to, from = 0, format, ...text }: { to: number; from?: number; format: (n: number) => string } & TextProps) {
  const t = useTheme();
  const v = useSharedValue(t.reduceMotion ? to : from);
  const [shown, setShown] = useState(t.reduceMotion ? to : from);
  useEffect(() => {
    v.value = t.reduceMotion ? to : withTiming(to, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [to, v, t.reduceMotion]);
  useAnimatedReaction(() => Math.round(v.value), (n, prev) => { if (n !== prev) runOnJS(setShown)(n); });
  return <Text tabular {...text}>{format(shown)}</Text>;
}
