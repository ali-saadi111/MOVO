import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme';
import { brand } from '@/theme/colors';

type Shape = 'dot' | 'plus' | 'heart' | 'wheel' | 'square';
const SHAPES: Shape[] = ['dot', 'plus', 'heart', 'wheel', 'square', 'dot', 'plus', 'wheel'];
const COLORS = [brand.mint, brand.navy, '#F6C58E', brand.mint, '#7FE3C2'];

function Piece({ shape, color, size }: { shape: Shape; color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      {shape === 'dot' ? <Circle cx={10} cy={10} r={7} fill={color} /> : null}
      {shape === 'square' ? <Rect x={4} y={4} width={12} height={12} rx={3} fill={color} /> : null}
      {shape === 'plus' ? <Path d="M10 3 V17 M3 10 H17" stroke={color} strokeWidth={4.5} strokeLinecap="round" /> : null}
      {shape === 'wheel' ? <Circle cx={10} cy={10} r={6.5} stroke={color} strokeWidth={3.5} fill="none" /> : null}
      {shape === 'heart' ? <Path d="M10 17 C4 13 2 10 2 7 C2 4.5 4 3 6 3 C7.8 3 9.2 4 10 5.5 C10.8 4 12.2 3 14 3 C16 3 18 4.5 18 7 C18 10 16 13 10 17 Z" fill={color} /> : null}
    </Svg>
  );
}

function Particle({ i, n, radius, delay }: { i: number; n: number; radius: number; delay: number }) {
  const p = useSharedValue(0);
  const [spec] = useState(() => {
    const angle = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const dist = radius * (0.65 + Math.random() * 0.55);
    return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist, spin: (Math.random() - 0.5) * 540, size: 12 + Math.random() * 12, fall: 30 + Math.random() * 40 };
  });
  useEffect(() => {
    p.value = withDelay(delay, withTiming(1, { duration: 1300, easing: Easing.out(Easing.cubic) }));
  }, [p, delay]);
  const style = useAnimatedStyle(() => {
    const v = p.value;
    return {
      opacity: v < 0.08 ? v * 12 : 1 - Math.max(0, v - 0.6) / 0.4,
      transform: [{ translateX: spec.dx * v }, { translateY: spec.dy * v + spec.fall * v * v }, { rotate: `${spec.spin * v}deg` }, { scale: 0.4 + v * 0.6 }],
    };
  });
  return (
    <Animated.View style={[{ position: 'absolute' }, style]}>
      <Piece shape={SHAPES[i % SHAPES.length]} color={COLORS[i % COLORS.length]} size={spec.size} />
    </Animated.View>
  );
}

/**
 * A burst of Movo shapes (wheels, care crosses, hearts) from the centre of its box.
 * Decorative only; skipped under Reduce Motion.
 */
export function Celebration({ size = 280, count = 26, delay = 250 }: { size?: number; count?: number; delay?: number }) {
  const t = useTheme();
  if (t.reduceMotion) return null;
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: count }, (_, i) => <Particle key={i} i={i} n={count} radius={size / 2} delay={delay + (i % 3) * 40} />)}
    </View>
  );
}

/** Soft rings that ripple out from behind a tick or an icon. */
export function PulseRings({ size = 120, color = brand.mint, rings = 2 }: { size?: number; color?: string; rings?: number }) {
  const t = useTheme();
  if (t.reduceMotion) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: rings }, (_, i) => <Ring key={i} size={size} color={color} delay={i * 600} />)}
    </View>
  );
}

function Ring({ size, color, delay }: { size: number; color: string; delay: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(400 + delay, withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }), 3, false));
  }, [p, delay]);
  const style = useAnimatedStyle(() => ({ opacity: 0.5 * (1 - p.value), transform: [{ scale: 1 + p.value * 0.9 }] }));
  return <Animated.View style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: 3, borderColor: color }, style]} />;
}
