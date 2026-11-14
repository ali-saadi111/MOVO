import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { useSettings } from '@/stores/settings';
import { useLocaleDirection } from '@/i18n';
import { dark, darkTints, light, lightTints, withHighContrast, type ColorTokens, type Tints } from './colors';

export type Theme = {
  scheme: 'light' | 'dark';
  colors: ColorTokens;
  /** Content palette: soft tile colours with a matching ink. */
  tints: Tints;
  highContrast: boolean;
  reduceMotion: boolean;
  rtl: boolean;
  textScale: number;
};

export function useTheme(): Theme {
  const system = useColorScheme();
  const appearance = useSettings((s) => s.appearance);
  const highContrast = useSettings((s) => s.highContrast);
  const forceReduceMotion = useSettings((s) => s.reduceMotion);
  const textScale = useSettings((s) => s.textScale);
  const systemReduced = useReducedMotion();
  const rtl = useLocaleDirection() === 'rtl';
  const scheme: 'light' | 'dark' = appearance === 'system' ? (system === 'dark' ? 'dark' : 'light') : appearance;

  return useMemo(() => {
    const base = scheme === 'dark' ? dark : light;
    return {
      scheme,
      colors: highContrast ? withHighContrast(base, scheme) : base,
      tints: scheme === 'dark' ? darkTints : lightTints,
      highContrast,
      reduceMotion: forceReduceMotion || systemReduced,
      rtl,
      textScale,
    };
  }, [scheme, highContrast, forceReduceMotion, systemReduced, rtl, textScale]);
}
