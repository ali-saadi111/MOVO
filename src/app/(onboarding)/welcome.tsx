import { Image } from 'expo-image';
import { useCallback, useRef, useState } from 'react';
import { FlatList, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useT } from '@/i18n';
import { brand } from '@/theme/colors';
import { space } from '@/theme';
import { BannerHeadline, Button, go, Icon, Pressable, Text, useScreen } from '@/ui';
import { CheckChip, HeroPhoto, MintDots, WordmarkOnDark } from '@/features/onboarding/kit';

const NAVY = '#01212E';
const PICS = {
  map: require('../../../assets/onboarding/know-cafe.jpg'),
  care: require('../../../assets/onboarding/care-home.jpg'),
  together: require('../../../assets/onboarding/together-sport.jpg'),
};
const CHAIR = require('../../../assets/preview-products/wheelchair-0.jpg');

type Page = { key: keyof typeof PICS; top: string; bottom: string; body: string };

export default function Welcome() {
  const tr = useT();
  const insets = useSafeAreaInsets();
  const scr = useScreen();
  const { width } = useWindowDimensions();
  const [h, setH] = useState(0);
  const [i, setI] = useState(0);
  const list = useRef<FlatList<Page>>(null);
  const pages: Page[] = [
    { key: 'map', top: tr('onb.w1.top', 'KNOW'), bottom: tr('onb.w1.bottom', 'BEFORE YOU GO'), body: tr('onb.w1.body', 'Every place on the map is checked by the Movo team, so you know if you can get in.') },
    { key: 'care', top: tr('onb.w2.top', 'GEAR & CARE'), bottom: tr('onb.w2.bottom', 'AT YOUR DOOR'), body: tr('onb.w2.body', 'Order mobility aids to your door, and book a specialist who comes to you.') },
    { key: 'together', top: tr('onb.w3.top', 'MOVE'), bottom: tr('onb.w3.bottom', 'TOGETHER'), body: tr('onb.w3.body', 'Join sports, workshops and meetups, and give to campaigns that change lives.') },
  ];
  const onView = useCallback(({ viewableItems }: { viewableItems: { index?: number | null }[] }) => { if (viewableItems[0]?.index != null) setI(viewableItems[0].index); }, []);
  const next = () => (i < pages.length - 1 ? (list.current?.scrollToIndex({ index: i + 1 }), setI(i + 1)) : go.push('/how-you-move'));

  const overlay = (key: Page['key']) => {
    if (key === 'map') {
      return (
        <View style={{ position: 'absolute', start: scr.gutter, bottom: space.xl, gap: 8 }}>
          <CheckChip label={tr('onb.w1.c1', 'Step-free entrance')} />
          <CheckChip label={tr('onb.w1.c2', 'Wide door')} />
          <CheckChip label={tr('onb.w1.c3', 'Accessible toilet')} />
        </View>
      );
    }
    if (key === 'care') {
      return (
        <View style={{ position: 'absolute', end: scr.gutter, bottom: space.xl, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, paddingEnd: 14, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.96)', boxShadow: '0 10px 24px rgba(0,0,0,0.22)' }}>
          <Image source={CHAIR} style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#FFFFFF' }} contentFit="contain" />
          <View>
            <Text variant="footnote" weight="700" style={{ color: brand.navy }}>{tr('onb.w2.c1', 'Wheelchair on its way')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="shippingbox" size={12} color={{ raw: '#0B8F66' }} />
              <Text variant="caption1" style={{ color: '#3B5561' }}>{tr('onb.w2.c2', 'At your door tomorrow')}</Text>
            </View>
          </View>
        </View>
      );
    }
    return (
      <View style={{ position: 'absolute', start: scr.gutter, bottom: space.xl }}>
        <CheckChip icon="figure.roll" label={tr('onb.w3.chip', 'Sports, workshops and meetups')} />
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: NAVY }}>
      <FlatList
        ref={list}
        data={pages}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
        onLayout={(e) => setH(Math.round(e.nativeEvent.layout.height))}
        onViewableItemsChanged={onView}
        getItemLayout={(_, n) => ({ length: width, offset: width * n, index: n })}
        keyExtractor={(p) => p.key}
        renderItem={({ item, index }) => (
          <View style={{ width, height: h || undefined }} accessible accessibilityLabel={`${item.top} ${item.bottom}. ${item.body}. ${tr('onb.slide', 'Slide {{n}} of 3', { n: index + 1 })}`}>
            <HeroPhoto source={PICS[item.key]} fade={NAVY}>
              {overlay(item.key)}
            </HeroPhoto>
            <Animated.View entering={FadeInDown.delay(100).springify().damping(26).stiffness(170)} style={{ paddingHorizontal: scr.gutter, paddingBottom: space.lg, gap: scr.short ? space.xs : space.sm }}>
              <BannerHeadline tone="navy" top={item.top} bottom={item.bottom} size={scr.short ? 32 : scr.fit(40)} />
              <Text variant="body" style={{ color: 'rgba(255,255,255,0.8)' }}>{item.body}</Text>
            </Animated.View>
          </View>
        )}
      />
      {/* Brand and Skip sit over the photos. */}
      <Animated.View entering={FadeInUp} pointerEvents="box-none" style={{ position: 'absolute', top: insets.top + 6, start: 0, end: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingStart: scr.gutter, paddingEnd: space.xs }}>
        <WordmarkOnDark size={26} />
        <Pressable onPress={() => go.push('/how-you-move')} accessibilityRole="button" style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: space.md, marginEnd: space.xs, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.28)' }}>
          <Text variant="subheadline" weight="700" style={{ color: '#FFFFFF' }}>{tr('onb.skip', 'Skip')}</Text>
        </Pressable>
      </Animated.View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg, paddingHorizontal: scr.gutter, paddingBottom: Math.max(insets.bottom, space.md) }}>
        <MintDots count={3} index={i} />
        <View style={{ flex: 1 }}>
          <Button variant="onBrand" label={i < 2 ? tr('common.next', 'Next') : tr('onb.getStarted', 'Get started')} icon={i < 2 ? undefined : 'arrow.right'} onPress={next} />
        </View>
      </View>
    </View>
  );
}
