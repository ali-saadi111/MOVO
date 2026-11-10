import { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useT } from '@/i18n';
import { useSettings } from '@/stores/settings';
import { layout, space } from '@/theme';
import { Button, go } from '@/ui';
import { PickTile, StepBanner } from '@/features/onboarding/kit';

const ME = require('../../../assets/people/session-12.jpg');
const SOMEONE = require('../../../assets/people/session-40.jpg');

export default function Who() {
  const tr = useT();
  const insets = useSafeAreaInsets();
  const set = useSettings((s) => s.set);
  const [who, setWho] = useState<'me' | 'someone' | null>(useSettings.getState().forWhom);
  return (
    <View style={{ flex: 1, paddingBottom: Math.max(insets.bottom, space.md) }}>
      <StepBanner step={2} total={who === 'someone' ? 3 : 2} top={tr('onb.who.top', 'WHO IS')} bottom={tr('onb.who.bottom', 'MOVO FOR?')} sub={tr('onb.who.sub', 'Caregivers can switch between people at any time.')} />
      <View style={{ flexDirection: 'row', gap: space.sm, paddingHorizontal: layout.margin, marginTop: space.lg }}>
        <PickTile image={ME} title={tr('onb.who.me', 'Myself')} sub={tr('onb.who.meSub', 'I use Movo for me')} selected={who === 'me'} onPress={() => setWho('me')} height={236} index={0} />
        <PickTile image={SOMEONE} title={tr('onb.who.someone', 'Someone I care for')} sub={tr('onb.who.someoneSub', 'A parent, child or partner')} selected={who === 'someone'} onPress={() => setWho('someone')} height={236} index={1} />
      </View>
      <View style={{ flex: 1 }} />
      <View style={{ paddingHorizontal: layout.margin }}>
        <Button
          label={who === 'someone' ? tr('common.continue', 'Continue') : tr('onb.finish', 'Start exploring')}
          disabledReason={who ? null : tr('onb.who.choose', 'Choose one')}
          onPress={() => { set({ forWhom: who }); if (who === 'someone') go.push('/caregiver-person'); else { set({ onboarded: true }); go.replace('/'); } }}
        />
      </View>
    </View>
  );
}
