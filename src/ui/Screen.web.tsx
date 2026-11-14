import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useT } from '@/i18n';
import { layout, space, useTheme } from '@/theme';
import { GlassSurface } from './GlassSurface';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import { Pressable } from './Pressable';
import type { ScreenProps } from './Screen';
import { go, useScrollBottom } from './nav';
import { Text } from './Text';

const BAR = 44;

/**
 * Web preview of the native navigation bar, used only for screenshots: large
 * title in content, a material bar that fades in on scroll, back chevron.
 */
export function Screen({ title, variant = 'detail', headerRight, grouped, refreshing, onRefresh, footer, children, scrollRef, heroHeight = 240, belowTitle, contentBottom = 0, header, onScrollEvent, overlay }: ScreenProps) {
  const t = useTheme();
  const tr = useT();
  const insets = useSafeAreaInsets();
  const [y, setY] = useState(0);
  const canvas = variant === 'canvas';
  const bottom = useScrollBottom();
  const canBack = variant !== 'root' && !canvas;
  const collapsed = variant === 'root' ? y > 44 : variant === 'hero' ? y > heroHeight - 100 : true;
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => { setY(e.nativeEvent.contentOffset.y); onScrollEvent?.(e.nativeEvent); };
  const bg = canvas ? t.colors.canvas : grouped ? t.colors.bgGrouped : t.colors.bgPrimary;
  const showBar = variant !== 'hero' || collapsed;

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView
        ref={scrollRef as never}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined}
        contentContainerStyle={{ paddingTop: variant === 'hero' ? 0 : canvas ? insets.top + 8 : insets.top + BAR, paddingBottom: bottom + contentBottom }}
      >
        {canvas ? header : null}
        {variant === 'root' ? (
          <Text variant="largeTitle" accessibilityRole="header" style={{ paddingHorizontal: layout.margin, paddingTop: 2, paddingBottom: space.xs }}>{title}</Text>
        ) : null}
        {belowTitle}
        {children}
      </ScrollView>

      {canvas ? null : <View pointerEvents="box-none" style={{ position: 'absolute', top: 0, start: 0, end: 0 }}>
        {showBar ? (
          <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(150)} style={StyleSheet.absoluteFill}>
            {collapsed ? <GlassSurface style={StyleSheet.absoluteFill} /> : <View style={[StyleSheet.absoluteFill, { backgroundColor: bg }]} />}
          </Animated.View>
        ) : null}
        <View style={{ height: insets.top }} />
        <View style={{ height: BAR, flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.xs }}>
          <View style={{ minWidth: 90, flexDirection: 'row' }}>
            {canBack ? (
              variant === 'hero' && !collapsed ? (
                <IconButton glass icon="chevron.left" label={tr('nav.back', 'Back')} onPress={go.back} size={44} mirrorInRTL />
              ) : (
                <Pressable onPress={go.back} accessibilityRole="button" accessibilityLabel={tr('nav.back', 'Back')} style={{ height: 44, flexDirection: 'row', alignItems: 'center', gap: 2, paddingEnd: 8 }}>
                  <Icon name="chevron.left" size={22} weight="semibold" color="tint" mirrorInRTL />
                  <Text variant="body" color="tint">{tr('nav.back', 'Back')}</Text>
                </Pressable>
              )
            ) : null}
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            {collapsed ? <Animated.View entering={FadeIn.duration(180)}><Text variant="headline" numberOfLines={1}>{title}</Text></Animated.View> : null}
          </View>
          <View style={{ minWidth: 90, flexDirection: 'row', justifyContent: 'flex-end' }}>
            {headerRight ? (variant === 'hero' && !collapsed ? <GlassSurface radius={22} style={{ flexDirection: 'row' }}>{headerRight()}</GlassSurface> : headerRight()) : null}
          </View>
        </View>
      </View>}
      {overlay}
      {canvas && y > 8 ? <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(120)} pointerEvents="none" style={{ position: 'absolute', top: 0, start: 0, end: 0, height: insets.top }}><GlassSurface style={StyleSheet.absoluteFill} /></Animated.View> : null}
      {footer}
    </View>
  );
}
