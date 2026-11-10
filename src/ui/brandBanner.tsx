import { useId } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/theme';
import { Text } from './Text';

/**
 * Movo's campaign look (from the Beirut Wheelchair Marathon key visuals):
 * heavy slanted headline, second line in mint, small tracked caption, and
 * either a navy night with a glowing mint swoosh or a cream day with a mint track.
 */
export type BrandTone = 'navy' | 'cream';

export function BannerBackdrop({ tone, width, height }: { tone: BrandTone; width: number; height: number }) {
  const w = width;
  const h = height;
  // Gradient ids are global on web; a shared id breaks when the first copy sits in a hidden tab.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  if (tone === 'navy') {
    return (
      <Svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0 }}>
        <Defs>
          <LinearGradient id={`nv${uid}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#0A3F52" />
            <Stop offset="1" stopColor="#01212E" />
          </LinearGradient>
          <RadialGradient id={`nvGlow${uid}`} cx="80%" cy="85%" rx="60%" ry="45%">
            <Stop offset="0" stopColor="#22D39C" stopOpacity={0.35} />
            <Stop offset="1" stopColor="#22D39C" stopOpacity={0} />
          </RadialGradient>
          <LinearGradient id={`sw${uid}`} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#22D39C" stopOpacity={0} />
            <Stop offset="0.55" stopColor="#3CF2B8" stopOpacity={0.95} />
            <Stop offset="1" stopColor="#22D39C" stopOpacity={0.2} />
          </LinearGradient>
        </Defs>
        <Rect width={w} height={h} fill={`url(#nv${uid})`} />
        <Rect width={w} height={h} fill={`url(#nvGlow${uid})`} />
        {[0, 1, 2, 3].map((i) => (
          <Path key={i} d={`M ${-w * 0.1} ${h * (1.02 - i * 0.03)} C ${w * 0.35} ${h * (0.95 - i * 0.04)}, ${w * 0.6} ${h * (0.78 - i * 0.05)}, ${w * 1.1} ${h * (0.42 - i * 0.06)}`}
            stroke={`url(#sw${uid})`} strokeWidth={i === 1 ? 5 : 1.5} strokeOpacity={i === 1 ? 0.9 : 0.45} fill="none" strokeLinecap="round" />
        ))}
      </Svg>
    );
  }
  return (
    <Svg width={w} height={h} style={{ position: 'absolute', top: 0, left: 0 }}>
      <Rect width={w} height={h} fill="#FBF8F2" />
      <Path d={`M 0 ${h * 0.7} C ${w * 0.3} ${h * 0.62}, ${w * 0.55} ${h * 0.66}, ${w} ${h * 0.6} L ${w} ${h * 0.72} C ${w * 0.6} ${h * 0.7}, ${w * 0.3} ${h * 0.74}, 0 ${h * 0.78} Z`} fill="#CFEFE3" opacity={0.7} />
      <Path d={`M 0 ${h * 0.86} C ${w * 0.4} ${h * 0.74}, ${w * 0.7} ${h * 0.72}, ${w} ${h * 0.68} L ${w} ${h} L 0 ${h} Z`} fill="#3CC59A" />
      {[0.3, 0.62].map((k) => (
        <Path key={k} d={`M 0 ${h * (0.86 + k * 0.14)} C ${w * 0.4} ${h * (0.74 + k * 0.2)}, ${w * 0.7} ${h * (0.72 + k * 0.22)}, ${w} ${h * (0.68 + k * 0.25)}`} stroke="#FFFFFF" strokeWidth={2.5} fill="none" opacity={0.85} />
      ))}
    </Svg>
  );
}

/** Headline in the campaign style. The slant is applied to Lexend, which has no italic. */
export function BannerHeadline({ top, bottom, caption, tone, size = 40, style }: { top: string; bottom: string; caption?: string; tone: BrandTone; size?: number; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const ink = tone === 'navy' ? '#FFFFFF' : '#0B2A38';
  const slant = t.rtl ? undefined : { transform: [{ skewX: '-9deg' }] };
  return (
    <View style={[{ gap: 2 }, style]}>
      <Text weight="800" style={[{ fontSize: size, lineHeight: size * 1.02, color: ink, letterSpacing: -0.5 }, slant]}>{top}</Text>
      <Text weight="800" style={[{ fontSize: size, lineHeight: size * 1.02, color: tone === 'navy' ? '#3CF2B8' : '#1FCB8E', letterSpacing: -0.5 }, slant]}>{bottom}</Text>
      {caption ? <Text weight="600" style={{ fontSize: 11, letterSpacing: t.rtl ? 0 : 2.6, color: ink, marginTop: 8, opacity: 0.9 }}>{caption}</Text> : null}
    </View>
  );
}

/** A full banner: backdrop plus headline, with an optional picture on the end side. */
export function BrandBanner({ tone, top, bottom, caption, width, height, radius = 0, children, size }: { tone: BrandTone; top: string; bottom: string; caption?: string; width: number; height: number; radius?: number; children?: React.ReactNode; size?: number }) {
  return (
    <View style={{ width, height, borderRadius: radius, overflow: 'hidden', justifyContent: 'center' }}>
      <BannerBackdrop tone={tone} width={width} height={height} />
      {children}
      <BannerHeadline tone={tone} top={top} bottom={bottom} caption={caption} size={size ?? Math.min(44, width / 8.5)} style={{ paddingHorizontal: 24 }} />
    </View>
  );
}
