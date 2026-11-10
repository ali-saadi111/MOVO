import { Image } from 'expo-image';
import { useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Text as RNText, View, useWindowDimensions } from 'react-native';

import { HERE } from '@/lib/geo';
import { useTheme } from '@/theme';
import { MapPin, Pressable } from '@/ui';
import type { MapAdapterProps } from './types';

/**
 * Offline map for the browser mockup, where live map tiles can't load.
 * A Mapbox Static Images snapshot of Hamra (zoom 15, 1280 pt square), with
 * Movo's pins placed by Web Mercator maths. Drag to pan.
 */
const IMG = require('../../../assets/map/hamra-static.jpg');
const CENTER = { lng: 35.484, lat: 33.8962 };
const ZOOM = 15;
const SIZE = 1280;
const WORLD = 512 * 2 ** ZOOM;
const mx = (lng: number) => ((lng + 180) / 360) * WORLD;
const my = (lat: number) => {
  const s = Math.sin((lat * Math.PI) / 180);
  return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * WORLD;
};
// Position inside the image, in points.
const ix = (lng: number) => mx(lng) - mx(CENTER.lng) + SIZE / 2;
const iy = (lat: number) => my(lat) - my(CENTER.lat) + SIZE / 2;

export function MapStatic({ places, selectedId, onSelect, bottomPadding, topPadding, focus, showUser }: MapAdapterProps) {
  const t = useTheme();
  const { width, height } = useWindowDimensions();
  const viewH = height - bottomPadding - topPadding;
  const clamp = (o: { x: number; y: number }) => ({ x: Math.min(0, Math.max(width - SIZE, o.x)), y: Math.min(topPadding, Math.max(height - SIZE, o.y)) });
  const centerOn = (lng: number, lat: number) => clamp({ x: width / 2 - ix(lng), y: topPadding + viewH / 2 - iy(lat) });
  const [off, setOff] = useState(() => centerOn(35.4826, 33.8968));
  const [base, setBase] = useState(off);
  // Re-centre when a pin or search result is focused (state adjusted during render).
  const [seenFocus, setSeenFocus] = useState(focus);
  if (focus !== seenFocus) {
    setSeenFocus(focus);
    if (focus) setOff(centerOn(focus.lng, focus.lat));
  }
  const pan = Gesture.Pan()
    .runOnJS(true)
    .minDistance(6)
    .onBegin(() => setBase(off))
    .onUpdate((e) => setOff(clamp({ x: base.x + e.translationX, y: base.y + e.translationY })));

  const pins = places.filter((p) => p.area !== 'saida').sort((a, b) => (a.id === selectedId ? 1 : b.id === selectedId ? -1 : b.lat - a.lat));
  return (
    <GestureDetector gesture={pan}>
    <View style={{ flex: 1, overflow: 'hidden', backgroundColor: t.colors.mapLand }}>
      <View style={{ position: 'absolute', left: off.x, top: off.y, width: SIZE, height: SIZE }}>
        <Pressable feedback="none" onPress={() => onSelect(null)} accessibilityLabel="Map" style={{ width: SIZE, height: SIZE }}>
          <Image source={IMG} style={{ width: SIZE, height: SIZE, opacity: t.scheme === 'dark' ? 0.55 : 1 }} contentFit="cover" />
        </Pressable>
        {showUser ? (
          <View pointerEvents="none" style={{ position: 'absolute', left: ix(HERE.lng) - 22, top: iy(HERE.lat) - 22, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(10,132,255,0.16)', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#0A84FF', borderWidth: 3, borderColor: '#fff' }} />
          </View>
        ) : null}
        {pins.map((p) => (
          <Pressable key={p.id} feedback="none" onPress={() => onSelect(p.id)} accessibilityRole="button" accessibilityLabel={p.name.en}
            style={{ position: 'absolute', left: ix(p.lng) - 24, top: iy(p.lat) - 54, width: 48, height: 64, zIndex: p.id === selectedId ? 10 : 1 }}>
            <MapPin level={p.rating.level} selected={p.id === selectedId} />
          </Pressable>
        ))}
      </View>
      <RNText style={{ position: 'absolute', left: 12, bottom: bottomPadding + 6, fontSize: 10, color: '#4a5a60' }}>© Mapbox © OpenStreetMap</RNText>
    </View>
    </GestureDetector>
  );
}
