import { useWindowDimensions } from 'react-native';

/**
 * Screen size classes for iPhones.
 * - short: home-button iPhones (SE, 667pt tall). Less vertical room, no home indicator.
 * - narrow: 375pt wide (SE, mini). Tighter gutters and smaller display type.
 * - wide: Plus / Pro Max (428pt and up).
 * `fit(n)` scales a size from the 393pt design width, clamped so text never shrinks below ~92%.
 */
export function useScreen() {
  const { width, height } = useWindowDimensions();
  const short = height < 700;
  const narrow = width < 385;
  const wide = width >= 428;
  const k = Math.min(1.08, Math.max(0.92, width / 393));
  return {
    width,
    height,
    short,
    narrow,
    wide,
    gutter: narrow ? 16 : 20,
    fit: (n: number) => Math.round(n * k),
    /** Height-aware size: scales by screen height against the 852pt design height. */
    fitH: (n: number, min = 0.72) => Math.round(n * Math.min(1.1, Math.max(min, height / 852))),
  };
}
