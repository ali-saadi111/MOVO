import { sync } from '@/data';
import { useActivity } from '@/stores/activity';
import { useCart } from '@/stores/cart';

export type FlowParams = Record<string, string | undefined>;

/** Applies a completed flow to local state and returns the id to show on the confirmation. */
export function commitFlow(p: FlowParams): string {
  const act = useActivity.getState();
  if (p.flow === 'order') {
    const lines = useCart.getState().lines;
    const id = `M-${1040 + act.orders.length + 1}`;
    act.addOrder({ id, lines, totalCents: Number(p.total ?? 0), payment: p.method ?? 'cash', placedAt: new Date().toISOString(), status: 'confirmed' });
    useCart.getState().clear();
    return id;
  }
  if (p.flow === 'booking') {
    const id = `bk_${Date.now().toString().slice(-5)}`;
    act.addBooking({ id, specialistId: p.specialist!, serviceId: p.service!, startsAt: p.at!, where: (p.where as 'home' | 'clinic') ?? 'home', payment: p.method ?? 'cash', status: 'upcoming' });
    return id;
  }
  if (p.flow === 'event') {
    const code = `MV-${Math.floor(1000 + Math.random() * 8999)}`;
    act.joinEvent({ eventId: p.event!, code, spots: Number(p.spots ?? 1) });
    return code;
  }
  if (p.flow === 'donation') {
    act.donate({ campaignId: p.campaign!, amountCents: Number(p.total ?? 0), at: new Date().toISOString() });
    return p.campaign!;
  }
  return '';
}

export const flowExists = (p: FlowParams) => (p.flow === 'booking' ? !!sync.specialist(p.specialist ?? '') : true);
