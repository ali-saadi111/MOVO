import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import type { Place } from '@/data';
import { placeTypeLabel } from '@/features/labels';
import { useLocalized, useT } from '@/i18n';
import { HERE, distanceKm, formatDistance } from '@/lib/geo';
import { ltr } from '@/lib/rtl';
import { directions } from '@/lib/whatsapp';
import { layout, radii, space } from '@/theme';
import { ArtImage, Button, FitsLine, IconButton, Pressable, RatingBadge, Text } from '@/ui';

/** The selected place's mini card at the medium detent (§2.9 moment 2). */
export function PlacePinCard({ place, onOpen, onClose }: { place: Place; onOpen: () => void; onClose: () => void }) {
  const tr = useT();
  const loc = useLocalized();
  return (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={{ paddingHorizontal: layout.margin, gap: space.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.sm }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text variant="title2" numberOfLines={2}>{loc(place.name)}</Text>
          <Text variant="subheadline" color="textSecondary">{placeTypeLabel(tr, place.category)} · {loc(place.street)} · {ltr(formatDistance(distanceKm(HERE, place)))}</Text>
        </View>
        <IconButton icon="xmark" label={tr('common.close', 'Close')} onPress={onClose} size={40} style={{ marginEnd: -6 }} />
      </View>
      <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel={tr('map.openPlace', 'Open {{name}}', { name: loc(place.name) })} style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
        <View style={{ width: 120 }}><ArtImage image={place.hero} aspect={4 / 3} radius={radii.thumb} /></View>
        <View style={{ flex: 1, gap: space.xs }}>
          <RatingBadge level={place.rating.level} size="large" />
          <FitsLine place={place} />
        </View>
      </Pressable>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        <View style={{ flex: 1 }}><Button label={tr('place.directions', 'Directions')} icon="arrow.triangle.turn.up.right.diamond.fill" onPress={() => directions(place.lat, place.lng, place.name.en)} size="medium" /></View>
        <View style={{ flex: 1 }}><Button label={tr('map.details', 'See details')} variant="secondary" onPress={onOpen} size="medium" /></View>
      </View>
    </Animated.View>
  );
}
