import { useCallback, useRef, useState } from 'react';
import { FlatList, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useT } from '@/i18n';
import { layout, space } from '@/theme';
import { BannerHeadline, Button, go, Pressable, Text, useScreen, type IconName } from '@/ui';
import { MintDots, NavyStage, PhotoCard, WordmarkOnDark } from '@/features/onboarding/kit';

const PICS = {
  map: require('../../../assets/photos/lb-outdoor-9.jpg'),
  care: require('../../../assets/people/session-40.jpg'),
  together: require('../../../assets/events/marathon-light.jpg'),
};

type Page = { key: keyof typeof PICS; top: string; bottom: string; body: string; chip: string; chipIcon: IconName };

export default function Welcome() {
  const tr = useT();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [i, setI] = useState(0);
  const list = useRef<FlatList<Page>>(null);
  const pages: Page[] = [
    { key: 'map', top: tr('onb.w1.top', 'KNOW'), bottom: tr('onb.w1.bottom', 'BEFORE YOU GO'), body: tr('onb.w1.body', 'Every place on the map is checked by the Movo team, so you know if you can get in.'), chip: tr('onb.w1.chip', 'Checked by Movo'), chipIcon: 'checkmark.seal.fill' },
    { key: 'care', top: tr('onb.w2.top', 'GEAR & CARE'), bottom: tr('onb.w2.bottom', 'AT YOUR DOOR'), body: tr('onb.w2.body', 'Order mobility aids to your door, and book a specialist who comes to you.'), chip: tr('onb.w2.chip', 'Home visits across Beirut'), chipIcon: 'house.fill' },
    { key: 'together', top: tr('onb.w3.top', 'MOVE'), bottom: tr('onb.w3.bottom', 'TOGETHER'), body: tr('onb.w3.body', 'Join sports, workshops and meetups, and give to campaigns that change lives.'), chip: tr('onb.w3.chip', 'Beirut Wheelchair Marathon'), chipIcon: 'figure.roll' },
  ];
  const onView = useCallback(({ viewableItems }: { viewableItems: { index?: number | null }[] }) => { if (viewableItems[0]?.index != null) setI(viewableItems[0].index); }, []);
  const next = () => (i < pages.length - 1 ? (list.current?.scrollToIndex({ index: i + 1 }), setI(i + 1)) : go.push('/how-you-move'));
  const scr = useScreen();
  // Leave room for the headline, body and the Next row on every iPhone, SE included.
  const photoH = scr.short ? Math.round(height * 0.32) : Math.min(Math.round(height * 0.42), 400);
  return (
    <NavyStage>
      <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, space.md) }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingStart: layout.margin, paddingEnd: space.xs }}>
          <WordmarkOnDark size={26} />
          <Pressable onPress={() => go.push('/how-you-move')} accessibilityRole="button" style={{ minHeight: 48, justifyContent: 'center', paddingHorizontal: space.md }}>
            <Text variant="body" weight="600" style={{ color: 'rgba(255,255,255,0.85)' }}>{tr('onb.skip', 'Skip')}</Text>
          </Pressable>
        </View>
        <FlatList
          ref={list}
          data={pages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
          onViewableItemsChanged={onView}
          getItemLayout={(_, n) => ({ length: width, offset: width * n, index: n })}
          keyExtractor={(p) => p.key}
          renderItem={({ item, index }) => (
            <View style={{ width, paddingHorizontal: scr.gutter, paddingTop: scr.short ? space.xs : space.md, gap: scr.short ? space.lg : space.xl }} accessible accessibilityLabel={`${item.top} ${item.bottom}. ${item.body}. ${tr('onb.slide', 'Slide {{n}} of 3', { n: index + 1 })}`}>
              <Animated.View entering={FadeIn.duration(400)}>
                <PhotoCard source={PICS[item.key]} chip={item.chip} chipIcon={item.chipIcon} height={photoH} />
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(120).springify().damping(26).stiffness(170)} style={{ gap: scr.short ? space.sm : space.md }}>
                <BannerHeadline tone="navy" top={item.top} bottom={item.bottom} size={scr.short ? 34 : scr.fit(42)} />
                <Text variant="body" style={{ color: 'rgba(255,255,255,0.78)' }}>{item.body}</Text>
              </Animated.View>
            </View>
          )}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg, paddingHorizontal: scr.gutter, paddingTop: space.sm }}>
          <MintDots count={3} index={i} />
          <View style={{ flex: 1 }}>
            <Button variant="onBrand" label={i < 2 ? tr('common.next', 'Next') : tr('onb.getStarted', 'Get started')} icon={i < 2 ? undefined : 'arrow.right'} onPress={next} />
          </View>
        </View>
      </View>
    </NavyStage>
  );
}
