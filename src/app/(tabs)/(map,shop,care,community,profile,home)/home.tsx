import { tabRoot } from '@/ui/TabRoot';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useEvents, usePlaces } from '@/data/queries';
import { HeaderButtons } from '@/features/shell/HeaderButtons';
import { useT } from '@/i18n';
import { useActivity } from '@/stores/activity';
import { useSession } from '@/stores/session';
import { layout, space } from '@/theme';
import { BookingHeroCard, EventCard, PlaceRow, Screen, SectionHeader, Text, useTabNav } from '@/ui';

/** Behind the Home dev flag (Build Brief has no Home tab; see README open questions). */
function Home() {
  const tr = useT();
  const { push } = useTabNav();
  const user = useSession((s) => s.user);
  const next = useActivity((s) => s.bookings.find((b) => b.status === 'upcoming'));
  const places = usePlaces();
  const events = useEvents();
  const hour = new Date().getHours();
  const hello = hour < 12 ? tr('home.morning', 'Good morning') : hour < 18 ? tr('home.afternoon', 'Good afternoon') : tr('home.evening', 'Good evening');
  return (
    <Screen title={user ? `${hello}, ${user.fullName.split(' ')[0]}` : hello} variant="root" headerRight={() => <HeaderButtons />}>
      {next ? (
        <Animated.View entering={FadeInDown.springify().damping(26).stiffness(170)} style={{ marginBottom: space.xxl }}>
          <BookingHeroCard startsAt={next.startsAt} specialistId={next.specialistId} where={next.where} onPress={() => push(`/booking/${next.id}`)} onAction={() => push(`/booking/${next.id}`)} actionLabel={tr('care.seeBooking', 'See booking')} />
        </Animated.View>
      ) : null}
      <SectionHeader title={tr('home.near', 'Near you')} actionLabel={tr('common.seeAll', 'See all')} onAction={() => push('/')} />
      {(places.data ?? []).slice(0, 3).map((p, i) => <PlaceRow key={p.id} place={p} index={i} onPress={() => push(`/place/${p.id}`)} />)}
      <View style={{ height: space.xl }} />
      <SectionHeader title={tr('home.thisWeek', 'This week')} actionLabel={tr('common.seeAll', 'See all')} onAction={() => push('/community')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: layout.margin, gap: space.sm }}>
        {(events.data ?? []).slice(0, 4).map((e) => <View key={e.id} style={{ width: 280 }}><EventCard ev={e} onPress={() => push(`/event/${e.id}`)} /></View>)}
      </ScrollView>
      <Text variant="footnote" color="textTertiary" style={{ padding: layout.margin }}>{tr('home.flag', 'Home is behind a developer flag while the tab layout is decided.')}</Text>
    </Screen>
  );
}

export default tabRoot('(home)', '/(tabs)/(home)/home', Home);
