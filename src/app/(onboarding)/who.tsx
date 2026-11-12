import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useT } from '@/i18n';
import { useSettings } from '@/stores/settings';
import { space } from '@/theme';
import { Button, go, useScreen } from '@/ui';
import { AnswerCard, ChatTop, MovoSays } from '@/features/onboarding/chat';

const ME = require('../../../assets/onboarding/who-me.jpg');
const SOMEONE = require('../../../assets/onboarding/who-someone.jpg');

export default function Who() {
  const tr = useT();
  const insets = useSafeAreaInsets();
  const set = useSettings((s) => s.set);
  const scr = useScreen();
  const [who, setWho] = useState<'me' | 'someone' | null>(useSettings.getState().forWhom);
  return (
    <View style={{ flex: 1, paddingBottom: Math.max(insets.bottom, space.md) }}>
      <ChatTop step={1} total={2} />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: scr.gutter, paddingTop: space.lg, paddingBottom: space.md, gap: space.xs }} showsVerticalScrollIndicator={false}>
        <MovoSays delay={150} lines={[tr('onb.chat.who.q1', 'First, who will use Movo?')]} style={{ marginTop: space.xs }} />
        {/* The two answers sit right under the question, on the person's side. */}
        <View style={{ gap: 6, marginStart: 36, marginTop: 2 }} accessibilityRole="radiogroup">
          <AnswerCard image={ME} title={tr('onb.chat.who.me', 'Just me')} sub={tr('onb.chat.who.meSub', 'I use Movo for myself')} selected={who === 'me'} onPress={() => setWho('me')} index={0} />
          <AnswerCard image={SOMEONE} title={tr('onb.who.someone', 'Someone I care for')} sub={tr('onb.chat.who.someoneSub', 'A parent, child or partner')} selected={who === 'someone'} onPress={() => setWho('someone')} index={1} />
        </View>
        {who ? <MovoSays key={`r-${who}`} delay={250} lines={[who === 'me' ? tr('onb.chat.who.rMe1', 'Got it. One more question about you.') : tr('onb.chat.who.rSomeone1', 'Lovely. Next, tell me a little about them. You can add more people later.')]} style={{ marginTop: space.xs }} /> : null}
      </ScrollView>
      <View style={{ paddingHorizontal: scr.gutter, paddingTop: space.sm }}>
        <Button
          label={tr('common.continue', 'Continue')}
          disabledReason={who ? null : tr('onb.who.choose', 'Choose one')}
          onPress={() => { set({ forWhom: who }); go.push(who === 'someone' ? '/caregiver-person' : '/how-you-move'); }}
        />
      </View>
    </View>
  );
}
