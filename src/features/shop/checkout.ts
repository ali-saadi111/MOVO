import type { PayMethod } from '@/ui';
import { EMPTY_DRAFT, useDrafts } from '@/stores/drafts';

export const SAVED_ADDRESSES = [
  { id: 'home', title: 'Home', sub: 'Hamra, Makdessi St, Bldg 14, 3rd floor' },
  { id: 'work', title: 'Mum’s place', sub: 'Saida, Riad El Solh St, Bldg 2, ground floor' },
];

export type CheckoutDraft = { addr: string; phone: string; notes: string; area: string; street: string; floor: string; pay: PayMethod };

const DEFAULTS: CheckoutDraft = { addr: 'home', phone: '+961 70 123 456', notes: '', area: '', street: '', floor: '', pay: 'cash' };

/** One checkout draft (address, phone, note, payment), kept across launches so nothing typed is lost. */
export function useCheckoutDraft() {
  const raw = useDrafts((s) => s.drafts.delivery ?? EMPTY_DRAFT) as Partial<CheckoutDraft>;
  const save = useDrafts((s) => s.save);
  const draft: CheckoutDraft = { ...DEFAULTS, ...raw };
  const set = (patch: Partial<CheckoutDraft>) => save('delivery', { ...draft, ...patch });
  return [draft, set] as const;
}

export function addressLine(d: CheckoutDraft): { title: string; sub: string } | null {
  const saved = SAVED_ADDRESSES.find((a) => a.id === d.addr);
  if (saved) return saved;
  if (!d.street.trim()) return null;
  return { title: d.area || d.street, sub: [d.area, d.street, d.floor ? `floor ${d.floor}` : ''].filter(Boolean).join(', ') };
}
