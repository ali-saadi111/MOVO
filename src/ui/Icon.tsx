import { MaterialSymbols_400Regular_Filled } from '@expo-google-fonts/material-symbols/400Regular_Filled';
import { MaterialSymbols_600SemiBold_Filled } from '@expo-google-fonts/material-symbols/600SemiBold_Filled';
import { SymbolView, type AnimationSpec, type SymbolWeight } from 'expo-symbols';
import { memo } from 'react';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';

import { useTheme, type ColorTokens } from '@/theme';
import { SYMBOLS, type IconName } from './symbols';

export type IconProps = {
  name: IconName;
  size?: number;
  weight?: SymbolWeight;
  rendering?: 'monochrome' | 'hierarchical';
  color?: keyof ColorTokens | { raw: ColorValue };
  mirrorInRTL?: boolean;
  effect?: 'bounce' | 'pulse' | 'none';
  /** Change this to replay the effect once. */
  effectKey?: number;
  /** Solid glyph on web/Android. On by default for `.fill` symbols, like iOS. */
  fill?: boolean;
  style?: StyleProp<ViewStyle>;
};

// The Material fallback font is outline-only, so `.fill` symbols looked hollow on web.
const FILLED_REGULAR = { name: 'MaterialSymbols_400Regular_Filled', font: MaterialSymbols_400Regular_Filled };
const FILLED_BOLD = { name: 'MaterialSymbols_600SemiBold_Filled', font: MaterialSymbols_600SemiBold_Filled };

export const Icon = memo(function Icon({ name, size = 17, weight = 'regular', rendering = 'monochrome', color = 'textPrimary', mirrorInRTL, effect = 'none', effectKey, fill, style }: IconProps) {
  const t = useTheme();
  const tint = typeof color === 'object' ? color.raw : t.colors[color];
  const spec: AnimationSpec | undefined =
    effect !== 'none' && !t.reduceMotion && effectKey ? { effect: { type: effect, wholeSymbol: true }, repeating: false } : undefined;
  const solid = fill ?? /\.fill\b|filled/.test(name);
  const heavy = weight === 'semibold' || weight === 'bold' || weight === 'heavy' || weight === 'black';
  const symbolWeight = solid ? { ios: weight, android: heavy ? FILLED_BOLD : FILLED_REGULAR } : weight;
  return (
    <SymbolView
      key={effectKey}
      name={{ ios: name, android: SYMBOLS[name], web: SYMBOLS[name] }}
      size={size}
      weight={symbolWeight}
      type={rendering}
      tintColor={tint}
      animationSpec={spec}
      style={[{ width: size, height: size }, mirrorInRTL && t.rtl ? { transform: [{ scaleX: -1 }] } : null, style]}
      accessible={false}
      importantForAccessibility="no"
    />
  );
});
