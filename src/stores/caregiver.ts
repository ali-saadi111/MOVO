import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Mobility } from './settings';
import { persistStorage } from './storage';

export type CaredPerson = { id: string; firstName: string; mobility: Mobility[]; relationship: string };

type CaregiverState = {
  people: CaredPerson[];
  actingFor: string | null;
  add: (p: CaredPerson) => void;
  remove: (id: string) => void;
  switchTo: (id: string | null) => void;
};

export const useCaregiver = create<CaregiverState>()(
  persist(
    (set) => ({
      people: [{ id: 'cp_sara', firstName: 'Sara', mobility: ['power'], relationship: 'Daughter' }],
      actingFor: null,
      add: (p) => set((s) => ({ people: [...s.people, p] })),
      remove: (id) => set((s) => ({ people: s.people.filter((x) => x.id !== id), actingFor: s.actingFor === id ? null : s.actingFor })),
      switchTo: (actingFor) => set({ actingFor }),
    }),
    { name: 'movo.caregiver', storage: persistStorage },
  ),
);

export function useActingPerson() {
  return useCaregiver((s) => s.people.find((p) => p.id === s.actingFor) ?? null);
}
