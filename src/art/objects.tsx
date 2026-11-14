import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { springs, useTheme } from '@/theme';
import { drawingAccent } from '@/theme/colors';

/**
 * Movo object drawings (the colour pass). Chunky shapes in one ink colour, with exactly one
 * mint part and a soft highlight, drawn on a 48pt grid. They sit on a tint tile; `cut` is that
 * tile's colour, used where a drawing needs a notch.
 */
export type ObjectName =
  | 'physio' | 'nurse' | 'ot' | 'leg' | 'wrench' | 'van' | 'wheel' | 'heart' | 'people' | 'pin' | 'bag'
  | 'ball' | 'vase' | 'swim' | 'book' | 'sun' | 'racket' | 'pot' | 'shoe' | 'cup' | 'calendar' | 'box' | 'gift';

type Props = { name: ObjectName; size?: number; ink: string; cut?: string; hi?: string };

export function MovoObject({ name, size = 44, ink, cut = '#FFFFFF', hi = 'rgba(255,255,255,0.75)' }: Props) {
  const m = drawingAccent;
  return (
    // Decorative: the label next to it carries the meaning.
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 48 48">{draw(name, ink, m, cut, hi)}</Svg>
    </View>
  );
}

/** A drawing that hops once as it appears (skipped with Reduce Motion). */
export function HopObject({ delay = 0, ...p }: Props & { delay?: number }) {
  const t = useTheme();
  const y = useSharedValue(0);
  const r = useSharedValue(0);
  useEffect(() => {
    if (t.reduceMotion) return;
    y.value = withDelay(delay + 250, withSequence(withTiming(-6, { duration: 160 }), withSpring(0, springs.bouncy)));
    r.value = withDelay(delay + 250, withSequence(withTiming(-7, { duration: 160 }), withSpring(0, springs.bouncy)));
  }, [delay, t.reduceMotion, y, r]);
  const s = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }, { rotate: `${r.value}deg` }] }));
  return <Animated.View style={s}><MovoObject {...p} /></Animated.View>;
}

