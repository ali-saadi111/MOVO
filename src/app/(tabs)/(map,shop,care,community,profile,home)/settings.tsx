import { View } from 'react-native';

import { useT } from '@/i18n';
import { applyDirection } from '@/lib/rtl';
import { useSession } from '@/stores/session';
import { useSettings, type Lang } from '@/stores/settings';
import { layout, space } from '@/theme';
import { ListRow, Screen, Section, Segmented, Switch, Text, go, useTabNav } from '@/ui';

export default function Settings() {
  const tr = useT();
  const { push } = useTabNav();
  const s = useSettings();
  const user = useSession((x) => x.user);
  const checkIn = { important: tr('checkIn.important', 'Only what’s important'), encouragement: tr('checkIn.encouragement', 'A little encouragement'), keepGoing: tr('checkIn.keepGoing', 'Help me keep going') }[s.checkIn];
  const setLang = (l: Lang) => { s.set({ lang: l }); applyDirection(l === 'ar'); };
  const appearance: ('system' | 'light' | 'dark')[] = ['system', 'light', 'dark'];
  return (
    <Screen title={tr('profile.settings', 'Settings')} variant="root" grouped>
      <Section header={tr('settings.language', 'Language')}>
        <ListRow title="English" trailing={{ type: 'check', on: s.lang !== 'ar' }} onPress={() => setLang('en')} />
        <ListRow title="العربية" trailing={{ type: 'check', on: s.lang === 'ar' }} onPress={() => setLang('ar')} />
      </Section>
      <Section header={tr('settings.notifications', 'Notifications')} footer={tr('settings.quietFooter', 'Quiet hours hold everything that isn’t urgent between 22:00 and 08:00.')}>
        <ListRow icon="bell.badge" title={tr('settings.checkIn', 'How often we check in')} trailing={{ type: 'value', text: checkIn }} onPress={() => push('/check-in')} />
        <ListRow icon="calendar" title={tr('settings.nBookings', 'Bookings and sessions')} trailing={{ type: 'node', node: <Switch label={tr('settings.nBookings', 'Bookings and sessions')} value={s.notify.bookings} onValueChange={(v) => s.set({ notify: { ...s.notify, bookings: v } })} /> }} />
        <ListRow icon="shippingbox" title={tr('settings.nOrders', 'Orders and delivery')} trailing={{ type: 'node', node: <Switch label={tr('settings.nOrders', 'Orders and delivery')} value={s.notify.orders} onValueChange={(v) => s.set({ notify: { ...s.notify, orders: v } })} /> }} />
        <ListRow icon="person.3" title={tr('settings.nEvents', 'Events I joined')} trailing={{ type: 'node', node: <Switch label={tr('settings.nEvents', 'Events I joined')} value={s.notify.events} onValueChange={(v) => s.set({ notify: { ...s.notify, events: v } })} /> }} />
        <ListRow icon="map" title={tr('settings.nPlaces', 'Places I saved')} trailing={{ type: 'node', node: <Switch label={tr('settings.nPlaces', 'Places I saved')} value={s.notify.places} onValueChange={(v) => s.set({ notify: { ...s.notify, places: v } })} /> }} />
        <ListRow icon="moon" title={tr('settings.quiet', 'Quiet hours')} trailing={{ type: 'node', node: <Switch label={tr('settings.quiet', 'Quiet hours')} value={s.quietHours} onValueChange={(v) => s.set({ quietHours: v })} /> }} />
      </Section>
      <Text variant="footnote" color="textSecondary" style={{ paddingHorizontal: layout.margin + space.md, marginBottom: space.xs }}>{tr('settings.appearance', 'Appearance').toUpperCase()}</Text>
      <View style={{ paddingHorizontal: layout.margin, marginBottom: space.xl }}>
        <Segmented values={[tr('settings.system', 'Automatic'), tr('settings.light', 'Light'), tr('settings.dark', 'Dark')]} index={appearance.indexOf(s.appearance)} onChange={(i) => s.set({ appearance: appearance[i] })} />
      </View>
      <Section header={tr('settings.display', 'Display')} footer={tr('settings.displayFooter', 'Text size also follows your iPhone’s setting.')}>
        <ListRow icon="circle.lefthalf.filled" title={tr('settings.contrast', 'Higher contrast')} trailing={{ type: 'node', node: <Switch label={tr('settings.contrast', 'Higher contrast')} value={s.highContrast} onValueChange={(v) => s.set({ highContrast: v })} /> }} />
        <ListRow icon="sparkles" title={tr('settings.motion', 'Reduce motion')} trailing={{ type: 'node', node: <Switch label={tr('settings.motion', 'Reduce motion')} value={s.reduceMotion} onValueChange={(v) => s.set({ reduceMotion: v })} /> }} />
        <ListRow icon="textformat" title={tr('settings.bigText', 'Larger text in Movo')} trailing={{ type: 'node', node: <Switch label={tr('settings.bigText', 'Larger text in Movo')} value={s.textScale > 1} onValueChange={(v) => s.set({ textScale: v ? 1.2 : 1 })} /> }} />
      </Section>
      <Section header={tr('settings.about', 'About')}>
        <ListRow icon="hand.raised" title={tr('settings.privacy', 'Privacy')} onPress={() => {}} />
        <ListRow icon="doc.text" title={tr('settings.terms', 'Terms')} onPress={() => {}} />
        <ListRow icon="photo" title={tr('settings.credits', 'Photo credits')} onPress={() => push('/credits')} />
        <ListRow icon="info.circle" title={tr('settings.version', 'Version')} trailing={{ type: 'value', text: '0.1 (draft)' }} />
      </Section>
      {user ? (
        <Section>
          <ListRow title={tr('settings.logout', 'Log out')} trailing={{ type: 'none' }} onPress={() => go.push('/sheets/confirm?kind=logout')} />
          <ListRow title={tr('settings.delete', 'Delete account')} destructive trailing={{ type: 'none' }} onPress={() => go.push('/sheets/delete-account')} />
        </Section>
      ) : null}
    </Screen>
  );
}
