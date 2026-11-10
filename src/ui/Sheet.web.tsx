import { ScrollView, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useT } from '@/i18n';
import { layout, space, useTheme } from '@/theme';
import { Button } from './Button';
import { Pressable } from './Pressable';
import { go } from './nav';
import type { SheetProps } from './Sheet';
import { Text } from './Text';

/** Web preview of a native form sheet: scrim, grabber, detent height, rounded top. */
export function Sheet({ title, dismissLabel = 'close', onDismiss, children, footer, detent = 0.92, scroll = true }: SheetProps) {
  const t = useTheme();
  const tr = useT();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const label = { close: tr('common.close', 'Close'), done: tr('common.done', 'Done'), cancel: tr('common.cancel', 'Cancel') }[dismissLabel];
  const Body = scroll ? ScrollView : View;
  const h = Math.round(height * detent);
  return (
    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
      <Animated.View entering={FadeIn.duration(200)} style={{ position: 'absolute', top: 0, bottom: 0, start: 0, end: 0, backgroundColor: t.colors.scrim }}>
        <Pressable feedback="none" style={{ flex: 1 }} onPress={onDismiss ?? go.back} accessibilityLabel={label} />
      </Animated.View>
      <Animated.View entering={SlideInDown.springify().damping(26).stiffness(170)} style={{ height: h, backgroundColor: t.colors.bgElevated, borderTopLeftRadius: 38, borderTopRightRadius: 38, overflow: 'hidden' }}>
        <View style={{ alignItems: 'center', paddingTop: 6 }}><View style={{ width: 36, height: 5, borderRadius: 3, backgroundColor: t.colors.fillStrong }} /></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingStart: layout.margin, paddingEnd: space.xs, paddingTop: space.sm, paddingBottom: space.xs, gap: space.sm }}>
          <Text variant="title3" accessibilityRole="header" style={{ flex: 1 }}>{title}</Text>
          <Button label={label} variant={dismissLabel === 'done' ? 'secondary' : 'plain'} size="medium" fullWidth={false} onPress={onDismiss ?? go.back} />
        </View>
        <Body style={{ flex: 1 }} contentContainerStyle={scroll ? { paddingBottom: 24 } : undefined}>{children}</Body>
        {footer ? <View style={{ paddingHorizontal: layout.margin, paddingTop: space.sm, paddingBottom: Math.max(insets.bottom, space.md), gap: space.xs }}>{footer}</View> : null}
      </Animated.View>
    </View>
  );
}
