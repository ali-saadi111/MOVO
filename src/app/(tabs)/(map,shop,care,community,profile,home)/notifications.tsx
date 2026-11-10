import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition, ZoomIn, ZoomOut } from 'react-native-reanimated';

import { HeroArt } from '@/art/HeroArt';
import type { Notification } from '@/data/models';
import { useNotifications } from '@/data/queries';
import { useLang, useLocalized, useT } from '@/i18n';
import { haptic } from '@/lib/haptics';
import { relativeAgo, useNow } from '@/lib/dates';
import { useActivity } from '@/stores/activity';
import { continuous, layout, radii, space, useTheme } from '@/theme';
import { ChipRow, EmptyState, ErrorState, Icon, Pressable, Screen, Skeleton, Text, toneColors, useTabNav, type IconName, type Tone } from '@/ui';
import { edges } from '@/lib/rtl';

type Kind = Notification['kind'];
type Filter = 'all' | 'care' | 'orders' | 'community' | 'places';

const ICON: Record<string, IconName> = { booking: 'calendar', order: 'shippingbox', event: 'person.3', place: 'mappin', donation: 'heart', care: 'heart' };
const TONE: Record<string, Tone> = { booking: 'navy', care: 'navy', order: 'sand', place: 'mint', event: 'mist', donation: 'mist' };
const FILTER_OF: Record<string, Filter> = { booking: 'care', care: 'care', order: 'orders', event: 'community', donation: 'community', place: 'places' };
const DAY = 86_400_000;

/**
 * Notifications as a panel: a navy summary block with the unread count and
 * "Mark all as read", filter chips, then Today / This week / Earlier groups of
 * colour-coded cards that each carry the one action they lead to.
 */
