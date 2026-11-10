import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useT } from '@/i18n';
import { layout, space, useTheme } from '@/theme';
import { Button } from './Button';
import { go } from './nav';
import { Text } from './Text';

export type SheetProps = {
  title: string;
  /** Close (default) or Done; always visible (prompt §2.6). */
  dismissLabel?: 'close' | 'done' | 'cancel';
  onDismiss?: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Detent this sheet is presented at; used by the web preview frame. */
  detent?: number;
  scroll?: boolean;
};

/** Content of a native form sheet (the route sets presentation: 'formSheet'). */
export function Sheet({ title, dismissLabel = 'close', onDismiss, children, footer, scroll = true }: SheetProps) {
  const t = useTheme();
  const tr = useT();
  const insets = useSafeAreaInsets();
  const label = { close: tr('common.close', 'Close'), done: tr('common.done', 'Done'), cancel: tr('common.cancel', 'Cancel') }[dismissLabel];
  const Body = scroll ? ScrollView : View;
  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bgElevated }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingStart: layout.margin, paddingEnd: space.xs, paddingTop: space.lg, paddingBottom: space.xs, gap: space.sm }}>
        <Text variant="title3" accessibilityRole="header" style={{ flex: 1 }}>{title}</Text>
        <Button label={label} variant={dismissLabel === 'done' ? 'secondary' : 'plain'} size="medium" fullWidth={false} onPress={onDismiss ?? go.back} />
      </View>
      <Body style={{ flex: 1 }} contentContainerStyle={scroll ? { paddingBottom: footer ? 140 : 32 } : undefined} keyboardShouldPersistTaps="handled">
        {children}
      </Body>
      {footer ? <View style={{ paddingHorizontal: layout.margin, paddingTop: space.sm, paddingBottom: Math.max(insets.bottom, space.md), gap: space.xs, backgroundColor: t.colors.bgElevated }}>{footer}</View> : null}
    </View>
  );
}
