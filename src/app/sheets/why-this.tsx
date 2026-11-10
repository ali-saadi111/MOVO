import { View } from 'react-native';

import { mobilityLabel } from '@/features/labels';
import { useT } from '@/i18n';
import { haptic } from '@/lib/haptics';
import { layout, space } from '@/theme';
import { Button, ListRow, Section, Sheet, Text, go, useMobilityFor } from '@/ui';

export default function WhyThis() {
  const tr = useT();
  const mob = useMobilityFor();
  return (
    <Sheet title={tr('why.title', 'Why you’re seeing this')} detent={0.62}>
      <Section header={tr('why.reasons', 'Because')}>
        <ListRow icon="figure.roll" title={tr('why.r1', 'You told us you use a {{m}}', { m: mobilityLabel(tr, mob ?? 'manual').toLowerCase() })} trailing={{ type: 'none' }} />
        <ListRow icon="star" title={tr('why.r2', 'People who move like you rated these highly')} trailing={{ type: 'none' }} />
      </Section>
      <Section>
        <ListRow icon="hand.thumbsup" title={tr('why.more', 'More like this')} onPress={() => { haptic.selection(); go.back(); }} />
        <ListRow icon="hand.thumbsdown" title={tr('why.fewer', 'Fewer like this')} onPress={() => { haptic.selection(); go.back(); }} />
        <ListRow icon="eye.slash" title={tr('why.hide', 'Hide “For you”')} onPress={() => { haptic.selection(); go.back(); }} />
      </Section>
      <View style={{ paddingHorizontal: layout.margin, gap: space.xs }}>
        <Text variant="footnote" color="textSecondary">{tr('why.note', 'We never use your health details for ads.')}</Text>
        <Button label={tr('why.change', 'Change what matters to me')} variant="secondary" onPress={() => { go.back(); go.push('/(onboarding)/how-you-move'); }} />
      </View>
    </Sheet>
  );
}
