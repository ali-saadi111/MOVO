import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { completeSignIn } from '@/features/shell/auth';
import { useT } from '@/i18n';
import { haptic } from '@/lib/haptics';
import { layout, space } from '@/theme';
import { Button, Sheet, TextField, go } from '@/ui';

export default function SignIn() {
  const { resume } = useLocalSearchParams<{ resume?: string }>();
  const tr = useT();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = () => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      if (!email.includes('@') || pw.length < 8 || pw === 'wrongpass') { haptic.error(); setErr(tr('auth.wrong', 'Email or password is incorrect')); return; }
      haptic.success();
      completeSignIn(resume);
    }, 500);
  };
  return (
    <Sheet title={tr('auth.login', 'Log in')} detent={0.92} footer={<Button label={tr('auth.login', 'Log in')} loading={busy} disabledReason={!email || !pw ? tr('auth.needBoth', 'Enter your email and password') : null} onPress={submit} />}>
      <View style={{ paddingHorizontal: layout.margin, gap: space.lg, paddingTop: space.sm }}>
        <TextField label={tr('auth.email', 'Email')} value={email} onChangeText={(v) => { setEmail(v); setErr(null); }} keyboardType="email-address" autoComplete="email" textContentType="emailAddress" />
        <TextField label={tr('auth.password', 'Password')} value={pw} onChangeText={(v) => { setPw(v); setErr(null); }} secure autoComplete="password" textContentType="password" error={err} />
        <Button label={tr('auth.forgot', 'Forgot password?')} variant="plain" fullWidth={false} onPress={() => go.push('/auth/forgot')} />
        <Button label={tr('auth.noAccount', 'New to Movo? Create an account')} variant="plain" fullWidth={false} onPress={() => go.replace(`/auth/sign-up?resume=${encodeURIComponent(resume ?? '')}`)} />
      </View>
    </Sheet>
  );
}
