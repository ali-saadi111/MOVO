import { useT } from '@/i18n';
import { useSettings, type CheckIn } from '@/stores/settings';
import { ListRow, Screen, Section, Switch } from '@/ui';

/** Everything about notifications on one page: how often we check in, what we tell you about, quiet hours. */
export default function NotificationSettings() {
  const tr = useT();
  const s = useSettings();
  const opts: { k: CheckIn; title: string; sub: string }[] = [
    { k: 'important', title: tr('checkIn.important', 'Only what’s important'), sub: tr('checkIn.importantShort', 'Bookings, orders and changes to your plans') },
    { k: 'encouragement', title: tr('checkIn.encouragement', 'A little encouragement'), sub: tr('checkIn.encouragementShort', 'Plus a word when you finish a session') },
    { k: 'keepGoing', title: tr('checkIn.keepGoing', 'Help me keep going'), sub: tr('checkIn.keepGoingShort', 'Plus a reminder after a quiet week') },
  ];
  type K = keyof typeof s.notify;
  const rows: { k: K; icon: 'calendar' | 'shippingbox' | 'person.3' | 'map' | 'sparkles'; title: string }[] = [
    { k: 'bookings', icon: 'calendar', title: tr('settings.nBookings', 'Bookings and sessions') },
    { k: 'orders', icon: 'shippingbox', title: tr('settings.nOrders', 'Orders and delivery') },
    { k: 'events', icon: 'person.3', title: tr('settings.nEvents', 'Events I joined') },
    { k: 'places', icon: 'map', title: tr('settings.nPlaces', 'Places I saved') },
    { k: 'news', icon: 'sparkles', title: tr('settings.nNews', 'Movo news') },
  ];
  return (
    <Screen title={tr('settings.notifications', 'Notifications')} variant="detail" grouped>
      <Section header={tr('settings.checkIn', 'How often we check in')}>
        {opts.map((o) => <ListRow key={o.k} title={o.title} subtitle={o.sub} trailing={{ type: 'check', on: s.checkIn === o.k }} onPress={() => s.set({ checkIn: o.k })} />)}
      </Section>
      <Section header={tr('settings.tellMe', 'Tell me about')}>
        {rows.map((r) => <ListRow key={r.k} icon={r.icon} title={r.title} trailing={{ type: 'node', node: <Switch label={r.title} value={s.notify[r.k]} onValueChange={(v) => s.set({ notify: { ...s.notify, [r.k]: v } })} /> }} />)}
      </Section>
      <Section footer={tr('settings.quietFooter', 'Quiet hours hold everything that isn’t urgent between 22:00 and 08:00.')}>
        <ListRow icon="moon" title={tr('settings.quiet', 'Quiet hours')} subtitle="22:00 – 08:00" trailing={{ type: 'node', node: <Switch label={tr('settings.quiet', 'Quiet hours')} value={s.quietHours} onValueChange={(v) => s.set({ quietHours: v })} /> }} />
      </Section>
    </Screen>
  );
}
