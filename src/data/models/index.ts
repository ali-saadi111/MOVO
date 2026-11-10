import { z } from 'zod';

export const L10n = z.object({ en: z.string(), ar: z.string().nullable() });
export type L10n = z.infer<typeof L10n>;

/**
 * Imagery. The draft ships drawn artwork (no network for photos in the build
 * environment); `uri` is used once the team's real photos exist.
 */
export const ImageRef = z.object({
  art: z.string(),
  seed: z.number(),
  uri: z.string().optional(),
  alt: L10n,
});
export type ImageRef = z.infer<typeof ImageRef>;

export const RatingLevel = z.enum(['accessible', 'partly', 'not']);
export type RatingLevel = z.infer<typeof RatingLevel>;

export const ChecklistKey = z.enum(['entrance', 'doorWidth', 'spaceInside', 'toilet', 'parking']);
export type ChecklistKey = z.infer<typeof ChecklistKey>;

export const Rating = z.object({
  level: RatingLevel,
  checkedAt: z.string(),
  checklist: z.array(z.object({ key: ChecklistKey, value: L10n, level: RatingLevel })),
  fits: z.object({ manual: z.boolean(), power: z.boolean(), 'walker-crutches': z.boolean(), other: z.boolean() }),
  entrancePhotos: z.array(ImageRef),
});
export type Rating = z.infer<typeof Rating>;

export const PlaceCategory = z.enum(['cafe', 'restaurant', 'pharmacy', 'clinic', 'bank', 'shop', 'supermarket', 'outdoor']);
export type PlaceCategory = z.infer<typeof PlaceCategory>;

export const Review = z.object({
  id: z.string(),
  author: z.string(),
  mobility: z.enum(['manual', 'power', 'walker-crutches', 'other']),
  stars: z.number(),
  text: z.string(),
  at: z.string(),
});
export type Review = z.infer<typeof Review>;

export const Place = z.object({
  id: z.string(),
  name: L10n,
  category: PlaceCategory,
  area: z.enum(['hamra', 'saida', 'downtown']),
  street: L10n,
  lat: z.number(),
  lng: z.number(),
  phone: z.string(),
  hours: z.array(z.object({ days: L10n, time: z.string() })),
  hero: ImageRef,
  rating: Rating,
  amenities: z.object({ stepFree: z.boolean(), toilet: z.boolean(), parking: z.boolean(), elevator: z.boolean() }),
  reviews: z.array(Review),
});
export type Place = z.infer<typeof Place>;

export const ProductCategory = z.enum(['mobility', 'bathroom-safety', 'daily-living', 'medical-supplies', 'home-adaptations', 'parts-accessories']);
export type ProductCategory = z.infer<typeof ProductCategory>;

export const Product = z.object({
  id: z.string(),
  slug: z.string(),
  name: L10n,
  brand: z.string(),
  category: ProductCategory,
  subcategory: z.string(),
  priceCents: z.number().int(),
  currency: z.literal('USD'),
  compareAtCents: z.number().int().optional(),
  images: z.array(ImageRef),
  description: L10n,
  keySpecs: z.array(z.object({ key: z.string(), label: L10n, value: z.union([z.number(), z.string(), z.boolean()]), unit: z.enum(['cm', 'kg', 'g', 'in']).optional() })),
  attributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  fitsMobility: z.array(z.enum(['manual', 'power', 'walker-crutches', 'other'])),
  stock: z.object({ status: z.enum(['in', 'low', 'out']), quantity: z.number() }),
  rating: z.object({ average: z.number(), count: z.number() }),
  delivery: z.object({ beirutDays: z.tuple([z.number(), z.number()]), otherDays: z.tuple([z.number(), z.number()]) }),
  returnable: z.boolean(),
  isBestSeller: z.boolean().optional(),
  createdAt: z.string(),
  source: z.union([z.object({ url: z.string(), license: z.string(), retrievedAt: z.string() }), z.object({ type: z.literal('curated') })]),
});
export type Product = z.infer<typeof Product>;

export const ServiceKind = z.enum(['physio', 'nursing', 'ot', 'prosthetics', 'repair', 'transport']);
export type ServiceKind = z.infer<typeof ServiceKind>;

export const Specialist = z.object({
  id: z.string(),
  name: z.string(),
  nameAr: z.string(),
  kind: ServiceKind,
  profession: L10n,
  years: z.number(),
  gender: z.enum(['f', 'm']),
  languages: z.array(z.enum(['ar', 'en', 'fr'])),
  priceCents: z.number(),
  stars: z.number(),
  reviewCount: z.number(),
  sponsored: z.boolean(),
  homeVisit: z.boolean(),
  clinic: z.object({ name: z.string(), placeId: z.string() }).nullable(),
  areas: z.array(z.string()),
  bio: L10n,
  services: z.array(z.object({ id: z.string(), name: L10n, minutes: z.number(), priceCents: z.number() })),
  reviews: z.array(Review),
  /** Hours from now of the next free slot (fixtures are relative to "now"). */
  nextFreeInHours: z.number(),
  avatarHue: z.number(),
});
export type Specialist = z.infer<typeof Specialist>;

export const Slot = z.object({ startsAt: z.string(), taken: z.boolean() });
export type Slot = z.infer<typeof Slot>;

export const EventType = z.enum(['sports', 'workshop', 'meetup']);
export const MovoEvent = z.object({
  id: z.string(),
  type: EventType,
  title: L10n,
  startsAt: z.string(),
  endsAt: z.string(),
  area: L10n,
  venuePlaceId: z.string(),
  sponsor: z.string(),
  priceCents: z.number(),
  spots: z.number(),
  taken: z.number(),
  image: ImageRef,
  about: L10n,
  gettingThere: L10n,
});
export type MovoEvent = z.infer<typeof MovoEvent>;

export const Campaign = z.object({
  id: z.string(),
  title: L10n,
  ngo: z.string(),
  goalCents: z.number(),
  raisedCents: z.number(),
  donors: z.number(),
  endsAt: z.string(),
  image: ImageRef,
  story: L10n,
  updates: z.array(z.object({ at: z.string(), text: L10n })),
  finalReport: L10n.nullable(),
});
export type Campaign = z.infer<typeof Campaign>;

export const Notification = z.object({
  id: z.string(),
  kind: z.enum(['booking', 'order', 'event', 'place', 'donation', 'care']),
  title: L10n,
  body: L10n,
  at: z.string(),
  href: z.string(),
});
export type Notification = z.infer<typeof Notification>;
