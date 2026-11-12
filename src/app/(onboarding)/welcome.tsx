import { ScrollView, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLang, useT } from '@/i18n';
import { space } from '@/theme';
import { Button, go, Pressable, Text, useScreen } from '@/ui';
import { Wordmark } from '@/features/onboarding/Wordmark';
import { Bubble, ChatCard, MovoSays } from '@/features/onboarding/chat';

const PICS = {
  map: require('../../../assets/onboarding/know-cafe.jpg'),
  care: require('../../../assets/onboarding/care-home.jpg'),
  together: require('../../../assets/onboarding/together-sport.jpg'),
};

/** One page instead of slides: Movo shows three real things it does, as cards in the chat. */
export default function Welcome() {
  const tr = useT();
  const lang = useLang();
  const insets = useSafeAreaInsets();
  const scr = useScreen();
  return (
    <View style={{ flex: 1, paddingBottom: Math.max(insets.bottom, space.md) }}>
      <Animated.View entering={FadeInUp} style={{ paddingTop: insets.top + 6, paddingStart: scr.gutter, paddingEnd: space.xs, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Wordmark size={26} />
        <Pressable onPress={() => go.push('/how-you-move')} accessibilityRole="button" style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: space.md }}>
          <Text variant="subheadline" weight="700" color="textSecondary">{tr('onb.skip', 'Skip')}</Text>
        </Pressable>
      </Animated.View>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingHorizontal: scr.gutter, paddingTop: space.md, paddingBottom: space.md, gap: space.xs }} showsVerticalScrollIndicator={false}>
        <Bubble from="me" delay={100}>{lang === 'ar' ? 'العربية' : 'English'}</Bubble>
        <MovoSays delay={400} lines={[tr('onb.chat.w.hi', "Great. Here's what I can do for you:")]} style={{ marginTop: space.xs }} />
        <ChatCard delay={700} image={PICS.map} icon="checkmark.seal.fill" title={tr('onb.chat.w.c1', 'Places checked in person')} line={tr('onb.chat.w.c1s', 'Step-free entrance, wide door, toilet')} />
        <ChatCard delay={950} image={PICS.care} icon="house" title={tr('onb.chat.w.c2', 'Gear and care at home')} line={tr('onb.chat.w.c2s', 'Delivered, or a specialist who visits')} />
        <ChatCard delay={1200} image={PICS.together} icon="person.2.fill" title={tr('onb.chat.w.c3', 'Move together')} line={tr('onb.chat.w.c3s', 'Sports, workshops and meetups')} />
        <MovoSays delay={1500} lines={[tr('onb.chat.w.next', 'Two quick questions, so I can show you what fits first.')]} style={{ marginTop: space.xs }} />
      </ScrollView>
      <View style={{ paddingHorizontal: scr.gutter }}>
        <Button label={tr('onb.chat.w.go', "Let's go")} icon="arrow.right" onPress={() => go.push('/how-you-move')} />
      </View>
    </View>
  );
}
