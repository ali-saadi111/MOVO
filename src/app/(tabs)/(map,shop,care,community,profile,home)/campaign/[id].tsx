import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { useCampaign } from '@/data/queries';
import { requireAccount } from '@/features/shell/auth';
import { useLang, useLocalized, useT } from '@/i18n';
import { relativeAgo } from '@/lib/dates';
import { formatMoney } from '@/lib/money';
import { ltr } from '@/lib/rtl';
import { useActivity } from '@/stores/activity';
import { layout, space } from '@/theme';
import { BannerHero, Button, CountUp, Divider, ErrorState, Icon, ProgressBar, Screen, Skeleton, StickyCTA, STICKY_CTA_SPACE, Tag, Text, go } from '@/ui';

/** §2.9 moment 6: the bar fills once and the amount counts up; after a gift it animates old → new. */
export default function CampaignPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tr = useT();
  const lang = useLang();
  const loc = useLocalized();
  const q = useCampaign(id);
  const mine = useActivity((s) => s.donations.filter((d) => d.campaignId === id).reduce((n, d) => n + d.amountCents, 0));
  const c = q.data;
  if (q.isError) return <Screen title=""><ErrorState onRetry={() => q.refetch()} /></Screen>;
  if (!c) return <Screen title="" variant="hero"><Skeleton height={221} radius={0} /></Screen>;
  const raised = c.raisedCents + mine;
  const reached = raised >= c.goalCents;
  return (
    <Screen title={loc(c.title)} variant="hero" heroHeight={300} contentBottom={STICKY_CTA_SPACE}
      footer={reached ? null : <StickyCTA note={<Text variant="caption1" color="textSecondary" align="center">{tr('donate.keepsNothing', 'Movo keeps nothing from donations.')}</Text>}><Button label={tr('donate.cta', 'Donate')} icon="gift" onPress={() => requireAccount('donate', `/sheets/donate?campaign=${c.id}`) && go.push(`/sheets/donate?campaign=${c.id}`)} /></StickyCTA>}>
      <BannerHero image={c.image} />
      <View style={{ paddingHorizontal: layout.margin, paddingTop: space.lg, gap: space.md }}>
        <Text variant="title2">{loc(c.title)}</Text>
        <View style={{ gap: 2 }}>
          <CountUp variant="title1" to={raised} from={mine ? c.raisedCents : 0} format={(n) => ltr(formatMoney(Math.round(n / 100) * 100))} />
          <Text variant="subheadline" color="textSecondary" tabular>{tr('cmp.ofGoalLong', 'of {{goal}} goal · {{n}} donors', { goal: ltr(formatMoney(c.goalCents)), n: c.donors + (mine ? 1 : 0) })}</Text>
        </View>
        <ProgressBar value={raised / c.goalCents} from={mine ? c.raisedCents / c.goalCents : 0} label={tr('cmp.progress', 'Raised')} />
        {reached ? <Tag tone="success" label={tr('cmp.reached', 'Goal reached')} icon={<Icon name="checkmark" size={11} weight="bold" color="accentText" />} /> : null}
        {mine ? <Text variant="footnote" color="accentText" weight="600">{tr('cmp.yours', 'Includes your {{amount}}. Thank you.', { amount: ltr(formatMoney(mine)) })}</Text> : null}
      </View>
      {c.finalReport ? (
        <View style={{ paddingHorizontal: layout.margin, marginTop: space.xxl, gap: space.sm }}>
          <Text variant="title3">{tr('cmp.report', 'Final report')}</Text>
          <Text variant="body">{loc(c.finalReport)}</Text>
        </View>
      ) : null}
      <View style={{ paddingHorizontal: layout.margin, marginTop: space.xxl, gap: space.sm }}>
        <Text variant="title3">{tr('cmp.story', 'The story')}</Text>
        <Text variant="body">{loc(c.story)}</Text>
      </View>
      <Divider style={{ marginHorizontal: layout.margin, marginVertical: space.xxl }} />
      <View style={{ paddingHorizontal: layout.margin, gap: space.sm }}>
        <Text variant="title3">{tr('cmp.partner', 'Partner NGO')}</Text>
        <Text variant="body">{tr('cmp.partnerBody', '{{ngo}} receives every dollar and reports back on how it was spent.', { ngo: c.ngo })}</Text>
      </View>
      {c.updates.length ? (
        <View style={{ paddingHorizontal: layout.margin, marginTop: space.xxl, gap: space.md }}>
          <Text variant="title3">{tr('cmp.updates', 'Updates')}</Text>
          {c.updates.map((u) => (
            <View key={u.at} style={{ gap: 2 }}>
              <Text variant="footnote" color="textSecondary">{relativeAgo(u.at, lang)}</Text>
              <Text variant="body">{loc(u.text)}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}
