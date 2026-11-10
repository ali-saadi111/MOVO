import LiquidGlass from 'liquid-glass-react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

// The library's refraction layer re-draws the content behind the bar sharp, which
// made labels hard to read over product text. Keep its rim light, shine and depth,
// and let the frosted base below do the blur.
if (typeof document !== 'undefined' && !document.getElementById('movo-glass-css')) {
  const el = document.createElement('style');
  el.id = 'movo-glass-css';
  el.textContent = '.movo-glass .glass__warp{display:none}';
  document.head.appendChild(el);
}

/**
 * Web preview of Liquid Glass with rdev/liquid-glass-react (its rim light, specular
 * shine and depth) over a frosted base. The phone build uses Apple's own Liquid
 * Glass through expo-glass-effect instead (LiquidGlass.tsx).
 */
export function LiquidGlassFill({ width, height, radius }: { width: number; height: number; radius: number }) {
  const t = useTheme();
  const dark = t.scheme === 'dark';
  if (!width || !height) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* frosted base so labels stay legible; the glass layer then bends it at the rim */}
      <View style={[StyleSheet.absoluteFill, { borderRadius: radius, backgroundColor: dark ? 'rgba(30,34,38,0.6)' : 'rgba(255,255,255,0.62)', backdropFilter: 'blur(10px) saturate(160%)', WebkitBackdropFilter: 'blur(10px) saturate(160%)', borderWidth: 1, borderColor: dark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.85)', boxShadow: dark ? 'inset 0 1px 0 rgba(255,255,255,0.12)' : 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(1,52,71,0.06)' } as ViewStyle]} />
      <View style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]}>
      <LiquidGlass
        displacementScale={56}
        blurAmount={0.06}
        saturation={170}
        aberrationIntensity={1.6}
        elasticity={0}
        cornerRadius={radius}
        padding="0"
        overLight={!dark}
        mode="standard"
        className="movo-glass"
        style={{ position: 'absolute', top: '50%', left: '50%' }}
      >
        <div style={{ width, height }} />
      </LiquidGlass>
      </View>
    </View>
  );
}
