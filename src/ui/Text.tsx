import { forwardRef, type ComponentRef } from 'react';
import { StyleSheet, Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { textStyle, useTheme, type ColorTokens, type TypeVariant } from '@/theme';
import { fontFor } from '@/theme/fonts';

export type TextColor = keyof Pick<ColorTokens, 'textPrimary' | 'textSecondary' | 'textTertiary' | 'textOnBrand' | 'tint' | 'accentText' | 'danger' | 'buttonPrimaryFg' | 'buttonSecondaryFg' | 'ratingPartly' | 'ratingNot' | 'accent'>;

export type TextProps = RNTextProps & {
  variant?: TypeVariant;
  color?: TextColor;
  weight?: TextStyle['fontWeight'];
  tabular?: boolean;
  align?: 'auto' | 'center';
  /** Wordmark and welcome hero only (open question 2). */
  display?: boolean;
};


export const Text = forwardRef<ComponentRef<typeof RNText>, TextProps>(function Text(
  { variant = 'body', color = 'textPrimary', weight, tabular, align, display: _display, style, ...rest },
  ref,
) {
  const t = useTheme();
  const base = textStyle(variant, { rtl: t.rtl, extraScale: t.textScale });
  const w = StyleSheet.flatten([base, weight ? { fontWeight: weight } : null, style])?.fontWeight;
  const family = fontFor(w, t.rtl);
  return (
    <RNText
      ref={ref}
      allowFontScaling
      {...rest}
      style={[
        base,
        { color: t.colors[color] },
        weight ? { fontWeight: weight } : null,
        tabular ? { fontVariant: ['tabular-nums'] } : null,
        align === 'center' ? { textAlign: 'center' } : { textAlign: 'auto' },
        style,
        // The family carries the weight; a separate fontWeight would make iOS fake-bold it.
        { fontFamily: family, fontWeight: 'normal' as TextStyle['fontWeight'] },
      ]}
    />
  );
});
