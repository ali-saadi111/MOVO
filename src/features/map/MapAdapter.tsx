import Mapbox, { Camera, LocationPuck, MapView, MarkerView, StyleImport, type MapState } from '@rnmapbox/maps';
import { useEffect, useRef, useState } from 'react';

import { MAPBOX_STYLE, MAPBOX_TOKEN } from '@/lib/mapbox';
import { useTheme } from '@/theme';
import { ClusterPin, MapPin, Pressable } from '@/ui';
import { INITIAL_REGION, type MapAdapterProps, type Region } from './types';
import { useClusters } from './useClusters';

Mapbox.setAccessToken(MAPBOX_TOKEN);

const regionOf = (s: MapState): Region => {
  const d = 360 / 2 ** s.properties.zoom;
  return { latitude: s.properties.center[1], longitude: s.properties.center[0], latitudeDelta: d, longitudeDelta: d };
};

/**
 * Mapbox (@rnmapbox/maps) with Movo's style. Needs a development build, not Expo Go.
 * Movo pins are the only coloured objects: POI and transit labels are off.
 */
export function MapAdapter({ places, selectedId, onSelect, bottomPadding, topPadding, focus, showUser }: MapAdapterProps) {
  const t = useTheme();
  const camera = useRef<Camera>(null);
  const [region, setRegion] = useState<Region>(INITIAL_REGION);
  const items = useClusters(places, region, selectedId);

  useEffect(() => {
    if (!focus) return;
    camera.current?.setCamera({ centerCoordinate: [focus.lng, focus.lat], animationDuration: t.reduceMotion ? 0 : 600 });
  }, [focus, t.reduceMotion]);

  return (
    <MapView
      style={{ flex: 1 }}
      styleURL={MAPBOX_STYLE}
      scaleBarEnabled={false}
      compassEnabled={false}
      logoPosition={{ left: 12, bottom: bottomPadding + 6 }}
      attributionPosition={{ left: 100, bottom: bottomPadding + 6 }}
      onMapIdle={(s) => setRegion(regionOf(s))}
      onPress={() => onSelect(null)}
      accessibilityLabel="Map"
    >
      <StyleImport id="basemap" existing config={{ lightPreset: t.scheme === 'dark' ? 'night' : 'day', showPointOfInterestLabels: false, showTransitLabels: false }} />
      <Camera
        ref={camera}
        defaultSettings={{ centerCoordinate: [35.4826, 33.8968], zoomLevel: 15.2, pitch: 45 }}
        padding={{ paddingTop: topPadding, paddingBottom: bottomPadding, paddingLeft: 0, paddingRight: 0 }}
        animationDuration={t.reduceMotion ? 0 : 300}
      />
      {showUser ? <LocationPuck puckBearingEnabled={false} pulsing={{ isEnabled: !t.reduceMotion }} /> : null}
      {items.map((it) =>
        it.kind === 'cluster' ? (
          <MarkerView key={`c${it.id}`} coordinate={[it.lng, it.lat]} allowOverlap>
            <Pressable feedback="none" accessibilityRole="button" accessibilityLabel={`${it.count} places`}
              onPress={() => camera.current?.setCamera({ centerCoordinate: [it.lng, it.lat], zoomLevel: Math.min(it.expansionZoom + 0.5, 18), animationDuration: t.reduceMotion ? 0 : 450 })}>
              <ClusterPin count={it.count} />
            </Pressable>
          </MarkerView>
        ) : (
          <MarkerView key={it.place.id} coordinate={[it.place.lng, it.place.lat]} anchor={{ x: 0.5, y: 0.85 }} allowOverlap isSelected={it.place.id === selectedId}>
            <Pressable feedback="none" accessibilityRole="button" accessibilityLabel={it.place.name.en} onPress={() => onSelect(it.place.id)}>
              <MapPin level={it.place.rating.level} selected={it.place.id === selectedId} />
            </Pressable>
          </MarkerView>
        ),
      )}
    </MapView>
  );
}