export default function Notifications() {
  const t = useTheme();
  const tr = useT();
  const lang = useLang();
  const loc = useLocalized();
  const now = useNow();
  const { push } = useTabNav();
  const q = useNotifications();
  const read = useActivity((s) => s.readNotifications);
  const markRead = useActivity((s) => s.markRead);
  const markAllRead = useActivity((s) => s.markAllRead);
  const [filter, setFilter] = useState<Filter>('all');

  const all = q.data ?? [];
  const unread = all.filter((n) => !read.includes(n.id));
  const list = all.filter((n) => filter === 'all' || FILTER_OF[n.kind] === filter);
  const groups: { key: string; title: string; items: Notification[] }[] = [
    { key: 'today', title: tr('notifications.today', 'Today'), items: list.filter((n) => now - new Date(n.at).getTime() < DAY) },
    { key: 'week', title: tr('notifications.week', 'This week'), items: list.filter((n) => { const d = now - new Date(n.at).getTime(); return d >= DAY && d < 7 * DAY; }) },
    { key: 'earlier', title: tr('notifications.earlier', 'Earlier'), items: list.filter((n) => now - new Date(n.at).getTime() >= 7 * DAY) },
  ].filter((g) => g.items.length);

  const action = (k: Kind): string => ({
    booking: tr('notifications.actBooking', 'Choose a time'),
    order: tr('notifications.actOrder', 'Track order'),
    place: tr('notifications.actPlace', 'See place'),
    event: tr('notifications.actEvent', 'Save my spot'),
    donation: tr('notifications.actDonation', 'See update'),
    care: tr('notifications.actCare', 'See progress'),
  } as Record<string, string>)[k] ?? tr('common.open', 'Open');

  const open = (n: Notification) => { markRead(n.id); push(n.href === '/session-complete' ? '/booking/bk_1001' : n.href); };
  let index = 0;

  return (
    <Screen title={tr('notifications.title', 'Notifications')} variant="detail" refreshing={q.isRefetching} onRefresh={() => q.refetch()}>
      {q.isLoading ? <View style={{ padding: layout.margin, gap: space.md }}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} height={96} />)}</View>
        : q.isError ? <ErrorState onRetry={() => q.refetch()} />
        : !all.length ? <EmptyState symbol="bell" message={tr('notifications.empty', 'Nothing new. We’ll let you know when something changes.')} />
        : (
          <>
            {/* summary block */}
            <Animated.View entering={t.reduceMotion ? undefined : FadeInDown.springify().damping(18).stiffness(160)} style={{ marginHorizontal: layout.margin, marginTop: space.xs, marginBottom: space.md, minHeight: 150, borderRadius: radii.hero, ...continuous, backgroundColor: t.colors.blockNavy, padding: space.lg, overflow: 'hidden', justifyContent: 'space-between', gap: space.md }}>
              <View pointerEvents="none" style={{ position: 'absolute', ...edges(t.rtl, { end: -14 }), top: -6 }}><HeroArt name="bell" size={140} /></View>
              <View style={{ maxWidth: '62%' }}>
                <Text variant="caption1" weight="700" style={{ color: t.colors.accent, letterSpacing: 0.6 }}>{tr('notifications.eyebrow', 'YOUR UPDATES').toUpperCase()}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
                  <Animated.View key={unread.length} entering={t.reduceMotion ? undefined : ZoomIn.springify().damping(12)}>
                    <Text tabular style={{ color: '#FFFFFF', fontSize: 56, lineHeight: 60, fontWeight: '800', letterSpacing: -1.5 }}>{unread.length}</Text>
                  </Animated.View>
                  <Text variant="headline" style={{ color: 'rgba(255,255,255,0.8)', paddingBottom: 10 }}>{tr('notifications.new', 'new')}</Text>
                </View>
              </View>
              {unread.length ? (
                <Animated.View exiting={t.reduceMotion ? undefined : ZoomOut.duration(180)} style={{ alignSelf: 'flex-start' }}>
                  <Pressable feedback="scale" onPress={() => { haptic.success(); markAllRead(all.map((n) => n.id)); }} accessibilityRole="button" accessibilityLabel={tr('notifications.markAll', 'Mark all as read')}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 8, height: 44, paddingHorizontal: space.md, borderRadius: 22, backgroundColor: t.colors.accent }}>
                    <Icon name="checkmark.circle" size={18} weight="semibold" color={{ raw: '#013447' }} />
                    <Text variant="subheadline" weight="700" style={{ color: '#013447' }}>{tr('notifications.markAll', 'Mark all as read')}</Text>
                  </Pressable>
                </Animated.View>
              ) : (
                <Animated.View entering={t.reduceMotion ? undefined : FadeInDown.springify()} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Icon name="checkmark.circle" size={18} color={{ raw: '#22D39C' }} />
                  <Text variant="subheadline" weight="600" style={{ color: '#FFFFFF' }}>{tr('notifications.allCaught', 'You’re all caught up')}</Text>
                </Animated.View>
              )}
            </Animated.View>

            <ChipRow<Filter>
              value={filter}
              onChange={setFilter}
              style={{ marginBottom: space.sm }}
              options={[
                { value: 'all', label: tr('notifications.fAll', 'All') },
                { value: 'care', label: tr('notifications.fCare', 'Care') },
                { value: 'orders', label: tr('notifications.fOrders', 'Orders') },
                { value: 'community', label: tr('notifications.fCommunity', 'Community') },
                { value: 'places', label: tr('notifications.fPlaces', 'Places') },
              ]}
            />

            {!list.length ? <EmptyState symbol="bell" message={tr('notifications.emptyFilter', 'Nothing here yet.')} /> : null}

            {groups.map((g) => (
              <View key={`${filter}-${g.key}`} style={{ paddingHorizontal: layout.margin, gap: space.sm, marginTop: space.md }}>
                <Text variant="title3" weight="800" accessibilityRole="header">{g.title}</Text>
                {g.items.map((n) => {
                  const isUnread = !read.includes(n.id);
                  const tone = toneColors(t.colors, TONE[n.kind] ?? 'mist');
                  const i = index++;
                  return (
                    <Animated.View key={n.id} entering={t.reduceMotion ? undefined : FadeInDown.delay(120 + i * 60).springify().damping(18).stiffness(170)} exiting={t.reduceMotion ? undefined : FadeOut.duration(120)} layout={LinearTransition.springify().damping(20)}>
                      <Pressable feedback="scale" onPress={() => open(n)} accessibilityRole="button" accessibilityLabel={`${isUnread ? tr('notifications.unread', 'Unread') + '. ' : ''}${loc(n.title)}. ${loc(n.body)}. ${action(n.kind)}`}
                        style={{ borderRadius: radii.card, ...continuous, backgroundColor: t.colors.bgElevated, padding: space.md, gap: space.sm, flexDirection: 'row', boxShadow: isUnread ? '0 10px 24px rgba(1,52,71,0.10)' : undefined, borderWidth: isUnread ? 0 : 1, borderColor: t.colors.separator }}>
                        <View style={{ width: 52, height: 52, borderRadius: 18, ...continuous, backgroundColor: tone.bg, alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name={ICON[n.kind] ?? 'bell'} size={22} weight="semibold" color={{ raw: tone.ink }} />
                        </View>
                        <View style={{ flex: 1, gap: 4 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
                            <Text variant="headline" weight={isUnread ? '800' : '600'} style={{ flex: 1 }}>{loc(n.title)}</Text>
                            {isUnread ? <Animated.View entering={t.reduceMotion ? undefined : ZoomIn} exiting={t.reduceMotion ? undefined : ZoomOut.springify()} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: t.colors.accent }} /> : null}
                          </View>
                          <Text variant="subheadline" color="textSecondary">{loc(n.body)}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 34, paddingHorizontal: 14, borderRadius: 17, backgroundColor: isUnread ? t.colors.buttonPrimaryBg : t.colors.fill }}>
                              <Text variant="footnote" weight="700" style={{ color: isUnread ? t.colors.buttonPrimaryFg : t.colors.textPrimary }}>{action(n.kind)}</Text>
                              <Icon name="arrow.up.right" size={12} weight="bold" color={{ raw: isUnread ? t.colors.buttonPrimaryFg : t.colors.textPrimary }} />
                            </View>
                            <Text variant="footnote" color="textTertiary">{relativeAgo(n.at, lang)}</Text>
                          </View>
                        </View>
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>
            ))}
          </>
        )}
    </Screen>
  );
}
