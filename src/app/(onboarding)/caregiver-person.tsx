import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PersonForm } from '@/features/caregiver/PersonForm';
import { useT } from '@/i18n';
import { useSettings } from '@/stores/settings';
import { space } from '@/theme';
import { go, useScreen } from '@/ui';
import { ChatTop, MovoSays } from '@/features/onboarding/chat';

export default function CaregiverPerson() {
  const tr = useT();
  const insets = useSafeAreaInsets();
  const scr = useScreen();
  const set = useSettings((s) => s.set);
  return (
    <View style={{ flex: 1, paddingBottom: Math.max(insets.bottom, space.md) }}>
      <ChatTop step={2} total={2} />
      <MovoSays delay={100} lines={[tr('onb.chat.person.q', 'Tell me about the person you care for.'), tr('onb.chat.person.q2', 'Their first name and how they get around is enough.')]} style={{ paddingHorizontal: scr.gutter, paddingTop: space.lg, paddingBottom: space.lg }} />
      <PersonForm onSaved={() => { set({ onboarded: true }); go.replace('/'); }} ctaLabel={tr('onb.finish', 'Start exploring')} gutter={scr.gutter} />
    </View>
  );
}
