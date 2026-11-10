import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from './storage';

export type Lang = 'en' | 'ar';
export type Mobility = 'manual' | 'power' | 'walker-crutches' | 'other' | 'none';
export type CheckIn = 'important' | 'encouragement' | 'keepGoing';

type SettingsState = {
  lang: Lang | null;
  onboarded: boolean;
  appearance: 'system' | 'light' | 'dark';
  highContrast: boolean;
  reduceMotion: boolean;
  textScale: number;
  /** How I move. Empty means not set. */
  mobility: Mobility[];
  mobilityOther: string;
  forWhom: 'me' | 'someone' | null;
  checkIn: CheckIn;
  quietHours: boolean;
  pausedUntil: string | null;
  notify: { bookings: boolean; orders: boolean; events: boolean; places: boolean; news: boolean };
  set: (patch: Partial<Omit<SettingsState, 'set'>>) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      lang: null,
      onboarded: false,
      appearance: 'system',
      highContrast: false,
      reduceMotion: false,
      textScale: 1,
      mobility: [],
      mobilityOther: '',
      forWhom: null,
      checkIn: 'encouragement',
      quietHours: true,
      pausedUntil: null,
      notify: { bookings: true, orders: true, events: true, places: true, news: false },
      set: (patch) => set(patch),
    }),
    { name: 'movo.settings', storage: persistStorage },
  ),
);

export function primaryMobility(m: Mobility[]): Exclude<Mobility, 'none'> | null {
  const first = m.find((x) => x !== 'none');
  return (first as Exclude<Mobility, 'none'>) ?? null;
}

/** True once saved settings have loaded from storage. */
export function useSettingsHydrated() {
  return useSyncExternalStore(
    (cb) => useSettings.persist.onFinishHydration(cb),
    () => useSettings.persist.hasHydrated(),
    () => false,
  );
}
