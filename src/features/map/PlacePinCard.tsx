import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import type { Place } from '@/data';
import { requireAccount } from '@/features/shell/auth';
import { mobilityLabel, placeTypeLabel } from '@/features/labels';
import { useLocalized, useT } from '@/i18n';
import { HERE, distanceKm, formatDistance } from '@/lib/geo';
import { haptic } from '@/lib/haptics';
import { ltr } from '@/lib/rtl';
import { call, directions } from '@/lib/whatsapp';
import { useActivity } from '@/stores/activity';
import { continuous, layout, radii, space, useTheme } from '@/theme';
import { Icon, IconButton, Pressable, RatingBadge, Text, useMobilityFor, type IconName } from '@/ui';

/**
 * The selected place's card (§2.9 moment 2), Apple Maps style: name and rating up top,
 * one row of actions, and the sheet sized to the card. Tapping the card opens the place.
 */
export function PlacePinCard({ place, onOpen, onClose }: { place: Place; onOpen: () => void; onClose: () => void }) {
  const t = useTheme();
  const tr = useT();
  const loc = useLocalized();
  const mob = useMobilityFor();
  const saved = useActivity((s) => s.saved.includes(place.id));
  const toggle = useActivity((s) => s.toggleSaved);
  const [tick, setTick] = useState(0);
  const fits = mob ? place.rating.fits[mob] : null;
  const onSave = () => {
    if (!requireAccount('save', `/place/${place.id}`)) return;
    haptic.light();
    toggle(place.id);
    setTick((n) => n + 1);
  };
  const actions: { icon: IconName; label: string; onPress: () => void; primary?: boolean; bounce?: boolean }[] = [
    { icon: 'arrow.triangle.turn.up.right.diamond.fill', label: tr('place.directions', 'Directions'), onPress: () => directions(place.lat, place.lng, place.name.en), primary: true },
    { icon: 'phone', label: tr('place.call', 'Call'), onPress: () => call(place.phone) },
    { icon: saved ? 'bookmark.fill' : 'bookmark', label: saved ? tr('place.saved', 'Saved') : tr('place.save', 'Save'), onPress: onSave, bounce: true },
    { icon: 'ellipsis', label: tr('map.more', 'More'), onPress: onOpen },
  ];
  return (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={{ paddingHorizontal: layout.margin, gap: space.sm }}>
      <Pressable feedback="none" onPress={onOpen} accessibilityRole="button" accessibilityLabel={tr('map.openPlace', 'Open {{name}}', { name: loc(place.name) })} style={{ gap: space.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.sm }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="title2" numberOfLines={1}>{loc(place.name)}</Text>
            <Text variant="subheadline" color="textSecondary" numberOfLines={1}>{placeTypeLabel(tr, place.category)} · {loc(place.street)} · {ltr(formatDistance(distanceKm(HERE, place)))}</Text>
          </View>
          <IconButton icon="xmark" label={tr('common.close', 'Close')} onPress={onClose} size={40} style={{ marginEnd: -8, marginTop: -4 }} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' }}>
          <RatingBadge level={place.rating.level} size="pillLarge" />
          {mob ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
              <Icon name={fits ? 'checkmark' : 'exclamationmark.triangle'} size={14} weight="semibold" color={fits ? 'accentText' : 'ratingPartly'} />
              <Text variant="subheadline" numberOfLines={1} style={{ flexShrink: 1 }}>
                {fits ? tr('place.fits', 'Fits {{m}}', { m: mobilityLabel(tr, mob).toLowerCase() }) : tr('place.mayNotFit', 'May not fit {{m}}', { m: mobilityLabel(tr, mob).toLowerCase() })}
              </Text>
            </View>
          ) : null}
        </View>
      </Pressable>
      <View style={{ flexDirection: 'row', gap: space.xs, marginTop: space.xs }}>
        {actions.map((a) => (
          <Pressable key={a.icon} onPress={a.onPress} accessibilityRole="button" accessibilityLabel={a.label}
            style={{ flex: 1, height: 58, borderRadius: radii.cell, ...continuous, backgroundColor: a.primary ? t.colors.buttonPrimaryBg : t.colors.fill, alignItems: 'center', justifyContent: 'center', gap: 3 }}>
            <Icon name={a.icon} size={19} weight="semibold" color={a.primary ? { raw: t.colors.buttonPrimaryFg } : 'tint'} effect={a.bounce ? 'bounce' : 'none'} effectKey={a.bounce ? tick : undefined} />
            <Text variant="caption1" weight="600" numberOfLines={1} style={{ color: a.primary ? t.colors.buttonPrimaryFg : t.colors.tint }}>{a.label}</Text>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
}
