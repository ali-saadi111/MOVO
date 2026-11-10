import { View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { mobilityLabel } from '@/features/labels';
import { useT } from '@/i18n';
import { useCaregiver } from '@/stores/caregiver';
import type { Mobility } from '@/stores/settings';
import { layout, space } from '@/theme';
import { Avatar, Button, ListRow, Screen, Section, Text, go } from '@/ui';

export default function Caregiver() {
  const tr = useT();
  const people = useCaregiver((s) => s.people);
  const acting = useCaregiver((s) => s.actingFor);
  const switchTo = useCaregiver((s) => s.switchTo);
  return (
    <Screen title={tr('profile.caregiver', 'Caregiver')} variant="detail" grouped>
      <View style={{ paddingHorizontal: layout.margin, paddingTop: space.md, marginBottom: space.lg }}>
        <Text variant="body" color="textSecondary">{tr('caregiver.lead', 'Book, order and save places for someone you look after. Switch to them and Movo shows what fits how they move.')}</Text>
      </View>
      <Section header={tr('caregiver.people', 'People')}>
        {people.map((p) => (
          <Animated.View key={p.id} entering={FadeInDown} layout={LinearTransition}>
            <ListRow
              leading={<Avatar name={p.firstName} size={40} />}
              title={p.firstName}
              subtitle={`${tr(`rel.${p.relationship.toLowerCase()}`, p.relationship)} · ${p.mobility.filter((m) => m !== 'none').map((m) => mobilityLabel(tr, m as Exclude<Mobility, 'none'>)).join(', ')}`}
              trailing={{ type: 'node', node: <Button label={acting === p.id ? tr('caregiver.acting', 'Acting') : tr('caregiver.switch', 'Switch')} size="medium" variant={acting === p.id ? 'secondary' : 'primary'} fullWidth={false} onPress={() => switchTo(acting === p.id ? null : p.id)} /> }}
            />
          </Animated.View>
        ))}
        <ListRow icon="plus" title={tr('caregiver.add', 'Add a person')} onPress={() => go.push('/sheets/add-person')} />
      </Section>
      {people.length ? (
        <Section>
          {people.map((p) => <ListRow key={p.id} title={tr('caregiver.remove', 'Remove {{name}}', { name: p.firstName })} destructive trailing={{ type: 'none' }} onPress={() => go.push(`/sheets/confirm?kind=removePerson&id=${p.id}`)} />)}
        </Section>
      ) : null}
    </Screen>
  );
}
