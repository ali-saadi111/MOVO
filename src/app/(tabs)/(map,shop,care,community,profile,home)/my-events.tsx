import { sync } from '@/data';
import { useLang, useLocalized, useT } from '@/i18n';
import { fmtDay } from '@/lib/dates';
import { formatMoney } from '@/lib/money';
import { ltr } from '@/lib/rtl';
import { useActivity } from '@/stores/activity';
import { EmptyState, ListRow, Screen, Section, go, useTabNav } from '@/ui';

/** Events you joined and gifts you gave, on one page. */
export default function MyEvents() {
  const tr = useT();
  const lang = useLang();
  const loc = useLocalized();
  const { push } = useTabNav();
  const events = useActivity((s) => s.events);
  const gifts = useActivity((s) => s.donations);
  return (
    <Screen title={tr('profile.eventsGifts', 'Events and donations')} variant="root" grouped>
      {!events.length && !gifts.length ? <EmptyState symbol="person.3" message={tr('myEvents.emptyBoth', 'You haven’t joined an event or given to a campaign yet.')} actionLabel={tr('myEvents.find', 'See activities')} onAction={() => go.push('/(tabs)/(community)/community')} /> : null}
      {events.length ? (
        <Section header={tr('myEvents.joined', 'Events you joined')}>
          {events.map((e) => { const ev = sync.event(e.eventId); return ev ? <ListRow key={e.eventId} icon="calendar" title={loc(ev.title)} subtitle={`${fmtDay(ev.startsAt, lang)} · ${tr('done.code', 'Your spot code')} ${e.code}`} onPress={() => push(`/event/${ev.id}`)} /> : null; })}
        </Section>
      ) : null}
      {gifts.length ? (
        <Section header={tr('myEvents.gifts', 'Your gifts')}>
          {gifts.map((d, i) => { const c = sync.campaign(d.campaignId); return c ? <ListRow key={`${d.campaignId}-${i}`} icon="gift" title={loc(c.title)} subtitle={fmtDay(d.at, lang)} trailing={{ type: 'value', text: ltr(formatMoney(d.amountCents)) }} onPress={() => push(`/campaign/${c.id}`)} /> : null; })}
        </Section>
      ) : null}
    </Screen>
  );
}
