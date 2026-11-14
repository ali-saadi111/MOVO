import { useLocalSearchParams } from 'expo-router';
import { Share } from 'react-native';

import { sync } from '@/data';
import { useLocalized, useT } from '@/i18n';
import { directions } from '@/lib/whatsapp';
import { ListRow, Section, Sheet, go } from '@/ui';

/** Press-and-hold menu for a saved place. */
export default function PlaceActions() {
  const { id = '' } = useLocalSearchParams<{ id?: string }>();
  const tr = useT();
  const loc = useLocalized();
  const p = sync.place(id);
  if (!p) return null;
  return (
    <Sheet title={loc(p.name)} detent={0.36}>
      <Section>
        <ListRow icon="arrow.triangle.turn.up.right.diamond" title={tr('place.directions', 'Directions')} trailing={{ type: 'none' }} onPress={() => { go.back(); directions(p.lat, p.lng, p.name.en); }} />
        <ListRow icon="square.and.arrow.up" title={tr('common.share', 'Share')} trailing={{ type: 'none' }} onPress={() => { Share.share({ message: loc(p.name) }).catch(() => {}); }} />
        <ListRow icon="trash" title={tr('common.remove', 'Remove')} destructive trailing={{ type: 'none' }} onPress={() => { go.back(); setTimeout(() => go.push(`/sheets/confirm?kind=removeSaved&id=${p.id}`), 60); }} />
      </Section>
    </Sheet>
  );
}