function draw(name: ObjectName, k: string, m: string, cut: string, hi: string) {
  switch (name) {
    case 'physio':
      return (<G>
        <Rect x={11} y={21.5} width={26} height={5} rx={2.5} fill={k} />
        <Rect x={5} y={13} width={8} height={22} rx={4} fill={k} />
        <Rect x={35} y={13} width={8} height={22} rx={4} fill={k} />
        <Rect x={12} y={17} width={5} height={14} rx={2.5} fill={m} />
        <Rect x={31} y={17} width={5} height={14} rx={2.5} fill={m} />
        <Rect x={7} y={15.5} width={2} height={7} rx={1} fill={hi} />
        <Rect x={37} y={15.5} width={2} height={7} rx={1} fill={hi} />
      </G>);
    case 'nurse':
      return (<G>
        <Path d="M7 23 24 9l17 14v15a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3Z" fill={k} />
        <Path d="M4 24.5 24 8l20 16.5" fill="none" stroke={m} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M24 36c-6-3.8-8.6-6.8-8.6-10a4.3 4.3 0 0 1 8.6-1.3 4.3 4.3 0 0 1 8.6 1.3c0 3.2-2.6 6.2-8.6 10Z" fill={cut} />
      </G>);
    case 'ot':
    case 'cup':
      return (<G>
        <Path d="M33 22h3a6 6 0 0 1 0 12h-3" fill="none" stroke={k} strokeWidth={4.5} />
        <Rect x={9} y={17} width={25} height={24} rx={6} fill={k} />
        <Rect x={9} y={24} width={25} height={6} fill={m} />
        <Path d="M16 6c-2 3 2 5 0 8M23 5c-2 3 2 5 0 8" fill="none" stroke={m} strokeWidth={3} strokeLinecap="round" />
        <Rect x={12.5} y={19.5} width={2.5} height={3} rx={1.2} fill={hi} />
      </G>);
    case 'leg':
      return (<G>
        <Path d="M15 5h18l-3 15H18Z" fill={k} />
        <Circle cx={24} cy={24} r={6} fill={m} />
        <Circle cx={24} cy={24} r={2} fill={k} />
        <Rect x={21.5} y={29} width={5} height={10} rx={1.5} fill={k} />
        <Path d="M19 38h11a6 6 0 0 1 6 5H17a2 2 0 0 1 2-5Z" fill={k} />
        <Rect x={18} y={8} width={2.5} height={7} rx={1.2} fill={hi} />
      </G>);
    case 'wrench':
      return (<G>
        <Circle cx={20} cy={27} r={13} fill="none" stroke={k} strokeWidth={4.5} />
        <Circle cx={20} cy={27} r={3.5} fill={k} />
        <Path d="M20 14v26M7 27h26M11 18l18 18M29 18 11 36" stroke={k} strokeWidth={1.6} opacity={0.55} />
        <G transform="rotate(40 34 16)">
          <Rect x={31} y={12} width={6} height={26} rx={3} fill={m} />
          <Circle cx={34} cy={11} r={7} fill={m} />
          <Rect x={31.5} y={2} width={5} height={8} rx={1.5} fill={cut} />
        </G>
      </G>);
    case 'van':
      return (<G>
        <Path d="M3 15a3 3 0 0 1 3-3h23l9 9h4a3 3 0 0 1 3 3v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" fill={k} />
        <Path d="M30 15l6 6h-6Z" fill={hi} />
        <Rect x={3} y={25} width={42} height={4} fill={m} />
        <Circle cx={13} cy={36} r={5.5} fill={k} stroke={cut} strokeWidth={2.5} />
        <Circle cx={35} cy={36} r={5.5} fill={k} stroke={cut} strokeWidth={2.5} />
        <Circle cx={13} cy={36} r={1.8} fill={m} />
        <Circle cx={35} cy={36} r={1.8} fill={m} />
        <Circle cx={13} cy={18.5} r={3.5} fill={hi} />
      </G>);
    case 'wheel':
      return (<G>
        <Circle cx={19} cy={31} r={12} fill="none" stroke={k} strokeWidth={4.5} />
        <Path d="M15 6h6v19h12l5 12" fill="none" stroke={k} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
        <Rect x={20} y={15} width={12} height={5} rx={2.5} fill={m} />
        <Circle cx={19} cy={31} r={3} fill={m} />
      </G>);
    case 'heart':
      return (<G>
        <Path d="M24 42C11 33.5 5 27 5 19.5A9.5 9.5 0 0 1 24 15a9.5 9.5 0 0 1 19 4.5C43 27 37 33.5 24 42Z" fill={k} />
        <Path d="M14 26h6l3-6 4 10 3-4h5" fill="none" stroke={m} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
      </G>);
    case 'people':
      return (<G>
        <Circle cx={17} cy={15} r={6.5} fill={k} />
        <Circle cx={33} cy={17} r={5.5} fill={m} />
        <Path d="M5 38a12 12 0 0 1 24 0v2H5Z" fill={k} />
        <Path d="M25 39a10 10 0 0 1 19-4v5H25Z" fill={m} />
      </G>);
    case 'pin':
      return (<G>
        <Path d="M24 44S9 29 9 19a15 15 0 0 1 30 0c0 10-15 25-15 25Z" fill={k} />
        <Circle cx={24} cy={19} r={6.5} fill={m} />
        <Rect x={14} y={12} width={3} height={7} rx={1.5} fill={hi} />
      </G>);
    case 'bag':
      return (<G>
        <Path d="M17 16v-3a7 7 0 0 1 14 0v3" fill="none" stroke={k} strokeWidth={4} />
        <Path d="M8 16h32l-2 24a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3Z" fill={k} />
        <Rect x={9} y={22} width={30} height={5} fill={m} />
      </G>);
    case 'box':
      return (<G>
        <Path d="M6 16 24 8l18 8v20l-18 8-18-8Z" fill={k} />
        <Path d="M6 16l18 8 18-8M24 24v20" fill="none" stroke={cut} strokeWidth={2} />
        <Path d="M14 12l18 8v6" fill="none" stroke={m} strokeWidth={4} strokeLinejoin="round" />
      </G>);
    case 'calendar':
      return (<G>
        <Rect x={6} y={10} width={36} height={32} rx={6} fill={k} />
        <Rect x={6} y={10} width={36} height={9} rx={4} fill={m} />
        <Rect x={13} y={5} width={4} height={9} rx={2} fill={k} />
        <Rect x={31} y={5} width={4} height={9} rx={2} fill={k} />
        <Path d="M16 30l5 5 11-11" fill="none" stroke={cut} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      </G>);
    case 'gift':
      return (<G>
        <Rect x={7} y={18} width={34} height={24} rx={4} fill={k} />
        <Rect x={5} y={14} width={38} height={8} rx={3} fill={k} />
        <Rect x={21} y={14} width={6} height={28} fill={m} />
        <Path d="M24 14c-4-8-12-6-10-1 1 2 6 1 10 1Zm0 0c4-8 12-6 10-1-1 2-6 1-10 1Z" fill={m} />
      </G>);
    case 'ball':
      return (<G>
        <Circle cx={24} cy={24} r={17} fill={k} />
        <Path d="M7 24h34M24 7v34M12 12c6 6 6 18 0 24M36 12c-6 6-6 18 0 24" fill="none" stroke={m} strokeWidth={2.6} />
      </G>);
    case 'vase':
      return (<G>
        <Path d="M17 5h14v6c6 3 9 9 9 15 0 9-7 17-16 17S8 35 8 26c0-6 3-12 9-15Z" fill={k} />
        <Rect x={15} y={4} width={18} height={5} rx={2.5} fill={m} />
        <Path d="M11 26c4-3 9 3 13 0s9 3 13 0" fill="none" stroke={m} strokeWidth={3} strokeLinecap="round" />
        <Rect x={13} y={17} width={3} height={7} rx={1.5} fill={hi} />
      </G>);
    case 'swim':
      return (<G>
        <Circle cx={24} cy={20} r={14} fill="none" stroke={k} strokeWidth={7} />
        <Path d="M24 6v6M24 28v6M10 20h6M32 20h6" stroke={m} strokeWidth={7} />
        <Path d="M4 40c4-3 8 3 12 0s8 3 12 0 8 3 12 0" fill="none" stroke={m} strokeWidth={3.4} strokeLinecap="round" />
      </G>);
    case 'book':
      return (<G>
        <Path d="M6 10c7-2 13-1 18 3v28c-5-4-11-5-18-3Z" fill={k} />
        <Path d="M42 10c-7-2-13-1-18 3v28c5-4 11-5 18-3Z" fill={k} opacity={0.8} />
        <Path d="M24 13v28" stroke={m} strokeWidth={3} />
        <Path d="M30 18l3 3 6-7" fill="none" stroke={m} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      </G>);
    case 'sun':
      return (<G>
        <Path d="M8 32a16 16 0 0 1 32 0Z" fill={k} />
        <Path d="M24 6v6M8 15l4 4M40 15l-4 4" stroke={k} strokeWidth={3.4} strokeLinecap="round" />
        <Path d="M4 38c4-3 8 3 12 0s8 3 12 0 8 3 12 0" fill="none" stroke={m} strokeWidth={3.4} strokeLinecap="round" />
      </G>);
    case 'racket':
      return (<G>
        <Ellipse cx={20} cy={18} rx={12} ry={14} fill="none" stroke={k} strokeWidth={4.5} transform="rotate(-35 20 18)" />
        <Path d="M12 12l14 12M10 20l12 10M18 8l12 10" stroke={k} strokeWidth={1.4} opacity={0.5} />
        <Rect x={28} y={28} width={6} height={16} rx={3} fill={k} transform="rotate(-40 31 36)" />
        <Circle cx={38} cy={12} r={5.5} fill={m} />
      </G>);
    case 'pot':
      return (<G>
        <Path d="M8 22h32v12a8 8 0 0 1-8 8H16a8 8 0 0 1-8-8Z" fill={k} />
        <Rect x={5} y={18} width={38} height={6} rx={3} fill={m} />
        <Path d="M18 6c-2 3 2 5 0 8M26 5c-2 3 2 5 0 8M34 6c-2 3 2 5 0 8" fill="none" stroke={k} strokeWidth={3} strokeLinecap="round" opacity={0.6} />
      </G>);
    case 'shoe':
      return (<G>
        <Path d="M6 30l2-14h10c1 5 6 8 12 8 6 0 12 3 13 9v3H6Z" fill={k} />
        <Rect x={6} y={33} width={37} height={5} rx={2.5} fill={m} />
      </G>);
  }
}
