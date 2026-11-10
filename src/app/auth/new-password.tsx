import { useState } from 'react';
import { View } from 'react-native';

import { completeSignIn } from '@/features/shell/auth';
import { useT } from '@/i18n';
import { layout, space } from '@/theme';
import { Button, Sheet, TextField } from '@/ui';

export default function NewPassword() {
  const tr = useT();
  const [pw, setPw] = useState('');
  return (
    <Sheet title={tr('auth.newPw', 'Choose a new password')} detent={0.7} footer={<Button label={tr('auth.savePw', 'Save password')} disabledReason={pw.length >= 8 ? null : tr('auth.pwErr', 'Use 8 characters or more')} onPress={() => completeSignIn()} />}>
      <View style={{ paddingHorizontal: layout.margin, gap: space.lg, paddingTop: space.sm }}>
        <TextField label={tr('auth.password', 'Password')} value={pw} onChangeText={setPw} secure textContentType="newPassword" helper={tr('auth.pwHelp', '8 characters or more')} />
      </View>
    </Sheet>
  );
}
