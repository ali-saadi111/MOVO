import { View } from 'react-native';

import { deviceLang, useT } from '@/i18n';
import { applyDirection } from '@/lib/rtl';
import { useSettings, type Lang } from '@/stores/settings';
import { continuous, useTheme } from '@/theme';
import { go, Pressable, Text } from '@/ui';
import { ChatBody, ChatHeader, MovoSays, ReplyTray, useChatColors } from '@/features/onboarding/chat';

/** The first message: Movo says hello in both languages, and one tap on a language answers and moves on. */
export default function LanguageScreen() {
  const tr = useT();
  const c = useChatColors();
  const set = useSettings((s) => s.set);
  const current = useSettings.getState().lang ?? deviceLang();
  const choose = async (l: Lang) => {
    set({ lang: l });
    go.push('/welcome');
    await applyDirection(l === 'ar');
  };
  const first: Lang = current === 'ar' ? 'ar' : 'en';
  const other: Lang = first === 'ar' ? 'en' : 'ar';
  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <ChatHeader back={false} />
      <ChatBody>
        <MovoSays delay={250} lines={["Hi, I'm Movo 👋", 'I help you find places, gear and care that work for the way you move.', 'Which language should we talk in?']} />
        <MovoSays delay={1700} typing={450} lines={[{ text: 'مرحبا، أنا موڤو. بأي لغة نتكلم؟', lang: 'ar' }]} />
      </ChatBody>
      <ReplyTray delay={2300} label={tr('onb.chat.reply', 'Your reply')} footer={
        <View style={{ gap: 8 }} accessibilityRole="radiogroup">
          {/* The device language is the main button, in the same slot as Continue on every other page. */}
          <LangButton label={LABEL[other]} primary={false} onPress={() => choose(other)} />
          <LangButton label={LABEL[first]} primary onPress={() => choose(first)} />
          <Text variant="caption1" style={{ color: c.muted, textAlign: 'center', marginTop: 2 }}>{tr('onb.lang.sub', 'You can change this any time in Settings.')}</Text>
        </View>
      } />
    </View>
  );
}

const LABEL: Record<Lang, string> = { en: 'English', ar: 'العربية' };

function LangButton({ label, primary, onPress }: { label: string; primary: boolean; onPress: () => void }) {
  const t = useTheme();
  const c = useChatColors();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} feedback="scale"
      style={{ height: 54, borderRadius: 27, ...continuous, alignItems: 'center', justifyContent: 'center', backgroundColor: primary ? t.colors.buttonPrimaryBg : c.option, borderWidth: primary ? 0 : 1.5, borderColor: c.optionLine }}>
      <Text variant="headline" weight="700" color={primary ? 'buttonPrimaryFg' : 'textPrimary'}>{label}</Text>
    </Pressable>
  );
}
