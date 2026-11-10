import { useLocalSearchParams } from 'expo-router';
import { specialistPhoto } from '@/art/people';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { sync } from '@/data';
import { useLang, useT } from '@/i18n';
import { fmtDayTime } from '@/lib/dates';
import { haptic } from '@/lib/haptics';
import { continuous, layout, radii, space, useTheme } from '@/theme';
import { Avatar, Button, PlanProgress, StarRating, SuccessTick, Text, go } from '@/ui';

/** Session complete (App Experience): plan progress, a note, a rating and the next session. */
export default function SessionComplete() {
  const { specialist = 'sp_maya' } = useLocalSearchParams<{ specialist?: string }>();
  const t = useTheme();
  const tr = useT();
  const lang = useLang();
  const insets = useSafeAreaInsets();
  const s = sync.specialist(specialist)!;
  const [stars, setStars] = useState(0);
  // Same time next week, the usual rhythm of a plan.
  const [nextSession] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 7); d.setHours(10, 0, 0, 0); return d.toISOString(); });
  const name = lang === 'ar' ? s.nameAr : s.name;
  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bgPrimary, paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, space.md) }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: layout.margin, paddingTop: space.xxl, gap: space.xl }}>
        <View style={{ alignItems: 'center', gap: space.md }}>
          <SuccessTick size={80} />
          <Animated.View entering={FadeInDown.delay(250).springify()}><Text variant="title2" align="center">{tr('session.title', 'Session done. Well moved.')}</Text></Animated.View>
        </View>
        <Animated.View entering={FadeInDown.delay(350).springify()}><PlanProgress done={5} total={8} /></Animated.View>
        <Animated.View entering={FadeInDown.delay(420).springify()} style={{ borderRadius: radii.card, ...continuous, backgroundColor: t.colors.fill, padding: space.md, gap: space.sm }}>
          <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
            <Avatar name={s.name} hue={s.avatarHue} size={40} photo={specialistPhoto(s.id)} />
            <Text variant="headline">{tr('session.noteFrom', 'A note from {{name}}', { name })}</Text>
          </View>
          <Text variant="body">{tr('session.note', 'Great work on the transfers today. Keep doing the shoulder stretches twice a day, and we’ll add standing balance next time.')}</Text>
        </Animated.View>
        <View style={{ gap: space.xs }}>
          <Text variant="headline">{tr('session.rate', 'How was today’s session?')}</Text>
          <StarRating value={stars} onChange={(n) => { setStars(n); haptic.selection(); }} label={tr('session.rate', 'How was today’s session?')} />
        </View>
      </ScrollView>
      <View style={{ paddingHorizontal: layout.margin, gap: space.xs }}>
        <Button label={tr('session.bookNext', 'Book {{when}}', { when: fmtDayTime(nextSession, lang) })} onPress={() => { haptic.success(); go.back(); }} />
        <Button label={tr('session.another', 'Choose another time')} variant="plain" onPress={() => { go.back(); go.push(`/(tabs)/(care)/book/${s.id}`); }} />
      </View>
    </View>
  );
}
