import { View } from 'react-native';

import { useT } from '@/i18n';
import { useSession } from '@/stores/session';
import { useSettings } from '@/stores/settings';
import { space } from '@/theme';
import { ListRow, Screen, Section, Segmented, Switch, Text, go, useTabNav } from '@/ui';

/**
 * Settings on one screen: the seeing-and-reading switches first (this is an
 * accessibility app), Language and Notifications as single rows that open
 * their own sheet or page, then About, account actions and the version.
 */
export default function Settings() {
  const tr = useT();
  const { push } = useTabNav();
  const s = useSettings();
  const user = useSession((x) => x.user);
  const appearance: ('system' | 'light' | 'dark')[] = ['system', 'light', 'dark'];
  const on = Object.values(s.notify).filter(Boolean).length;
  const total = Object.values(s.notify).length;
  const checkIn = { important: tr('checkIn.important', 'Only what’s important'), encouragement: tr('checkIn.encouragement', 'A little encouragement'), keepGoing: tr('checkIn.keepGoing', 'Help me keep going') }[s.checkIn];
  const sw = (label: string, value: boolean, set: (v: boolean) => void) => ({ type: 'node' as const, node: <Switch label={label} value={value} onValueChange={set} /> });
  return (
    <Screen title={tr('profile.settings', 'Settings')} variant="root" grouped>
      <Section header={tr('settings.seeing', 'Seeing and reading')} footer={tr('settings.displayFooter', 'Text size also follows your iPhone’s setting.')}>
        <ListRow icon="textformat" title={tr('settings.bigText', 'Larger text in Movo')} trailing={sw(tr('settings.bigText', 'Larger text in Movo'), s.textScale > 1, (v) => s.set({ textScale: v ? 1.2 : 1 }))} />
        <ListRow icon="circle.lefthalf.filled" title={tr('settings.contrast', 'Higher contrast')} trailing={sw(tr('settings.contrast', 'Higher contrast'), s.highContrast, (v) => s.set({ highContrast: v }))} />
        <ListRow icon="sparkles" title={tr('settings.motion', 'Reduce motion')} trailing={sw(tr('settings.motion', 'Reduce motion'), s.reduceMotion, (v) => s.set({ reduceMotion: v }))} />
        <ListRow icon="moon" title={tr('settings.theme', 'Theme')} trailing={{ type: 'node', node: (
          <View style={{ width: 196 }}>
            <Segmented values={[tr('settings.auto', 'Auto'), tr('settings.light', 'Light'), tr('settings.dark', 'Dark')]} index={appearance.indexOf(s.appearance)} onChange={(i) => s.set({ appearance: appearance[i] })} />
          </View>
        ) }} />
      </Section>
      <Section header={tr('settings.general', 'General')}>
        <ListRow icon="globe.americas.fill" title={tr('settings.language', 'Language')} trailing={{ type: 'value', text: s.lang === 'ar' ? 'العربية' : 'English' }} onPress={() => go.push('/sheets/language')} />
        <ListRow icon="bell.badge" title={tr('settings.notifications', 'Notifications')} subtitle={`${checkIn}${s.quietHours ? ' · ' + tr('settings.quietShort', 'quiet at night') : ''}`} subtitleLines={1}
          trailing={{ type: 'value', text: tr('settings.onOf', '{{on}} of {{total}} on', { on, total }) }} onPress={() => push('/notification-settings')} />
      </Section>
      <Section header={tr('settings.about', 'About')}>
        <ListRow icon="hand.raised" title={tr('settings.privacyTerms', 'Privacy and terms')} onPress={() => {}} />
        <ListRow icon="photo" title={tr('settings.credits', 'Photo credits')} onPress={() => push('/credits')} />
      </Section>
      {user ? (
        <Section style={{ marginBottom: space.sm }}>
          <ListRow title={tr('settings.logout', 'Log out')} trailing={{ type: 'none' }} onPress={() => go.push('/sheets/confirm?kind=logout')} />
          <ListRow title={tr('settings.delete', 'Delete account')} destructive trailing={{ type: 'none' }} onPress={() => go.push('/sheets/delete-account')} />
        </Section>
      ) : null}
      <Text variant="footnote" color="textTertiary" style={{ textAlign: 'center', marginBottom: space.lg }}>{tr('settings.versionLine', 'Movo {{v}}', { v: '0.1 (draft)' })}</Text>
    </Screen>
  );
}
