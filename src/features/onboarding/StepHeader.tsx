import { View } from 'react-native';

import { useT } from '@/i18n';
import { space } from '@/theme';
import { go, IconButton, Text } from '@/ui';

export function StepHeader({ step, total, title, sub }: { step: number; total: number; title: string; sub?: string }) {
  const tr = useT();
  return (
    <View style={{ gap: space.xs, marginBottom: space.xl }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginStart: -space.sm }}>
        <IconButton icon="chevron.left" label={tr('nav.back', 'Back')} onPress={go.back} mirrorInRTL />
        <Text variant="subheadline" color="textSecondary" tabular>{tr('onb.step', 'Step {{n}} of {{total}}', { n: step, total })}</Text>
      </View>
      <Text variant="title1">{title}</Text>
      {sub ? <Text variant="body" color="textSecondary">{sub}</Text> : null}
    </View>
  );
}

