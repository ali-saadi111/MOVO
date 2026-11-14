import { useLocalSearchParams } from 'expo-router';
import { Share, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { sync } from '@/data';
import { useEvent } from '@/data/queries';
import { FactTiles } from '@/features/community/components';
import { ratingLabel } from '@/features/labels';
import { requireAccount } from '@/features/shell/auth';
import { useLang, useLocalized, useT } from '@/i18n';
import { fmtLongDay, fmtTime } from '@/lib/dates';
import { haptic } from '@/lib/haptics';
import { formatMoney } from '@/lib/money';
import { ltr } from '@/lib/rtl';
import { useActivity } from '@/stores/activity';
import { layout, space, useTheme } from '@/theme';
import { BannerHero, Button, ErrorState, IconButton, ListRow, Pressable, RatingBadge, Screen, Skeleton, StickyCTA, STICKY_CTA_SPACE, Text, go, showBanner, useTabNav } from '@/ui';

/** One screen: banner, info card with fact tiles, short About, rows that open details, Join in the bar. */
export default function EventPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const tr = useT();
  const lang = useLang();
  const loc = useLocalized();
  const { push } = useTabNav();
  const q = useEvent(id);
  const mine = useActivity((s) => s.events.find((e) => e.eventId === id));
  const e = q.data;
  if (q.isError) return <Screen title=""><ErrorState onRetry={() => q.refetch()} /></Screen>;
  if (!e) return <Screen title="" variant="hero"><Skeleton height={221} radius={0} /></Screen>;
  const venue = sync.place(e.venuePlaceId);
  const left = Math.max(0, e.spots - e.taken);
  const full = left <= 0;
  const price = e.priceCents ? ltr(formatMoney(e.priceCents)) : tr('event.free', 'Free');
  const when = `${fmtLongDay(e.startsAt, lang)} · ${fmtTime(e.startsAt, lang)}–${fmtTime(e.endsAt, lang)}`;
  const join = () => { if (requireAccount('join', `/sheets/join?event=${e.id}`)) go.push(`/sheets/join?event=${e.id}`); };
  const info = (kind: string) => go.push(`/sheets/community-info?event=${e.id}&kind=${kind}`);
  const ticket = () => mine && go.push(`/covers/success?flow=event&event=${e.id}&id=${mine.code}&method=cash`);
  const share = () => { haptic.light(); Share.share({ message: `${loc(e.title)} · ${when}` }).catch(() => {}); };
  const calendar = () => { haptic.success(); showBanner({ icon: 'calendar.badge.plus', tone: 'mint', title: tr('event.calAdded', 'Added to your calendar'), body: when }); };

  return (
    <Screen title={loc(e.title)} variant="hero" heroHeight={300} contentBottom={STICKY_CTA_SPACE}
      headerRight={() => (
        <View style={{ flexDirection: 'row', gap: space.xs }}>
          <IconButton icon="calendar.badge.plus" label={tr('event.addCal', 'Add to calendar')} size={44} onPress={calendar} />
          <IconButton icon="square.and.arrow.up" label={tr('common.share', 'Share')} size={44} onPress={share} />
        </View>
      )}
      footer={
        <StickyCTA>
          {mine ? (
            <Pressable onPress={ticket} accessibilityRole="button" accessibilityLabel={tr('event.showTicket', 'Show ticket')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, height: 54, borderRadius: 27, paddingHorizontal: 18, backgroundColor: t.colors.bgSelected }}>
              <Text variant="headline" weight="700" color="accentText" style={{ flex: 1 }}>{tr('event.youreInCode', '✓ You’re in · {{code}}', { code: mine.code })}</Text>
              <Text variant="subheadline" weight="700" color="accentText">{tr('event.showTicket', 'Show ticket')}</Text>
            </Pressable>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
              <View style={{ gap: 0 }}>
                <Text variant="title3" weight="800" tabular>{price}</Text>
                <Text variant="caption1" color={full ? 'textSecondary' : 'textSecondary'} tabular>{full ? tr('event.waiting', 'Waiting list open') : tr('event.left', '{{n}} spots left', { n: left })}</Text>
              </View>
              <View style={{ flex: 1 }}><Button label={full ? tr('event.joinWait', 'Join the waiting list') : tr('event.join', 'Join')} onPress={join} /></View>
            </View>
          )}
        </StickyCTA>
      }>
      <BannerHero image={e.image} />
      <Animated.View entering={FadeIn.duration(200)} style={{ paddingHorizontal: layout.margin, paddingTop: space.md }}>
        <Text variant="footnote" weight="600" color="accentText" tabular>{when}</Text>
        <Text variant="title2" weight="700" style={{ marginTop: 2 }}>{loc(e.title)}</Text>
        <Text variant="subheadline" color="textSecondary" style={{ marginTop: 2 }}>{loc(e.area)} · {tr('event.byShort', 'Sponsored by {{s}}', { s: e.sponsor })}</Text>
        <FactTiles items={[
          { value: price, label: tr('event.entry', 'Entry') },
          { value: full ? tr('event.fullShort', 'Full') : tr('comm.left', '{{n}} left', { n: left }), label: tr('event.ofSpots', 'of {{n}} spots', { n: e.spots }), bar: e.taken / e.spots },
          ...(venue ? [{ value: venue.rating.level === 'accessible' ? tr('event.stepFree', 'Step-free') : ratingLabel(tr, venue.rating.level), label: tr('event.venue', 'Venue'), accent: venue.rating.level === 'accessible' }] : []),
        ]} />
        <Pressable onPress={() => info('about')} feedback="none" accessibilityRole="button" accessibilityLabel={tr('event.about', 'About')} style={{ marginTop: space.md, gap: 2 }}>
          <Text variant="body" numberOfLines={3}>{loc(e.about)}</Text>
          <Text variant="subheadline" weight="600" color="accentText">{tr('common.more', 'More')}</Text>
        </Pressable>
      </Animated.View>
      <View style={{ marginHorizontal: layout.margin, marginTop: space.lg, borderRadius: 16, backgroundColor: t.colors.fill, overflow: 'hidden' }}>
        {venue ? <ListRow leading={<RatingBadge level={venue.rating.level} size="mini" />} title={loc(venue.name)} subtitle={ratingLabel(tr, venue.rating.level)} onPress={() => push(`/place/${venue.id}`)} /> : null}
        <ListRow icon="car" title={tr('event.gettingThere', 'Getting there')} subtitle={loc(e.gettingThere)} subtitleLines={1} onPress={() => info('there')} />
        {mine ? <ListRow icon="xmark.circle.fill" destructive title={tr('event.cantMake', 'I can’t make it')} onPress={() => go.push(`/sheets/confirm?kind=leaveEvent&id=${e.id}`)} /> : null}
      </View>
    </Screen>
  );
}
