import { useState } from 'react';
import { View } from 'react-native';

import { sync } from '@/data';
import { useLang, useT } from '@/i18n';
import { fmtDay, fmtTime } from '@/lib/dates';
import { useActivity } from '@/stores/activity';
import { layout, space } from '@/theme';
import { EmptyState, ListRow, Screen, Section, Segmented, go, useTabNav } from '@/ui';

export default function Bookings() {
  const tr = useT();
  const lang = useLang();
  const { push } = useTabNav();
  const [seg, setSeg] = useState(0);
  const list = useActivity((s) => s.bookings).filter((b) => (seg === 0 ? b.status === 'upcoming' : b.status !== 'upcoming'));
  return (
    <Screen title={tr('profile.bookings', 'My bookings')} variant="root" grouped>
      <View style={{ paddingHorizontal: layout.margin, marginBottom: space.lg }}><Segmented values={[tr('seg.upcoming2', 'Upcoming'), tr('seg.past', 'Past')]} index={seg} onChange={setSeg} /></View>
      {!list.length ? <EmptyState symbol="calendar" message={tr('bookings.empty', 'No bookings yet.')} actionLabel={tr('bookings.find', 'Find a specialist')} onAction={() => go.push('/(tabs)/(care)/care')} /> : (
        <Section>{list.map((b) => { const s = sync.specialist(b.specialistId); return <ListRow key={b.id} icon="calendar" title={`${fmtDay(b.startsAt, lang)} · ${fmtTime(b.startsAt, lang)}`} subtitle={(lang === 'ar' ? s?.nameAr : s?.name) ?? ''} onPress={() => push(`/booking/${b.id}`)} />; })}</Section>
      )}
    </Screen>
  );
}
