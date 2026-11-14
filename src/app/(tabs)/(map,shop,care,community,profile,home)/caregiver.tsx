import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { mobilityLabel } from '@/features/labels';
import { useT } from '@/i18n';
import { useCaregiver } from '@/stores/caregiver';
import type { Mobility } from '@/stores/settings';
import { Avatar, Button, ListRow, Screen, Section, go } from '@/ui';

/** People you care for. Tap someone for their sheet (act for them, how they move, remove). */
export default function Caregiver() {
  const tr = useT();
  const people = useCaregiver((s) => s.people);
  const acting = useCaregiver((s) => s.actingFor);
  const switchTo = useCaregiver((s) => s.switchTo);
  return (
    <Screen title={tr('profile.caringFor', 'Caring for')} variant="detail" grouped>
      <Section footer={tr('caregiver.note', 'Act for someone you look after, and Movo shows what fits how they move.')}>
        {people.map((p) => (
          <Animated.View key={p.id} entering={FadeInDown} layout={LinearTransition}>
            <ListRow
              leading={<Avatar name={p.firstName} size={40} hue={1} />}
              title={p.firstName}
              subtitle={[tr(`rel.${p.relationship.toLowerCase()}`, p.relationship), p.mobility.filter((m) => m !== 'none').map((m) => mobilityLabel(tr, m as Exclude<Mobility, 'none'>)).join(', ')].filter(Boolean).join(' · ')}
              trailing={{ type: 'node', node: <Button label={acting === p.id ? tr('caregiver.acting', 'Acting') : tr('caregiver.switch', 'Switch')} size="medium" variant={acting === p.id ? 'secondary' : 'primary'} fullWidth={false} onPress={() => switchTo(acting === p.id ? null : p.id)} /> }}
              onPress={() => go.push(`/sheets/person?id=${p.id}`)}
            />
          </Animated.View>
        ))}
        <ListRow icon="plus" title={tr('caregiver.add', 'Add a person')} onPress={() => go.push('/sheets/add-person')} />
      </Section>
    </Screen>
  );
}
