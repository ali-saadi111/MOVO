import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { mobilityLabel } from '@/features/labels';
import { useT } from '@/i18n';
import { useSettings } from '@/stores/settings';
import { space } from '@/theme';
import { Button, go, useScreen } from '@/ui';
import { AnswerCard, Bubble, ChatTop, MovoSays } from '@/features/onboarding/chat';

const ME = require('../../../assets/onboarding/who-me.jpg');
const SOMEONE = require('../../../assets/onboarding/who-someone.jpg');

export default function Who() {
  const tr = useT();
  const insets = useSafeAreaInsets();
  const set = useSettings((s) => s.set);
  const mobility = useSettings((s) => s.mobility);
  const scr = useScreen();
  const [who, setWho] = useState<'me' | 'someone' | null>(useSettings.getState().forWhom);
  const before = mobility.map((m) => mobilityLabel(tr, m)).join(', ');
  return (
    <View style={{ flex: 1, paddingBottom: Math.max(insets.bottom, space.md) }}>
      <ChatTop step={2} total={who === 'someone' ? 3 : 2} />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: scr.gutter, paddingTop: space.lg, paddingBottom: space.md, gap: space.xs }} showsVerticalScrollIndicator={false}>
        {before ? <Bubble from="me" faded>{before}</Bubble> : null}
        <MovoSays delay={150} lines={[tr('onb.chat.who.q', 'Last one. Who will use Movo?')]} style={{ marginTop: space.xs }} />
        {/* The two answers sit right under the question, on the person's side. */}
        <View style={{ gap: 6, marginStart: 36, marginTop: 2 }} accessibilityRole="radiogroup">
          <AnswerCard image={ME} title={tr('onb.chat.who.me', 'Just me')} sub={tr('onb.chat.who.meSub', 'I use Movo for myself')} selected={who === 'me'} onPress={() => setWho('me')} index={0} />
          <AnswerCard image={SOMEONE} title={tr('onb.who.someone', 'Someone I care for')} sub={tr('onb.chat.who.someoneSub', 'A parent, child or partner')} selected={who === 'someone'} onPress={() => setWho('someone')} index={1} />
        </View>
        {who ? <MovoSays key={`r-${who}`} delay={250} lines={[who === 'me' ? tr('onb.chat.who.rMe', "Perfect. Let's get you moving.") : tr('onb.chat.who.rSomeone', 'Lovely. Next, tell me a little about them. You can switch between people any time.')]} style={{ marginTop: space.xs }} /> : null}
      </ScrollView>
      <View style={{ paddingHorizontal: scr.gutter, paddingTop: space.sm }}>
        <Button
          label={who === 'someone' ? tr('common.continue', 'Continue') : tr('onb.finish', 'Start exploring')}
          disabledReason={who ? null : tr('onb.who.choose', 'Choose one')}
          onPress={() => { set({ forWhom: who }); if (who === 'someone') go.push('/caregiver-person'); else { set({ onboarded: true }); go.replace('/'); } }}
        />
      </View>
    </View>
  );
}
