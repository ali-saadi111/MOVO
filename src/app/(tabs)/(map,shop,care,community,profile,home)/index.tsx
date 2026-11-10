import { useMemo, useRef, useState } from 'react';
import { ScrollView, TextInput, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePlaces } from '@/data/queries';
import type { PlaceCategory } from '@/data';
import { MapAdapter } from '@/features/map/MapAdapter';
import { MapSheet, type Detent, type MapSheetHandle } from '@/features/map/MapSheet';
import { PlacePinCard } from '@/features/map/PlacePinCard';
import { placeCategoryLabel } from '@/features/labels';
import { useLocalized, useT } from '@/i18n';
import { HERE, distanceKm } from '@/lib/geo';
import { haptic } from '@/lib/haptics';
import { useActivity } from '@/stores/activity';
import { useDev } from '@/stores/dev';
import { mapFilterCount, useFilters } from '@/stores/filters';
import { layout, radii, space, useTheme } from '@/theme';
import { bodyFont } from '@/theme/fonts';
import {
  ActingForBar, ChipRow, EmptyState, ErrorState, GlassGroup, GlassSurface, Icon, IconButton, OfflinePill, PlaceRow, Pressable, Segmented, Skeleton, Text,
  go, useMobilityFor, useTabBarInset, useTabNav,
} from '@/ui';
import { useCaregiver } from '@/stores/caregiver';

const CATS: (PlaceCategory | 'all')[] = ['all', 'cafe', 'restaurant', 'pharmacy', 'clinic', 'bank', 'shop', 'supermarket'];

