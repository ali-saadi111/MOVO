import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { sync } from '@/data';
import { useEvent } from '@/data/queries';
import { requireAccount } from '@/features/shell/auth';
import { useLang, useLocalized, useT } from '@/i18n';
import { fmtLongDay, fmtTime } from '@/lib/dates';
import { formatMoney } from '@/lib/money';
import { ltr } from '@/lib/rtl';
import { useActivity } from '@/stores/activity';
import { layout, space } from '@/theme';
import { BannerHero, Button, Divider, ErrorState, ListRow, ProgressBar, RatingBadge, Screen, Section, Skeleton, StickyCTA, STICKY_CTA_SPACE, Tag, Text, go, useTabNav } from '@/ui';

export default function EventPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
  const left = e.spots - e.taken;
  const full = left <= 0;
  const join = () => { if (requireAccount('join', `/sheets/join?event=${e.id}`)) go.push(`/sheets/join?event=${e.id}`); };
  return (
    <Screen title={loc(e.title)} variant="hero" heroHeight={300} contentBottom={STICKY_CTA_SPACE}
      footer={<StickyCTA>{mine ? (
        <View style={{ gap: 4 }}><Button label={tr('event.youreIn', '✓ You’re in · code {{code}}', { code: mine.code })} variant="secondary" onPress={() => {}} /><Button label={tr('event.cantMake', 'I can’t make it')} variant="plain" onPress={() => go.push(`/sheets/confirm?kind=leaveEvent&id=${e.id}`)} /></View>
      ) : <Button label={full ? tr('event.joinWait', 'Join the waiting list') : e.priceCents ? tr('event.joinPaid', 'Join · {{price}}', { price: ltr(formatMoney(e.priceCents)) }) : tr('event.join', 'Join')} onPress={join} />}</StickyCTA>}>
      <BannerHero image={e.image} />
      <Animated.View entering={FadeIn.duration(200)} style={{ paddingHorizontal: layout.margin, paddingTop: space.lg, gap: space.xs }}>
        <Text variant="footnote" weight="600" color="accentText" tabular>{fmtLongDay(e.startsAt, lang)} · {fmtTime(e.startsAt, lang)}–{fmtTime(e.endsAt, lang)}</Text>
        <Text variant="title1">{loc(e.title)}</Text>
        <Text variant="subheadline" color="textSecondary">{tr('event.by', 'Sponsored by {{s}}', { s: e.sponsor })} · {e.priceCents ? ltr(formatMoney(e.priceCents)) : tr('event.free', 'Free')}</Text>
      </Animated.View>
      <View style={{ paddingHorizontal: layout.margin, marginTop: space.lg, gap: space.xs }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="headline" tabular>{full ? tr('event.fullShort', 'Full') : tr('event.spotsOf', '{{left}} spots left of {{total}}', { left, total: e.spots })}</Text>
          {full ? <Tag label={tr('event.waiting', 'Waiting list open')} tone="warning" /> : null}
        </View>
        <ProgressBar value={e.taken / e.spots} label={tr('event.spotsTaken', 'Spots taken')} />
      </View>
      <View style={{ paddingHorizontal: layout.margin, marginTop: space.xxl, gap: space.sm }}>
        <Text variant="title3">{tr('event.about', 'About')}</Text>
        <Text variant="body">{loc(e.about)}</Text>
      </View>
      <Divider style={{ marginHorizontal: layout.margin, marginVertical: space.xxl }} />
      <Text variant="title3" style={{ marginHorizontal: layout.margin, marginBottom: space.sm }}>{tr('event.gettingThere', 'Getting there')}</Text>
      {venue ? (
        <Section>
          <ListRow leading={<RatingBadge level={venue.rating.level} size="mini" />} title={loc(venue.name)} subtitle={loc(venue.street)} onPress={() => push(`/place/${venue.id}`)} />
        </Section>
      ) : null}
      <Text variant="body" style={{ marginHorizontal: layout.margin }}>{loc(e.gettingThere)}</Text>
    </Screen>
  );
}
