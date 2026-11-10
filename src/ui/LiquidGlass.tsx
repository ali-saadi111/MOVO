import { StyleSheet, View } from 'react-native';

import { GlassSurface } from './GlassSurface';

/**
 * The tab bar's glass. On iOS 26 this is Apple's own Liquid Glass through
 * expo-glass-effect (UIGlassEffect), with a material blur on older systems.
 * The web build swaps in liquid-glass-react (LiquidGlass.web.tsx).
 */
export function LiquidGlassFill({ radius }: { width: number; height: number; radius: number; tint?: number; displacement?: number; elasticity?: number }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <GlassSurface radius={radius} interactive style={StyleSheet.absoluteFill} />
    </View>
  );
}
