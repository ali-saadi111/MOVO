import { router, useSegments, type Href } from 'expo-router';
import { useCallback } from 'react';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_GROUPS = ['(home)', '(map)', '(shop)', '(care)', '(community)', '(profile)'] as const;

/**
 * Push a shared route (place, product, event, notifications…) inside the stack of
 * the tab the person is on, so the tab bar and back stack stay where they expect.
 */
export function useTabNav() {
  const segments = useSegments() as string[];
  const group = segments.find((s) => (TAB_GROUPS as readonly string[]).includes(s)) ?? '(map)';
  const push = useCallback((path: string) => router.push(`/(tabs)/${group}${path.startsWith('/') ? path : '/' + path}` as Href), [group]);
  return { push, group };
}

export const go = {
  push: (p: string) => router.push(p as Href),
  replace: (p: string) => router.replace(p as Href),
  back: () => (router.canGoBack() ? router.back() : router.replace('/' as Href)),
  dismissTo: (p: string) => router.dismissTo(p as Href),
};

/** Floating pill tab bar geometry, shared by the bar and the screens that clear it. */
export const TAB_BAR = {
  height: 68,
  offset: (safeBottom: number) => Math.max(safeBottom - 8, 16),
};

/** Space taken by the floating tab bar at the bottom, plus a little air. */
export function useTabBarInset() {
  const insets = useSafeAreaInsets();
  return TAB_BAR.offset(insets.bottom) + TAB_BAR.height + 16;
}

/** Bottom padding for a sticky footer: clears the floating tab bar inside tabs, the home indicator elsewhere. */
export function useFooterInset() {
  const insets = useSafeAreaInsets();
  const inTabs = (useSegments() as string[])[0] === '(tabs)';
  if (inTabs) return TAB_BAR.offset(insets.bottom) + TAB_BAR.height + 12;
  return Math.max(insets.bottom, 16);
}

/** Bottom padding for scroll content so the last row clears the tab bar or home indicator. */
export function useScrollBottom() {
  const insets = useSafeAreaInsets();
  const inTabs = (useSegments() as string[])[0] === '(tabs)';
  return inTabs ? TAB_BAR.offset(insets.bottom) + TAB_BAR.height + 24 : Math.max(insets.bottom, 16) + 24;
}
