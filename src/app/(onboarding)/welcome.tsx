import { View } from 'react-native';

import { useLang, useT } from '@/i18n';
import { space } from '@/theme';
import { Button, go, Pressable, Text } from '@/ui';
import { ChatBody, ChatHeader, FeatureList, MeSays, MovoSays, ReplyTray, useChatColors } from '@/features/onboarding/chat';

/** Movo shows three things it does as one rich message, then asks two quick questions. */
export default function Welcome() {
  const tr = useT();
  const lang = useLang();
  const c = useChatColors();
  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <ChatHeader right={
        <Pressable onPress={() => go.push('/who')} accessibilityRole="button" style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: space.sm }}>
          <Text variant="subheadline" weight="700" style={{ color: c.accent }}>{tr('onb.skip', 'Skip')}</Text>
        </Pressable>
      } />
      <ChatBody>
        <MovoSays lines={[tr('onb.chat.lang.hi', "Hi, I'm Movo 👋"), tr('onb.chat.lang.q', 'Which language should we talk in?')]} delay={0} typing={0} step={0} />
        <MeSays lines={[lang === 'ar' ? 'العربية' : 'English']} delay={150} />
        <MovoSays delay={500} lines={[tr('onb.chat.w.hi', "Great. Here's what I can do for you:")]}
          extra={<FeatureList items={[
            { icon: 'checkmark.seal.fill', title: tr('onb.chat.w.c1', 'Places checked in person'), line: tr('onb.chat.w.c1s', 'Step-free entrance, wide door, toilet') },
            { icon: 'house.fill', title: tr('onb.chat.w.c2', 'Gear and care at home'), line: tr('onb.chat.w.c2s', 'Delivered, or a specialist who visits') },
            { icon: 'person.3', title: tr('onb.chat.w.c3', 'Move together'), line: tr('onb.chat.w.c3s', 'Sports, workshops and meetups') },
          ]} />}
          after={[tr('onb.chat.w.next', 'Two quick questions, so I can show you what fits first.')]} />
      </ChatBody>
      <ReplyTray delay={1900} footer={<Button label={tr('onb.chat.w.go', "Let's go")} icon="arrow.right" onPress={() => go.push('/who')} />} />
    </View>
  );
}
