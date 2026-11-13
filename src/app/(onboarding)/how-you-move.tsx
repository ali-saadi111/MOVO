import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { mobilityIcon, mobilityLabel } from '@/features/labels';
import { useT, type Tr } from '@/i18n';
import { useSettings, type Mobility } from '@/stores/settings';
import { Button, go, TextField } from '@/ui';
import { ChatBody, ChatHeader, MeSays, MovoSays, ReplyChip, ReplyChips, ReplyTray, useChatColors } from '@/features/onboarding/chat';

const OPTS: Mobility[] = ['manual', 'power', 'walker-crutches', 'other', 'none'];

/** What Movo says back, so the person sees what their answer changes. */
function reply(tr: Tr, sel: Mobility[]) {
  if (sel.includes('manual') || sel.includes('power')) return tr('onb.chat.m.wheel', "Got it. I'll show places with step-free entrances and wide doors first.");
  if (sel.includes('walker-crutches')) return tr('onb.chat.m.walk', "Got it. I'll show places with few steps and handrails first.");
  if (sel.includes('other')) return tr('onb.chat.m.other', 'Thanks. Tell me more below if you like.');
  return tr('onb.chat.m.none', "No problem. You'll see every place with all its details.");
}

/** Question 2: how you get around. Opened later from Profile, it just edits the answer. */
export default function HowYouMove() {
  const tr = useT();
  const c = useChatColors();
  const s = useSettings();
  const [sel, setSel] = useState<Mobility[]>(s.mobility);
  const [other, setOther] = useState(s.mobilityOther);
  const toggle = (m: Mobility) => setSel((cur) => (m === 'none' ? (cur.includes('none') ? [] : ['none']) : cur.includes(m) ? cur.filter((x) => x !== m) : [...cur.filter((x) => x !== 'none'), m]));
  const setup = !s.onboarded;
  // The person's answer reads as one message, in the order of the options.
  const picked = OPTS.filter((m) => sel.includes(m)).map((m) => mobilityLabel(tr, m));
  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <ChatHeader step={setup ? 2 : undefined} total={setup ? 2 : undefined} />
      <ChatBody>
        {setup && s.forWhom === 'me' ? (
          <>
            <MovoSays lines={[tr('onb.chat.who.q1', 'First, who will use Movo?')]} typing={0} />
            <MeSays lines={[tr('onb.chat.who.me', 'Just me')]} delay={0} />
          </>
        ) : null}
        <MovoSays delay={150} lines={[tr('onb.chat.m.q', 'How do you get around?'), tr('onb.chat.m.q2', 'Pick all that apply.')]} />
        {picked.length ? <MeSays lines={[picked.join(', ')]} /> : null}
        {sel.length ? <MovoSays key={reply(tr, sel)} delay={250} lines={[reply(tr, sel)]} /> : null}
      </ChatBody>
      <ReplyTray delay={700} label={tr('onb.chat.replyMany', 'Your reply · pick any')} footer={
        <Button label={s.onboarded ? tr('common.done', 'Done') : tr('onb.finish', 'Start exploring')} disabledReason={sel.length ? null : tr('onb.move.choose', 'Choose at least one')}
          onPress={() => { if (s.onboarded) { s.set({ mobility: sel, mobilityOther: other }); go.back(); } else { s.set({ mobility: sel, mobilityOther: other, onboarded: true }); go.replace('/'); } }} />
      }>
        <ReplyChips>
          {OPTS.map((m) => <ReplyChip key={m} grid multi icon={mobilityIcon[m]} label={mobilityLabel(tr, m)} selected={sel.includes(m)} onPress={() => toggle(m)} />)}
        </ReplyChips>
        {sel.includes('other') ? <Animated.View entering={FadeInDown}><TextField label={tr('onb.move.otherLabel', 'Tell us more (optional)')} value={other} onChangeText={setOther} /></Animated.View> : null}
      </ReplyTray>
    </View>
  );
}
