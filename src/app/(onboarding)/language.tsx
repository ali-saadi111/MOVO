import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { deviceLang, useT } from '@/i18n';
import { applyDirection } from '@/lib/rtl';
import { useSettings, type Lang } from '@/stores/settings';
import { continuous, layout, space } from '@/theme';
import { BannerHeadline, Button, go, Icon, Pressable, Text, useScreen } from '@/ui';
import { NavyStage, WordmarkOnDark } from '@/features/onboarding/kit';

export default function LanguageScreen() {
  const insets = useSafeAreaInsets();
  const tr = useT();
  const scr = useScreen();
  const set = useSettings((s) => s.set);
  const [lang, setLang] = useState<Lang>(useSettings.getState().lang ?? deviceLang());
  const choose = (l: Lang) => { setLang(l); set({ lang: l }); };
  return (
    <NavyStage>
      <View style={{ flex: 1, paddingTop: insets.top + (scr.short ? space.md : Math.round(scr.height * 0.06)), paddingBottom: Math.max(insets.bottom, space.md), paddingHorizontal: layout.margin }}>
        <Animated.View entering={FadeInDown.springify().damping(26).stiffness(170)}><WordmarkOnDark /></Animated.View>
        <Animated.View entering={FadeInDown.delay(80).springify().damping(26).stiffness(170)} style={{ marginTop: space.xxl * 1.6 }}>
          <BannerHeadline tone="navy" top={tr('onb.lang.top', 'MOVE')} bottom={tr('onb.lang.bottom', 'YOUR WAY')} caption={tr('onb.lang.caption', 'ACCESSIBLE LEBANON, CHECKED BY MOVO')} size={scr.short ? 48 : scr.fit(58)} />
        </Animated.View>
        <View style={{ flex: 1 }} />
        <Animated.View entering={FadeInDown.delay(160).springify().damping(26).stiffness(170)} style={{ gap: space.sm, marginBottom: space.lg }}>
          <Text variant="subheadline" weight="600" style={{ color: 'rgba(255,255,255,0.8)' }}>{tr('onb.lang.title', 'Choose your language')}</Text>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <LangTile glyph="Aa" title="English" hello="Hello" on={lang === 'en'} onPress={() => choose('en')} />
            <LangTile glyph="عر" title="العربية" hello="مرحبا" on={lang === 'ar'} onPress={() => choose('ar')} />
          </View>
          <Text variant="footnote" style={{ color: 'rgba(255,255,255,0.6)' }}>{tr('onb.lang.sub', 'You can change this any time in Settings.')}</Text>
        </Animated.View>
        <Button variant="onBrand" label={tr('common.continue', 'Continue')} onPress={async () => { set({ lang }); go.push('/welcome'); await applyDirection(lang === 'ar'); }} />
      </View>
    </NavyStage>
  );
}

function LangTile({ glyph, title, hello, on, onPress }: { glyph: string; title: string; hello: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={title} feedback="scale"
      style={{ flex: 1, height: 128, borderRadius: 24, ...continuous, padding: space.md, justifyContent: 'space-between', backgroundColor: on ? '#FFFFFF' : 'rgba(255,255,255,0.08)', borderWidth: 1.5, borderColor: on ? '#3CF2B8' : 'rgba(255,255,255,0.18)' }}>
      <Text weight="800" style={{ fontSize: 30, lineHeight: 36, color: on ? '#013447' : '#FFFFFF' }}>{glyph}</Text>
      <View>
        <Text variant="headline" weight="700" style={{ color: on ? '#013447' : '#FFFFFF' }}>{title}</Text>
        <Text variant="footnote" style={{ color: on ? '#3B5561' : 'rgba(255,255,255,0.6)' }}>{hello}</Text>
      </View>
      <View style={{ position: 'absolute', top: 12, end: 12, width: 24, height: 24, borderRadius: 12, backgroundColor: on ? '#22D39C' : 'transparent', borderWidth: on ? 0 : 1.5, borderColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center' }}>
        {on ? <Icon name="checkmark" size={12} weight="bold" color={{ raw: '#013447' }} /> : null}
      </View>
    </Pressable>
  );
}
