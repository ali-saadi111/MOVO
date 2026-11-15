import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { createElement, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { View } from 'react-native';

import { HERE } from '@/lib/geo';
import { MAPBOX_STYLE, MAPBOX_TOKEN } from '@/lib/mapbox';
import { useTheme } from '@/theme';
import { ClusterPin, MapPin, Pressable } from '@/ui';
import { INITIAL_REGION, type MapAdapterProps, type Region } from './types';
import { MapStatic } from './MapStatic.web';
import { useClusters } from './useClusters';

mapboxgl.accessToken = MAPBOX_TOKEN;

const START = { lng: 35.4826, lat: 33.8968, zoom: 15.2, pitch: 45 };
const regionFor = (m: mapboxgl.Map): Region => {
  const c = m.getCenter();
  const d = 360 / 2 ** m.getZoom();
  return { latitude: c.lat, longitude: c.lng, latitudeDelta: d, longitudeDelta: d };
};

/**
 * Mapbox GL on web with Movo's own style. Pins are Movo's React pins, each held by a
 * Mapbox marker, so they match iOS, keep their springs and move with the map.
 */
/** The browser mockup can't reach map tiles, so it uses a static snapshot. */
export function MapAdapter(props: MapAdapterProps) {
  return process.env.EXPO_PUBLIC_MAP_STATIC === '1' ? <MapStatic {...props} /> : <MapLive {...props} />;
}

function MapLive({ places, selectedId, onSelect, bottomPadding, topPadding, focus, showUser }: MapAdapterProps) {
  const t = useTheme();
  const host = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [region, setRegion] = useState<Region>(INITIAL_REGION);
  const items = useClusters(places, region, selectedId);

  // Keep the latest onSelect without rebuilding the map.
  const onSelectRef = useRef(onSelect);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    if (!host.current) return;
    const m = new mapboxgl.Map({
      container: host.current,
      style: MAPBOX_STYLE,
      center: [START.lng, START.lat],
      zoom: START.zoom,
      pitch: START.pitch,
      bearing: 0,
      attributionControl: false,
      config: { basemap: { showPointOfInterestLabels: false, showTransitLabels: false } },
    });
    m.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-left');
    m.on('moveend', () => setRegion(regionFor(m)));
    m.on('load', () => setRegion(regionFor(m)));
    // Pins live inside the map, so their clicks reach it too: only a click on the map itself deselects.
    m.on('click', (e) => { if (!(e.originalEvent.target as HTMLElement | null)?.closest?.('.mapboxgl-marker')) onSelectRef.current(null); });
    setMap(m);
    return () => m.remove();
  }, []);

  useEffect(() => {
    if (!map) return;
    const apply = () => { try { map.setConfigProperty('basemap', 'lightPreset', t.scheme === 'dark' ? 'night' : 'day'); } catch { /* style without the Standard basemap */ } };
    if (map.isStyleLoaded()) apply(); else map.once('style.load', apply);
  }, [map, t.scheme]);

  useEffect(() => {
    map?.setPadding({ top: topPadding, bottom: bottomPadding, left: 0, right: 0 });
  }, [map, topPadding, bottomPadding]);

  useEffect(() => {
    if (!map || !focus) return;
    map.easeTo({ center: [focus.lng, focus.lat], duration: t.reduceMotion ? 0 : 600 });
  }, [map, focus, t.reduceMotion]);

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.mapLand, overflow: 'hidden' }}>
      {createElement('div', { ref: host, style: { position: 'absolute', inset: 0 }, 'aria-label': 'Map' })}
      {map && showUser ? (
        <MapMarker map={map} lng={HERE.lng} lat={HERE.lat} width={44} height={44} footX={22} footY={22} z={0} inert>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(10,132,255,0.16)', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#0A84FF', borderWidth: 3, borderColor: '#fff' }} />
          </View>
        </MapMarker>
      ) : null}
      {map ? items.map((it) => {
        if (it.kind === 'cluster') {
          return (
            <MapMarker key={`c${it.id}`} map={map} lng={it.lng} lat={it.lat} width={44} height={44} footX={22} footY={22} z={1}>
              <Pressable feedback="none" onPress={() => map.easeTo({ center: [it.lng, it.lat], zoom: Math.min(it.expansionZoom + 0.5, 18), duration: t.reduceMotion ? 0 : 450 })} accessibilityRole="button" accessibilityLabel={`${it.count} places`}
                style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                <ClusterPin count={it.count} />
              </Pressable>
            </MapMarker>
          );
        }
        const pl = it.place;
        return (
          <MapMarker key={pl.id} map={map} lng={pl.lng} lat={pl.lat} width={48} height={64} footX={24} footY={54} z={pl.id === selectedId ? 10 : 1}>
            <Pressable feedback="none" onPress={() => onSelect(pl.id)} accessibilityRole="button" accessibilityLabel={pl.name.en} style={{ width: 48, height: 64 }}>
              <MapPin level={pl.rating.level} selected={pl.id === selectedId} />
            </Pressable>
          </MapMarker>
        );
      }) : null}
    </View>
  );
}

/**
 * One React pin held by a Mapbox marker. Mapbox moves the marker itself, in the same frame it
 * draws the map, so pins stay glued to the ground while panning, zooming and tilting instead of
 * trailing a frame behind a React re-render. `footX`/`footY` is the point of the box that sits
 * on the coordinate.
 */
function MapMarker({ map, lng, lat, width, height, footX, footY, z, inert, children }: { map: mapboxgl.Map; lng: number; lat: number; width: number; height: number; footX: number; footY: number; z: number; inert?: boolean; children: ReactNode }) {
  // The box the pin renders into, sized once; Mapbox positions it.
  const [el] = useState(() => {
    const d = document.createElement('div');
    d.style.width = `${width}px`;
    d.style.height = `${height}px`;
    if (inert) d.style.pointerEvents = 'none';
    return d;
  });
  const marker = useRef<mapboxgl.Marker | null>(null);
  useEffect(() => {
    const m = new mapboxgl.Marker({ element: el, anchor: 'top-left', offset: [-footX, -footY] }).setLngLat([lng, lat]).addTo(map);
    m.getElement().style.zIndex = String(z);
    marker.current = m;
    return () => { m.remove(); marker.current = null; };
    // Created once per pin; position and stacking are kept current by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, el]);
  useEffect(() => { marker.current?.setLngLat([lng, lat]); }, [lng, lat]);
  useEffect(() => { const m = marker.current; if (m) m.getElement().style.zIndex = String(z); }, [z]);
  return createPortal(children, el);
}
