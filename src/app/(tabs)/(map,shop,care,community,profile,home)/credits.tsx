import { Linking, View } from 'react-native';

import { PEOPLE_CREDITS } from '@/art/people';
import { CREDITS as PLACE_CREDITS } from '@/art/photos';

const CREDITS = [...PLACE_CREDITS, ...PEOPLE_CREDITS];
import { useT } from '@/i18n';
import { layout, space } from '@/theme';
import { Pressable, Screen, Text } from '@/ui';

/** Photo credits. Most photos are Creative Commons and need their author and licence shown. */
export default function Credits() {
  const tr = useT();
  return (
    <Screen title={tr('settings.credits', 'Photo credits')} variant="detail">
      <Text variant="subheadline" color="textSecondary" style={{ marginHorizontal: layout.margin, marginBottom: space.md }}>
        {tr('credits.intro', 'Place photos are real Beirut and Saida photos from Flickr and Wikimedia Commons, shared under Creative Commons licences.')}
      </Text>
      {CREDITS.map((c) => (
        <Pressable key={c.file} feedback="highlight" accessibilityRole="link" onPress={() => c.source && Linking.openURL(c.source)}
          style={{ paddingHorizontal: layout.margin, paddingVertical: space.sm }}>
          <View style={{ gap: 2 }}>
            <Text variant="callout" weight="600" numberOfLines={2}>{c.title}</Text>
            <Text variant="footnote" color="textSecondary">{c.creator ? `${c.creator} · ` : ''}{c.license}</Text>
          </View>
        </Pressable>
      ))}
    </Screen>
  );
}
