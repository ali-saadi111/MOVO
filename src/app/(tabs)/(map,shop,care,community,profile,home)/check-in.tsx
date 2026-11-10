import { View } from 'react-native';

import { useT } from '@/i18n';
import { useSettings, type CheckIn } from '@/stores/settings';
import { layout, space } from '@/theme';
import { ChoiceRow, Screen, Section, Text } from '@/ui';

export default function CheckInScreen() {
  const tr = useT();
  const v = useSettings((s) => s.checkIn);
  const set = useSettings((s) => s.set);
  const opts: { k: CheckIn; title: string; sub: string }[] = [
    { k: 'important', title: tr('checkIn.important', 'Only what’s important'), sub: tr('checkIn.importantSub', 'Bookings, orders and changes to your plans. Nothing else.') },
    { k: 'encouragement', title: tr('checkIn.encouragement', 'A little encouragement'), sub: tr('checkIn.encouragementSub', 'Plus a word when you finish a session or reach a milestone.') },
    { k: 'keepGoing', title: tr('checkIn.keepGoing', 'Help me keep going'), sub: tr('checkIn.keepGoingSub', 'Plus a gentle reminder if a week goes by without a session.') },
  ];
  return (
    <Screen title={tr('settings.checkIn', 'How often we check in')} variant="detail" grouped>
      <View style={{ paddingHorizontal: layout.margin, paddingTop: space.md, marginBottom: space.lg }}>
        <Text variant="body" color="textSecondary">{tr('checkIn.lead', 'You choose how much we say. You can change this any time.')}</Text>
      </View>
      <Section>
        {opts.map((o) => <ChoiceRow key={o.k} title={o.title} subtitle={o.sub} selected={v === o.k} onPress={() => set({ checkIn: o.k })} />)}
      </Section>
    </Screen>
  );
}
