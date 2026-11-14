import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { completeSignIn } from '@/features/shell/auth';
import { useT } from '@/i18n';
import { haptic } from '@/lib/haptics';
import { layout, space, useTheme } from '@/theme';
import { Button, Pressable, Sheet, Text, TextField, go } from '@/ui';

/**
 * Log in, sized to its content: Sign in with Apple first, then email and
 * password with "Forgot?" beside the password label and the Log in button
 * right under the fields.
 */
export default function SignIn() {
  const { resume } = useLocalSearchParams<{ resume?: string }>();
  const t = useTheme();
  const tr = useT();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const link = t.scheme === 'dark' ? t.colors.accent : t.colors.tint;
  const submit = () => {
    if (!email || !pw) { haptic.error(); setErr(tr('auth.needBoth', 'Enter your email and password')); return; }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      if (!email.includes('@') || pw.length < 8 || pw === 'wrongpass') { haptic.error(); setErr(tr('auth.wrong', 'Email or password is incorrect')); return; }
      haptic.success();
      completeSignIn(resume);
    }, 500);
  };
  return (
    <Sheet title={tr('auth.login', 'Log in')} detent={0.66}>
      <View style={{ paddingHorizontal: layout.margin, paddingTop: space.xs, gap: space.md }}>
        {/* Draft: signs in as the demo account, like the email form. */}
        <Pressable feedback="scale" onPress={() => { haptic.success(); completeSignIn(resume); }} accessibilityRole="button" accessibilityLabel={tr('auth.apple', 'Sign in with Apple')}
          style={{ height: 52, borderRadius: 26, backgroundColor: t.colors.textPrimary, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="headline" style={{ color: t.colors.bgElevated }}>{tr('auth.apple', 'Sign in with Apple')}</Text>
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <View style={{ flex: 1, height: 1, backgroundColor: t.colors.separator }} />
          <Text variant="caption1" color="textTertiary">{tr('auth.orEmail', 'or with email')}</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: t.colors.separator }} />
        </View>
        <TextField label={tr('auth.email', 'Email')} value={email} onChangeText={(v) => { setEmail(v); setErr(null); }} keyboardType="email-address" autoComplete="email" textContentType="emailAddress" />
        <View>
          <TextField label={tr('auth.password', 'Password')} value={pw} onChangeText={(v) => { setPw(v); setErr(null); }} secure autoComplete="password" textContentType="password" error={err} />
          <Pressable onPress={() => go.push('/auth/forgot')} accessibilityRole="button" accessibilityLabel={tr('auth.forgot', 'Forgot password?')} hitSlop={10} style={{ position: 'absolute', top: 0, end: 0 }}>
            <Text variant="subheadline" weight="600" style={{ color: link }}>{tr('auth.forgotShort', 'Forgot?')}</Text>
          </Pressable>
        </View>
        <Button label={tr('auth.login', 'Log in')} loading={busy} onPress={submit} />
        <Pressable onPress={() => go.replace(`/auth/sign-up?resume=${encodeURIComponent(resume ?? '')}`)} accessibilityRole="button" style={{ alignSelf: 'center', paddingVertical: space.xs }}>
          <Text variant="subheadline" color="textSecondary">{tr('auth.newTo', 'New to Movo?')} <Text variant="subheadline" weight="700" style={{ color: link }}>{tr('auth.createShort', 'Create an account')}</Text></Text>
        </Pressable>
      </View>
    </Sheet>
  );
}
