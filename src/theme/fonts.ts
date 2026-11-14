import { NotoSans_400Regular, NotoSans_500Medium, NotoSans_600SemiBold, NotoSans_700Bold, NotoSans_800ExtraBold } from '@expo-google-fonts/noto-sans';
import { NotoSansArabic_400Regular, NotoSansArabic_500Medium, NotoSansArabic_600SemiBold, NotoSansArabic_700Bold, NotoSansArabic_800ExtraBold } from '@expo-google-fonts/noto-sans-arabic';
import type { TextStyle } from 'react-native';

/**
 * Movo's type: Noto Sans for Latin text and its twin Noto Sans Arabic for Arabic, so both
 * scripts read as one family. Each weight is its own family on iOS, so the weight a
 * style asks for is mapped to a family here. Light (300) maps to Regular.
 */
export const fontFiles = {
  NotoSans_400Regular, NotoSans_500Medium, NotoSans_600SemiBold, NotoSans_700Bold, NotoSans_800ExtraBold,
  NotoSansArabic_400Regular, NotoSansArabic_500Medium, NotoSansArabic_600SemiBold, NotoSansArabic_700Bold, NotoSansArabic_800ExtraBold,
};

const LATIN: Record<number, string> = { 300: 'NotoSans_400Regular', 400: 'NotoSans_400Regular', 500: 'NotoSans_500Medium', 600: 'NotoSans_600SemiBold', 700: 'NotoSans_700Bold', 800: 'NotoSans_800ExtraBold' };
const ARABIC: Record<number, string> = { 300: 'NotoSansArabic_400Regular', 400: 'NotoSansArabic_400Regular', 500: 'NotoSansArabic_500Medium', 600: 'NotoSansArabic_600SemiBold', 700: 'NotoSansArabic_700Bold', 800: 'NotoSansArabic_800ExtraBold' };

export function fontFor(weight: TextStyle['fontWeight'], rtl: boolean) {
  const n = weight === 'bold' ? 700 : weight === 'normal' || weight == null ? 400 : Number(weight) || 400;
  const w = Math.min(800, Math.max(300, Math.round(n / 100) * 100));
  return (rtl ? ARABIC : LATIN)[w];
}

/** For TextInput and other raw RN text. */
export const bodyFont = (rtl: boolean) => fontFor('400', rtl);
