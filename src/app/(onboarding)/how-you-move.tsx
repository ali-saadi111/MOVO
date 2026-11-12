import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { mobilityIcon, mobilityLabel } from '@/features/labels';
import { useT } from '@/i18n';
import { useSettings, type Mobility } from '@/stores/settings';
import { space } from '@/theme';
import { Button, go, TextField, useScreen } from '@/ui';
import { OptionRow, StepBanner } from '@/features/onboarding/kit';

const OPTS: Mobility[] = ['manual', 'power', 'walker-crutches', 'other', 'none'];

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
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: space.md }} showsVerticalScrollIndicator={false}>
        <StepBanner step={1} total={s.forWhom === 'someone' ? 3 : 2} top={tr('onb.move.top', 'HOW DO')} bottom={tr('onb.move.bottom', 'YOU MOVE?')} sub={tr('onb.move.sub', 'We use this to show what fits you first. Choose all that apply.')} />
        {/* Rows share the free height, so the list fills the screen instead of leaving a gap above Continue. */}
        <View style={{ flexGrow: 1, gap: space.sm, paddingHorizontal: scr.gutter, marginTop: scr.short ? space.md : space.lg }}>
          {OPTS.map((m, k) => (
            <OptionRow key={m} multi index={k} icon={mobilityIcon[m]} title={mobilityLabel(tr, m)} selected={sel.includes(m)} onPress={() => toggle(m)} style={{ flexGrow: 1, maxHeight: 100 }} />
          ))}
          {sel.includes('other') ? <Animated.View entering={FadeInDown}><TextField label={tr('onb.move.otherLabel', 'Tell us more (optional)')} value={other} onChangeText={setOther} /></Animated.View> : null}
        </View>
      </ScrollView>
      <View style={{ paddingHorizontal: scr.gutter, paddingTop: space.sm }}>
        <Button label={tr('common.continue', 'Continue')} disabledReason={sel.length ? null : tr('onb.move.choose', 'Choose at least one')} onPress={() => { s.set({ mobility: sel, mobilityOther: other }); go.push('/who'); }} />
      </View>
    </View>
  );
}
