import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { continuous, useTheme } from '@/theme';

type Props = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** 'chrome' for bars, StickyCTA and controls; 'thick' for the map sheet. */
  material?: 'chrome' | 'thick';
  radius?: number;
  interactive?: boolean;
};

let liquid: boolean | null = null;
const hasLiquidGlass = () => {
  if (liquid === null) {
    try {
      liquid = Platform.OS === 'ios' && isLiquidGlassAvailable();
    } catch {
      liquid = false;
    }
  }
  return liquid;
};

function useReduceTransparency() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (Platform.OS === 'web') return;
    AccessibilityInfo.isReduceTransparencyEnabled().then(setOn).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setOn);
    return () => sub.remove();
  }, []);
  return on;
}

/**
 * The only place glass and blur are implemented (prompt §2.5). Liquid Glass on
 * iOS 26+, a system material blur before that, and opaque with a hairline under
 * Reduce Transparency or high contrast. Navigation layer only — never on content.
 */
export function GlassSurface({ children, style, material = 'chrome', radius = 0, interactive }: Props) {
  const t = useTheme();
  const reduce = useReduceTransparency();
  const shape: ViewStyle = { borderRadius: radius, overflow: 'hidden', ...continuous };

  if (reduce || t.highContrast) {
    return (
      <View style={[shape, { backgroundColor: t.colors.bgElevated, borderWidth: StyleSheet.hairlineWidth, borderColor: t.colors.separator }, style]}>
        {children}
      </View>
    );
  }
  if (hasLiquidGlass()) {
    return (
      <GlassView glassEffectStyle="regular" isInteractive={interactive} style={[shape, style]}>
        {children}
      </GlassView>
    );
  }
  if (Platform.OS === 'web') {
    // Web preview: CSS backdrop blur under a near-opaque material tint, close to iOS system materials.
    const bg = t.scheme === 'dark' ? (material === 'thick' ? 'rgba(28,28,30,0.92)' : 'rgba(30,30,32,0.72)') : material === 'thick' ? 'rgba(250,251,251,0.93)' : 'rgba(255,255,255,0.8)';
    return (
      <View style={[shape, { backgroundColor: bg, borderWidth: StyleSheet.hairlineWidth, borderColor: t.colors.separator, backdropFilter: 'saturate(180%) blur(24px)' } as ViewStyle, style]}>
        {children}
      </View>
    );
  }
  const tint = Platform.OS === 'ios' ? (material === 'thick' ? 'systemThickMaterial' : 'systemChromeMaterial') : t.scheme === 'dark' ? 'dark' : 'light';
  return (
    <BlurView
      tint={tint}
      intensity={100}
      style={[shape, style]}
    >
      {children}
    </BlurView>
  );
}

export function GlassGroup({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  // GlassContainer merges neighbouring glass shapes on iOS 26; a plain View elsewhere.
  if (hasLiquidGlass()) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { GlassContainer } = require('expo-glass-effect');
    return <GlassContainer spacing={8} style={style}>{children}</GlassContainer>;
  }
  return <View style={style}>{children}</View>;
}
