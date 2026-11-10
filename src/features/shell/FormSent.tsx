import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { layout, space } from '@/theme';
import { Button, SuccessTick, Text, go } from '@/ui';

/** In-sheet confirmation after sending a review, report or request. */
export function FormSent({ title, body, done }: { title: string; body: string; done: string }) {
  return (
    <View style={{ alignItems: 'center', gap: space.lg, paddingHorizontal: layout.margin, paddingTop: space.xxl }}>
      <SuccessTick size={88} />
      <Animated.View entering={FadeInDown.delay(250).springify()} style={{ gap: space.xs }}>
        <Text variant="title2" align="center">{title}</Text>
        <Text variant="body" color="textSecondary" align="center">{body}</Text>
      </Animated.View>
      <Button label={done} onPress={go.back} />
    </View>
  );
}
