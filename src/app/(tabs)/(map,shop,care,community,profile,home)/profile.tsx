import { MovoObject, type ObjectName } from '@/art/objects';
import type { TintName } from '@/theme/colors';
import { tabRoot } from '@/ui/TabRoot';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { HeroArt } from '@/art/HeroArt';
import { sync } from '@/data';
import { mobilityLabel } from '@/features/labels';
import { CanvasActions } from '@/features/shell/HeaderButtons';
import { useLang, useLocalized, useT } from '@/i18n';
import { fmtTime, fmtWeekday } from '@/lib/dates';
import { edges } from '@/lib/rtl';
import { useActivity } from '@/stores/activity';
import { useCaregiver } from '@/stores/caregiver';
import { useSession } from '@/stores/session';
import { useSettings, type Mobility } from '@/stores/settings';
import { continuous, layout, radii, space, useTheme } from '@/theme';
import { ActingForBar, Avatar, Button, CanvasHeader, Icon, ListRow, Pressable, Screen, Section, Text, go, useTabNav } from '@/ui';

/**
 * Profile home, one screen: the navy card (opens your account), one activity list
 * with live status on the right, the people you care for with Switch right there,
 * then Settings and support. The developer menu is a small footer line.
 */
function Profile() {
  const t = useTheme();
  const tr = useT();
  const lang = useLang();
  const loc = useLocalized();
  const { push } = useTabNav();
  const user = useSession((s) => s.user);
  const mob = useSettings((s) => s.mobility);
  const a = useActivity();
  const people = useCaregiver((s) => s.people);
  const acting = useCaregiver((s) => s.actingFor);
  const switchTo = useCaregiver((s) => s.switchTo);
  const moves = mob.filter((m) => m !== 'none').map((m) => mobilityLabel(tr, m as Exclude<Mobility, 'none'>)).join(', ') || tr('profile.moveNotSet', 'Not set');
  const moveLabel = (m: Mobility[]) => m.filter((x) => x !== 'none').map((x) => mobilityLabel(tr, x as Exclude<Mobility, 'none'>)).join(', ');

  // live status for each activity row
  const next = a.bookings.filter((b) => b.status === 'upcoming').sort((x, y) => x.startsAt.localeCompare(y.startsAt))[0];
  const nextSp = next ? sync.specialist(next.specialistId) : undefined;
  const nextSvc = nextSp?.services.find((s) => s.id === next?.serviceId);
  const order = a.orders[0];
  const orderItem = order ? sync.product(order.lines[0]?.productId ?? '') : undefined;
  const orderStatus = order ? { confirmed: tr('order.confirmed', 'Confirmed'), packed: tr('order.packed', 'Packed'), onTheWay: tr('order.onTheWay', 'On the way'), delivered: tr('order.delivered', 'Delivered') }[order.status] : '';
  const savedNames = a.saved.map((id) => sync.place(id)).filter((p) => !!p).map((p) => loc(p!.name)).join(', ');
  const joined = a.events.length + a.donations.length;

  const hero = (children: React.ReactNode) => {
    const box = { marginHorizontal: layout.margin, marginBottom: space.md, borderRadius: radii.hero, ...continuous, backgroundColor: t.tints.mint.bg, padding: space.md, gap: space.md, overflow: 'hidden' as const };
    return (
      <Animated.View entering={t.reduceMotion ? undefined : FadeInDown.springify().damping(18).stiffness(160)}>
<View style={box}>{children}</View>
      </Animated.View>
    );
  };
  const art = <View pointerEvents="none" style={{ position: 'absolute', ...edges(t.rtl, { end: -36 }), bottom: -44, opacity: 0.35 }}><HeroArt name="chair" size={128} /></View>;

  return (
    <Screen title={tr('tab.profile', 'Profile')} variant="canvas" header={<CanvasHeader compact title={tr('profile.title', 'Your Movo')} actions={<CanvasActions />} />}>
      <ActingForBar onSwitchBack={() => switchTo(null)} />
      {user ? (
        <>
          {hero(
            <>
              {art}
              <Pressable feedback="highlight" onPress={() => push('/account')} accessibilityRole="button" accessibilityLabel={`${user.fullName}, ${user.email}. ${tr('account.title', 'Your account')}`} style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
                <View style={{ borderRadius: 30, borderWidth: 3, borderColor: t.colors.accent, backgroundColor: t.colors.bgElevated }}><Avatar name={user.fullName} size={52} /></View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="title3" weight="700">{user.fullName}</Text>
                  <Text variant="subheadline" color="textSecondary" numberOfLines={1}>{user.email}</Text>
                </View>
                <Icon name="chevron.right" size={14} weight="semibold" color="textSecondary" mirrorInRTL />
              </Pressable>
              <Pressable onPress={() => go.push('/how-you-move')} accessibilityRole="button" accessibilityLabel={`${tr('profile.howIMove', 'How I move')}: ${moves}. ${tr('common.edit', 'Edit')}`} style={{ alignSelf: 'flex-start', maxWidth: '86%', flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 48, borderRadius: 18, backgroundColor: t.colors.bgElevated, paddingStart: 6, paddingEnd: space.md }}>
                <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: t.colors.accent, alignItems: 'center', justifyContent: 'center' }}><MovoObject name="wheel" size={24} ink="#013447" /></View>
                <View style={{ flexShrink: 1 }}>
                  <Text variant="caption2" weight="600" color="textSecondary">{tr('profile.howIMove', 'How I move')}</Text>
                  <Text variant="subheadline" weight="700" numberOfLines={1}>{moves}</Text>
                </View>
                <Icon name="pencil" size={13} weight="semibold" color="accentText" />
              </Pressable>
            </>,
          )}
          <Section header={tr('profile.activity', 'Your activity')} style={{ marginBottom: space.lg }}>
            <ListRow leading={<ObjTile name="heart" tint="lilac" />} title={tr('profile.bookings', 'My bookings')}
              subtitle={next ? `${(lang === 'ar' ? nextSp?.nameAr : nextSp?.name) ?? ''}${nextSvc ? ' · ' + loc(nextSvc.name) : ''}` : tr('profile.noBookings', 'No sessions booked')} subtitleLines={1}
              trailing={next ? { type: 'value', text: `${fmtWeekday(next.startsAt, lang)} ${fmtTime(next.startsAt, lang)}` } : undefined}
              onPress={() => push('/bookings')} />
            <ListRow leading={<ObjTile name="bag" tint="peach" />} title={tr('profile.orders', 'My orders')}
              subtitle={order ? `${order.id}${orderItem ? ' · ' + loc(orderItem.name) : ''}` : tr('profile.none', 'None yet')} subtitleLines={1}
              trailing={order ? { type: 'value', text: orderStatus } : undefined}
              onPress={() => push('/orders')} />
            <ListRow leading={<ObjTile name="pin" tint="sky" />} title={tr('profile.saved', 'Saved places')}
              subtitle={savedNames || tr('profile.none', 'None yet')} subtitleLines={1}
              trailing={a.saved.length ? { type: 'value', text: tr('profile.changed', '1 changed') } : undefined}
              onPress={() => push('/saved')} />
            <ListRow leading={<ObjTile name="people" tint="butter" />} title={tr('profile.eventsGifts', 'Events and donations')}
              subtitle={joined ? tr('profile.eventsGiftsSub', '{{e}} joined · {{d}} gifts', { e: a.events.length, d: a.donations.length }) : undefined}
              trailing={joined ? undefined : { type: 'value', text: tr('profile.findOne', 'Find one') }}
              onPress={() => push('/my-events')} />
          </Section>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: layout.margin + space.md, marginBottom: 6 }}>
            <Text variant="footnote" color="textSecondary" accessibilityRole="header" style={{ flex: 1, textTransform: t.rtl ? 'none' : 'uppercase' }}>{tr('profile.caringFor', 'Caring for')}</Text>
            <Pressable onPress={() => go.push('/sheets/add-person')} accessibilityRole="button" accessibilityLabel={tr('caregiver.add', 'Add a person')} hitSlop={10} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="plus" size={13} weight="bold" color={t.scheme === 'dark' ? 'accent' : 'tint'} />
              <Text variant="footnote" weight="700" color={t.scheme === 'dark' ? 'accent' : 'tint'}>{tr('common.add', 'Add')}</Text>
            </Pressable>
          </View>
          <Section style={{ marginBottom: space.lg }}>
            {people.length ? people.map((p) => (
              <ListRow key={p.id} leading={<Avatar name={p.firstName} size={36} hue={1} />} title={p.firstName}
                subtitle={[tr(`rel.${p.relationship.toLowerCase()}`, p.relationship), moveLabel(p.mobility)].filter(Boolean).join(' · ')} subtitleLines={1}
                trailing={{ type: 'node', node: <Button label={acting === p.id ? tr('caregiver.acting', 'Acting') : tr('caregiver.switch', 'Switch')} size="medium" variant={acting === p.id ? 'secondary' : 'primary'} fullWidth={false} onPress={() => switchTo(acting === p.id ? null : p.id)} /> }}
                onPress={() => go.push(`/sheets/person?id=${p.id}`)} />
            )) : <ListRow icon="person.badge.plus" title={tr('caregiver.add', 'Add a person')} subtitle={tr('caregiver.addSub', 'Book and order for someone you look after')} onPress={() => go.push('/sheets/add-person')} />}
          </Section>
        </>
      ) : (
        hero(
          <>
            {art}
            <Text variant="title3" weight="700" style={{ maxWidth: '78%' }}>{tr('profile.signInPitch', 'Sign in to book, order and save places')}</Text>
            <Text variant="subheadline" color="textSecondary" style={{ maxWidth: '78%', marginTop: -space.xs }}>{tr('profile.browseFree', 'You can browse everything without an account.')}</Text>
            <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap' }}>
              <Pressable feedback="scale" onPress={() => go.push('/auth/sign-up')} accessibilityRole="button" style={{ height: 44, paddingHorizontal: space.md, borderRadius: 22, backgroundColor: t.colors.buttonPrimaryBg, justifyContent: 'center' }}>
                <Text variant="subheadline" weight="700" style={{ color: t.colors.buttonPrimaryFg }}>{tr('auth.create', 'Create an account')}</Text>
              </Pressable>
              <Pressable feedback="scale" onPress={() => go.push('/auth/sign-in')} accessibilityRole="button" style={{ height: 44, paddingHorizontal: space.md, borderRadius: 22, backgroundColor: t.colors.bgElevated, justifyContent: 'center' }}>
                <Text variant="subheadline" weight="700">{tr('auth.login', 'Log in')}</Text>
              </Pressable>
            </View>
          </>,
        )
      )}
      <Section style={{ marginBottom: space.sm }}>
        <ListRow icon="gearshape" title={tr('profile.settings', 'Settings')} onPress={() => push('/settings')} />
        <ListRow icon="headphones" title={tr('profile.support', 'Get support')} onPress={() => go.push('/sheets/support')} />
      </Section>
      <Pressable onPress={() => go.push('/dev/menu')} accessibilityRole="button" accessibilityLabel={tr('profile.dev', 'Developer menu')} style={{ alignSelf: 'center', paddingVertical: space.xs, paddingHorizontal: space.md, marginBottom: space.md }}>
        <Text variant="caption1" color="textTertiary">{tr('profile.draft', 'Movo 0.1 draft')} · <Text variant="caption1" weight="600" color="textSecondary">{tr('profile.dev', 'Developer menu')}</Text></Text>
      </Pressable>
    </Screen>
  );
}

export default tabRoot('(profile)', '/(tabs)/(profile)/profile', Profile);

/** Small tinted tile with a Movo drawing, for list rows (each row takes its source tab's colour). */
function ObjTile({ name, tint }: { name: ObjectName; tint: TintName }) {
  const t = useTheme();
  const c = t.tints[tint];
  return (
    <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
      <MovoObject name={name} size={24} ink={c.ink} cut={c.bg} />
    </View>
  );
}
