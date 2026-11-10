import { PixelRatio, type TextStyle } from 'react-native';

export type TypeVariant =
  | 'largeTitle'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'headline'
  | 'body'
  | 'callout'
  | 'subheadline'
  | 'footnote'
  | 'caption1'
  | 'caption2';

type Ramp = 'largeTitle' | 'title1' | 'title2' | 'title3' | 'headline' | 'body' | 'callout' | 'subheadline' | 'footnote' | 'caption1' | 'caption2';
type Spec = { size: number; line: number; weight: TextStyle['fontWeight']; ramp: Ramp };

/** Apple Dynamic Type at the default (Large) setting, in pt. */
export const typeScale: Record<TypeVariant, Spec> = {
  largeTitle: { size: 34, line: 41, weight: '700', ramp: 'largeTitle' },
  title1: { size: 28, line: 34, weight: '700', ramp: 'title1' },
  title2: { size: 22, line: 28, weight: '700', ramp: 'title2' },
  title3: { size: 20, line: 25, weight: '600', ramp: 'title3' },
  headline: { size: 17, line: 22, weight: '600', ramp: 'headline' },
  body: { size: 17, line: 22, weight: '400', ramp: 'body' },
  callout: { size: 16, line: 21, weight: '400', ramp: 'callout' },
  subheadline: { size: 15, line: 20, weight: '400', ramp: 'subheadline' },
  footnote: { size: 13, line: 18, weight: '400', ramp: 'footnote' },
  caption1: { size: 12, line: 16, weight: '400', ramp: 'caption1' },
  caption2: { size: 11, line: 13, weight: '400', ramp: 'caption2' },
};

const smallFromBody: TypeVariant[] = ['body', 'callout', 'subheadline', 'footnote', 'caption1', 'caption2'];

/**
 * Build a text style. Font family stays unset (system SF Pro / SF Arabic), and so
 * does letterSpacing: the system applies Apple's tracking per size.
 */
export function textStyle(variant: TypeVariant, opts: { rtl: boolean; extraScale?: number }): TextStyle {
  const s = typeScale[variant];
  const scale = opts.extraScale ?? 1;
  let size = s.size * scale;
  let line = s.line * scale;
  let weight = s.weight;
  if (opts.rtl) {
    if (smallFromBody.includes(variant)) line += 4;
    if (size < 12) size = 12;
    if (weight === '700' && size < 17) weight = '600';
  }
  return {
    // dynamicTypeRamp: iOS grows each style on Apple's curve.
    fontSize: size,
    lineHeight: line,
    fontWeight: weight,
    ...({ dynamicTypeRamp: s.ramp } as object),
  } as TextStyle;
}

/** Above ~1.6x, horizontal key–value pairs stack vertically (prompt §2.3). */
export function isLargeText(extraScale = 1) {
  return PixelRatio.getFontScale() * extraScale >= 1.6;
}
