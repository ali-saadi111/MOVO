import { sync } from '@/data';
import { useLang, useLocalized, useT } from '@/i18n';
import { fmtDay } from '@/lib/dates';
import { useActivity } from '@/stores/activity';
import { EmptyState, ListRow, Screen, Section, go, useTabNav } from '@/ui';

export default function MyEvents() {
  const tr = useT();
  const lang = useLang();
  const loc = useLocalized();
  const { push } = useTabNav();
  const list = useActivity((s) => s.events);
  return (
    <Screen title={tr('profile.events', 'My events')} variant="root" grouped>
      {!list.length ? <EmptyState symbol="person.3" message={tr('myEvents.empty', 'You haven’t joined anything yet.')} actionLabel={tr('myEvents.find', 'See activities')} onAction={() => go.push('/(tabs)/(community)/community')} /> : (
        <Section>{list.map((e) => { const ev = sync.event(e.eventId); return ev ? <ListRow key={e.eventId} icon="calendar" title={loc(ev.title)} subtitle={`${fmtDay(ev.startsAt, lang)} · ${tr('done.code', 'Your spot code')} ${e.code}`} onPress={() => push(`/event/${ev.id}`)} /> : null; })}</Section>
      )}
    </Screen>
  );
}
