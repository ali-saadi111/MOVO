import type { ReactNode } from 'react';

/** Native: nothing. The web build adds a status bar and safe areas for screenshots. */
export function PreviewChrome({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
