import { useMemo } from 'react';
import { View } from 'react-native';

import { places } from '@/data/fixtures/places';
import type { RatingLevel } from '@/data';
import { ratingLabel } from '@/features/labels';
import { useT } from '@/i18n';
import { useFilters, type MustHave } from '@/stores/filters';
import { layout, space } from '@/theme';
import { Button, ListRow, RatingBadge, Section, Sheet, Switch, go, useMobilityFor } from '@/ui';

export default function MapFilters() {
  const tr = useT();
  const f = useFilters((s) => s.map);
  const set = useFilters((s) => s.setMap);
  const clear = useFilters((s) => s.clearMap);
  const mob = useMobilityFor();
  const n = useMemo(() => places.filter((p) => (f.category === 'all' || p.category === f.category) && (!f.ratings.length || f.ratings.includes(p.rating.level)) && f.mustHave.every((m) => p.amenities[m]) && (!f.fitsMe || !mob || p.rating.fits[mob])).length, [f, mob]);
  const toggleR = (l: RatingLevel) => set({ ratings: f.ratings.includes(l) ? f.ratings.filter((x) => x !== l) : [...f.ratings, l] });
  const toggleM = (m: MustHave) => set({ mustHave: f.mustHave.includes(m) ? f.mustHave.filter((x) => x !== m) : [...f.mustHave, m] });
  const must: [MustHave, string][] = [['stepFree', tr('filter.stepFree', 'Step-free entrance')], ['toilet', tr('filter.toilet', 'Accessible toilet')], ['parking', tr('filter.parking', 'Parking nearby')], ['elevator', tr('filter.elevator', 'Elevator')]];
  return (
    <Sheet title={tr('map.filters', 'Filters')} detent={0.85}
      footer={<Button label={n ? tr('map.showN', 'Show {{n}} places', { n }) : tr('map.noneMatch', 'No places match')} disabledReason={n ? null : tr('map.noneMatch', 'No places match')} onPress={go.back} />}>
      <View style={{ height: space.sm }} />
      <Section header={tr('filter.rating', 'Rating')}>
        {(['accessible', 'partly', 'not'] as RatingLevel[]).map((l) => (
          <ListRow key={l} leading={<RatingBadge level={l} size="mini" />} title={ratingLabel(tr, l)} trailing={{ type: 'check', on: f.ratings.includes(l) }} onPress={() => toggleR(l)} />
        ))}
      </Section>
      <Section footer={mob ? undefined : tr('filter.fitsHint', 'Set how you move in Profile to use this.')}>
        <ListRow icon="figure.roll" title={tr('filter.fitsMe', 'Fits how I move')} trailing={{ type: 'node', node: <Switch value={f.fitsMe && !!mob} onValueChange={(v) => set({ fitsMe: v })} label={tr('filter.fitsMe', 'Fits how I move')} /> }} />
      </Section>
      <Section header={tr('filter.mustHave', 'Must have')}>
        {must.map(([k, l]) => <ListRow key={k} title={l} trailing={{ type: 'check', on: f.mustHave.includes(k) }} onPress={() => toggleM(k)} />)}
      </Section>
      <View style={{ paddingHorizontal: layout.margin }}><Button label={tr('shop.clear', 'Clear filters')} variant="plain" onPress={clear} /></View>
    </Sheet>
  );
}
