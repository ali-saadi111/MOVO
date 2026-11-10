import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { layout, space, useTheme } from '@/theme';
import { Badge, Button, Chip, ProgressBar, Segmented, Skeleton, StarRating, Stepper, SuccessTick, Switch, Tag, Text } from '@/ui';

function H({ c }: { c: string }) {
  return <Text variant="footnote" color="textSecondary" style={{ marginTop: space.xl, marginBottom: space.xs }}>{c.toUpperCase()}</Text>;
}

/** Every primitive on one page, for design review. Not translated. */
export default function Gallery() {
  const t = useTheme();
  const [seg, setSeg] = useState(0);
  const [on, setOn] = useState(true);
  const [qty, setQty] = useState(1);
  const [stars, setStars] = useState(4);
  return (
    <ScrollView style={{ backgroundColor: t.colors.bgGrouped }} contentContainerStyle={{ padding: layout.margin, gap: space.sm, paddingBottom: 80 }}>
      {(['largeTitle', 'title1', 'title2', 'title3', 'headline', 'body', 'subheadline', 'footnote', 'caption1'] as const).map((v) => <Text key={v} variant={v}>{v}</Text>)}
      <H c="Buttons" />
      <Button label="Primary" onPress={() => {}} />
      <Button label="Secondary" variant="secondary" onPress={() => {}} />
      <Button label="Plain" variant="plain" onPress={() => {}} />
      <Button label="Destructive" variant="destructive" onPress={() => {}} />
      <Button label="Disabled" disabledReason="Choose a time first" onPress={() => {}} />
      <Button label="Loading" loading onPress={() => {}} />
      <H c="Controls" />
      <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap' }}><Chip label="All" selected /><Chip label="Cafés" /><Chip label="Pharmacies" /></View>
      <Segmented values={['Upcoming', 'Past']} index={seg} onChange={setSeg} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}><Switch label="Switch" value={on} onValueChange={setOn} /><Stepper label="Quantity" value={qty} onChange={setQty} /><Badge count={3} /></View>
      <StarRating label="Rating" value={stars} onChange={setStars} />
      <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap' }}><Tag label="Neutral" /><Tag label="Success" tone="success" /><Tag label="Warning" tone="warning" /><Tag label="Brand" tone="brand" /></View>
      <H c="Feedback" />
      <ProgressBar value={0.62} label="Raised" />
      <Skeleton height={56} />
      <View style={{ alignItems: 'center' }}><SuccessTick /></View>
    </ScrollView>
  );
}
