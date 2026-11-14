import { mobilityLabel } from '@/features/labels';
import { useT } from '@/i18n';
import { useSession } from '@/stores/session';
import { useSettings, type Mobility } from '@/stores/settings';
import { ListRow, Screen, Section, go } from '@/ui';

/** Your account: who you are, how you move, and the account actions. Opened from the navy card on Profile. */
export default function Account() {
  const tr = useT();
  const user = useSession((s) => s.user);
  const mob = useSettings((s) => s.mobility);
  const moves = mob.filter((m) => m !== 'none').map((m) => mobilityLabel(tr, m as Exclude<Mobility, 'none'>)).join(', ') || tr('profile.moveNotSet', 'Not set');
  return (
    <Screen title={tr('account.title', 'Your account')} variant="detail" grouped>
      <Section>
        <ListRow icon="person" title={tr('account.name', 'Name')} trailing={{ type: 'value', text: user?.fullName ?? '' }} />
        <ListRow icon="envelope" title={tr('auth.email', 'Email')} trailing={{ type: 'value', text: user?.email ?? '' }} />
      </Section>
      <Section footer={tr('account.moveFooter', 'Movo uses this to show places and products that fit you.')}>
        <ListRow icon="figure.roll" title={tr('profile.howIMove', 'How I move')} trailing={{ type: 'value', text: moves }} onPress={() => go.push('/how-you-move')} />
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
