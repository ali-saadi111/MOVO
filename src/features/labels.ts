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
  ({
    mobility: tr('shop.cat.mobility', 'Mobility'), 'home-care': tr('shop.cat.homecare', 'Home care'), cushions: tr('shop.cat.cushions', 'Cushions and beds'),
    braces: tr('shop.cat.braces', 'Braces and supports'), therapy: tr('shop.cat.therapy', 'Rehab and therapy'), health: tr('shop.cat.health', 'Health checks'),
    breathing: tr('shop.cat.breathing', 'Breathing'), daily: tr('shop.cat.daily', 'Daily care'), 'first-aid': tr('shop.cat.firstaid', 'First aid'),
  })[c];
export const productCategoryIcon: Record<ProductCategory, IconName> = {
  mobility: 'figure.roll', 'home-care': 'house', cushions: 'house.lodge', braces: 'figure.walk', therapy: 'figure.walk.motion', health: 'heart.fill',
  breathing: 'drop', daily: 'hand.raised', 'first-aid': 'bandage',
};

export const subcategoryLabel = (tr: Tr, s: string) => {
  const m: Record<string, string> = {
    wheelchairs: tr('sub.wheelchairs', 'Wheelchairs'), scooters: tr('sub.scooters', 'Scooters'), 'stair-climbers': tr('sub.stairChairs', 'Stair chairs'), walkers: tr('sub.walkers', 'Walkers'),
    crutches: tr('sub.crutches', 'Crutches'), canes: tr('sub.canes', 'Canes'), accessories: tr('sub.accessories', 'Accessories'),
    commodes: tr('sub.commodes', 'Commodes'), 'toilet-seats': tr('sub.toilet', 'Toilet seats'), 'bed-care': tr('sub.bedCare', 'Bedside care'),
    cushions: tr('sub.cushions', 'Cushions'), mattresses: tr('sub.mattresses', 'Mattresses'), pillows: tr('sub.pillows', 'Positioning pillows'),
    'ankle-foot': tr('sub.ankleFoot', 'Ankle and foot'), knee: tr('sub.knee', 'Knee'), 'hand-wrist': tr('sub.handWrist', 'Hand and wrist'), 'arm-shoulder': tr('sub.armShoulder', 'Arm and shoulder'),
    'back-neck': tr('sub.backNeck', 'Back and neck'), hip: tr('sub.hip', 'Hip'),
    exercise: tr('sub.exercise', 'Exercise'), tape: tr('sub.tape', 'Therapy tape'), 'hot-cold': tr('sub.hotCold', 'Hot and cold'), massage: tr('sub.massage', 'Massage'), traction: tr('sub.traction', 'Traction'),
    'blood-pressure': tr('sub.bloodPressure', 'Blood pressure'), oximeters: tr('sub.oximeters', 'Oximeters'), thermometers: tr('sub.thermometers', 'Thermometers'), scales: tr('sub.scales', 'Scales'),
    nebulizers: tr('sub.nebulizers', 'Nebulisers'), cpap: tr('sub.cpap', 'CPAP'), oxygen: tr('sub.oxygen', 'Oxygen'), spirometers: tr('sub.spirometers', 'Breathing trainers'), suction: tr('sub.suction', 'Suction'),
    medication: tr('sub.medication', 'Medication'), hearing: tr('sub.hearing', 'Hearing'), compression: tr('sub.compression', 'Compression'), 'foot-care': tr('sub.footCare', 'Foot care'),
    kits: tr('sub.kits', 'First aid kits'), bandages: tr('sub.bandages', 'Bandages'), dressings: tr('sub.dressings', 'Dressings'), emergency: tr('sub.emergency', 'Emergency'),
  };
  return m[s] ?? s;
};

export const serviceLabel = (tr: Tr, k: ServiceKind) =>
  ({ physio: tr('care.svc.physio', 'Physiotherapy'), nursing: tr('care.svc.nursing', 'Home nursing'), ot: tr('care.svc.ot', 'Occupational therapy'), prosthetics: tr('care.svc.prosthetics', 'Prosthetics and orthotics'), repair: tr('care.svc.repair', 'Wheelchair repair'), transport: tr('care.svc.transport', 'Accessible transport') })[k];
export const serviceIcon: Record<ServiceKind, IconName> = { physio: 'figure.walk.motion', nursing: 'cross.case', ot: 'hand.raised', prosthetics: 'figure.walk', repair: 'wrench.and.screwdriver', transport: 'car' };

export const paymentLabel = (tr: Tr, m: string) =>
  ({ cash: tr('pay.cash', 'Cash'), whish: 'Whish', omt: 'OMT', card: tr('pay.card', 'Card') })[m] ?? m;
