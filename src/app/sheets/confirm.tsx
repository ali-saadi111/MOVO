import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { sync } from '@/data';
import { useLocalized, useT } from '@/i18n';
import { haptic } from '@/lib/haptics';
import { useActivity } from '@/stores/activity';
import { useCaregiver } from '@/stores/caregiver';
import { useCart } from '@/stores/cart';
import { useSession } from '@/stores/session';
import { layout, space } from '@/theme';
import { Button, Sheet, Text, go } from '@/ui';

/** Anything irreversible asks first, in one plain sentence (rule 4). */
export default function Confirm() {
  const p = useLocalSearchParams<{ kind: string; id?: string }>();
  const tr = useT();
  const loc = useLocalized();
  useEffect(() => { haptic.warning(); }, []);
  const cfg: Record<string, { title: string; body: string; action: string; run: () => void }> = {
    removeCartItem: { title: tr('confirm.removeTitle', 'Remove from cart?'), body: tr('confirm.removeBody', '{{name}} will be taken out of your cart.', { name: loc(sync.product(p.id ?? '')?.name ?? { en: '', ar: null }) }), action: tr('cart.remove', 'Remove'), run: () => useCart.getState().remove(p.id!) },
    cancelBooking: { title: tr('confirm.cancelTitle', 'Cancel this booking?'), body: tr('confirm.cancelBody', 'You’ll get a full refund because it’s more than 24 hours away.'), action: tr('booking.cancel', 'Cancel booking'), run: () => useActivity.getState().cancelBooking(p.id!) },
    leaveEvent: { title: tr('confirm.leaveTitle', 'Give up your spot?'), body: tr('confirm.leaveBody', 'Your spot goes to the next person on the waiting list.'), action: tr('event.cantMake', 'I can’t make it'), run: () => useActivity.getState().leaveEvent(p.id!) },
    removePerson: { title: tr('confirm.personTitle', 'Remove this person?'), body: tr('confirm.personBody', 'Their details and saved places are deleted from your account.'), action: tr('common.remove', 'Remove'), run: () => useCaregiver.getState().remove(p.id!) },
    removeSaved: { title: tr('confirm.savedTitle', 'Remove from saved?'), body: tr('confirm.savedBody', 'You can save it again from the place page.'), action: tr('common.remove', 'Remove'), run: () => useActivity.getState().toggleSaved(p.id!) },
    logout: { title: tr('confirm.logoutTitle', 'Log out?'), body: tr('confirm.logoutBody', 'Your cart and drafts stay on this phone.'), action: tr('settings.logout', 'Log out'), run: () => useSession.getState().signOut() },
  };
  const c = cfg[p.kind] ?? cfg.logout;
  return (
    <Sheet title={c.title} dismissLabel="cancel" detent={0.34} scroll={false}>
      <View style={{ paddingHorizontal: layout.margin, gap: space.xl, paddingTop: space.xs }}>
        <Text variant="body" color="textSecondary">{c.body}</Text>
        <View style={{ gap: space.xs }}>
          <Button label={c.action} variant="destructive" onPress={() => { c.run(); go.back(); }} />
          <Button label={tr('common.keep', 'Keep it')} variant="plain" onPress={go.back} />
        </View>
      </View>
    </Sheet>
  );
}
