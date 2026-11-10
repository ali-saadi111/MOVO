import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { completeSignIn } from '@/features/shell/auth';
import { useT } from '@/i18n';
import { layout, space } from '@/theme';
import { Button, Icon, Sheet, Text } from '@/ui';

export default function CheckEmail() {
  const { resume } = useLocalSearchParams<{ resume?: string }>();
  const tr = useT();
  return (
    <Sheet title={tr('auth.checkEmail', 'Check your email')} detent={0.6} scroll={false}>
      <View style={{ paddingHorizontal: layout.margin, gap: space.lg, alignItems: 'center', paddingTop: space.lg }}>
        <Icon name="envelope" size={56} color="tint" rendering="hierarchical" />
        <Text variant="body" color="textSecondary" align="center">{tr('auth.checkBody', 'We sent a link to confirm your email. Open it on this phone to finish.')}</Text>
        <Button label={tr('auth.opened', 'I’ve confirmed my email')} onPress={() => completeSignIn(resume)} />
      </View>
    </Sheet>
  );
}
