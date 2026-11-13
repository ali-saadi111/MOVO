import { useState } from 'react';
import { View } from 'react-native';

import { useT } from '@/i18n';
import { useSettings } from '@/stores/settings';
import { Button, go } from '@/ui';
import { ChatBody, ChatHeader, MeSays, MovoSays, ReplyRow, ReplyTray, useChatColors } from '@/features/onboarding/chat';

/** Question 1: who is Movo for. The answer appears as the person's own message, and Movo answers back. */
export default function Who() {
  const tr = useT();
  const c = useChatColors();
  const set = useSettings((s) => s.set);
  const [who, setWho] = useState<'me' | 'someone' | null>(useSettings.getState().forWhom);
  const answer = who === 'me' ? tr('onb.chat.who.me', 'Just me') : who === 'someone' ? tr('onb.who.someone', 'Someone I care for') : null;
  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <ChatHeader step={1} total={2} />
      <ChatBody>
        <MovoSays delay={150} lines={[tr('onb.chat.who.q1', 'First, who will use Movo?')]} />
        {answer ? <MeSays key={answer} lines={[answer]} /> : null}
        {who ? <MovoSays key={`r-${who}`} delay={250} lines={[who === 'me' ? tr('onb.chat.who.rMe1', 'Got it. One more question about you.') : tr('onb.chat.who.rSomeone1', 'Lovely. Next, tell me a little about them. You can add more people later.')]} /> : null}
      </ChatBody>
      <ReplyTray delay={700} label={tr('onb.chat.reply', 'Your reply')} footer={
        <Button label={tr('common.continue', 'Continue')} disabledReason={who ? null : tr('onb.who.choose', 'Choose one')}
          onPress={() => { set({ forWhom: who }); go.push(who === 'someone' ? '/caregiver-person' : '/how-you-move'); }} />
      }>
        <View style={{ gap: 8 }} accessibilityRole="radiogroup">
          <ReplyRow icon="person.fill" title={tr('onb.chat.who.me', 'Just me')} sub={tr('onb.chat.who.meSub', 'I use Movo for myself')} selected={who === 'me'} onPress={() => setWho('me')} />
          <ReplyRow icon="heart.fill" title={tr('onb.who.someone', 'Someone I care for')} sub={tr('onb.chat.who.someoneSub', 'A parent, child or partner')} selected={who === 'someone'} onPress={() => setWho('someone')} />
        </View>
      </ReplyTray>
    </View>
  );
}
