import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { sync } from '@/data';
import { useT } from '@/i18n';
import { space } from '@/theme';
import { ArtImage, Button, Text, go } from '@/ui';

/** Full-screen photo viewer with a visible Close button. */
export default function Photos() {
  const { place, product, i = '0' } = useLocalSearchParams<{ place?: string; product?: string; i?: string }>();
  const tr = useT();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const images = place ? sync.place(place)?.rating.entrancePhotos ?? [] : sync.product(product ?? '')?.images ?? [];
  const [idx, setIdx] = useState(Number(i));
  return (
    <View style={{ flex: 1, backgroundColor: '#000', paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space.md }}>
        <Text variant="subheadline" tabular style={{ color: '#fff' }}>{tr('pager.of', '{{n}} of {{total}}', { n: idx + 1, total: images.length })}</Text>
        <Button label={tr('common.close', 'Close')} variant="plain" fullWidth={false} onPress={go.back} style={{ backgroundColor: 'rgba(255,255,255,0.14)' }} />
      </View>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        initialScrollIndex={Number(i)}
        getItemLayout={(_, n) => ({ length: width, offset: width * n, index: n })}
        onMomentumScrollEnd={(e) => setIdx(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => <View style={{ width, justifyContent: 'center' }}><ArtImage image={item} aspect={product ? 1 : 4 / 3} tile={!!product} radius={0} edge={false} /></View>}
        keyExtractor={(_, n) => String(n)}
      />
    </View>
  );
}
