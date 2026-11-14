import { tabRoot } from '@/ui/TabRoot';
import { useState } from 'react';
import { ScrollView, View, type LayoutChangeEvent, type NativeScrollEvent } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { sync } from '@/data';
import { useCampaigns, useEvents } from '@/data/queries';
import { BannerCarousel, CampaignRow, EventRow, FilterPill, GoingStub, GroupLabel, RaisedStrip, groupByWeek, isThisWeek } from '@/features/community/components';
import { CanvasActions } from '@/features/shell/HeaderButtons';
import { requireAccount } from '@/features/shell/auth';
import { useLang, useLocalized, useT } from '@/i18n';
import { fmtDay } from '@/lib/dates';
import { haptic } from '@/lib/haptics';
import { useActivity } from '@/stores/activity';
import { useCaregiver } from '@/stores/caregiver';
import { layout, space } from '@/theme';
import { ActingForBar, CanvasHeader, EmptyState, ErrorState, GlassSurface, Screen, Segmented, Skeleton, go, useTabNav } from '@/ui';

type Filter = 'all' | 'week' | 'free' | 'sports' | 'workshop' | 'meetup';

/** Activities and donations as compact rows under the key-visual banners. */
function Community() {
  const tr = useT();
  const lang = useLang();
  const loc = useLocalized();
  const insets = useSafeAreaInsets();
  const { push } = useTabNav();
  const [tab, setTab] = useState(0);
  const [filter, setFilter] = useState<Filter>('all');
  const [pillsY, setPillsY] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [now] = useState(() => Date.now());
  const ev = useEvents();
  const cmp = useCampaigns();
  const switchTo = useCaregiver((s) => s.switchTo);
  const mine = useActivity((s) => s.events);
  const gifts = useActivity((s) => s.donations);
  const q = tab === 0 ? ev : cmp;

  const all = ev.data ?? [];
  const shown = all.filter((e) => filter === 'all' || (filter === 'week' ? isThisWeek(e) : filter === 'free' ? !e.priceCents : e.type === filter));
  const groups = groupByWeek(shown);
  const joinedIds = new Set(mine.map((m) => m.eventId));
  const nextMine = mine.map((m) => ({ m, e: sync.event(m.eventId) })).filter((x) => x.e && new Date(x.e.endsAt).getTime() > now).sort((a, b) => a.e!.startsAt.localeCompare(b.e!.startsAt))[0];
  const marathon = all.find((e) => e.id === 'ev_marathon');
  const campaigns = cmp.data ?? [];
  const raisedOf = (id: string, base: number) => base + gifts.filter((g) => g.campaignId === id).reduce((n, g) => n + g.amountCents, 0);
  const open = campaigns.filter((c) => raisedOf(c.id, c.raisedCents) < c.goalCents);
  const finished = campaigns.filter((c) => raisedOf(c.id, c.raisedCents) >= c.goalCents);
  const total = campaigns.reduce((n, c) => n + raisedOf(c.id, c.raisedCents), 0);
  const donors = campaigns.reduce((n, c) => n + c.donors, 0);
  const firstCampaign = campaigns.find((c) => c.id === 'cmp_chairs') ?? campaigns[0];

  const join = (id: string) => { if (requireAccount('join', `/sheets/join?event=${id}`)) go.push(`/sheets/join?event=${id}`); };
  const give = (id: string) => { if (requireAccount('donate', `/sheets/donate?campaign=${id}`)) go.push(`/sheets/donate?campaign=${id}`); };
  const pick = (f: Filter) => { haptic.selection(); setFilter(f); };
  const onScroll = (e: NativeScrollEvent) => { const p = tab === 0 && pillsY > 0 && e.contentOffset.y > pillsY; if (p !== pinned) setPinned(p); };

  const FILTERS: [Filter, string][] = [
    ['all', tr('map.cat.all', 'All')], ['week', tr('comm.thisWeek', 'This week')], ['free', tr('event.free', 'Free')],
    ['sports', tr('comm.sports', 'Sports')], ['workshop', tr('comm.workshops', 'Workshops')], ['meetup', tr('comm.meetups', 'Meetups')],
  ];
  const pills = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityRole="tablist" contentContainerStyle={{ paddingHorizontal: layout.margin, gap: space.xs, paddingVertical: 2 }}>
      {FILTERS.map(([f, label]) => <FilterPill key={f} label={label} selected={filter === f} onPress={() => pick(f)} />)}
    </ScrollView>
  );
  const groupLabel = { week: tr('comm.thisWeek', 'This week'), next: tr('comm.nextWeek', 'Next week'), later: tr('comm.later', 'Later') };

  return (
    <Screen title={tr('tab.community', 'Community')} variant="canvas" refreshing={q.isRefetching} onRefresh={() => q.refetch()} onScrollEvent={onScroll}
      header={<CanvasHeader title={tr('comm.title', 'Get together')} actions={<CanvasActions />}
        titleAside={<Segmented values={[tr('comm.activities', 'Activities'), tr('comm.donations', 'Donations')]} index={tab} onChange={(i) => { setTab(i); setPinned(false); }} style={{ width: 178, height: 38 }} />} />}
      overlay={pinned ? (
        <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(120)} style={{ position: 'absolute', top: 0, start: 0, end: 0 }}>
          <GlassSurface style={{ paddingTop: insets.top + 6, paddingBottom: 8 }}>{pills}</GlassSurface>
        </Animated.View>
      ) : null}>
      <ActingForBar onSwitchBack={() => switchTo(null)} />
      <BannerCarousel slides={[
        ...(marathon ? [{ key: 'm', image: marathon.image, chips: [fmtDay(marathon.startsAt, lang), tr('event.left', '{{n}} spots left', { n: marathon.spots - marathon.taken })], label: loc(marathon.title), onPress: () => push(`/event/${marathon.id}`) }] : []),
        ...(firstCampaign ? [{ key: 'c', image: firstCampaign.image, chips: [tr('comm.raisedPct', '{{pct}}% raised', { pct: Math.round((raisedOf(firstCampaign.id, firstCampaign.raisedCents) / firstCampaign.goalCents) * 100) })], label: loc(firstCampaign.title), onPress: () => push(`/campaign/${firstCampaign.id}`) }] : []),
      ]} />

      {tab === 0 ? (
        <Animated.View key="a" entering={FadeIn.duration(200)}>
          {nextMine?.e ? <GoingStub ev={nextMine.e} code={nextMine.m.code} onPress={() => push(`/event/${nextMine.e!.id}`)} /> : null}
          <View onLayout={(e: LayoutChangeEvent) => setPillsY(e.nativeEvent.layout.y)} style={{ opacity: pinned ? 0 : 1 }}>{pills}</View>
          {ev.isLoading ? <RowSkeletons /> : ev.isError && !ev.data ? <ErrorState onRetry={() => ev.refetch()} /> : !shown.length ? (
            <EmptyState symbol="calendar" message={tr('comm.noEvents', 'No activities coming up. New ones are added every week.')} actionLabel={tr('comm.seeAll', 'See all activities')} onAction={() => setFilter('all')} />
          ) : groups.map((g) => (
            <View key={g.key}>
              <GroupLabel label={groupLabel[g.key]} />
              {g.items.map((e, i) => <EventRow key={e.id} ev={e} first={i === 0} index={i} joined={joinedIds.has(e.id)} onPress={() => push(`/event/${e.id}`)} onJoin={() => join(e.id)} />)}
            </View>
          ))}
        </Animated.View>
      ) : (
        <Animated.View key="d" entering={FadeIn.duration(200)}>
          <RaisedStrip cents={total} donors={donors} />
          {cmp.isLoading ? <RowSkeletons /> : cmp.isError && !cmp.data ? <ErrorState onRetry={() => cmp.refetch()} /> : !campaigns.length ? (
            <EmptyState symbol="gift" message={tr('comm.noCampaigns', 'No campaigns right now.')} />
          ) : (
            <>
              {open.length ? <GroupLabel label={tr('comm.openNow', 'Open now')} /> : null}
              {open.map((c, i) => <CampaignRow key={c.id} c={c} first={i === 0} index={i} raisedCents={raisedOf(c.id, c.raisedCents)} onPress={() => push(`/campaign/${c.id}`)} onGive={() => give(c.id)} />)}
              {finished.length ? <GroupLabel label={tr('comm.finished', 'Finished')} /> : null}
              {finished.map((c, i) => <CampaignRow key={c.id} c={c} first={i === 0} index={i} raisedCents={raisedOf(c.id, c.raisedCents)} onPress={() => push(`/campaign/${c.id}`)} />)}
            </>
          )}
        </Animated.View>
      )}
    </Screen>
  );
}

function RowSkeletons() {
  return (
    <View style={{ gap: space.md, paddingHorizontal: layout.margin, paddingTop: space.md }}>
      {[0, 1, 2, 3].map((i) => <View key={i} style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}><Skeleton height={72} width={72} radius={14} /><View style={{ flex: 1, gap: 8 }}><Skeleton shape="text" width="70%" /><Skeleton shape="text" width="45%" /></View></View>)}
    </View>
  );
}

export default tabRoot('(community)', '/(tabs)/(community)/community', Community);
