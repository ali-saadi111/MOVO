import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { deviceLang, useT } from '@/i18n';
import { applyDirection } from '@/lib/rtl';
import { useSettings, type Lang } from '@/stores/settings';
import { continuous, space } from '@/theme';
import { go, Pressable, Text, useScreen } from '@/ui';
import { HeroPhoto, WordmarkOnDark } from '@/features/onboarding/kit';
import { MovoSays } from '@/features/onboarding/chat';

const HERO = require('../../../assets/onboarding/hero-race.jpg');
const NAVY = '#01212E';

/** Movo says hello in both languages, and one tap on a language answers and moves on. */
export default function LanguageScreen() {
  const tr = useT();
  const insets = useSafeAreaInsets();
  const scr = useScreen();
  const set = useSettings((s) => s.set);
  const current = useSettings.getState().lang ?? deviceLang();
  const choose = async (l: Lang) => {
    set({ lang: l });
    go.push('/welcome');
    await applyDirection(l === 'ar');
  };
  return (
    <View style={{ flex: 1, backgroundColor: NAVY }}>
      <HeroPhoto source={HERO} fade={NAVY}>
        <View style={{ position: 'absolute', top: insets.top + 12, start: scr.gutter }}>
          <WordmarkOnDark size={28} />
        </View>
      </HeroPhoto>
      <View style={{ paddingHorizontal: scr.gutter, marginTop: scr.short ? -110 : -150, gap: scr.short ? space.md : space.lg, paddingBottom: Math.max(insets.bottom, space.md) }}>
        <MovoSays onDark delay={200} lines={["Hi, I'm Movo. Which language should we talk in?", { text: 'مرحبا، أنا موڤو. بأي لغة نتكلم؟', lang: 'ar' }]} />
        <Animated.View entering={FadeInDown.delay(1000).springify().damping(26).stiffness(170)} style={{ gap: space.sm }} accessibilityRole="radiogroup">
          <LangButton label="English" primary={current !== 'ar'} onPress={() => choose('en')} />
          <LangButton label="العربية" primary={current === 'ar'} onPress={() => choose('ar')} />
          <Text variant="footnote" style={{ color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginTop: 2 }}>{tr('onb.lang.sub', 'You can change this any time in Settings.')}</Text>
        </Animated.View>
      </View>
    </View>
  );
}

/** The device language gets the mint button; the other is outlined. Both answer in one tap. */
function LangButton({ label, primary, onPress }: { label: string; primary: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} feedback="scale"
      style={{ height: 54, borderRadius: 27, ...continuous, alignItems: 'center', justifyContent: 'center', backgroundColor: primary ? '#3CF2B8' : 'transparent', borderWidth: primary ? 0 : 1.5, borderColor: 'rgba(255,255,255,0.35)' }}>
      <Text variant="headline" weight="700" style={{ color: primary ? '#013447' : '#FFFFFF' }}>{label}</Text>
    </Pressable>
  );
}
