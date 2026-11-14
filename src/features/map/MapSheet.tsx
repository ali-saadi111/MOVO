import { forwardRef, useEffect, useImperativeHandle, type ReactNode } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedReaction, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { useT } from '@/i18n';
import { radii, springs, useTheme } from '@/theme';
import { GlassSurface, Pressable } from '@/ui';

export type Detent = 'small' | 'medium' | 'large';
export type MapSheetHandle = { snapTo: (d: Detent) => void };

/**
 * The persistent Nearby sheet (§2.9 moment 1). Dragging tracks the finger 1:1 and
 * settles on the nearest detent with `smooth`, taking velocity into account.
 * Tapping the grabber, or the Map/List control, does the same without a drag.
 */
export const MapSheet = forwardRef<MapSheetHandle, {
  heights: Record<Detent, number>;
  initial?: Detent;
  header: ReactNode;
  children: ReactNode;
  onDetent?: (d: Detent, height: number) => void;
  /** Floats just above the sheet's top edge and rides up and down with it (the locate button). */
  accessory?: ReactNode;
}>(function MapSheet({ heights, initial = 'medium', header, children, onDetent, accessory }, ref) {
  const t = useTheme();
  const tr = useT();
  const { height: screenH } = useWindowDimensions();
  const max = heights.large;
  const h = useSharedValue(heights[initial]);
  const start = useSharedValue(0);
  const detentSV = useSharedValue<Detent>(initial);
  const order: Detent[] = ['small', 'medium', 'large'];

  const settle = (d: Detent) => {
    'worklet';
    detentSV.value = d;
    h.value = t.reduceMotion ? withTiming(heights[d], { duration: 200 }) : withSpring(heights[d], springs.smooth);
    if (onDetent) runOnJS(onDetent)(d, heights[d]);
  };
  useImperativeHandle(ref, () => ({ snapTo: (d) => settle(d) }));

  const pan = Gesture.Pan()
    .onBegin(() => { start.value = h.value; })
    .onUpdate((e) => { h.value = Math.max(heights.small - 30, Math.min(max + 20, start.value - e.translationY)); })
    .onEnd((e) => {
      const projected = h.value - e.velocityY * 0.18;
      let best: Detent = 'small';
      for (const d of order) if (Math.abs(heights[d] - projected) < Math.abs(heights[best] - projected)) best = d;
      settle(best);
    });

  const cycle = () => {
    const cur = order.reduce((b, d) => (Math.abs(heights[d] - h.value) < Math.abs(heights[b] - h.value) ? d : b), 'small' as Detent);
    settle(cur === 'large' ? 'medium' : cur === 'medium' ? 'large' : 'medium');
  };

  // Keep the current detent's height when the heights change (the pin card sizes the sheet to itself).
  useEffect(() => { h.value = t.reduceMotion ? withTiming(heights[detentSV.value], { duration: 200 }) : withSpring(heights[detentSV.value], springs.smooth); }, [heights.small, heights.medium, heights.large]); // eslint-disable-line react-hooks/exhaustive-deps

  const style = useAnimatedStyle(() => ({ height: h.value }));
  useAnimatedReaction(() => h.value, () => {});

  return (
    <Animated.View style={[{ position: 'absolute', start: 0, end: 0, bottom: 0, maxHeight: screenH }, style]}>
      {accessory ? <View pointerEvents="box-none" style={{ position: 'absolute', top: -60, end: 16 }}>{accessory}</View> : null}
      <GlassSurface material="thick" radius={0} style={{ flex: 1, borderTopLeftRadius: radii.hero + 12, borderTopRightRadius: radii.hero + 12 }}>
        <GestureDetector gesture={pan}>
          <View>
            <Pressable feedback="none" onPress={cycle} accessibilityRole="adjustable" accessibilityLabel={tr('map.sheetHandle', 'Nearby places sheet')} accessibilityHint={tr('map.sheetHint', 'Tap to resize')} style={{ height: 22, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 36, height: 5, borderRadius: 3, backgroundColor: t.colors.fillStrong }} />
            </Pressable>
            {header}
          </View>
        </GestureDetector>
        <View style={{ flex: 1 }}>{children}</View>
      </GlassSurface>
    </Animated.View>
  );
});
