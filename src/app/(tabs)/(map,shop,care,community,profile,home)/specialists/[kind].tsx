import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import type { ServiceKind } from '@/data';
import { useSpecialists } from '@/data/queries';
import { serviceLabel } from '@/features/labels';
import { useT } from '@/i18n';
import { layout, space } from '@/theme';
import { ChipRow, Divider, EmptyState, ErrorState, Screen, Skeleton, SpecialistRow, Text, useTabNav } from '@/ui';

export default function SpecialistList() {
  const { kind, where } = useLocalSearchParams<{ kind: ServiceKind; where?: string }>();
  const tr = useT();
  const { push } = useTabNav();
  const q = useSpecialists(kind);
  const [f, setF] = useState<string[]>([]);
  let list = (q.data ?? []).filter((s) => (where === 'home' ? s.homeVisit : where === 'clinic' ? !!s.clinic : true));
  if (f.includes('rating')) list = list.filter((s) => s.stars >= 4);
  if (f.includes('en')) list = list.filter((s) => s.languages.includes('en'));
  if (f.includes('f')) list = list.filter((s) => s.gender === 'f');
  if (f.includes('price')) list = list.filter((s) => s.priceCents <= 3000);
  // At most one Sponsored card, then earliest free time, then rating.
  const sponsored = list.find((s) => s.sponsored);
  const rest = list.filter((s) => s !== sponsored).sort((a, b) => a.nextFreeInHours - b.nextFreeInHours || b.stars - a.stars);
  const ordered = sponsored ? [sponsored, ...rest] : rest;
  const toggle = (v: string) => setF((c) => (c.includes(v) ? c.filter((x) => x !== v) : [...c, v]));
  return (
    <Screen title={serviceLabel(tr, kind)} variant="root" refreshing={q.isRefetching} onRefresh={() => q.refetch()}>
      <Text variant="subheadline" color="textSecondary" style={{ marginHorizontal: layout.margin, marginTop: -4, marginBottom: space.sm }}>
        {where === 'clinic' ? tr('care.atClinic', 'At the clinic') : tr('care.homeVisit', 'Home visit')} · {tr('care.sortedBy', 'Soonest first')}
      </Text>
      <ChipRow multi options={[{ value: 'price', label: tr('care.f.price', 'Under $30') }, { value: 'en', label: tr('care.f.lang', 'Speaks English') }, { value: 'f', label: tr('care.f.gender', 'Woman specialist') }, { value: 'rating', label: tr('care.f.rating', 'Rating 4+') }]} value={f} onChange={toggle} style={{ marginBottom: space.sm }} />
      {q.isLoading ? (
        <View style={{ paddingHorizontal: layout.margin, gap: space.lg, marginTop: space.sm }}>{[0, 1, 2].map((i) => <View key={i} style={{ flexDirection: 'row', gap: 12 }}><Skeleton shape="circle" width={56} height={56} /><View style={{ flex: 1, gap: 8 }}><Skeleton shape="text" width="60%" /><Skeleton shape="text" width="40%" /></View></View>)}</View>
      ) : q.isError && !q.data ? <ErrorState onRetry={() => q.refetch()} /> : !ordered.length ? (
        <EmptyState symbol="stethoscope" message={tr('care.emptyArea', 'No specialists visit this area yet.')} actionLabel={tr('care.tryClinic', 'Try at a clinic')} onAction={() => push(`/specialists/${kind}?where=clinic`)} />
      ) : ordered.map((s, i) => (
        <View key={s.id}>{i > 0 ? <Divider inset={layout.margin + 56 + space.sm} /> : null}<SpecialistRow s={s} index={i} onPress={() => push(`/specialist/${s.id}?where=${where ?? 'home'}`)} /></View>
      ))}
    </Screen>
  );
}
