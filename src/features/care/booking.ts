import { useQuery } from '@tanstack/react-query';

import { repos } from '@/data';
import type { Specialist } from '@/data';
import { SAVED_ADDRESSES } from '@/features/shop/checkout';
import { EMPTY_DRAFT, useDrafts } from '@/stores/drafts';
import type { PayMethod } from '@/ui';

export type Where = 'home' | 'clinic';

/** Choices made while booking care: where, which address, which service, how to pay. Kept across launches. */
export type CareDraft = { where: Where; addr: string; service: string; pay: PayMethod };

const DEFAULTS: CareDraft = { where: 'home', addr: 'home', service: '', pay: 'cash' };

export function useCareDraft() {
  const raw = useDrafts((s) => s.drafts.care ?? EMPTY_DRAFT) as Partial<CareDraft>;
  const save = useDrafts((s) => s.save);
  const draft: CareDraft = { ...DEFAULTS, ...raw };
  const set = (patch: Partial<CareDraft>) => save('care', { ...draftNow(), ...patch });
  return [draft, set] as const;
}

/** Latest draft straight from the store, so two quick edits don't overwrite each other. */
function draftNow(): CareDraft {
  return { ...DEFAULTS, ...((useDrafts.getState().drafts.care ?? {}) as Partial<CareDraft>) };
}

export const careAddress = (id: string) => SAVED_ADDRESSES.find((a) => a.id === id) ?? SAVED_ADDRESSES[0];

/** Where this specialist can actually see you, given what you asked for. */
export function whereFor(s: Specialist, wanted: Where): Where {
  if (wanted === 'home' && !s.homeVisit) return 'clinic';
  if (wanted === 'clinic' && !s.clinic) return 'home';
  return wanted;
}

/** The picked service if this specialist offers it, otherwise their first one. */
export function serviceFor(s: Specialist, id?: string) {
  return s.services.find((x) => x.id === id) ?? s.services[0];
}

/** The next free times over the coming days, soonest first. */
export function useNextFree(id: string, count = 3) {
  return useQuery({
    queryKey: ['nextFree', id, count],
    queryFn: async () => {
      const out: string[] = [];
      const day = new Date();
      day.setHours(0, 0, 0, 0);
      for (let i = 0; i < 7 && out.length < count; i++) {
        const slots = await repos.care.slots(id, day.toISOString());
        for (const s of slots) if (!s.taken && out.length < count) out.push(s.startsAt);
        day.setDate(day.getDate() + 1);
      }
      return out;
    },
  });
}

export const sameDay = (a: string, b: string) => new Date(a).toDateString() === new Date(b).toDateString();

/** Start of the day an ISO time falls on, as ISO (what DayStrip and slots expect). */
export function dayOf(iso: string) {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/** The plan in the draft is fixed at 8 sessions; real plans come from the specialist. */
export const PLAN = { done: 5, total: 8 };
