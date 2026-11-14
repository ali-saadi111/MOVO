import { useRef, type ReactNode } from 'react';
import { Platform } from 'react-native';
import ReanimatedSwipeable, { type SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

/**
 * A list row you can swipe left to reveal one action. On the web preview the
 * swipe layer draws its action over the row, so there the row renders plain
 * (each screen also offers the action another way: a long press or a sheet).
 */
export function SwipeRow({ children, action, onOpen, enabled = true }: { children: ReactNode; action: ReactNode; onOpen?: () => void; enabled?: boolean }) {
  const ref = useRef<SwipeableMethods>(null);
  if (Platform.OS === 'web' || !enabled) return <>{children}</>;
  return (
    <ReanimatedSwipeable
      ref={ref}
      friction={2}
      rightThreshold={44}
      onSwipeableOpen={() => { if (onOpen) { onOpen(); ref.current?.close(); } }}
      renderRightActions={() => <>{action}</>}
    >
      {children}
    </ReanimatedSwipeable>
  );
}
