import { mockCare, mockCommunity, mockNotifications, mockPlaces, mockProducts } from './mock';

/** Repo registry. Swapping mock for api (Supabase) changes nothing above data/. */
export const repos = {
  places: mockPlaces,
  products: mockProducts,
  care: mockCare,
  community: mockCommunity,
  notifications: mockNotifications,
};

export * from './models';
export { sync, OfflineError } from './mock';
