import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { useProduct } from '@/data/queries';
import { useLocalized, useT } from '@/i18n';
import { openWhatsApp } from '@/lib/whatsapp';
import { layout, space, useTheme } from '@/theme';
import { Button, Divider, KeySpecsTable, ListRow, Section, Sheet, StarRating, Text } from '@/ui';

const REVIEWS: [string, number, string][] = [
  ['Rania K.', 5, 'Folds easily into my small car. Customer service called to check it fit.'],
  ['Hadi M.', 4, 'Good value. The seat cushion could be thicker.'],
  ['Lina S.', 5, 'Arrived the next day in Hamra. Light enough for my mum to push.'],
];

/** About, delivery and returns, or reviews for one product, opened from its page. */
export default function ProductInfo() {
  const { id, kind = 'about' } = useLocalSearchParams<{ id: string; kind?: 'about' | 'delivery' | 'reviews' }>();
  const t = useTheme();
  const tr = useT();
  const loc = useLocalized();
  const p = useProduct(id).data;
  const title = { about: tr('product.about', 'About'), delivery: tr('product.delivery', 'Delivery and returns'), reviews: tr('product.reviewsTitle', 'Reviews from buyers') }[kind];
  const ask = () => p && openWhatsApp(`Question about: ${p.name.en}`);

  return (
    <Sheet title={title} dismissLabel="done" detent={kind === 'about' ? 0.72 : 0.6}>
      {!p ? null : kind === 'about' ? (
        <View style={{ paddingHorizontal: layout.margin, gap: space.lg }}>
          <Text variant="body">{loc(p.description)}</Text>
          {p.keySpecs.length ? <KeySpecsTable specs={p.keySpecs} /> : null}
          <View style={{ gap: space.xs, padding: space.md, borderRadius: 16, backgroundColor: t.colors.bgSelected }}>
            <Text variant="headline">{tr('product.askTitle', 'Not sure it fits?')}</Text>
            <Text variant="subheadline" color="textSecondary">{tr('product.askBody', 'Send us your measurements or a photo and the team will tell you.')}</Text>
            <Button variant="secondary" icon="message" label={tr('product.ask', 'Ask us on WhatsApp')} onPress={ask} />
          </View>
        </View>
      ) : kind === 'delivery' ? (
        <Section>
          <ListRow icon="shippingbox" title={tr('product.deliveryBeirut', 'Beirut 1–2 days · Other areas 2–4 days')} subtitle={tr('product.deliveryFee', '$5 delivery in Beirut')} trailing={{ type: 'none' }} />
          <ListRow icon="arrow.uturn.backward" title={p.returnable ? tr('product.returns', '14 days if unused') : tr('product.noReturns', 'Hygiene item, can’t be returned once opened')} trailing={{ type: 'none' }} />
          <ListRow icon="message" title={tr('product.ask', 'Ask us on WhatsApp')} onPress={ask} />
        </Section>
      ) : (
        <View style={{ paddingHorizontal: layout.margin }}>
          {p.rating.count ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingBottom: space.md }}>
                <Text variant="largeTitle" weight="800" tabular style={{ fontSize: 44, lineHeight: 50 }}>{p.rating.average.toFixed(1)}</Text>
                <View style={{ gap: 2 }}>
                  <StarRating value={Math.round(p.rating.average)} size={16} label={tr('product.rating', 'Rating')} />
                  <Text variant="footnote" color="textSecondary">{tr('product.reviews', '{{n}} reviews', { n: p.rating.count })}</Text>
                </View>
              </View>
              {REVIEWS.slice(0, Math.min(3, p.rating.count)).map(([a, stars, b], i) => (
                <View key={a}>
                  {i ? <Divider /> : null}
                  <View style={{ gap: 4, paddingVertical: space.sm }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text variant="headline">{a}</Text><StarRating value={stars} size={13} label="" /></View>
                    <Text variant="body" color="textSecondary">{b}</Text>
                  </View>
                </View>
              ))}
            </>
          ) : <Text variant="body" color="textSecondary">{tr('product.noReviews', 'No reviews yet. Buyers can review after delivery.')}</Text>}
        </View>
      )}
    </Sheet>
  );
}
