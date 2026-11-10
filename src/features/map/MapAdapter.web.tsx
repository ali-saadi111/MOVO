import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import { createElement, useEffect, useRef, useState } from 'react';
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
 * Mapbox GL on web with Movo's own style. Pins are Movo's React pins laid over
 * the map at projected positions, so they match iOS and keep their springs.
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
  const [, setFrame] = useState(0);
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
    let raf = 0;
    const tick = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setFrame((f) => f + 1)); };
    m.on('move', tick);
    m.on('moveend', () => setRegion(regionFor(m)));
    m.on('load', () => { setRegion(regionFor(m)); tick(); });
    m.on('click', () => onSelectRef.current(null));
    setMap(m);
    return () => { cancelAnimationFrame(raf); m.remove(); };
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

  const pt = (lng: number, lat: number) => (map ? map.project([lng, lat]) : { x: -100, y: -100 });
  const here = pt(HERE.lng, HERE.lat);

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.mapLand, overflow: 'hidden' }}>
      {createElement('div', { ref: host, style: { position: 'absolute', inset: 0 }, 'aria-label': 'Map' })}
      {map && showUser ? (
        <View pointerEvents="none" style={{ position: 'absolute', left: here.x - 22, top: here.y - 22, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(10,132,255,0.16)', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#0A84FF', borderWidth: 3, borderColor: '#fff' }} />
        </View>
      ) : null}
      {map ? [...items].sort((a, b) => (a.kind === 'place' && a.place.id === selectedId ? 1 : b.kind === 'place' && b.place.id === selectedId ? -1 : 0)).map((it) => {
        if (it.kind === 'cluster') {
          const p = pt(it.lng, it.lat);
          return (
            <Pressable key={`c${it.id}`} feedback="none" onPress={() => map.easeTo({ center: [it.lng, it.lat], zoom: Math.min(it.expansionZoom + 0.5, 18), duration: t.reduceMotion ? 0 : 450 })} accessibilityRole="button" accessibilityLabel={`${it.count} places`}
              style={{ position: 'absolute', left: p.x - 22, top: p.y - 22, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
              <ClusterPin count={it.count} />
            </Pressable>
          );
        }
        const pl = it.place;
        const p = pt(pl.lng, pl.lat);
        return (
          <Pressable key={pl.id} feedback="none" onPress={() => onSelect(pl.id)} accessibilityRole="button" accessibilityLabel={pl.name.en}
            style={{ position: 'absolute', left: p.x - 24, top: p.y - 54, width: 48, height: 64, zIndex: pl.id === selectedId ? 10 : 1 }}>
            <MapPin level={pl.rating.level} selected={pl.id === selectedId} />
          </Pressable>
        );
      }) : null}
    </View>
  );
}
