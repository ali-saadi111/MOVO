import { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useT } from '@/i18n';
import { useSettings } from '@/stores/settings';
import { space } from '@/theme';
import { Button, go, useScreen } from '@/ui';
import { PickTile, StepBanner } from '@/features/onboarding/kit';

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
      <StepBanner step={2} total={who === 'someone' ? 3 : 2} top={tr('onb.who.top', 'WHO IS')} bottom={tr('onb.who.bottom', 'MOVO FOR?')} sub={tr('onb.who.sub', 'Caregivers can switch between people at any time.')} />
      {/* The two cards share the free height, so there is no gap above the button. */}
      <View style={{ flex: 1, flexDirection: 'row', gap: space.sm, paddingHorizontal: scr.gutter, marginTop: scr.short ? space.md : space.lg }}>
        <PickTile image={ME} title={tr('onb.who.me', 'Myself')} sub={tr('onb.who.meSub', 'I use Movo for me')} selected={who === 'me'} onPress={() => setWho('me')} fill index={0} />
        <PickTile image={SOMEONE} title={tr('onb.who.someone', 'Someone I care for')} sub={tr('onb.who.someoneSub', 'Family or a partner')} selected={who === 'someone'} onPress={() => setWho('someone')} fill index={1} />
      </View>
      <View style={{ paddingHorizontal: scr.gutter, paddingTop: space.md }}>
        <Button
          label={who === 'someone' ? tr('common.continue', 'Continue') : tr('onb.finish', 'Start exploring')}
          disabledReason={who ? null : tr('onb.who.choose', 'Choose one')}
          onPress={() => { set({ forWhom: who }); if (who === 'someone') go.push('/caregiver-person'); else { set({ onboarded: true }); go.replace('/'); } }}
        />
      </View>
    </View>
  );
}
