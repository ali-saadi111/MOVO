import { Redirect } from 'expo-router';
import type { ComponentType } from 'react';

import { useTabNav } from './nav';

/**
 * Tab roots live in a shared array group, so a deep link like /shop can resolve
 * inside the Map tab. Send it to its own tab so the right tab is selected.
 */
export function tabRoot(group: string, href: string, Screen: ComponentType) {
  return function TabRootScreen() {
    const { group: current } = useTabNav();
    if (current !== group) return <Redirect href={href as never} />;
    return <Screen />;
  };
}
