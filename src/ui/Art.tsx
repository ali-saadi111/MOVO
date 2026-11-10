import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isProductPhoto, photoFor } from '@/art/photos';
import { ProductArt } from '@/art/ProductArt';
import { SceneArt } from '@/art/SceneArt';
import type { ImageRef } from '@/data/models';
import { useLocalized } from '@/i18n';
import { continuous, radii, useTheme } from '@/theme';

/**
 * Shows a real photo when one is bundled for this art key (see art/photos.ts),
 * otherwise drawn artwork. Same frame, radius, 200 ms fade and hairline edge.
 */
export function ArtImage({ image, aspect, radius = radii.tile, style, tile, edge = true }: { image: ImageRef; aspect: number; radius?: number; style?: StyleProp<ViewStyle>; tile?: boolean; edge?: boolean }) {
  const t = useTheme();
  const loc = useLocalized();
  const [w, setW] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setW(Math.round(e.nativeEvent.layout.width));
  const h = w / aspect;
  const photo = photoFor(image);
  return (
    <View
      onLayout={onLayout}
      accessible
      accessibilityRole="image"
      accessibilityLabel={loc(image.alt)}
      style={[{ width: '100%', aspectRatio: aspect, borderRadius: radius, ...continuous, overflow: 'hidden', backgroundColor: tile || isProductPhoto(image) ? '#FFFFFF' : t.colors.illoBg }, style]}
    >
      {w > 0 ? (
        <Animated.View entering={FadeIn.duration(200)} style={StyleSheet.absoluteFill}>
          {photo ? (
            tile ? (
              <View style={{ flex: 1, backgroundColor: '#FFFFFF', padding: '6%' }}>
                <Image source={photo} style={{ flex: 1 }} contentFit="contain" transition={t.reduceMotion ? 0 : 200} />
              </View>
            ) : (
              <Image source={photo} style={StyleSheet.absoluteFill} contentFit={isProductPhoto(image) ? 'contain' : 'cover'} transition={t.reduceMotion ? 0 : 200} />
            )
          ) : tile ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ProductArt art={image.art} seed={image.seed} size={Math.min(w, h) * 0.86} />
            </View>
          ) : (
            <SceneArt art={image.art} seed={image.seed} width={w} height={h} />
          )}
          {tile && !photo ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: t.scheme === 'dark' ? 'rgba(0,0,0,0.10)' : t.colors.productOverlay }]} /> : null}
        </Animated.View>
      ) : null}
      {edge ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, borderWidth: StyleSheet.hairlineWidth, borderColor: t.colors.separator }]} /> : null}
    </View>
  );
}

/**
 * A campaign or event banner at the top of a hero screen. The banner art has its
 * headline near the top, so it sits fully below the status bar and back button
 * as a rounded card instead of bleeding under them.
 */
export function BannerHero({ image }: { image: ImageRef }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + 52, paddingHorizontal: 16 }}>
      <ArtImage image={image} aspect={16 / 9} radius={24} style={{ boxShadow: '0 14px 32px rgba(1,52,71,0.16)' }} />
    </View>
  );
}
