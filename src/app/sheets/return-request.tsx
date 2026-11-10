import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { FormSent } from '@/features/shell/FormSent';
import { useT } from '@/i18n';
import { layout, space } from '@/theme';
import { Button, ListRow, Section, Sheet, Text, TextField } from '@/ui';

export default function ReturnRequest() {
  const { order } = useLocalSearchParams<{ order: string }>();
  const tr = useT();
  const [why, setWhy] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);
  const opts = [['fit', tr('return.fit', 'It doesn’t fit')], ['damaged', tr('return.damaged', 'It arrived damaged')], ['wrong', tr('return.wrong', 'Wrong item')], ['other', tr('return.other', 'Something else')]];
  if (sent) return <Sheet title={tr('return.title', 'Return an item')} detent={0.7}><FormSent title={tr('return.sent', 'Return requested')} body={tr('return.sentBody', 'We’ll collect it from your door within 3 days and refund you the same way you paid.')} done={tr('common.done', 'Done')} /></Sheet>;
  return (
    <Sheet title={tr('return.title', 'Return an item')} detent={0.92} footer={<Button label={tr('return.send', 'Request return')} disabledReason={why ? null : tr('return.choose', 'Choose a reason')} onPress={() => setSent(true)} />}>
      <View style={{ paddingHorizontal: layout.margin, marginBottom: space.lg }}>
        <Text variant="body" color="textSecondary">{tr('return.lead', 'Order {{id}}. Free returns within 14 days.', { id: order ?? '' })}</Text>
      </View>
      <Section header={tr('return.why', 'Why are you returning it?')}>
        {opts.map(([k, l]) => <ListRow key={k} title={l} trailing={{ type: 'check', on: why === k }} onPress={() => setWhy(k)} />)}
      </Section>
      <View style={{ paddingHorizontal: layout.margin }}>
        <TextField label={tr('report.note', 'Add a note (optional)')} value={note} onChangeText={setNote} multiline maxLength={500} />
      </View>
    </Sheet>
  );
}
