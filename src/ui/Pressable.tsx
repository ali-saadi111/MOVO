import { forwardRef, type ComponentRef, type ReactNode } from 'react';
import { Pressable as RNPressable, type PressableProps as RNPressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { press, springs, useTheme } from '@/theme';

const APressable = Animated.createAnimatedComponent(RNPressable);

export type PressableProps = Omit<RNPressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
  /** 'scale' for buttons and cards; 'highlight' for rows (fill instead of scaling). */
  feedback?: 'scale' | 'highlight' | 'none';
  highlightRadius?: number;
};

/** Spring press feedback: 0.97 scale and 0.85 opacity on press-in, no delay. */
export const Pressable = forwardRef<ComponentRef<typeof RNPressable>, PressableProps>(function Pressable({ feedback = 'scale', style, children, onPressIn, onPressOut, highlightRadius = 0, ...rest }, ref) {
  const t = useTheme();
  const p = useSharedValue(0);
  const anim = useAnimatedStyle(() => {
    if (feedback === 'scale') {
      const s = 1 - (1 - press.scale) * p.value;
      return { transform: [{ scale: s }], opacity: 1 - (1 - press.opacity) * p.value };
    }
    if (feedback === 'highlight') return { backgroundColor: p.value > 0.01 ? t.colors.fill : 'transparent', borderRadius: highlightRadius };
    return {};
  });
  return (
    <APressable
      ref={ref as never}
      unstable_pressDelay={0}
      onPressIn={(e) => {
        p.value = t.reduceMotion ? 1 : withSpring(1, springs.snappy);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        p.value = t.reduceMotion ? 0 : withSpring(0, springs.snappy);
        onPressOut?.(e);
      }}
      style={[style, anim]}
      {...rest}
    >
      {children}
    </APressable>
  );
});
