import { View } from 'react-native';

import { sync } from '@/data';
import { useT } from '@/i18n';
import { haptic } from '@/lib/haptics';
import { useActivity } from '@/stores/activity';
import { layout, space, useTheme } from '@/theme';
import { Divider, EmptyState, PlaceRow, Pressable, Screen, SwipeRow, Tag, Text, go, useTabNav } from '@/ui';

/** Saved places. Swipe a place left to remove it, or press and hold for Directions, Share and Remove. */
export default function Saved() {
  const t = useTheme();
  const tr = useT();
  const { push } = useTabNav();
  const saved = useActivity((s) => s.saved).map((id) => sync.place(id)).filter((p) => !!p);
  const remove = (id: string) => go.push(`/sheets/confirm?kind=removeSaved&id=${id}`);
  return (
    <Screen title={tr('profile.saved', 'Saved places')} variant="root">
      {!saved.length ? <EmptyState symbol="bookmark" message={tr('saved.empty', 'No saved places yet.')} actionLabel={tr('saved.find', 'Find places on the map')} onAction={() => go.push('/')} /> : saved.map((p, i) => (
        <View key={p.id}>
          {i > 0 ? <Divider inset={layout.margin + 64 + space.sm} /> : null}
          <SwipeRow
            action={(
              <Pressable feedback="none" onPress={() => remove(p.id)} accessibilityRole="button" accessibilityLabel={tr('common.remove', 'Remove')} style={{ width: 88, backgroundColor: t.colors.danger, alignItems: 'center', justifyContent: 'center' }}>
                <Text variant="subheadline" weight="700" style={{ color: '#FFFFFF' }}>{tr('common.remove', 'Remove')}</Text>
              </Pressable>
            )}
          >
            <PlaceRow
              place={p}
              index={i}
              tag={i === 0 ? <Tag tone="warning" label={tr('saved.changed', 'Rating changed')} /> : undefined}
              onPress={() => push(`/place/${p.id}`)}
              onLongPress={() => { haptic.light(); go.push(`/sheets/place-actions?id=${p.id}`); }}
            />
          </SwipeRow>
        </View>
      ))}
      {saved.length ? <Text variant="footnote" color="textTertiary" style={{ textAlign: 'center', marginTop: space.md }}>{tr('saved.hint', 'Press and hold a place for directions, sharing or to remove it.')}</Text> : null}
    </Screen>
  );
}
