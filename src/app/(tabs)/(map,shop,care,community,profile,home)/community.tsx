import { tabRoot } from '@/ui/TabRoot';
import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useCampaigns, useEvents } from '@/data/queries';
import { HeroArt } from '@/art/HeroArt';
import { CanvasActions } from '@/features/shell/HeaderButtons';
import { useLocalized, useT } from '@/i18n';
import { useActivity } from '@/stores/activity';
import { useCaregiver } from '@/stores/caregiver';
import { layout, space } from '@/theme';
import { ActingForBar, BlockCard, PromoBanner, CampaignCard, CanvasHeader, ChipRow, EmptyState, ErrorState, EventCard, PillToggle, Screen, Skeleton, StatTile, Text, useTabNav } from '@/ui';

function Community() {
  const tr = useT();
  const { push } = useTabNav();
  const [tab, setTab] = useState(0);
  const [type, setType] = useState<'all' | 'sports' | 'workshop' | 'meetup'>('all');
  const ev = useEvents();
  const cmp = useCampaigns();
  const switchTo = useCaregiver((s) => s.switchTo);
  const events = (ev.data ?? []).filter((e) => type === 'all' || e.type === type);
  const q = tab === 0 ? ev : cmp;
  const loc = useLocalized();
  const joined = useActivity((s) => s.events.length);
  const open = (ev.data ?? []).filter((e) => e.spots - e.taken > 0);
  const featured = open.find((e) => e.id === 'ev_marathon') ?? open[0];
  const totalRaised = (cmp.data ?? []).reduce((n, c) => n + c.raisedCents, 0);
  return (
    <Screen title={tr('tab.community', 'Community')} variant="canvas" refreshing={q.isRefetching} onRefresh={() => q.refetch()}
      header={<CanvasHeader title={tr('comm.title', 'Get together')} actions={<CanvasActions />} />}>
      <ActingForBar onSwitchBack={() => switchTo(null)} />
      <View style={{ paddingHorizontal: layout.margin, marginBottom: space.md }}>
        <PillToggle values={[tr('comm.activities', 'Activities'), tr('comm.donations', 'Donations')]} index={tab} onChange={setTab} />
      </View>
      {tab === 0 ? (
        <Animated.View key="a" entering={FadeIn.duration(200)}>
          {featured ? (
            <View style={{ marginBottom: space.md }}>
              <PromoBanner image={featured.image} eyebrow={tr('comm.featured', 'This week')} title={loc(featured.title)} meta={tr('event.left', '{{n}} spots left', { n: featured.spots - featured.taken })} onPress={() => push(`/event/${featured.id}`)} />
            </View>
          ) : null}
          <View style={{ flexDirection: 'row', gap: space.sm, paddingHorizontal: layout.margin, marginBottom: space.xl }}>
            <StatTile value={(ev.data ?? []).length} label={tr('comm.statComing', 'Activities coming up')} icon="calendar" tone="mint" index={0} />
            <StatTile value={joined} label={tr('comm.statJoined', 'You’ve joined')} icon="person.3" tone="mist" index={1} />
          </View>
          <ChipRow options={[{ value: 'all', label: tr('map.cat.all', 'All') }, { value: 'sports', label: tr('comm.sports', 'Sports') }, { value: 'workshop', label: tr('comm.workshops', 'Workshops') }, { value: 'meetup', label: tr('comm.meetups', 'Meetups') }]} value={type} onChange={setType} style={{ marginBottom: space.lg }} />
          {ev.isLoading ? <CardSkeletons /> : ev.isError && !ev.data ? <ErrorState onRetry={() => ev.refetch()} /> : !events.length ? (
            <EmptyState symbol="calendar" message={tr('comm.noEvents', 'No activities coming up. New ones are added every week.')} actionLabel={tr('comm.seeAll', 'See all activities')} onAction={() => setType('all')} />
          ) : (
            <View style={{ gap: space.xxl }}>{events.filter((e) => type !== 'all' || e.id !== featured?.id).map((e, i) => <EventCard key={e.id} ev={e} index={i} onPress={() => push(`/event/${e.id}`)} />)}</View>
          )}
        </Animated.View>
      ) : (
        <Animated.View key="d" entering={FadeIn.duration(200)}>
          <View style={{ marginBottom: space.md }}>
            <BlockCard tone="mint" eyebrow={tr('comm.raisedEyebrow', 'Raised together')} title={`$${Math.round(totalRaised / 100).toLocaleString('en-US')}`} body={tr('comm.raisedBody', 'Every dollar goes to Arc en Ciel.')} art={<HeroArt name="heart" size={150} />} minHeight={170} />
          </View>
          <Text variant="subheadline" color="textSecondary" style={{ marginHorizontal: layout.margin, marginBottom: space.lg }}>{tr('donate.keepsNothingLong', 'Donations go through our partner NGO, Arc en Ciel. Movo keeps nothing from donations.')}</Text>
          {cmp.isLoading ? <CardSkeletons /> : cmp.isError && !cmp.data ? <ErrorState onRetry={() => cmp.refetch()} /> : !(cmp.data ?? []).length ? (
            <EmptyState symbol="gift" message={tr('comm.noCampaigns', 'No campaigns right now.')} />
          ) : (
            <View style={{ gap: space.xxl }}>{(cmp.data ?? []).map((c, i) => <CampaignCard key={c.id} c={c} index={i} onPress={() => push(`/campaign/${c.id}`)} />)}</View>
          )}
        </Animated.View>
      )}
    </Screen>
  );
}

function CardSkeletons() {
  return <View style={{ gap: space.xl, paddingHorizontal: layout.margin }}>{[0, 1].map((i) => <View key={i} style={{ gap: 10 }}><Skeleton height={190} radius={16} /><Skeleton shape="text" width="40%" /><Skeleton shape="text" width="80%" height={20} /></View>)}</View>;
}

export default tabRoot('(community)', '/(tabs)/(community)/community', Community);
