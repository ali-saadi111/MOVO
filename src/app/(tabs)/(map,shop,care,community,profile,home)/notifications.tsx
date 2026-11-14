import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOut, LinearTransition, ZoomIn, ZoomOut } from 'react-native-reanimated';

import type { Notification } from '@/data/models';
import { useNotifications } from '@/data/queries';
import { useLang, useLocalized, useT } from '@/i18n';
import { haptic } from '@/lib/haptics';
import { relativeAgo, useNow } from '@/lib/dates';
import { useActivity } from '@/stores/activity';
import { continuous, layout, space, useTheme } from '@/theme';
import { ChipRow, EmptyState, ErrorState, Icon, Pressable, Screen, Skeleton, SwipeRow, Text, toneColors, useTabNav, type IconName, type Tone } from '@/ui';

type Kind = Notification['kind'];
type Filter = 'all' | 'care' | 'orders' | 'community' | 'places';

const ICON: Record<string, IconName> = { booking: 'calendar', order: 'shippingbox', event: 'person.3', place: 'mappin', donation: 'heart', care: 'heart' };
const TONE: Record<string, Tone> = { booking: 'navy', care: 'navy', order: 'sand', place: 'mint', event: 'mist', donation: 'mist' };
const FILTER_OF: Record<string, Filter> = { booking: 'care', care: 'care', order: 'orders', event: 'community', donation: 'community', place: 'places' };
const DAY = 86_400_000;

/**
 * Notifications as a list, like Mail: colour-coded icon, bold title with the time
 * on the right, two lines of text and the action as small text. Tap a row to open
 * it, swipe it left to mark it read. "Read all" sits in the bar.
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
  const accent = t.scheme === 'dark' ? t.colors.accent : t.colors.tint;
  let index = 0;

  return (
    <Screen title={tr('notifications.title', 'Notifications')} variant="detail" refreshing={q.isRefetching} onRefresh={() => q.refetch()}
      headerRight={unread.length ? () => (
        <Pressable onPress={() => { haptic.success(); markAllRead(all.map((n) => n.id)); }} accessibilityRole="button" accessibilityLabel={tr('notifications.markAll', 'Mark all as read')} hitSlop={8} style={{ height: 44, justifyContent: 'center', paddingHorizontal: space.xs }}>
          <Text variant="body" weight="600" style={{ color: accent }}>{tr('notifications.readAll', 'Read all')}</Text>
        </Pressable>
      ) : undefined}>
      {q.isLoading ? <View style={{ padding: layout.margin, gap: space.md }}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} height={72} />)}</View>
        : q.isError ? <ErrorState onRetry={() => q.refetch()} />
        : !all.length ? <EmptyState symbol="bell" message={tr('notifications.empty', 'Nothing new. We’ll let you know when something changes.')} />
        : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: layout.margin, paddingTop: space.xs, paddingBottom: space.sm }}>
              {unread.length ? (
                <Animated.View key={unread.length} entering={t.reduceMotion ? undefined : ZoomIn.springify().damping(14)} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.colors.accent }} />
              ) : <Icon name="checkmark.circle" size={16} color="accent" />}
              <Text variant="subheadline" weight="600" color="textSecondary">
                {unread.length ? tr('notifications.newCount', '{{n}} new', { n: unread.length }) : tr('notifications.allCaught', 'You’re all caught up')}
              </Text>
            </View>
            <ChipRow<Filter>
              value={filter}
              onChange={setFilter}
              style={{ marginBottom: space.xs }}
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
              <View key={`${filter}-${g.key}`} style={{ marginTop: space.sm }}>
                <Text variant="headline" weight="800" accessibilityRole="header" style={{ paddingHorizontal: layout.margin, marginBottom: 2 }}>{g.title}</Text>
                {g.items.map((n, gi) => {
                  const isUnread = !read.includes(n.id);
                  const tone = toneColors(t.colors, TONE[n.kind] ?? 'mist');
                  const i = index++;
                  return (
                    <Animated.View key={n.id} entering={t.reduceMotion ? undefined : FadeInDown.delay(80 + i * 40).springify().damping(20).stiffness(180)} exiting={t.reduceMotion ? undefined : FadeOut.duration(120)} layout={LinearTransition.springify().damping(20)}>
                      <SwipeRow
                        enabled={isUnread}
                        onOpen={() => { haptic.selection(); markRead(n.id); }}
                        action={(
                          <View style={{ width: 92, backgroundColor: t.colors.accent, alignItems: 'center', justifyContent: 'center' }}>
                            <Text variant="footnote" weight="700" style={{ color: '#013447', textAlign: 'center' }}>{tr('notifications.markOne', 'Mark read')}</Text>
                          </View>
                        )}
                      >
                        <Pressable feedback="highlight" onPress={() => open(n)} accessibilityRole="button" accessibilityLabel={`${isUnread ? tr('notifications.unread', 'Unread') + '. ' : ''}${loc(n.title)}. ${loc(n.body)}. ${action(n.kind)}`}
                          accessibilityActions={isUnread ? [{ name: 'markRead', label: tr('notifications.markOne', 'Mark read') }] : undefined}
                          onAccessibilityAction={() => markRead(n.id)}
                          style={{ flexDirection: 'row', gap: space.sm, paddingHorizontal: layout.margin, paddingVertical: space.sm, backgroundColor: t.colors.bgPrimary }}>
                          <View style={{ width: 40, height: 40, borderRadius: 13, ...continuous, backgroundColor: tone.bg, alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name={ICON[n.kind] ?? 'bell'} size={19} weight="semibold" color={{ raw: tone.ink }} />
                          </View>
                          <View style={{ flex: 1, gap: 2 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.xs }}>
                              <Text variant="subheadline" weight={isUnread ? '700' : '500'} style={{ flex: 1 }} numberOfLines={1}>{loc(n.title)}</Text>
                              <Text variant="caption1" color="textTertiary">{relativeAgo(n.at, lang)}</Text>
                            </View>
                            <Text variant="footnote" color="textSecondary" numberOfLines={2}>{loc(n.body)}</Text>
                            <Text variant="footnote" weight="700" style={{ color: isUnread ? accent : t.colors.textSecondary, marginTop: 2 }}>{action(n.kind)}</Text>
                          </View>
                          <View style={{ width: 9, paddingTop: 6 }}>
                            {isUnread ? <Animated.View entering={t.reduceMotion ? undefined : ZoomIn} exiting={t.reduceMotion ? undefined : ZoomOut.springify()} style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: t.colors.accent }} /> : null}
                          </View>
                        </Pressable>
                        {gi < g.items.length - 1 ? <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: t.colors.separator, marginStart: layout.margin + 40 + space.sm }} /> : null}
                      </SwipeRow>
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
