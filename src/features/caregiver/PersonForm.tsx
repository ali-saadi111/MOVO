import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { mobilityLabel } from '@/features/labels';
import { useT } from '@/i18n';
import { useCaregiver } from '@/stores/caregiver';
import type { Mobility } from '@/stores/settings';
import { layout, space } from '@/theme';
import { Button, ChipWrap, Text, TextField } from '@/ui';

/** Same form in onboarding step 3 and Caregiver › Add a person. */
export function PersonForm({ onSaved, ctaLabel, gutter = layout.margin }: { onSaved: () => void; ctaLabel: string; gutter?: number }) {
  const tr = useT();
  const add = useCaregiver((s) => s.add);
  const [name, setName] = useState('');
  const [mob, setMob] = useState<Mobility[]>([]);
  const [rel, setRel] = useState<string | null>(null);
  const rels = ['Parent', 'Child', 'Partner', 'Other'].map((r) => ({ value: r, label: tr(`rel.${r.toLowerCase()}`, r) }));
  const mobs: Mobility[] = ['manual', 'power', 'walker-crutches', 'other'];
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: gutter, gap: space.xl, paddingBottom: space.xl }}>
        <TextField label={tr('person.name', 'First name')} value={name} onChangeText={setName} autoComplete="name" textContentType="name" />
        <View style={{ gap: space.sm }}>
          <Text variant="subheadline" weight="600">{tr('person.move', 'How they move')}</Text>
          <ChipWrap options={mobs.map((m) => ({ value: m, label: mobilityLabel(tr, m) }))} value={mob} onChange={(m) => setMob((c) => (c.includes(m) ? c.filter((x) => x !== m) : [...c, m]))} />
        </View>
        <View style={{ gap: space.sm }}>
          <Text variant="subheadline" weight="600">{tr('person.rel', 'They are my…')}</Text>
          <ChipWrap options={rels} value={rel} onChange={setRel} />
        </View>
      </ScrollView>
      <View style={{ paddingHorizontal: gutter }}>
        <Button
          label={ctaLabel}
          disabledReason={name.trim() ? null : tr('person.needName', 'Add their first name')}
          onPress={() => { add({ id: `cp_${Date.now()}`, firstName: name.trim(), mobility: mob, relationship: rel ?? 'Other' }); onSaved(); }}
        />
      </View>
    </View>
  );
}
