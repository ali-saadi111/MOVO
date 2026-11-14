import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import type { ServiceKind } from '@/data';
import { useSpecialists } from '@/data/queries';
import { careAddress, useCareDraft, type Where } from '@/features/care/booking';
import { LocationPill, SpecialistSlotsRow } from '@/features/care/components';
import { serviceLabel } from '@/features/labels';
import { useT } from '@/i18n';
import { layout, space } from '@/theme';
import { ChipRow, Divider, EmptyState, ErrorState, Screen, Segmented, Skeleton, go, useTabNav } from '@/ui';

/** Specialists for one service. Home or clinic is a switch here (no sheet first), and every row can book a time straight away. */
export default function SpecialistList() {
  const { kind, where: whereParam } = useLocalSearchParams<{ kind: ServiceKind; where?: Where }>();
  const tr = useT();
  const { push } = useTabNav();
  const q = useSpecialists(kind);
  const [draft, setDraft] = useCareDraft();
  const [where, setWhere] = useState<Where>(whereParam ?? draft.where);
  const [f, setF] = useState<string[]>([]);
  const pickWhere = (w: Where) => { setWhere(w); setDraft({ where: w }); };
  let list = (q.data ?? []).filter((s) => (where === 'home' ? s.homeVisit : !!s.clinic));
  if (f.includes('rating')) list = list.filter((s) => s.stars >= 4);
  if (f.includes('en')) list = list.filter((s) => s.languages.includes('en'));
  if (f.includes('f')) list = list.filter((s) => s.gender === 'f');
  if (f.includes('price')) list = list.filter((s) => s.priceCents <= 3000);
  // At most one Sponsored card, then earliest free time, then rating.
  const sponsored = list.find((s) => s.sponsored);
  const rest = list.filter((s) => s !== sponsored).sort((a, b) => a.nextFreeInHours - b.nextFreeInHours || b.stars - a.stars);
  const ordered = sponsored ? [sponsored, ...rest] : rest;
  const toggle = (v: string) => setF((c) => (c.includes(v) ? c.filter((x) => x !== v) : [...c, v]));
  const area = careAddress(draft.addr).sub.split(',')[0];
  return (
    <Screen title={serviceLabel(tr, kind)} variant="root" headerRight={() => <LocationPill label={area} onPress={() => go.push('/sheets/care-edit?kind=address')} />} refreshing={q.isRefetching} onRefresh={() => q.refetch()}>
      <Segmented style={{ marginHorizontal: layout.margin, marginTop: space.xs, marginBottom: space.xs }} values={[tr('care.homeVisit', 'Home visit'), tr('care.clinic', 'At the clinic')]} icons={['house.fill', 'building.2']} index={where === 'home' ? 0 : 1} onChange={(i) => pickWhere(i === 0 ? 'home' : 'clinic')} />
      <ChipRow multi options={[{ value: 'price', label: tr('care.f.price', 'Under $30') }, { value: 'en', label: tr('care.f.lang', 'Speaks English') }, { value: 'f', label: tr('care.f.gender', 'Woman specialist') }, { value: 'rating', label: tr('care.f.rating', 'Rating 4+') }]} value={f} onChange={toggle} style={{ marginBottom: space.xs }} />
      {q.isLoading ? (
        <View style={{ paddingHorizontal: layout.margin, gap: space.lg, marginTop: space.sm }}>{[0, 1, 2].map((i) => <View key={i} style={{ flexDirection: 'row', gap: 12 }}><Skeleton shape="circle" width={52} height={52} /><View style={{ flex: 1, gap: 8 }}><Skeleton shape="text" width="60%" /><Skeleton shape="text" width="40%" /></View></View>)}</View>
      ) : q.isError && !q.data ? <ErrorState onRetry={() => q.refetch()} /> : !ordered.length ? (
        where === 'home'
          ? <EmptyState symbol="stethoscope" message={tr('care.emptyArea', 'No specialists visit this area yet.')} actionLabel={tr('care.tryClinic', 'Try at a clinic')} onAction={() => pickWhere('clinic')} />
          : <EmptyState symbol="stethoscope" message={tr('care.emptyClinic', 'No clinics for this yet.')} actionLabel={tr('care.tryHome', 'Try a home visit')} onAction={() => pickWhere('home')} />
      ) : ordered.map((s, i) => (
        <View key={s.id}>{i > 0 ? <Divider inset={layout.margin} /> : null}<SpecialistSlotsRow s={s} where={where} index={i} onOpen={() => push(`/specialist/${s.id}?where=${where}`)} /></View>
      ))}
    </Screen>
  );
}
