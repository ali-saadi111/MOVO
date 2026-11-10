import { View } from 'react-native';

import { sync } from '@/data';
import { useT } from '@/i18n';
import { useActivity } from '@/stores/activity';
import { layout, space } from '@/theme';
import { Button, Divider, EmptyState, PlaceRow, Screen, Tag, go, useTabNav } from '@/ui';

export default function Saved() {
  const tr = useT();
  const { push } = useTabNav();
  const saved = useActivity((s) => s.saved).map((id) => sync.place(id)).filter((p) => !!p);
  return (
    <Screen title={tr('profile.saved', 'Saved places')} variant="root">
      {!saved.length ? <EmptyState symbol="bookmark" message={tr('saved.empty', 'No saved places yet.')} actionLabel={tr('saved.find', 'Find places on the map')} onAction={() => go.push('/')} /> : saved.map((p, i) => (
        <View key={p.id}>
          {i > 0 ? <Divider inset={layout.margin + 64 + space.sm} /> : null}
          {i === 0 ? <View style={{ paddingHorizontal: layout.margin, paddingTop: space.xs }}><Tag tone="warning" label={tr('saved.changed', 'Rating changed')} /></View> : null}
          <PlaceRow place={p} index={i} onPress={() => push(`/place/${p.id}`)} />
          <View style={{ paddingStart: layout.margin + 64 + space.sm, marginTop: -space.xs, marginBottom: space.xs }}>
            <Button label={tr('common.remove', 'Remove')} variant="plain" size="medium" fullWidth={false} onPress={() => go.push(`/sheets/confirm?kind=removeSaved&id=${p.id}`)} />
          </View>
        </View>
      ))}
    </Screen>
  );
}
