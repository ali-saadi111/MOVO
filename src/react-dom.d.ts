/** The web map portals its pins into Mapbox markers; this is the one react-dom call the app makes. */
declare module 'react-dom' {
  import type { ReactNode, ReactPortal } from 'react';

  export function createPortal(children: ReactNode, container: Element, key?: string | null): ReactPortal;
}
