import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from './storage';

/** Form drafts are never lost (cross-cutting rule 8). */
type DraftsState = {
  drafts: Record<string, Record<string, unknown>>;
  save: (key: string, value: Record<string, unknown>) => void;
  clear: (key: string) => void;
};

export const useDrafts = create<DraftsState>()(
  persist(
    (set) => ({
      drafts: {},
      save: (key, value) => set((s) => ({ drafts: { ...s.drafts, [key]: value } })),
      clear: (key) => set((s) => { const d = { ...s.drafts }; delete d[key]; return { drafts: d }; }),
    }),
    { name: 'movo.drafts', storage: persistStorage },
  ),
);

/** Stable empty draft so selectors don't return a new object every render. */
export const EMPTY_DRAFT: Record<string, never> = Object.freeze({}) as Record<string, never>;
