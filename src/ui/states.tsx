import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { useT } from '@/i18n';
import { announce } from '@/lib/a11y';
import { layout, radii, space, useTheme } from '@/theme';
import { Button } from './Button';
import { Icon } from './Icon';
import type { IconName } from './symbols';
import { Text } from './Text';

export function EmptyState({ symbol, message, actionLabel, onAction }: { symbol: IconName; message: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <Animated.View entering={FadeIn.duration(200)} style={{ alignItems: 'center', paddingHorizontal: space.xxl, paddingVertical: space.xxxl, gap: space.md }}>
      <Icon name={symbol} size={48} rendering="hierarchical" color="textSecondary" />
      <Text variant="body" color="textSecondary" align="center" style={{ maxWidth: 300 }}>{message}</Text>
      {actionLabel ? <Button label={actionLabel} onPress={onAction} variant="secondary" size="medium" fullWidth={false} /> : null}
    </Animated.View>
  );
}

export function ErrorState({ onRetry, offline }: { onRetry: () => void; offline?: boolean }) {
  const tr = useT();
  return (
    <EmptyState
      symbol={offline ? 'wifi.slash' : 'exclamationmark.triangle'}
      message={offline ? tr('state.offlineNoCache', 'You’re offline and nothing is saved here yet.') : tr('state.error', 'Couldn’t load. Try again.')}
      actionLabel={tr('state.retry', 'Try again')}
      onAction={onRetry}
    />
  );
}

export function OfflinePill() {
  const t = useTheme();
  const tr = useT();
  return (
    <View accessibilityRole="text" accessibilityLabel={tr('state.offline', 'Offline')} style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', gap: 6, paddingHorizontal: space.sm, paddingVertical: 6, borderRadius: radii.capsule, backgroundColor: t.colors.fill, marginVertical: space.xs }}>
      <Icon name="wifi.slash" size={13} color="textSecondary" />
      <Text variant="footnote" color="textSecondary">{tr('state.offlineShowing', 'Offline · showing what was last loaded')}</Text>
    </View>
  );
}

/** Tick + message. Announces itself; sits above the sticky CTA; never the only route to an action. */
export function Toast({ message, bottom = 120, onHide }: { message: string | null; bottom?: number; onHide: () => void }) {
  const t = useTheme();
  useEffect(() => {
    if (!message) return;
    announce(message);
    const id = setTimeout(onHide, 2600);
    return () => clearTimeout(id);
  }, [message, onHide]);
  if (!message) return null;
  return (
    <Animated.View entering={FadeInDown.springify().damping(26).stiffness(170)} exiting={FadeOutDown.duration(200)} pointerEvents="none" style={{ position: 'absolute', start: layout.margin, end: layout.margin, bottom, alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.md, minHeight: 44, borderRadius: radii.capsule, backgroundColor: t.scheme === 'dark' ? t.colors.bgElevated2 : t.colors.bgBrand }}>
        <Icon name="checkmark.circle.fill" size={18} color="accent" />
        <Text variant="subheadline" weight="600" style={{ color: '#fff' }}>{message}</Text>
      </View>
    </Animated.View>
  );
}
