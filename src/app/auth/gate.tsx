import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Illustration } from '@/art/Illustration';
import { useT } from '@/i18n';
import { layout, space } from '@/theme';
import { Button, Sheet, Text, go } from '@/ui';

/** The account gate. Its title names the action ("Sign in to book"). */
export default function Gate() {
  const { action = 'continue', resume = '' } = useLocalSearchParams<{ action: string; resume: string }>();
  const tr = useT();
  const titles: Record<string, string> = {
    book: tr('gate.book', 'Sign in to book'), cart: tr('gate.cart', 'Sign in to add to cart'), checkout: tr('gate.checkout', 'Sign in to check out'), save: tr('gate.save', 'Sign in to save places'),
    review: tr('gate.review', 'Sign in to write a review'), report: tr('gate.report', 'Sign in to report a change'), join: tr('gate.join', 'Sign in to join'), donate: tr('gate.donate', 'Sign in to donate'), request: tr('gate.request', 'Sign in to request a place'),
  };
  const q = `resume=${encodeURIComponent(resume)}`;
  return (
    <Sheet title={titles[action] ?? tr('gate.default', 'Sign in to continue')} detent={0.62} scroll={false}>
      <View style={{ paddingHorizontal: layout.margin, gap: space.lg, alignItems: 'center', paddingTop: space.sm }}>
        <Illustration name="community" size={120} />
        <Text variant="body" color="textSecondary" align="center">{tr('gate.body', 'Browsing is free. An account keeps your bookings, orders and saved places together, and brings you back to where you were.')}</Text>
        <View style={{ alignSelf: 'stretch', gap: space.xs }}>
          <Button label={tr('auth.create', 'Create an account')} onPress={() => go.push(`/auth/sign-up?${q}`)} />
          <Button label={tr('auth.login', 'Log in')} variant="secondary" onPress={() => go.push(`/auth/sign-in?${q}`)} />
        </View>
      </View>
    </Sheet>
  );
}
