import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { mobilityIcon, mobilityLabel } from '@/features/labels';
import { useT, type Tr } from '@/i18n';
import { useSettings, type Mobility } from '@/stores/settings';
import { space } from '@/theme';
import { Button, go, TextField, useScreen } from '@/ui';
import { AnswerChip, Bubble, ChatTop, MovoSays } from '@/features/onboarding/chat';

const OPTS: Mobility[] = ['manual', 'power', 'walker-crutches', 'other', 'none'];

/** What Movo says back, so the person sees what their answer changes. */
function reply(tr: Tr, sel: Mobility[]) {
  if (sel.includes('manual') || sel.includes('power')) return tr('onb.chat.m.wheel', "Got it. I'll show places with step-free entrances and wide doors first.");
  if (sel.includes('walker-crutches')) return tr('onb.chat.m.walk', "Got it. I'll show places with few steps and handrails first.");
  if (sel.includes('other')) return tr('onb.chat.m.other', 'Thanks. Tell me more below if you like.');
  return tr('onb.chat.m.none', "No problem. You'll see every place with all its details.");
}

export default function HowYouMove() {
  const tr = useT();
  const insets = useSafeAreaInsets();
  const s = useSettings();
  const scr = useScreen();
  const [sel, setSel] = useState<Mobility[]>(s.mobility);
  const [other, setOther] = useState(s.mobilityOther);
  const toggle = (m: Mobility) => setSel((cur) => (m === 'none' ? (cur.includes('none') ? [] : ['none']) : cur.includes(m) ? cur.filter((x) => x !== m) : [...cur.filter((x) => x !== 'none'), m]));
  return (
    <View style={{ flex: 1, paddingBottom: Math.max(insets.bottom, space.md) }}>
      {/* Step 2 of 2 during setup; opened later from Profile it just edits the answer. */}
      <ChatTop step={2} total={2} bar={!s.onboarded} />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: scr.gutter, paddingTop: space.lg, paddingBottom: space.md, gap: space.xs }} showsVerticalScrollIndicator={false}>
        {!s.onboarded && s.forWhom === 'me' ? <Bubble from="me" faded>{tr('onb.chat.who.me', 'Just me')}</Bubble> : null}
        <MovoSays delay={100} lines={[tr('onb.chat.m.q', 'How do you get around?'), tr('onb.chat.m.q2', 'Pick all that apply.')]} style={!s.onboarded && s.forWhom === 'me' ? { marginTop: space.xs } : undefined} />
        {/* Quick replies sit right under the question, on the person's side, like a chat. */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 6, marginStart: 36, marginTop: 2 }} accessibilityRole="list">
          {OPTS.map((m, k) => (
            <AnswerChip key={m} multi index={k} icon={mobilityIcon[m]} label={mobilityLabel(tr, m)} selected={sel.includes(m)} onPress={() => toggle(m)} />
          ))}
        </View>
        {sel.length ? <MovoSays key={reply(tr, sel)} delay={250} lines={[reply(tr, sel)]} style={{ marginTop: space.xs }} /> : null}
        {sel.includes('other') ? <Animated.View entering={FadeInDown} style={{ marginTop: space.xs }}><TextField label={tr('onb.move.otherLabel', 'Tell us more (optional)')} value={other} onChangeText={setOther} /></Animated.View> : null}
      </ScrollView>
      <View style={{ paddingHorizontal: scr.gutter, paddingTop: space.sm }}>
        <Button label={s.onboarded ? tr('common.done', 'Done') : tr('onb.finish', 'Start exploring')} disabledReason={sel.length ? null : tr('onb.move.choose', 'Choose at least one')} onPress={() => { if (s.onboarded) { s.set({ mobility: sel, mobilityOther: other }); go.back(); } else { s.set({ mobility: sel, mobilityOther: other, onboarded: true }); go.replace('/'); } }} />
      </View>
    </View>
  );
}
