import { tabRoot } from '@/ui/TabRoot';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { HeroArt } from '@/art/HeroArt';
import { mobilityLabel } from '@/features/labels';
import { CanvasActions } from '@/features/shell/HeaderButtons';
import { useT } from '@/i18n';
import { useActivity } from '@/stores/activity';
import { useCaregiver } from '@/stores/caregiver';
import { useSession } from '@/stores/session';
import { useSettings, type Mobility } from '@/stores/settings';
import { continuous, layout, radii, space, useTheme } from '@/theme';
import { ActingForBar, Avatar, Button, CanvasHeader, Icon, ListRow, Pressable, Screen, Section, StatTile, Text, go, useTabNav } from '@/ui';
import { edges } from '@/lib/rtl';

function Profile() {
  const t = useTheme();
  const tr = useT();
  const { push } = useTabNav();
  const user = useSession((s) => s.user);
  const mob = useSettings((s) => s.mobility);
  const a = useActivity();
  const people = useCaregiver((s) => s.people);
  const switchTo = useCaregiver((s) => s.switchTo);
  const moves = mob.filter((m) => m !== 'none').map((m) => mobilityLabel(tr, m as Exclude<Mobility, 'none'>)).join(', ') || tr('profile.moveNotSet', 'Not set');
  const upcoming = a.bookings.filter((b) => b.status === 'upcoming').length;
  return (
    <Screen title={tr('tab.profile', 'Profile')} variant="canvas" header={<CanvasHeader title={tr('profile.title', 'Your Movo')} actions={<CanvasActions />} />}>
      <ActingForBar onSwitchBack={() => switchTo(null)} />
      {user ? (
        <>
          <Animated.View entering={FadeInDown.springify().damping(18).stiffness(160)} style={{ marginHorizontal: layout.margin, marginBottom: space.md, borderRadius: radii.hero, ...continuous, backgroundColor: t.colors.blockNavy, padding: space.lg, gap: space.lg, overflow: 'hidden' }}>
            <View pointerEvents="none" style={{ position: 'absolute', ...edges(t.rtl, { end: -36 }), bottom: -40, opacity: 0.9 }}><HeroArt name="chair" size={140} /></View>
            <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
              <View style={{ borderRadius: 34, borderWidth: 3, borderColor: t.colors.accent }}><Avatar name={user.fullName} size={60} /></View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="title3" style={{ color: '#FFFFFF', fontWeight: '800' }}>{user.fullName}</Text>
                <Text variant="subheadline" style={{ color: 'rgba(255,255,255,0.7)' }} numberOfLines={1}>{user.email}</Text>
              </View>
            </View>
            <Pressable onPress={() => go.push('/how-you-move')} accessibilityRole="button" accessibilityLabel={`${tr('profile.howIMove', 'How I move')}: ${moves}. ${tr('common.edit', 'Edit')}`} style={{ alignSelf: 'flex-start', maxWidth: '86%', flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 52, borderRadius: 26, backgroundColor: t.colors.accent, paddingStart: 8, paddingEnd: space.md }}>
              <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#013447', alignItems: 'center', justifyContent: 'center' }}><Icon name="figure.roll" size={18} color={{ raw: '#22D39C' }} /></View>
              <View style={{ flexShrink: 1 }}>
                <Text variant="caption1" weight="600" style={{ color: '#013447', opacity: 0.75 }}>{tr('profile.howIMove', 'How I move')}</Text>
                <Text variant="subheadline" weight="700" style={{ color: '#013447' }} numberOfLines={1}>{moves}</Text>
              </View>
              <Icon name="pencil" size={14} weight="semibold" color={{ raw: '#013447' }} />
            </Pressable>
          </Animated.View>
          <View style={{ flexDirection: 'row', gap: space.sm, paddingHorizontal: layout.margin, marginBottom: space.xl }}>
            <StatTile value={a.saved.length} label={tr('profile.saved', 'Saved places')} icon="bookmark.fill" tone="mint" index={0} onPress={() => push('/saved')} />
            <StatTile value={upcoming} label={tr('profile.bookings', 'My bookings')} icon="calendar" tone="sand" index={1} onPress={() => push('/bookings')} />
            <StatTile value={a.orders.length} label={tr('profile.orders', 'My orders')} icon="shippingbox" tone="mist" index={2} onPress={() => push('/orders')} />
          </View>
        </>
      ) : (
        <View style={{ marginHorizontal: layout.margin, marginBottom: space.xl, gap: space.xs }}>
          <Text variant="body" color="textSecondary" style={{ marginBottom: space.sm }}>{tr('profile.signedOut', 'Browse everything without an account. Sign in to book, order, save places and join events.')}</Text>
          <Button label={tr('auth.create', 'Create an account')} onPress={() => go.push('/auth/sign-up')} />
          <Button label={tr('auth.login', 'Log in')} variant="secondary" onPress={() => go.push('/auth/sign-in')} />
        </View>
      )}
      {user ? (
        <Section>
          <ListRow icon="bookmark" title={tr('profile.saved', 'Saved places')} subtitle={tr('profile.savedSub', '{{n}} places · 1 rating changed', { n: a.saved.length })} onPress={() => push('/saved')} />
          <ListRow icon="shippingbox" title={tr('profile.orders', 'My orders')} subtitle={a.orders[0] ? tr('profile.ordersSub', 'Last: {{id}}', { id: a.orders[0].id }) : tr('profile.none', 'None yet')} onPress={() => push('/orders')} />
          <ListRow icon="calendar" title={tr('profile.bookings', 'My bookings')} subtitle={tr('profile.bookingsSub', '{{n}} upcoming', { n: upcoming })} onPress={() => push('/bookings')} />
          <ListRow icon="person.3" title={tr('profile.events', 'My events')} subtitle={tr('profile.eventsSub', '{{n}} joined', { n: a.events.length })} onPress={() => push('/my-events')} />
          <ListRow icon="gift" title={tr('profile.donations', 'My donations')} subtitle={tr('profile.donationsSub', '{{n}} gifts', { n: a.donations.length })} onPress={() => push('/donations')} />
          <ListRow icon="person.2" title={tr('profile.caregiver', 'Caregiver')} subtitle={tr('profile.caregiverSub', 'Caring for {{names}}', { names: people.map((p) => p.firstName).join(', ') || '—' })} onPress={() => push('/caregiver')} />
        </Section>
      ) : null}
      <Section>
        <ListRow icon="gearshape" title={tr('profile.settings', 'Settings')} onPress={() => push('/settings')} />
        <ListRow icon="headphones" title={tr('profile.support', 'Get support')} onPress={() => go.push('/sheets/support')} />
        <ListRow icon="hammer" title={tr('profile.dev', 'Developer menu')} subtitle={tr('profile.devSub', 'Draft only: states, flags, outcomes')} onPress={() => go.push('/dev/menu')} />
      </Section>
    </Screen>
  );
}

export default tabRoot('(profile)', '/(tabs)/(profile)/profile', Profile);