export default function MapScreen() {
  const t = useTheme();
  const tr = useT();
  const loc = useLocalized();
  const insets = useSafeAreaInsets();
  const tabInset = useTabBarInset();
  const { height } = useWindowDimensions();
  const { push } = useTabNav();
  const q = usePlaces();
  const filters = useFilters((s) => s.map);
  const setMap = useFilters((s) => s.setMap);
  const offline = useDev((s) => s.offline);
  const unread = 6 - useActivity((s) => s.readNotifications.length);
  const switchTo = useCaregiver((s) => s.switchTo);
  const mob = useMobilityFor();
  const sheet = useRef<MapSheetHandle>(null);
  const [detent, setDetent] = useState<Detent>('medium');
  const [selected, setSelected] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [focus, setFocus] = useState<{ lat: number; lng: number; key: number } | null>(null);
  const [userShown, setUserShown] = useState(true);

  const heights = useMemo(() => ({ small: 96 + tabInset, medium: Math.round(height * 0.45) + tabInset * 0.4, large: height - insets.top - 56 }), [height, insets.top, tabInset]);
  const sheetH = heights[detent];

  const places = useMemo(() => {
    const all = q.data ?? [];
    return all
      .filter((p) => filters.category === 'all' || p.category === filters.category)
      .filter((p) => !filters.ratings.length || filters.ratings.includes(p.rating.level))
      .filter((p) => filters.mustHave.every((m) => p.amenities[m]))
      .map((p) => ({ p, d: distanceKm(HERE, p), fits: mob ? p.rating.fits[mob] : false }))
      .sort((a, b) => (filters.fitsMe && a.fits !== b.fits ? (a.fits ? -1 : 1) : a.d - b.d))
      .map((x) => x.p);
  }, [q.data, filters, mob]);
  const sel = places.find((p) => p.id === selected) ?? (q.data ?? []).find((p) => p.id === selected) ?? null;

  const select = (id: string | null) => {
    setSelected(id);
    if (id) {
      haptic.selection();
      const p = (q.data ?? []).find((x) => x.id === id);
      if (p) setFocus({ lat: p.lat, lng: p.lng, key: Date.now() });
      if (detent !== 'medium') sheet.current?.snapTo('medium');
    }
  };
  const startSearch = () => { setSearching(true); setSelected(null); sheet.current?.snapTo('large'); };
  const cancelSearch = () => { setSearching(false); setQuery(''); sheet.current?.snapTo('medium'); };

  const results = query.trim()
    ? (q.data ?? []).filter((p) => loc(p.name).toLowerCase().includes(query.toLowerCase()) || p.name.en.toLowerCase().includes(query.toLowerCase()))
    : [];
  const areas = [tr('area.hamra', 'Hamra'), tr('area.raouche', 'Raouché'), tr('area.downtown', 'Downtown Beirut'), tr('area.saida', 'Saida')].filter((a) => !query || a.toLowerCase().includes(query.toLowerCase()));

  const header = (
    <View style={{ gap: space.xs, paddingBottom: space.xs }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: layout.margin, gap: space.sm }}>
        <Pressable feedback="none" onPress={searching ? undefined : startSearch} accessibilityRole="search" style={{ flex: 1, height: 44, borderRadius: radii.cell, backgroundColor: t.colors.fill, flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.sm, gap: space.xs }}>
          <Icon name="magnifyingglass" size={17} color="textSecondary" />
          {searching ? (
            <TextInput autoFocus value={query} onChangeText={setQuery} placeholder={tr('map.search', 'Search places and areas')} placeholderTextColor={t.colors.textSecondary} style={{ flex: 1, fontSize: 17, fontFamily: bodyFont(t.rtl), color: t.colors.textPrimary, textAlign: t.rtl ? 'right' : 'left', outlineStyle: 'none' } as never} returnKeyType="search" accessibilityLabel={tr('map.search', 'Search places and areas')} />
          ) : (
            <Text variant="body" color="textSecondary" style={{ flex: 1 }} numberOfLines={1}>{tr('map.search', 'Search places and areas')}</Text>
          )}
        </Pressable>
        {searching ? (
          <Pressable onPress={cancelSearch} accessibilityRole="button" style={{ minHeight: 44, justifyContent: 'center' }}><Text variant="body" color="tint">{tr('common.cancel', 'Cancel')}</Text></Pressable>
        ) : null}
      </View>
      {!searching && detent !== 'small' && !sel ? (
        <ChipRow options={CATS.map((c) => ({ value: c, label: placeCategoryLabel(tr, c) }))} value={filters.category} onChange={(v) => setMap({ category: v })} />
      ) : null}
    </View>
  );

  let body: React.ReactNode;
  if (searching) {
    body = (
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: tabInset + 24 }}>
        {query ? (
          <>
            <Text variant="footnote" color="textSecondary" style={{ marginHorizontal: layout.margin, marginTop: space.sm }}>{tr('map.places', 'Places')}</Text>
            {results.length ? results.slice(0, 8).map((p, i) => <PlaceRow key={p.id} place={p} index={i} onPress={() => push(`/place/${p.id}`)} />) : <Text variant="body" color="textSecondary" style={{ margin: layout.margin }}>{tr('map.noResults', 'No places match “{{q}}”.', { q: query })}</Text>}
          </>
        ) : null}
        <Text variant="footnote" color="textSecondary" style={{ marginHorizontal: layout.margin, marginTop: space.md, marginBottom: space.xs }}>{tr('map.areas', 'Areas')}</Text>
        {areas.map((a) => (
          <Pressable key={a} feedback="highlight" onPress={cancelSearch} style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center', minHeight: 48, paddingHorizontal: layout.margin }}>
            <Icon name="building.2" size={18} color="textSecondary" /><Text variant="body">{a}</Text>
          </Pressable>
        ))}
        {!query ? (
          <>
            <Text variant="footnote" color="textSecondary" style={{ marginHorizontal: layout.margin, marginTop: space.md, marginBottom: space.xs }}>{tr('map.recent', 'Recent')}</Text>
            {['Café Rami', 'Hamra Central Pharmacy'].map((r) => (
              <Pressable key={r} feedback="highlight" onPress={() => setQuery(r)} style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center', minHeight: 48, paddingHorizontal: layout.margin }}>
                <Icon name="clock" size={18} color="textSecondary" /><Text variant="body">{r}</Text>
              </Pressable>
            ))}
          </>
        ) : null}
      </ScrollView>
    );
  } else if (q.isLoading) {
    body = (
      <View style={{ paddingTop: space.sm }}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={{ flexDirection: 'row', gap: space.sm, paddingHorizontal: layout.margin, paddingVertical: space.sm }}>
            <Skeleton width={64} height={64} />
            <View style={{ flex: 1, gap: 8, paddingTop: 4 }}><Skeleton shape="text" width="70%" height={17} /><Skeleton shape="text" width="40%" height={13} /><Skeleton shape="text" width="50%" height={18} /></View>
          </View>
        ))}
      </View>
    );
  } else if (q.isError && !q.data) {
    body = <ErrorState offline={offline} onRetry={() => q.refetch()} />;
  } else if (!places.length) {
    body = <EmptyState symbol="map" message={tr('map.empty', 'No rated places here yet.')} actionLabel={tr('map.request', 'Request a place')} onAction={() => go.push('/sheets/request-place')} />;
  } else {
    body = (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, display: sel ? 'none' : 'flex' }}>
          <ScrollView contentContainerStyle={{ paddingBottom: tabInset + 24 }}>
            {offline ? <OfflinePill /> : null}
            <Text variant="footnote" color="textSecondary" style={{ marginHorizontal: layout.margin, marginTop: space.xs }}>
              {mob && filters.fitsMe ? tr('map.nearbyFits', '{{n}} nearby · places that fit you first', { n: places.length }) : tr('map.nearby', '{{n}} places nearby', { n: places.length })}
            </Text>
            {places.slice(0, 30).map((p, i) => <PlaceRow key={p.id} place={p} index={i} onPress={() => push(`/place/${p.id}`)} />)}
          </ScrollView>
        </View>
        {sel ? <PlacePinCard place={sel} onOpen={() => push(`/place/${sel.id}`)} onClose={() => setSelected(null)} /> : null}
      </View>
    );
  }

  const fcount = mapFilterCount(filters);
  return (
    <View style={{ flex: 1, backgroundColor: t.colors.mapLand }}>
      <MapAdapter places={places} selectedId={selected} onSelect={select} bottomPadding={Math.min(sheetH, heights.medium)} topPadding={insets.top + 56} focus={focus} showUser={userShown} />

      <View pointerEvents="box-none" style={{ position: 'absolute', top: insets.top + space.xs, start: layout.margin, end: layout.margin }}>
        <ActingForBar onSwitchBack={() => switchTo(null)} />
        <View pointerEvents="box-none" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <GlassSurface radius={radii.capsule} interactive style={{ width: 188 }}>
            <Segmented glass glyphs={['fold', 'list']} values={[tr('map.mapMode', 'Map'), tr('map.listMode', 'List')]} index={detent === 'large' ? 1 : 0} onChange={(i) => sheet.current?.snapTo(i === 1 ? 'large' : 'medium')} />
          </GlassSurface>
          <GlassGroup style={{ gap: space.xs }}>
            <IconButton glass icon="bell" label={tr('nav.notifications', 'Notifications')} badge={unread > 0} onPress={() => push('/notifications')} />
            <IconButton glass icon="line.3.horizontal.decrease" label={fcount ? tr('map.filtersOn', 'Filters, {{n}} on', { n: fcount }) : tr('map.filters', 'Filters')} badge={fcount > 0} onPress={() => go.push('/sheets/map-filters')} />
            <IconButton glass icon={userShown ? 'location.fill' : 'location'} label={tr('map.myLocation', 'Use my location')} onPress={() => { setUserShown(true); setFocus({ ...HERE, key: Date.now() }); }} />
          </GlassGroup>
        </View>
      </View>

      <MapSheet ref={sheet} heights={heights} header={header} onDetent={(d) => setDetent(d)}>
        {detent === 'small' && !searching ? null : (
          <Animated.View key={sel ? 'card' : searching ? 'search' : 'list'} entering={FadeIn.duration(200)} exiting={FadeOut.duration(120)} style={{ flex: 1 }}>{body}</Animated.View>
        )}
      </MapSheet>
    </View>
  );
}
