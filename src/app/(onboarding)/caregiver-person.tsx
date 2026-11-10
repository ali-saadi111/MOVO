import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PersonForm } from '@/features/caregiver/PersonForm';
import { useT } from '@/i18n';
import { useSettings } from '@/stores/settings';
import { space } from '@/theme';
import { go } from '@/ui';
import { StepBanner } from '@/features/onboarding/kit';

export default function CaregiverPerson() {
  const tr = useT();
  const insets = useSafeAreaInsets();
  const set = useSettings((s) => s.set);
  return (
    <View style={{ flex: 1, paddingBottom: Math.max(insets.bottom, space.md) }}>
      <StepBanner step={3} total={3} top={tr('onb.person.top', 'WHO DO')} bottom={tr('onb.person.bottom', 'YOU CARE FOR?')} />
      <View style={{ height: space.lg }} />
      <PersonForm onSaved={() => { set({ onboarded: true }); go.replace('/'); }} ctaLabel={tr('onb.finish', 'Start exploring')} />
    </View>
  );
}
