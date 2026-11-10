import LiquidGlass from 'liquid-glass-react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

/**
 * Web preview of Liquid Glass, built on rdev/liquid-glass-react: the full effect,
 * an SVG displacement map that bends the content behind the glass at its rim,
 * chromatic aberration, backdrop blur, rim light and specular shine. Nothing else is
 * layered on it: the library draws its own rim, shine and shadow. Chromium shows the refraction;
 * Safari and Firefox get the blur and rim only. The phone build uses Apple's own
 * Liquid Glass through expo-glass-effect instead (LiquidGlass.tsx).
 */
export function LiquidGlassFill({ width, height, radius, displacement = 64, elasticity = 0 }: { width: number; height: number; radius: number; tint?: number; displacement?: number; elasticity?: number }) {
  const t = useTheme();
  const dark = t.scheme === 'dark';
  if (!width || !height) return null;
  return (
    <View pointerEvents={elasticity ? 'auto' : 'none'} style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, { borderRadius: radius }]}>
        <LiquidGlass
          displacementScale={displacement}
          blurAmount={0.08}
          saturation={180}
          aberrationIntensity={2}
          elasticity={elasticity}
          cornerRadius={radius}
          padding="0"
          overLight={!dark}
          mode="standard"
          style={{ position: 'absolute', top: '50%', left: '50%' }}
        >
          <div style={{ width, height }} />
        </LiquidGlass>
      </View>
    </View>
  );
}
