import { z } from 'zod';

import { useDev } from '@/stores/dev';
import { Campaign, MovoEvent, Notification, Place, Product, Slot, Specialist } from '../models';
import { campaigns, events, notifications } from '../fixtures/community';
import { places } from '../fixtures/places';
import productsJson from '../fixtures/products.json';
import { specialists } from '../fixtures/specialists';
import type { CareRepo, CommunityRepo, NotificationsRepo, PlacesRepo, ProductsRepo } from '../repositories';

export class OfflineError extends Error {}

const products = z.array(Product).parse(productsJson);
z.array(Place).parse(places);
z.array(Specialist).parse(specialists);
z.array(MovoEvent).parse(events);
z.array(Campaign).parse(campaigns);
z.array(Notification).parse(notifications);

/** 250–600 ms latency with error / empty / offline injection from the dev menu. */
async function respond<T>(value: T, emptyValue?: T): Promise<T> {
  const dev = useDev.getState();
  if (dev.latency) await new Promise((r) => setTimeout(r, 250 + Math.random() * 350));
  if (dev.offline) throw new OfflineError('offline');
  if (dev.forceError) throw new Error('forced');
  if (dev.forceEmpty && emptyValue !== undefined) return emptyValue;
  return structuredClone(value);
}
function find<T extends { id: string }>(list: T[], id: string) {
  const v = list.find((x) => x.id === id);
  if (!v) throw new Error(`not found: ${id}`);
  return v;
}

export const mockPlaces: PlacesRepo = {
  list: () => respond(places, []),
  get: (id) => respond(find(places, id)),
};

export const mockProducts: ProductsRepo = {
  list: (q = {}) => {
    let r = products;
    if (q.ids) r = q.ids.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => !!p);
    if (q.category) r = r.filter((p) => p.category === q.category);
    if (q.subcategory) r = r.filter((p) => p.subcategory === q.subcategory);
    if (q.search) {
      const s = q.search.toLowerCase();
      r = r.filter((p) => p.name.en.toLowerCase().includes(s) || (p.name.ar ?? '').includes(q.search!) || p.subcategory.includes(s));
    }
    return respond(r, []);
  },
  get: (id) => respond(find(products, id)),
};

export const mockCare: CareRepo = {
  specialists: (kind) => respond(kind ? specialists.filter((s) => s.kind === kind) : specialists, []),
  specialist: (id) => respond(find(specialists, id)),
  slots: (specialistId, day) => {
    const base = new Date(day);
    const hours = [9, 10, 11, 13, 14, 15, 16, 17];
    const seed = specialistId.length + base.getDate();
    const slots = hours.map((h, i) => {
      const d = new Date(base);
      d.setHours(h, 0, 0, 0);
      return { startsAt: d.toISOString(), taken: (seed + i * 3) % 4 === 0 || d.getTime() < Date.now() + 2 * 3600e3 };
    });
    return respond(slots);
  },
};

export const mockCommunity: CommunityRepo = {
  events: () => respond([...events].sort((a, b) => a.startsAt.localeCompare(b.startsAt)), []),
  event: (id) => respond(find(events, id)),
  campaigns: () => respond(campaigns, []),
  campaign: (id) => respond(find(campaigns, id)),
};

export const mockNotifications: NotificationsRepo = {
  list: () => respond(notifications, []),
};

/** Synchronous lookups for places that only need a label (cart rows, clinic names). */
export const sync = {
  product: (id: string) => products.find((p) => p.id === id),
  place: (id: string) => places.find((p) => p.id === id),
  specialist: (id: string) => specialists.find((s) => s.id === id),
  event: (id: string) => events.find((e) => e.id === id),
  campaign: (id: string) => campaigns.find((c) => c.id === id),
  allProducts: () => products,
};
