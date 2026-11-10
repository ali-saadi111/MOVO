import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { sync } from '@/data';
import { FormSent } from '@/features/shell/FormSent';
import { useLocalized, useT } from '@/i18n';
import { EMPTY_DRAFT, useDrafts } from '@/stores/drafts';
import { layout, radii, space, useTheme } from '@/theme';
import { Button, Icon, Pressable, Sheet, StarRating, Text, TextField } from '@/ui';

export default function Review() {
  const { place, product } = useLocalSearchParams<{ place?: string; product?: string }>();
  const t = useTheme();
  const tr = useT();
  const loc = useLocalized();
  const key = `review:${place ?? product}`;
  const draft = useDrafts((s) => s.drafts[key] ?? EMPTY_DRAFT) as { stars?: number; text?: string; photos?: number };
  const save = useDrafts((s) => s.save);
  const clear = useDrafts((s) => s.clear);
  const [sent, setSent] = useState(false);
  const stars = draft.stars ?? 0;
  const text = draft.text ?? '';
  const photos = draft.photos ?? 0;
  const name = place ? loc(sync.place(place)?.name ?? { en: '', ar: null }) : loc(sync.product(product ?? '')?.name ?? { en: '', ar: null });
  if (sent) return <Sheet title={tr('review.title', 'Write a review')} detent={0.7}><FormSent title={tr('review.sentTitle', 'Waiting for the team')} body={tr('review.sentBody', 'Reviews appear once the team has read them, usually within a day.')} done={tr('common.done', 'Done')} /></Sheet>;
  return (
    <Sheet title={tr('review.title', 'Write a review')} detent={0.92} footer={<Button label={tr('review.send', 'Send review')} disabledReason={stars ? null : tr('review.needStars', 'Choose a star rating')} onPress={() => { clear(key); setSent(true); }} />}>
      <View style={{ paddingHorizontal: layout.margin, gap: space.xl, paddingTop: space.xs }}>
        <Text variant="headline">{name}</Text>
        <View style={{ gap: space.xs }}>
          <Text variant="subheadline" weight="600">{tr('review.stars', 'Your rating')}</Text>
          <StarRating value={stars} onChange={(n) => save(key, { ...draft, stars: n })} size={30} label={tr('review.stars', 'Your rating')} />
        </View>
        <TextField label={tr('review.text', 'What should others know? (optional)')} value={text} onChangeText={(v) => save(key, { ...draft, text: v })} multiline maxLength={500} />
        <View style={{ gap: space.xs }}>
          <Text variant="subheadline" weight="600">{tr('review.photos', 'Photos (up to 3)')}</Text>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            {Array.from({ length: photos }, (_, i) => <View key={i} style={{ width: 72, height: 72, borderRadius: radii.thumb, backgroundColor: t.colors.bgSelected, alignItems: 'center', justifyContent: 'center' }}><Icon name="photo.on.rectangle" size={24} color="tint" /></View>)}
            {photos < 3 ? (
              <Pressable onPress={() => save(key, { ...draft, photos: photos + 1 })} accessibilityRole="button" accessibilityLabel={tr('review.addPhoto', 'Add a photo')} style={{ width: 72, height: 72, borderRadius: radii.thumb, borderWidth: 1.5, borderStyle: 'dashed', borderColor: t.colors.separator, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="camera" size={22} color="tint" />
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </Sheet>
  );
}
