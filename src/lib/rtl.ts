import { I18nManager, Platform } from 'react-native';
import * as Updates from 'expo-updates';

/**
 * Apply layout direction for a language. Native needs a reload for I18nManager to
 * take effect (open question 7); web flips the root direction live.
 */
export async function applyDirection(rtl: boolean) {
  if (Platform.OS === 'web') return;
  if (I18nManager.isRTL === rtl) return;
  I18nManager.allowRTL(rtl);
  I18nManager.forceRTL(rtl);
  try {
    await Updates.reloadAsync();
  } catch {
    // In Expo Go dev mode reloadAsync may be unavailable; the next launch applies it.
  }
}

/** Use for LTR-only runs inside Arabic text: prices, phone numbers, order codes. */
export const LRI = '⁦';
export const PDI = '⁩';
export const ltr = (s: string) => `${LRI}${s}${PDI}`;

type Edge = number | `${number}%`;
/**
 * Absolute start/end offsets that follow the reading direction everywhere.
 * Native flips start/end through I18nManager; web only flips them under a real
 * `dir`, so there we map to left/right ourselves.
 */
export function edges(rtl: boolean, e: { start?: Edge; end?: Edge }) {
  if (Platform.OS !== 'web') return e;
  const out: { left?: Edge; right?: Edge } = {};
  if (e.start !== undefined) out[rtl ? 'right' : 'left'] = e.start;
  if (e.end !== undefined) out[rtl ? 'left' : 'right'] = e.end;
  return out;
}
