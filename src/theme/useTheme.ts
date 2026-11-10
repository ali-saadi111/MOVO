import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { useSettings } from '@/stores/settings';
import { useLocaleDirection } from '@/i18n';
import { dark, light, withHighContrast, type ColorTokens } from './colors';

export type Theme = {
  scheme: 'light' | 'dark';
  colors: ColorTokens;
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
      highContrast,
      reduceMotion: forceReduceMotion || systemReduced,
      rtl,
      textScale,
    };
  }, [scheme, highContrast, forceReduceMotion, systemReduced, rtl, textScale]);
}
