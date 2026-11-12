import type { ChecklistKey, PlaceCategory, ProductCategory, RatingLevel, ServiceKind } from '@/data/models';
import type { Tr } from '@/i18n';
import type { IconName } from '@/ui/symbols';

export const ratingLabel = (tr: Tr, l: RatingLevel) =>
  ({ accessible: tr('rating.accessible', 'Accessible'), partly: tr('rating.partly', 'Partly accessible'), not: tr('rating.not', 'Not accessible') })[l];

export const ratingIcon: Record<RatingLevel, IconName> = { accessible: 'checkmark.circle.fill', partly: 'minus.circle.fill', not: 'xmark.circle.fill' };

export const placeCategoryLabel = (tr: Tr, c: PlaceCategory | 'all') =>
  ({
    all: tr('map.cat.all', 'All'), cafe: tr('map.cat.cafe', 'Cafés'), restaurant: tr('map.cat.restaurant', 'Restaurants'), pharmacy: tr('map.cat.pharmacy', 'Pharmacies'), clinic: tr('map.cat.clinic', 'Clinics'),
    bank: tr('map.cat.bank', 'Banks'), shop: tr('map.cat.shop', 'Shops'), supermarket: tr('map.cat.supermarket', 'Supermarkets'), outdoor: tr('map.cat.outdoor', 'Outdoors'),
  })[c];

export const placeTypeLabel = (tr: Tr, c: PlaceCategory) =>
  ({ cafe: tr('place.type.cafe', 'Café'), restaurant: tr('place.type.restaurant', 'Restaurant'), pharmacy: tr('place.type.pharmacy', 'Pharmacy'), clinic: tr('place.type.clinic', 'Clinic'), bank: tr('place.type.bank', 'Bank'), shop: tr('place.type.shop', 'Shop'), supermarket: tr('place.type.supermarket', 'Supermarket'), outdoor: tr('place.type.outdoor', 'Outdoors') })[c];

export const placeIcon: Record<PlaceCategory, IconName> = { cafe: 'cup.and.saucer', restaurant: 'fork.knife', pharmacy: 'pills', clinic: 'stethoscope', bank: 'building.columns', shop: 'bag', supermarket: 'cart', outdoor: 'tree' };

export const checklistLabel = (tr: Tr, k: ChecklistKey) =>
  ({ entrance: tr('check.entrance', 'Entrance'), doorWidth: tr('check.doorWidth', 'Door width'), spaceInside: tr('check.spaceInside', 'Space inside'), toilet: tr('check.toilet', 'Accessible toilet'), parking: tr('check.parking', 'Parking nearby') })[k];
export const checklistIcon: Record<ChecklistKey, IconName> = { entrance: 'door.left.hand.open', doorWidth: 'ruler', spaceInside: 'arrow.left.arrow.right', toilet: 'toilet', parking: 'parkingsign' };

export type MobilityKey = 'manual' | 'power' | 'walker-crutches' | 'other';
export const mobilityLabel = (tr: Tr, m: MobilityKey | 'none') =>
  ({ manual: tr('mob.manual', 'Manual wheelchair'), power: tr('mob.power', 'Power wheelchair'), 'walker-crutches': tr('mob.walker', 'Walker or crutches'), other: tr('mob.other', 'Something else'), none: tr('mob.none', 'Prefer not to say') })[m];
export const mobilityIcon: Record<MobilityKey | 'none', IconName> = { manual: 'figure.roll', power: 'figure.roll.runningpace', 'walker-crutches': 'figure.walk.motion', other: 'face.smiling', none: 'eye.slash' };

export const productCategoryLabel = (tr: Tr, c: ProductCategory) =>
  ({ mobility: tr('shop.cat.mobility', 'Mobility'), 'bathroom-safety': tr('shop.cat.bathroom', 'Bathroom safety'), 'daily-living': tr('shop.cat.daily', 'Daily living'), 'medical-supplies': tr('shop.cat.medical', 'Medical supplies'), 'home-adaptations': tr('shop.cat.home', 'Home adaptations'), 'parts-accessories': tr('shop.cat.parts', 'Parts and accessories') })[c];
export const productCategoryIcon: Record<ProductCategory, IconName> = { mobility: 'figure.roll', 'bathroom-safety': 'bathtub', 'daily-living': 'hand.raised', 'medical-supplies': 'cross.case', 'home-adaptations': 'house', 'parts-accessories': 'wrench.and.screwdriver' };

export const subcategoryLabel = (tr: Tr, s: string) => {
  const m: Record<string, string> = {
    wheelchairs: tr('sub.wheelchairs', 'Wheelchairs'), walkers: tr('sub.walkers', 'Walkers'), rollators: tr('sub.rollators', 'Rollators'), crutches: tr('sub.crutches', 'Crutches'), canes: tr('sub.canes', 'Canes'),
    'shower-chairs': tr('sub.shower', 'Shower chairs'), 'transfer-benches': tr('sub.transfer', 'Transfer benches'), 'toilet-seats': tr('sub.toilet', 'Toilet seats'), 'grab-bars': tr('sub.grab', 'Grab bars'), commodes: tr('sub.commodes', 'Commodes'),
    reachers: tr('sub.reachers', 'Reachers'), 'dressing-aids': tr('sub.dressing', 'Dressing aids'), utensils: tr('sub.utensils', 'Utensils'), 'pill-organisers': tr('sub.pills', 'Pill organisers'), 'bed-rails': tr('sub.bedrails', 'Bed rails'),
    cushions: tr('sub.cushions', 'Cushions'), gloves: tr('sub.gloves', 'Gloves'), incontinence: tr('sub.incontinence', 'Incontinence'), compression: tr('sub.compression', 'Compression'), 'first-aid': tr('sub.firstaid', 'First aid'),
    'portable-ramps': tr('sub.ramps', 'Portable ramps'), 'threshold-ramps': tr('sub.threshold', 'Threshold ramps'), 'door-hinges': tr('sub.hinges', 'Door hinges'), 'stair-rails': tr('sub.stair', 'Stair rails'),
    tyres: tr('sub.tyres', 'Tyres'), tubes: tr('sub.tubes', 'Inner tubes'), armrests: tr('sub.armrests', 'Armrests'), bags: tr('sub.bags', 'Bags'), batteries: tr('sub.batteries', 'Batteries'),
  };
  return m[s] ?? s;
};

export const serviceLabel = (tr: Tr, k: ServiceKind) =>
  ({ physio: tr('care.svc.physio', 'Physiotherapy'), nursing: tr('care.svc.nursing', 'Home nursing'), ot: tr('care.svc.ot', 'Occupational therapy'), prosthetics: tr('care.svc.prosthetics', 'Prosthetics and orthotics'), repair: tr('care.svc.repair', 'Wheelchair repair'), transport: tr('care.svc.transport', 'Accessible transport') })[k];
export const serviceIcon: Record<ServiceKind, IconName> = { physio: 'figure.walk.motion', nursing: 'cross.case', ot: 'hand.raised', prosthetics: 'figure.walk', repair: 'wrench.and.screwdriver', transport: 'car' };

export const paymentLabel = (tr: Tr, m: string) =>
  ({ cash: tr('pay.cash', 'Cash'), whish: 'Whish', omt: 'OMT', card: tr('pay.card', 'Card') })[m] ?? m;
