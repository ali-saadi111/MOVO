import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import type { ServiceKind } from '@/data';
import { serviceLabel } from '@/features/labels';
import { useT } from '@/i18n';
import { layout, space } from '@/theme';
import { Button, ChoiceRow, Sheet, TextField, go } from '@/ui';

export default function ChooseWhere() {
  const { kind } = useLocalSearchParams<{ kind: ServiceKind }>();
  const tr = useT();
  const [where, setWhere] = useState<'home' | 'clinic' | null>(null);
  const [note, setNote] = useState('');
  return (
    <Sheet title={serviceLabel(tr, kind)} detent={0.62}
      footer={<Button label={tr('care.seeSpecialists', 'See specialists')} disabledReason={where ? null : tr('care.chooseWhere', 'Choose where')} onPress={() => { go.back(); setTimeout(() => go.push(`/(tabs)/(care)/specialists/${kind}?where=${where}`), 30); }} />}>
      <View style={{ paddingHorizontal: layout.margin, gap: space.sm, paddingTop: space.xs }}>
        <ChoiceRow icon="house" title={tr('care.homeVisit', 'Home visit')} subtitle={tr('care.homeSub', 'Hamra, Makdessi St, Bldg 14')} selected={where === 'home'} onPress={() => setWhere('home')} />
        <ChoiceRow icon="building.2" title={tr('care.clinic', 'At the clinic')} subtitle={tr('care.clinicSub', 'Clinics show their Map rating')} selected={where === 'clinic'} onPress={() => setWhere('clinic')} />
        {where === 'home' ? <TextField label={tr('care.note', 'Anything the specialist should know? (optional)')} value={note} onChangeText={setNote} multiline maxLength={300} /> : null}
      </View>
    </Sheet>
  );
}
