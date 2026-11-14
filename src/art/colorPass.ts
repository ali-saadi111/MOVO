import type { ProductCategory, ServiceKind } from '@/data';
import type { TintName } from '@/theme/colors';

import type { ObjectName } from './objects';

/**
 * Where the content palette goes. Each tab has a home colour (Care lilac, Shop peach,
 * Community butter, Map sky, Profile mint); items inside a tab can take their own.
 * The map never uses these: its pins keep the accessibility rating colours.
 */

/** Rotation for sets of things with no meaning of their own (faces, filler). */
export const TINT_ROTATION: TintName[] = ['sky', 'rose', 'butter', 'peach', 'lilac', 'mint'];

export const serviceTint: Record<ServiceKind, TintName> = {
  physio: 'lilac', nursing: 'rose', ot: 'butter', prosthetics: 'peach', repair: 'mint', transport: 'sky',
};
export const serviceObject: Record<ServiceKind, ObjectName> = {
  physio: 'physio', nursing: 'nurse', ot: 'ot', prosthetics: 'leg', repair: 'wrench', transport: 'van',
};

/** Activities: sports sky, workshops peach, meetups butter, learning lilac. The marathon keeps its poster. */
const EVENT_ART: Record<string, { object: ObjectName; tint: TintName }> = {
  ev_basket: { object: 'ball', tint: 'sky' },
  ev_swim: { object: 'swim', tint: 'sky' },
  ev_tennis: { object: 'racket', tint: 'sky' },
  ev_pottery: { object: 'vase', tint: 'peach' },
  ev_cook: { object: 'pot', tint: 'peach' },
  ev_coffee: { object: 'cup', tint: 'butter' },
  ev_walk: { object: 'sun', tint: 'butter' },
  ev_rights: { object: 'book', tint: 'lilac' },
};
export const eventArt = (id: string) => EVENT_ART[id];

export const productCategoryTint: Record<ProductCategory, TintName> = {
  mobility: 'sky', 'bathroom-safety': 'mint', 'daily-living': 'butter', 'medical-supplies': 'rose', 'home-adaptations': 'lilac', 'parts-accessories': 'peach',
};
