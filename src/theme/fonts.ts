import { Lexend_300Light, Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold, Lexend_700Bold, Lexend_800ExtraBold } from '@expo-google-fonts/lexend';
import { IBMPlexSansArabic_400Regular, IBMPlexSansArabic_500Medium, IBMPlexSansArabic_600SemiBold, IBMPlexSansArabic_700Bold } from '@expo-google-fonts/ibm-plex-sans-arabic';
import type { TextStyle } from 'react-native';

/**
 * Movo's type: Lexend (the brand font, built for reading ease) for Latin text and
 * IBM Plex Sans Arabic for Arabic. Each weight is its own family on iOS, so the
 * weight a style asks for is mapped to a family here.
 */
export const fontFiles = {
  Lexend_300Light, Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold, Lexend_700Bold, Lexend_800ExtraBold,
  IBMPlexSansArabic_400Regular, IBMPlexSansArabic_500Medium, IBMPlexSansArabic_600SemiBold, IBMPlexSansArabic_700Bold,
};

const LATIN: Record<number, string> = { 300: 'Lexend_300Light', 400: 'Lexend_400Regular', 500: 'Lexend_500Medium', 600: 'Lexend_600SemiBold', 700: 'Lexend_700Bold', 800: 'Lexend_800ExtraBold' };
const ARABIC: Record<number, string> = { 300: 'IBMPlexSansArabic_400Regular', 400: 'IBMPlexSansArabic_400Regular', 500: 'IBMPlexSansArabic_500Medium', 600: 'IBMPlexSansArabic_600SemiBold', 700: 'IBMPlexSansArabic_700Bold', 800: 'IBMPlexSansArabic_700Bold' };

export function fontFor(weight: TextStyle['fontWeight'], rtl: boolean) {
  const n = weight === 'bold' ? 700 : weight === 'normal' || weight == null ? 400 : Number(weight) || 400;
  const w = Math.min(800, Math.max(300, Math.round(n / 100) * 100));
  return (rtl ? ARABIC : LATIN)[w];
}

/** For TextInput and other raw RN text. */
export const bodyFont = (rtl: boolean) => fontFor('400', rtl);
