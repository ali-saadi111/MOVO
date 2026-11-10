import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from './storage';

/** Things the member has done in this session of the draft (bookings, orders, saves…). */
export type MyBooking = { id: string; specialistId: string; serviceId: string; startsAt: string; where: 'home' | 'clinic'; payment: string; status: 'upcoming' | 'past' | 'cancelled' };
export type MyOrder = { id: string; lines: { productId: string; qty: number }[]; totalCents: number; payment: string; placedAt: string; status: 'confirmed' | 'packed' | 'onTheWay' | 'delivered' };
export type MyEvent = { eventId: string; code: string; spots: number };
export type MyDonation = { campaignId: string; amountCents: number; at: string };

type ActivityState = {
  saved: string[];
  bookings: MyBooking[];
  orders: MyOrder[];
  events: MyEvent[];
  donations: MyDonation[];
  readNotifications: string[];
  toggleSaved: (placeId: string) => void;
  addBooking: (b: MyBooking) => void;
  cancelBooking: (id: string) => void;
  addOrder: (o: MyOrder) => void;
  joinEvent: (e: MyEvent) => void;
  leaveEvent: (eventId: string) => void;
  donate: (d: MyDonation) => void;
  markRead: (id: string) => void;
  markAllRead: (ids: string[]) => void;
};

export const useActivity = create<ActivityState>()(
  persist(
    (set) => ({
      saved: ['plc_cafe_rami', 'plc_zaitunay'],
      bookings: [
        { id: 'bk_1001', specialistId: 'sp_maya', serviceId: 'svc_physio_home', startsAt: nextWeekday(2, 10), where: 'home', payment: 'cash', status: 'upcoming' },
      ],
      orders: [
        { id: 'M-1038', lines: [{ productId: 'prd_reacher-pro-82', qty: 1 }], totalCents: 3400, payment: 'cash', placedAt: daysAgo(9), status: 'delivered' },
      ],
      events: [],
      donations: [],
      readNotifications: [],
      toggleSaved: (id) => set((s) => ({ saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id] })),
      addBooking: (b) => set((s) => ({ bookings: [b, ...s.bookings] })),
      cancelBooking: (id) => set((s) => ({ bookings: s.bookings.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)) })),
      addOrder: (o) => set((s) => ({ orders: [o, ...s.orders] })),
      joinEvent: (e) => set((s) => ({ events: [...s.events.filter((x) => x.eventId !== e.eventId), e] })),
      leaveEvent: (eventId) => set((s) => ({ events: s.events.filter((x) => x.eventId !== eventId) })),
      donate: (d) => set((s) => ({ donations: [d, ...s.donations] })),
      markRead: (id) => set((s) => ({ readNotifications: [...new Set([...s.readNotifications, id])] })),
      markAllRead: (ids) => set((s) => ({ readNotifications: [...new Set([...s.readNotifications, ...ids])] })),
    }),
    { name: 'movo.activity', storage: persistStorage },
  ),
);

function nextWeekday(dow: number, hour: number) {
  const d = new Date();
  const diff = (dow - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 0, 0, 0);
  return d.toISOString();
}
