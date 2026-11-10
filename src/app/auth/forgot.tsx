import { useState } from 'react';
import { View } from 'react-native';

import { useT } from '@/i18n';
import { layout, space } from '@/theme';
import { Button, Sheet, Text, TextField, go } from '@/ui';

export default function Forgot() {
  const tr = useT();
  const [email, setEmail] = useState('');
  return (
    <Sheet title={tr('auth.forgotTitle', 'Reset your password')} detent={0.7} footer={<Button label={tr('auth.sendLink', 'Send reset link')} disabledReason={email.includes('@') ? null : tr('auth.enterEmail', 'Enter your email')} onPress={() => go.replace('/auth/new-password')} />}>
      <View style={{ paddingHorizontal: layout.margin, gap: space.lg, paddingTop: space.sm }}>
        <Text variant="body" color="textSecondary">{tr('auth.forgotBody', 'We’ll email you a link to choose a new password.')}</Text>
        <TextField label={tr('auth.email', 'Email')} value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" />
      </View>
    </Sheet>
  );
}
