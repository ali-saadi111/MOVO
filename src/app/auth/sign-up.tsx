import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

import { useT } from '@/i18n';
import { haptic } from '@/lib/haptics';
import { layout, space } from '@/theme';
import { Button, Icon, Pressable, Sheet, Text, TextField, go } from '@/ui';

const schema = z.object({
  name: z.string().trim().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  terms: z.literal(true),
});
type Form = z.infer<typeof schema>;

export default function SignUp() {
  const { resume } = useLocalSearchParams<{ resume?: string }>();
  const tr = useT();
  const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { name: '', email: '', password: '', terms: false as unknown as true } });
  const terms = watch('terms');
  const onValid = () => { haptic.success(); go.push(`/auth/check-email?resume=${encodeURIComponent(resume ?? '')}`); };
  return (
    <Sheet title={tr('auth.create', 'Create an account')} detent={0.92} footer={<Button label={tr('auth.create', 'Create an account')} onPress={handleSubmit(onValid, () => haptic.error())} />}>
      <View style={{ paddingHorizontal: layout.margin, gap: space.lg, paddingTop: space.sm }}>
        <Controller control={control} name="name" render={({ field }) => <TextField label={tr('auth.name', 'Full name')} value={field.value} onChangeText={field.onChange} autoComplete="name" textContentType="name" error={errors.name ? tr('auth.nameErr', 'Add your full name') : null} />} />
        <Controller control={control} name="email" render={({ field }) => <TextField label={tr('auth.email', 'Email')} value={field.value} onChangeText={field.onChange} keyboardType="email-address" autoComplete="email" textContentType="emailAddress" error={errors.email ? tr('auth.emailErr', 'Check the email address') : null} />} />
        <Controller control={control} name="password" render={({ field }) => <TextField label={tr('auth.password', 'Password')} value={field.value} onChangeText={field.onChange} secure textContentType="newPassword" helper={tr('auth.pwHelp', '8 characters or more')} error={errors.password ? tr('auth.pwErr', 'Use 8 characters or more') : null} />} />
        <Pressable feedback="none" onPress={() => setValue('terms', (!terms) as true)} accessibilityRole="checkbox" accessibilityState={{ checked: !!terms }} style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center', minHeight: 48 }}>
          <Icon name={terms ? 'checkmark.square.fill' : 'square'} size={24} color={errors.terms ? 'danger' : 'tint'} />
          <Text variant="subheadline" style={{ flex: 1 }}>{tr('auth.terms', 'I agree to the terms and privacy policy')}</Text>
        </Pressable>
      </View>
    </Sheet>
  );
}
