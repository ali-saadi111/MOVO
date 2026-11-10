import { useState } from 'react';
import { View } from 'react-native';

import { useT } from '@/i18n';
import { haptic } from '@/lib/haptics';
import { useSession } from '@/stores/session';
import { layout, space } from '@/theme';
import { Button, Sheet, Text, TextField, go } from '@/ui';

export default function DeleteAccount() {
  const tr = useT();
  const [v, setV] = useState('');
  const word = tr('delete.word', 'DELETE');
  const ok = v.trim().toUpperCase() === word.toUpperCase();
  return (
    <Sheet title={tr('settings.delete', 'Delete account')} dismissLabel="cancel" detent={0.6}>
      <View style={{ paddingHorizontal: layout.margin, gap: space.lg }}>
        <Text variant="body" color="textSecondary">{tr('delete.body', 'Your account, saved places, reviews and caregiver profiles are deleted for good. Orders and bookings already paid stay on record for 30 days, as the law asks.')}</Text>
        <TextField label={tr('delete.type', 'Type {{word}} to confirm', { word })} value={v} onChangeText={setV} />
        <Button label={tr('settings.delete', 'Delete account')} variant="destructive" disabledReason={ok ? null : tr('delete.typeFirst', 'Type {{word}} first', { word })} onPress={() => { haptic.warning(); useSession.getState().signOut(); go.dismissTo('/'); }} />
      </View>
    </Sheet>
  );
}
