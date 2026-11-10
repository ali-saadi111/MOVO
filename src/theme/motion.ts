import type { WithSpringConfig } from 'react-native-reanimated';

/** Springs, not easings (prompt §2.6). mass is 1 throughout. */
export const springs = {
  /** Sheets, layout changes and zooms. No overshoot. */
  smooth: { mass: 1, damping: 26, stiffness: 170 } satisfies WithSpringConfig,
  /** Presses, chips and toggles. */
  snappy: { mass: 1, damping: 30, stiffness: 300 } satisfies WithSpringConfig,
  /** Confirmations only: the tick, the cart badge, the selected pin. */
  bouncy: { mass: 1, damping: 15, stiffness: 200 } satisfies WithSpringConfig,
} as const;

export const durations = { fade: 200, tickStroke: 350, stagger: 40, shimmer: 1200, settle: 1200 } as const;

export const press = { scale: 0.97, opacity: 0.85 } as const;
