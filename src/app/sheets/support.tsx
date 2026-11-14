import { View } from 'react-native';

import { useT } from '@/i18n';
import { call, openWhatsApp } from '@/lib/whatsapp';
import { layout, space } from '@/theme';
import { ListRow, Section, Sheet, Text } from '@/ui';

const PHONE = '+96170000000';

export default function Support() {
  const tr = useT();
  return (
    <Sheet title={tr('profile.support', 'Get support')} detent={0.4}>
      <View style={{ paddingHorizontal: layout.margin, marginBottom: space.lg }}>
        <Text variant="body" color="textSecondary">{tr('support.lead', 'A real person answers, every day from 8:00 to 20:00. In Arabic or English.')}</Text>
      </View>
      <Section>
        <ListRow icon="message" title={tr('support.whatsapp', 'Message us on WhatsApp')} subtitle={tr('support.whatsappSub', 'Usually answers within 10 minutes')} onPress={() => openWhatsApp(tr('support.hello', 'Hello Movo, I need help with'))} />
        <ListRow icon="phone" title={tr('support.call', 'Call us')} subtitle="+961 70 000 000" onPress={() => call(PHONE)} />
      </Section>
    </Sheet>
  );
}
