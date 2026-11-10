import { PayLogo } from '@/ui/flows';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { commitFlow } from '@/features/shell/commit';
import { paymentLabel } from '@/features/labels';
import { useT } from '@/i18n';
import { haptic } from '@/lib/haptics';
import { formatMoney } from '@/lib/money';
import { ltr } from '@/lib/rtl';
import { useDev } from '@/stores/dev';
import { layout, space, useTheme } from '@/theme';
import { Button, Icon, Text, go } from '@/ui';

/** 9.4 hand-off: "Finish paying in Whish" → success or "Payment didn’t go through". */
export default function PaymentHandoff() {
  const p = useLocalSearchParams<Record<string, string>>();
  const t = useTheme();
  const tr = useT();
  const insets = useSafeAreaInsets();
  const outcome = useDev((s) => s.paymentOutcome);
  const [state, setState] = useState<'waiting' | 'failed'>('waiting');
  const method = p.method ?? 'cash';
  const total = ltr(formatMoney(Number(p.total ?? 0)));

  const succeed = (m = method) => {
    const id = commitFlow({ ...p, method: m });
    go.replace(`/covers/success?flow=${p.flow}&id=${id}&method=${m}&total=${p.total ?? ''}&at=${p.at ?? ''}&specialist=${p.specialist ?? ''}&where=${p.where ?? ''}&event=${p.event ?? ''}&campaign=${p.campaign ?? ''}`);
  };

  useEffect(() => {
    if (method === 'cash') { succeed('cash'); return; }
    const id = setTimeout(() => {
      if (outcome === 'failed') { haptic.error(); setState('failed'); } else succeed();
    }, outcome === 'slow' ? 4500 : 2200);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bgPrimary, paddingTop: insets.top + space.xxxl, paddingBottom: Math.max(insets.bottom, space.md), paddingHorizontal: layout.margin }}>
      {state === 'waiting' ? (
        <Animated.View entering={FadeIn.duration(200)} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.lg }}>
          <View style={{ boxShadow: '0 12px 28px rgba(1,52,71,0.18)', borderRadius: 26 }}>
            <PayLogo method={method} size={88} />
          </View>
          <Text variant="title2" align="center">{tr('pay.finishIn', 'Finish paying in {{m}}', { m: paymentLabel(tr, method) })}</Text>
          <Text variant="body" color="textSecondary" align="center">{tr('pay.waiting', 'We’ll bring you back here when {{total}} is paid.', { total })}</Text>
          <ActivityIndicator color={t.colors.textSecondary} accessibilityLabel={tr('pay.waitingA11y', 'Waiting for payment')} />
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown.springify().damping(26).stiffness(170)} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: space.lg }}>
          <Icon name="exclamationmark.triangle" size={56} color="danger" rendering="hierarchical" />
          <Text variant="title2" align="center">{tr('pay.failed', 'Payment didn’t go through')}</Text>
          <Text variant="body" color="textSecondary" align="center">{tr('pay.failedBody', 'Nothing was charged. You can try again or choose another way to pay.')}</Text>
        </Animated.View>
      )}
      <View style={{ gap: space.xs }}>
        {state === 'failed' ? (
          <>
            <Button label={tr('pay.tryAgain', 'Try again')} onPress={() => setState('waiting')} />
            {p.flow === 'order' || p.flow === 'booking' ? <Button variant="plain" label={p.flow === 'order' ? tr('pay.cashInstead', 'Pay cash on delivery instead') : tr('pay.cashSessionInstead', 'Pay cash at the session instead')} onPress={() => succeed('cash')} /> : null}
          </>
        ) : (
          <Button variant="plain" label={tr('common.cancel', 'Cancel')} onPress={go.back} />
        )}
      </View>
    </View>
  );
}
