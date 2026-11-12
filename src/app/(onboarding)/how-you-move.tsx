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
  const answer = OPTS.filter((m) => sel.includes(m)).map((m) => mobilityLabel(tr, m)).join(', ');
  return (
    <View style={{ flex: 1, paddingBottom: Math.max(insets.bottom, space.md) }}>
      <ChatTop step={1} total={s.forWhom === 'someone' ? 3 : 2} />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: scr.gutter, paddingTop: space.lg, gap: space.xs }} showsVerticalScrollIndicator={false}>
        <MovoSays delay={100} lines={[tr('onb.chat.m.q', 'How do you get around?'), tr('onb.chat.m.q2', 'Pick all that apply.')]} />
        {sel.length ? (
          <>
            <Bubble key={answer} from="me" delay={0}>{answer}</Bubble>
            <MovoSays key={`r-${answer}`} delay={350} lines={[reply(tr, sel)]} />
          </>
        ) : null}
        {sel.includes('other') ? <Animated.View entering={FadeInDown} style={{ marginTop: space.xs }}><TextField label={tr('onb.move.otherLabel', 'Tell us more (optional)')} value={other} onChangeText={setOther} /></Animated.View> : null}
      </ScrollView>
      <View style={{ paddingHorizontal: scr.gutter, paddingTop: space.sm, gap: space.md }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }} accessibilityRole="list">
          {OPTS.map((m, k) => (
            <AnswerChip key={m} multi index={k} icon={mobilityIcon[m]} label={mobilityLabel(tr, m)} selected={sel.includes(m)} onPress={() => toggle(m)} />
          ))}
        </View>
        <Button label={tr('common.done', 'Done')} disabledReason={sel.length ? null : tr('onb.move.choose', 'Choose at least one')} onPress={() => { s.set({ mobility: sel, mobilityOther: other }); go.push('/who'); }} />
      </View>
    </View>
  );
}
