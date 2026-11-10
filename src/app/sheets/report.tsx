import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { FormSent } from '@/features/shell/FormSent';
import { useT } from '@/i18n';
import { EMPTY_DRAFT, useDrafts } from '@/stores/drafts';
import { layout, space } from '@/theme';
import { Button, ListRow, Section, Sheet, TextField } from '@/ui';

export default function Report() {
  const { place } = useLocalSearchParams<{ place: string }>();
  const tr = useT();
  const key = `report:${place}`;
  const draft = useDrafts((s) => s.drafts[key] ?? EMPTY_DRAFT) as { what?: string; note?: string };
  const save = useDrafts((s) => s.save);
  const [sent, setSent] = useState(false);
  const opts = [['entrance', tr('report.entrance', 'Entrance')], ['toilet', tr('report.toilet', 'Toilet')], ['closed', tr('report.closed', 'Closed or moved')], ['other', tr('report.other', 'Something else')]];
  if (sent) return <Sheet title={tr('report.title', 'Report a change')} detent={0.7}><FormSent title={tr('report.sent', 'Thanks for telling us')} body={tr('report.sentBody', 'The team will visit and let you know.')} done={tr('common.done', 'Done')} /></Sheet>;
  return (
    <Sheet title={tr('report.title', 'Report a change')} detent={0.92} footer={<Button label={tr('report.send', 'Send report')} disabledReason={draft.what ? null : tr('report.choose', 'Choose what changed')} onPress={() => { useDrafts.getState().clear(key); setSent(true); }} />}>
      <Section header={tr('report.what', 'What changed?')}>
        {opts.map(([k, l]) => <ListRow key={k} title={l} trailing={{ type: 'check', on: draft.what === k }} onPress={() => save(key, { ...draft, what: k })} />)}
      </Section>
      <View style={{ paddingHorizontal: layout.margin, gap: space.lg }}>
        <TextField label={tr('report.note', 'Add a note (optional)')} value={draft.note ?? ''} onChangeText={(v) => save(key, { ...draft, note: v })} multiline maxLength={500} />
        <Button label={tr('report.photo', 'Add a photo')} variant="secondary" icon="camera" onPress={() => {}} />
      </View>
    </Sheet>
  );
}
