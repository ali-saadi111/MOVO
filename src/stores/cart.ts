import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from './storage';

export type CartLine = { productId: string; qty: number };

type CartState = {
  lines: CartLine[];
  /** Bumps on every add so the nav-bar cart symbol can bounce once. */
  addTick: number;
  add: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      addTick: 0,
      add: (productId, qty = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => l.productId === productId);
          const lines = existing
            ? s.lines.map((l) => (l.productId === productId ? { ...l, qty: l.qty + qty } : l))
            : [...s.lines, { productId, qty }];
          return { lines, addTick: s.addTick + 1 };
        }),
      setQty: (productId, qty) =>
        set((s) => ({ lines: s.lines.map((l) => (l.productId === productId ? { ...l, qty } : l)) })),
      remove: (productId) => set((s) => ({ lines: s.lines.filter((l) => l.productId !== productId) })),
      clear: () => set({ lines: [] }),
    }),
    { name: 'movo.cart', storage: persistStorage, partialize: (s) => ({ lines: s.lines }) },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty, 0);
