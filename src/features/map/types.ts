import type { Place } from '@/data';

export type Region = { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };

/** MapAdapter: screens talk to this, so Mapbox (@rnmapbox/maps) can replace Apple Maps later. */
export type MapAdapterProps = {
  places: Place[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Sheet height (capped at medium) so the selected pin and legal label stay visible. */
  bottomPadding: number;
  topPadding: number;
  focus: { lat: number; lng: number; key: number } | null;
  showUser: boolean;
};

export const INITIAL_REGION: Region = { latitude: 33.8962, longitude: 35.4832, latitudeDelta: 0.016, longitudeDelta: 0.016 };
