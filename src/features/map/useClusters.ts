import { useMemo } from 'react';
import Supercluster from 'supercluster';

import type { Place } from '@/data';
import type { Region } from './types';

export type ClusterItem = { kind: 'place'; place: Place } | { kind: 'cluster'; id: number; count: number; lat: number; lng: number; expansionZoom: number };

export function zoomFromRegion(r: Region) {
  return Math.round(Math.log2(360 / r.longitudeDelta));
}

/** Clusters show a count only; a tap zooms in. */
export function useClusters(places: Place[], region: Region, selectedId: string | null): ClusterItem[] {
  const index = useMemo(() => {
    const sc = new Supercluster<{ id: string }>({ radius: 46, maxZoom: 16 });
    sc.load(places.map((p) => ({ type: 'Feature', properties: { id: p.id }, geometry: { type: 'Point', coordinates: [p.lng, p.lat] } })));
    return sc;
  }, [places]);
  return useMemo(() => {
    const zoom = zoomFromRegion(region);
    const bbox: [number, number, number, number] = [region.longitude - region.longitudeDelta, region.latitude - region.latitudeDelta, region.longitude + region.longitudeDelta, region.latitude + region.latitudeDelta];
    const byId = new Map(places.map((p) => [p.id, p]));
    return index.getClusters(bbox, zoom).map((f) => {
      const props = f.properties as { cluster?: boolean; cluster_id?: number; point_count?: number; id?: string };
      if (props.cluster && props.cluster_id != null) {
        const [lng, lat] = f.geometry.coordinates;
        return { kind: 'cluster' as const, id: props.cluster_id, count: props.point_count ?? 0, lat, lng, expansionZoom: index.getClusterExpansionZoom(props.cluster_id) };
      }
      return { kind: 'place' as const, place: byId.get(props.id!)! };
    }).sort((a, b) => (a.kind === 'place' && a.place.id === selectedId ? 1 : b.kind === 'place' && b.place.id === selectedId ? -1 : 0));
  }, [index, region, places, selectedId]);
}
