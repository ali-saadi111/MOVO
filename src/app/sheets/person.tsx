import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { mobilityLabel } from '@/features/labels';
import { useT } from '@/i18n';
import { haptic } from '@/lib/haptics';
import { useCaregiver } from '@/stores/caregiver';
import type { Mobility } from '@/stores/settings';
import { layout, space } from '@/theme';
import { Avatar, Button, ChipWrap, Sheet, Text, go } from '@/ui';

/** One person you care for: act for them, change how they move or who they are to you, or remove them. */
export default function Person() {
  const { id = '' } = useLocalSearchParams<{ id?: string }>();
  const tr = useT();
  const p = useCaregiver((s) => s.people.find((x) => x.id === id));
  const acting = useCaregiver((s) => s.actingFor === id);
  const update = useCaregiver((s) => s.update);
  const switchTo = useCaregiver((s) => s.switchTo);
  if (!p) return <Sheet title={tr('profile.caringFor', 'Caring for')} detent={0.3}><View /></Sheet>;
  const mobs: Mobility[] = ['manual', 'power', 'walker-crutches', 'other'];
  const rels = ['Parent', 'Child', 'Daughter', 'Partner', 'Other'].map((r) => ({ value: r, label: tr(`rel.${r.toLowerCase()}`, r) }));
  return (
    <Sheet title={p.firstName} dismissLabel="done" detent={0.74}>
      <View style={{ alignItems: 'center', gap: space.xs, marginBottom: space.lg }}>
        <Avatar name={p.firstName} size={64} hue={1} />
        <Text variant="subheadline" color="textSecondary">{tr(`rel.${p.relationship.toLowerCase()}`, p.relationship)}</Text>
      </View>
      <View style={{ paddingHorizontal: layout.margin, gap: space.xl }}>
        <Button
          icon="arrow.left.arrow.right"
          label={acting ? tr('person.stopActing', 'Stop acting for {{name}}', { name: p.firstName }) : tr('person.actFor', 'Act for {{name}}', { name: p.firstName })}
          variant={acting ? 'secondary' : 'primary'}
          onPress={() => { haptic.success(); switchTo(acting ? null : p.id); go.back(); }}
        />
        <View style={{ gap: space.sm }}>
          <Text variant="subheadline" weight="600">{tr('person.howMoves', 'How {{name}} moves', { name: p.firstName })}</Text>
          <ChipWrap options={mobs.map((m) => ({ value: m, label: mobilityLabel(tr, m) }))} value={p.mobility} onChange={(m) => update(p.id, { mobility: p.mobility.includes(m) ? p.mobility.filter((x) => x !== m) : [...p.mobility, m] })} />
        </View>
        <View style={{ gap: space.sm }}>
          <Text variant="subheadline" weight="600">{tr('person.rel', 'They are my…')}</Text>
          <ChipWrap options={rels} value={p.relationship} onChange={(r) => update(p.id, { relationship: r })} />
        </View>
        <Button label={tr('caregiver.remove', 'Remove {{name}}', { name: p.firstName })} variant="destructive" onPress={() => { go.back(); setTimeout(() => go.push(`/sheets/confirm?kind=removePerson&id=${p.id}`), 60); }} />
      </View>
    </Sheet>
  );
}
