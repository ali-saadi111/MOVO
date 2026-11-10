import { useState, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { continuous, useTheme } from '@/theme';
import { LiquidGlassFill } from './LiquidGlass.web';

type Props = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** 'chrome' for bars, StickyCTA and controls; 'thick' for the map sheet. */
  material?: 'chrome' | 'thick';
  radius?: number;
  interactive?: boolean;
};

/**
 * Web preview of the glass layer. Rounded chrome (pills, round buttons, the
 * Map/List switch) gets rdev/liquid-glass-react's refracting glass; square bars and
 * the thick map sheet keep a frosted material. High contrast turns it opaque.
 */
export function GlassSurface({ children, style, material = 'chrome', radius = 0 }: Props) {
  const t = useTheme();
  const [size, setSize] = useState({ w: 0, h: 0 });
  const shape: ViewStyle = { borderRadius: radius, ...continuous };
  const dark = t.scheme === 'dark';
  if (t.highContrast) {
    return <View style={[shape, { overflow: 'hidden', backgroundColor: t.colors.bgElevated, borderWidth: StyleSheet.hairlineWidth, borderColor: t.colors.separator }, style]}>{children}</View>;
  }
  if (material === 'chrome' && radius > 0) {
    return (
      <View onLayout={(e) => setSize({ w: Math.round(e.nativeEvent.layout.width), h: Math.round(e.nativeEvent.layout.height) })}
        style={[shape, style]}>
        <LiquidGlassFill width={size.w} height={size.h} radius={Math.min(radius, size.h / 2 || radius)} displacement={40} />
        {children}
      </View>
    );
  }
  const bg = dark ? (material === 'thick' ? 'rgba(28,28,30,0.92)' : 'rgba(30,30,32,0.72)') : material === 'thick' ? 'rgba(250,251,251,0.93)' : 'rgba(255,255,255,0.8)';
  return (
    <View style={[shape, { overflow: 'hidden', backgroundColor: bg, borderWidth: StyleSheet.hairlineWidth, borderColor: t.colors.separator, backdropFilter: 'saturate(180%) blur(24px)' } as ViewStyle, style]}>
      {children}
    </View>
  );
}

export function GlassGroup({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={style}>{children}</View>;
}
