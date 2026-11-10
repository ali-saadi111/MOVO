import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { usePlace } from '@/data/queries';
import { requireAccount } from '@/features/shell/auth';
import { mobilityLabel, placeTypeLabel } from '@/features/labels';
import { useLang, useLocalized, useT } from '@/i18n';
import { fmtMonthYear, monthsSince } from '@/lib/dates';
import { HERE, distanceKm, formatDistance } from '@/lib/geo';
import { haptic } from '@/lib/haptics';
import { ltr } from '@/lib/rtl';
import { call, directions } from '@/lib/whatsapp';
import { useActivity } from '@/stores/activity';
import { continuous, layout, radii, space, useTheme } from '@/theme';
import {
  ArtImage, Button, ChecklistRow, ChipRow, Divider, ErrorState, FitsLine, Icon, Pressable, RatingBadge, Screen, Skeleton, StarRating, Text, go, type IconName,
} from '@/ui';

export default function PlacePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const tr = useT();
  const lang = useLang();
  const loc = useLocalized();
  const q = usePlace(id);
  const saved = useActivity((s) => s.saved.includes(id));
  const toggle = useActivity((s) => s.toggleSaved);
  const [saveTick, setSaveTick] = useState(0);
  const [revFilter, setRevFilter] = useState<'all' | 'manual' | 'power' | 'walker-crutches'>('all');
  const p = q.data;

  if (q.isError) return <Screen title=""><ErrorState onRetry={() => q.refetch()} /></Screen>;
  if (!p) return <Screen title="" variant="hero"><Skeleton height={295} radius={0} /><View style={{ padding: layout.margin, gap: 12 }}><Skeleton shape="text" width="70%" height={28} /><Skeleton height={140} radius={16} /></View></Screen>;

  const old = monthsSince(p.rating.checkedAt) >= 12;
  const reviews = p.reviews.filter((r) => revFilter === 'all' || r.mobility === revFilter);
  const onSave = () => {
    if (!requireAccount('save', `/place/${p.id}`)) return;
    haptic.light();
    toggle(p.id);
    setSaveTick((n) => n + 1);
  };
  const actions: { icon: IconName; label: string; onPress: () => void; primary?: boolean }[] = [
    { icon: 'arrow.triangle.turn.up.right.diamond.fill', label: tr('place.directions', 'Directions'), onPress: () => directions(p.lat, p.lng, p.name.en), primary: true },
    { icon: 'phone', label: tr('place.call', 'Call'), onPress: () => call(p.phone) },
    { icon: saved ? 'bookmark.fill' : 'bookmark', label: saved ? tr('place.saved', 'Saved') : tr('place.save', 'Save'), onPress: onSave },
  ];

  return (
    <Screen title={loc(p.name)} variant="hero" heroHeight={295}>
      <ArtImage image={p.hero} aspect={4 / 3} radius={0} edge={false} />
      <Animated.View entering={FadeIn.duration(200)} style={{ paddingHorizontal: layout.margin, paddingTop: space.lg, gap: space.xs }}>
        <Text variant="title1">{loc(p.name)}</Text>
        <Text variant="subheadline" color="textSecondary">{placeTypeLabel(tr, p.category)} · {loc(p.street)} · {ltr(formatDistance(distanceKm(HERE, p)))}</Text>
      </Animated.View>

      {/* The focal element: the only tinted surface on the screen. */}
      <View style={{ marginHorizontal: layout.margin, marginTop: space.lg, borderRadius: radii.card, ...continuous, backgroundColor: t.colors.fill, padding: space.md, gap: space.sm }}>
        <RatingBadge level={p.rating.level} size="large" />
        <FitsLine place={p} />
        <Divider />
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          <Icon name={old ? 'exclamationmark.triangle' : 'checkmark.seal'} size={15} color={old ? 'ratingPartly' : 'accentText'} />
          <Text variant="footnote" color="textSecondary">
            {old ? tr('place.checkedOld', 'Checked over a year ago') : tr('place.checked', 'Checked by the Movo team in {{when}}', { when: fmtMonthYear(p.rating.checkedAt, lang) })}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: space.sm, paddingHorizontal: layout.margin, marginTop: space.lg }}>
        {actions.map((a) => (
          <Pressable key={a.label} onPress={a.onPress} accessibilityRole="button" accessibilityLabel={a.label} style={{ flex: 1, height: 56, borderRadius: radii.capsule, ...continuous, backgroundColor: a.primary ? t.colors.buttonPrimaryBg : t.colors.fill, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Icon name={a.icon} size={18} weight="semibold" color={a.primary ? { raw: t.colors.buttonPrimaryFg } : 'tint'} effect={a.icon.startsWith('bookmark') ? 'bounce' : 'none'} effectKey={a.icon.startsWith('bookmark') ? saveTick : undefined} />
            <Text variant="caption1" weight="600" style={{ color: a.primary ? t.colors.buttonPrimaryFg : t.colors.tint }}>{a.label}</Text>
          </Pressable>
        ))}
      </View>

      <Section title={tr('place.checklist', 'Accessibility checklist')}>
        {p.rating.checklist.map((c, i) => (
          <View key={c.key}>
            {i > 0 ? <Divider inset={32} /> : null}
            <ChecklistRow item={c} />
          </View>
        ))}
      </Section>

      <Section title={tr('place.entrancePhotos', 'Entrance photos')} flush>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: layout.margin, gap: space.sm }}>
          {p.rating.entrancePhotos.map((img, i) => (
            <Pressable key={i} onPress={() => go.push(`/covers/photos?place=${p.id}&i=${i}`)} accessibilityRole="imagebutton" accessibilityLabel={loc(img.alt)} style={{ width: 160 }}>
              <ArtImage image={img} aspect={4 / 3} radius={radii.thumb} />
            </Pressable>
          ))}
        </ScrollView>
        <Text variant="footnote" color="textSecondary" style={{ marginHorizontal: layout.margin, marginTop: space.xs }}>{tr('place.photosBy', 'Taken by the Movo team')}</Text>
      </Section>

      <Section title={tr('place.hours', 'Hours')}>
        {p.hours.map((h) => (
          <View key={h.days.en} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
            <Text variant="body">{loc(h.days)}</Text>
            <Text variant="body" color="textSecondary" tabular>{h.time === 'Closed' ? tr('place.closed', 'Closed') : ltr(h.time)}</Text>
          </View>
        ))}
      </Section>

      <Section title={tr('place.reviews', 'Reviews')} flush>
        <ChipRow options={[{ value: 'all', label: tr('map.cat.all', 'All') }, ...(['manual', 'power', 'walker-crutches'] as const).map((m) => ({ value: m, label: mobilityLabel(tr, m) }))]} value={revFilter} onChange={setRevFilter} />
        <View style={{ paddingHorizontal: layout.margin, marginTop: space.sm }}>
          {reviews.length ? reviews.map((r) => (
            <View key={r.id} style={{ paddingVertical: space.sm, gap: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text variant="headline">{r.author}</Text>
                <StarRating value={r.stars} size={13} label={tr('product.rating', 'Rating')} />
              </View>
              <Text variant="footnote" color="textSecondary">{mobilityLabel(tr, r.mobility)}</Text>
              <Text variant="body">{r.text}</Text>
            </View>
          )) : <Text variant="body" color="textSecondary">{tr('place.noReviews', 'No reviews from people who move this way yet.')}</Text>}
        </View>
      </Section>

      <View style={{ paddingHorizontal: layout.margin, gap: space.xs, marginTop: space.xl }}>
        <Button label={tr('place.writeReview', 'Write a review')} variant="secondary" icon="pencil" onPress={() => requireAccount('review', `/sheets/review?place=${p.id}`) && go.push(`/sheets/review?place=${p.id}`)} />
        <Button label={tr('place.report', 'Report a change')} variant="plain" icon="flag" onPress={() => requireAccount('report', `/sheets/report?place=${p.id}`) && go.push(`/sheets/report?place=${p.id}`)} />
      </View>
    </Screen>
  );
}

function Section({ title, children, flush }: { title: string; children: React.ReactNode; flush?: boolean }) {
  return (
    <View style={{ marginTop: space.xxl }}>
      <Text variant="title3" accessibilityRole="header" style={{ marginHorizontal: layout.margin, marginBottom: space.xs }}>{title}</Text>
      <View style={flush ? null : { paddingHorizontal: layout.margin }}>{children}</View>
    </View>
  );
}
