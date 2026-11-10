import { useState } from 'react';
import { View } from 'react-native';

import type { PlaceCategory } from '@/data';
import { FormSent } from '@/features/shell/FormSent';
import { placeTypeLabel } from '@/features/labels';
import { useT } from '@/i18n';
import { layout, radii, space, useTheme } from '@/theme';
import { Button, ChipWrap, Icon, Sheet, Text, TextField } from '@/ui';

export default function RequestPlace() {
  const t = useTheme();
  const tr = useT();
  const [name, setName] = useState('');
  const [type, setType] = useState<PlaceCategory | null>(null);
  const [sent, setSent] = useState(false);
  if (sent) return <Sheet title={tr('request.title', 'Request a place')} detent={0.7}><FormSent title={tr('request.sent', 'Request sent')} body={tr('request.sentBody', 'Thanks. The team will visit and let you know.')} done={tr('common.done', 'Done')} /></Sheet>;
  const cats: PlaceCategory[] = ['cafe', 'restaurant', 'pharmacy', 'clinic', 'bank', 'shop', 'supermarket', 'outdoor'];
  return (
    <Sheet title={tr('request.title', 'Request a place')} detent={0.92} footer={<Button label={tr('request.send', 'Send request')} disabledReason={!name.trim() ? tr('request.needName', 'Add the place’s name') : !type ? tr('request.needType', 'Choose a type') : null} onPress={() => setSent(true)} />}>
      <View style={{ paddingHorizontal: layout.margin, gap: space.xl, paddingTop: space.xs }}>
        <TextField label={tr('request.name', 'Place name')} value={name} onChangeText={setName} />
        <View style={{ gap: space.sm }}>
          <Text variant="subheadline" weight="600">{tr('request.type', 'Type')}</Text>
          <ChipWrap options={cats.map((c) => ({ value: c, label: placeTypeLabel(tr, c) }))} value={type} onChange={setType} />
        </View>
        <View style={{ gap: space.sm }}>
          <Text variant="subheadline" weight="600">{tr('request.pin', 'Where is it?')}</Text>
          <View style={{ height: 140, borderRadius: radii.card, backgroundColor: t.colors.mapLand, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <Icon name="location.fill" size={30} color="tint" />
            <Text variant="footnote" color="textSecondary" style={{ marginTop: 6 }}>{tr('request.pinHint', 'Drag the map to place the pin')}</Text>
          </View>
        </View>
      </View>
    </Sheet>
  );
}
