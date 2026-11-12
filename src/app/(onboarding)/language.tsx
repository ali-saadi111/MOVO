import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { deviceLang, useT } from '@/i18n';
import { applyDirection } from '@/lib/rtl';
import { useSettings, type Lang } from '@/stores/settings';
import { continuous, space } from '@/theme';
import { BannerHeadline, Button, go, Icon, Pressable, Text, useScreen } from '@/ui';
import { HeroPhoto, WordmarkOnDark } from '@/features/onboarding/kit';

const HERO = require('../../../assets/onboarding/hero-race.jpg');
const NAVY = '#01212E';

export default function LanguageScreen() {
  const insets = useSafeAreaInsets();
  const tr = useT();
  const scr = useScreen();
  const set = useSettings((s) => s.set);
  const [lang, setLang] = useState<Lang>(useSettings.getState().lang ?? deviceLang());
  const choose = (l: Lang) => { setLang(l); set({ lang: l }); };
  return (
    <View style={{ flex: 1, backgroundColor: NAVY }}>
      <HeroPhoto source={HERO} fade={NAVY}>
        <View style={{ position: 'absolute', top: insets.top + 12, start: scr.gutter }}>
          <WordmarkOnDark size={28} />
        </View>
        <Animated.View entering={FadeInDown.delay(80).springify().damping(26).stiffness(170)} style={{ position: 'absolute', bottom: space.md, start: scr.gutter, end: scr.gutter }}>
          <BannerHeadline tone="navy" top={tr('onb.lang.top', 'MOVE')} bottom={tr('onb.lang.bottom', 'YOUR WAY')} caption={tr('onb.lang.caption', 'ACCESSIBLE LEBANON, CHECKED BY MOVO')} size={scr.short ? 42 : scr.fit(52)} />
        </Animated.View>
      </HeroPhoto>
      <Animated.View entering={FadeInDown.delay(160).springify().damping(26).stiffness(170)} style={{ paddingHorizontal: scr.gutter, paddingTop: space.sm, paddingBottom: Math.max(insets.bottom, space.md), gap: space.md }}>
        <Text variant="subheadline" weight="600" style={{ color: 'rgba(255,255,255,0.78)' }}>{tr('onb.lang.title', 'Choose your language')}</Text>
        <View style={{ flexDirection: 'row', gap: space.sm }} accessibilityRole="radiogroup">
          <LangOption title="English" hello="Hello" on={lang === 'en'} onPress={() => choose('en')} />
          <LangOption title="العربية" hello="مرحبا" on={lang === 'ar'} onPress={() => choose('ar')} />
        </View>
        <Button variant="onBrand" label={tr('common.continue', 'Continue')} onPress={async () => { set({ lang }); go.push('/welcome'); await applyDirection(lang === 'ar'); }} />
        <Text variant="footnote" style={{ color: 'rgba(255,255,255,0.55)', textAlign: 'center' }}>{tr('onb.lang.sub', 'You can change this any time in Settings.')}</Text>
      </Animated.View>
    </View>
  );
}

/** Both options share one shape; only the fill and the check change. */
function LangOption({ title, hello, on, onPress }: { title: string; hello: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={title} feedback="scale"
      style={{ flex: 1, height: 68, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, borderRadius: 20, ...continuous, backgroundColor: on ? '#FFFFFF' : '#0B3442', borderWidth: 2, borderColor: on ? '#3CF2B8' : '#164A5B' }}>
      <View style={{ flex: 1 }}>
        <Text variant="headline" weight="700" numberOfLines={1} style={{ color: on ? '#013447' : '#FFFFFF' }}>{title}</Text>
        <Text variant="footnote" numberOfLines={1} style={{ color: on ? '#3B5561' : 'rgba(255,255,255,0.65)' }}>{hello}</Text>
      </View>
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: on ? '#22D39C' : 'transparent', borderWidth: on ? 0 : 2, borderColor: 'rgba(255,255,255,0.45)', alignItems: 'center', justifyContent: 'center' }}>
        {on ? <Icon name="checkmark" size={11} weight="bold" color={{ raw: '#013447' }} /> : null}
      </View>
    </Pressable>
  );
}
