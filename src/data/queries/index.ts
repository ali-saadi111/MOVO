import { useQuery } from '@tanstack/react-query';

import { useDev } from '@/stores/dev';
import { repos } from '../index';
import type { ProductCategory, ServiceKind } from '../models';
import type { ProductQuery } from '../repositories';

export const keys = {
  places: ['places'] as const,
  place: (id: string) => ['place', id] as const,
  products: (q: ProductQuery) => ['products', q] as const,
  product: (id: string) => ['product', id] as const,
  specialists: (kind?: ServiceKind) => ['specialists', kind ?? 'all'] as const,
  specialist: (id: string) => ['specialist', id] as const,
  slots: (id: string, day: string) => ['slots', id, day] as const,
  events: ['events'] as const,
  event: (id: string) => ['event', id] as const,
  campaigns: ['campaigns'] as const,
  campaign: (id: string) => ['campaign', id] as const,
  notifications: ['notifications'] as const,
};

/** Dev toggles are part of every key so flipping one refetches. */
function useDevKey() {
  const d = useDev();
  return [d.forceError, d.forceEmpty, d.offline] as const;
}

export const usePlaces = () => { const k = useDevKey(); return useQuery({ queryKey: [...keys.places, ...k], queryFn: () => repos.places.list() }); };
export const usePlace = (id: string) => useQuery({ queryKey: keys.place(id), queryFn: () => repos.places.get(id) });
export const useProducts = (q: ProductQuery = {}) => { const k = useDevKey(); return useQuery({ queryKey: [...keys.products(q), ...k], queryFn: () => repos.products.list(q) }); };
export const useProduct = (id: string) => useQuery({ queryKey: keys.product(id), queryFn: () => repos.products.get(id) });
export const useCategoryProducts = (category: ProductCategory) => useProducts({ category });
export const useSpecialists = (kind?: ServiceKind) => { const k = useDevKey(); return useQuery({ queryKey: [...keys.specialists(kind), ...k], queryFn: () => repos.care.specialists(kind) }); };
export const useSpecialist = (id: string) => useQuery({ queryKey: keys.specialist(id), queryFn: () => repos.care.specialist(id) });
export const useSlots = (id: string, day: string) => useQuery({ queryKey: keys.slots(id, day), queryFn: () => repos.care.slots(id, day) });
export const useEvents = () => { const k = useDevKey(); return useQuery({ queryKey: [...keys.events, ...k], queryFn: () => repos.community.events() }); };
export const useEvent = (id: string) => useQuery({ queryKey: keys.event(id), queryFn: () => repos.community.event(id) });
export const useCampaigns = () => { const k = useDevKey(); return useQuery({ queryKey: [...keys.campaigns, ...k], queryFn: () => repos.community.campaigns() }); };
export const useCampaign = (id: string) => useQuery({ queryKey: keys.campaign(id), queryFn: () => repos.community.campaign(id) });
export const useNotifications = () => { const k = useDevKey(); return useQuery({ queryKey: [...keys.notifications, ...k], queryFn: () => repos.notifications.list() }); };
