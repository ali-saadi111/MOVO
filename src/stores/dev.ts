import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from './storage';

export type PaymentOutcome = 'success' | 'failed' | 'slow';

/** Dev menu toggles (prompt §6). */
type DevState = {
  latency: boolean;
  forceError: boolean;
  forceEmpty: boolean;
  offline: boolean;
  homeTab: boolean;
  paymentOutcome: PaymentOutcome;
  slotTaken: boolean;
  set: (p: Partial<Omit<DevState, 'set'>>) => void;
};

export const useDev = create<DevState>()(
  persist(
    (set) => ({
      latency: true,
      forceError: false,
      forceEmpty: false,
      offline: false,
      homeTab: false,
      paymentOutcome: 'success',
      slotTaken: false,
      set: (p) => set(p),
    }),
    { name: 'movo.dev', storage: persistStorage },
  ),
);
