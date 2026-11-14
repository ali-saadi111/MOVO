import { Stack, useNavigation } from 'expo-router';
import { useLayoutEffect, useRef, useState, type ComponentRef, type ReactNode, type RefObject } from 'react';
import { RefreshControl, ScrollView, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { useScrollBottom } from './nav';

export type ScreenProps = {
  title: string;
  /** canvas: no navigation bar; the screen draws its own header (tab roots). */
  variant?: 'root' | 'detail' | 'hero' | 'canvas';
  /** Custom header for the canvas variant (greeting, title, actions). */
  header?: ReactNode;
  headerRight?: () => ReactNode;
  grouped?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  footer?: ReactNode;
  children?: ReactNode;
  scrollRef?: RefObject<ComponentRef<typeof ScrollView> | null>;
  /** Hero screens show the title inline once the scroll passes this offset. */
  heroHeight?: number;
  /** Extra content under the large title, before the scroll content (search on web). */
  belowTitle?: ReactNode;
  contentBottom?: number;
  /** Every scroll frame (for pinned bars that appear on scroll, or load-more). */
  onScrollEvent?: (e: NativeScrollEvent) => void;
  /** Drawn above the scroll view, e.g. a pinned search bar. */
  overlay?: ReactNode;
};

/**
 * Native: the real UINavigationBar (large titles that collapse natively, Liquid
 * Glass on iOS 26, system material before), with a scroll view that runs under it.
 */
export function Screen({ title, variant = 'detail', headerRight, grouped, refreshing, onRefresh, footer, children, scrollRef, heroHeight = 240, belowTitle, contentBottom = 0, header, onScrollEvent, overlay }: ScreenProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const bottom = useScrollBottom();
  const canvas = variant === 'canvas';
  const nav = useNavigation();
  const [showTitle, setShowTitle] = useState(variant !== 'hero');
  const last = useRef(showTitle);
  useLayoutEffect(() => {
    nav.setOptions({ title: variant === 'hero' && !showTitle ? '' : title });
  }, [nav, title, showTitle, variant]);
  const onScroll = variant === 'hero' || onScrollEvent ? (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    onScrollEvent?.(e.nativeEvent);
    if (variant !== 'hero') return;
    const s = e.nativeEvent.contentOffset.y > heroHeight - 100;
    if (s !== last.current) { last.current = s; setShowTitle(s); }
  } : undefined;
  return (
    <View style={{ flex: 1, backgroundColor: canvas ? t.colors.canvas : grouped ? t.colors.bgGrouped : t.colors.bgPrimary }}>
      <Stack.Screen
        options={canvas ? { headerShown: false } : {
          headerLargeTitleEnabled: variant === 'root',
          headerTransparent: variant === 'hero' ? true : undefined,
          headerShadowVisible: false,
          headerLargeTitleShadowVisible: false,
          headerRight,
          headerTintColor: t.colors.tint,
          headerLargeStyle: { backgroundColor: grouped ? t.colors.bgGrouped : t.colors.bgPrimary },
          headerTitleStyle: { color: t.colors.textPrimary },
          headerLargeTitleStyle: { color: t.colors.textPrimary },
        }}
      />
      <ScrollView
        ref={scrollRef as never}
        contentInsetAdjustmentBehavior={variant === 'hero' || canvas ? 'never' : 'automatic'}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={t.colors.textSecondary} /> : undefined}
        contentContainerStyle={{ paddingTop: canvas ? insets.top + 8 : 0, paddingBottom: bottom + contentBottom }}
      >
        {canvas ? header : null}
        {belowTitle}
        {children}
      </ScrollView>
      {overlay}
      {footer}
    </View>
  );
}
