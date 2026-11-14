import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Share, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { useCampaign } from '@/data/queries';
import { PercentRing } from '@/features/community/components';
import { requireAccount } from '@/features/shell/auth';
import { useLang, useLocalized, useT } from '@/i18n';
import { relativeAgo } from '@/lib/dates';
import { haptic } from '@/lib/haptics';
import { formatMoney } from '@/lib/money';
import { ltr } from '@/lib/rtl';
import { useActivity } from '@/stores/activity';
import { layout, space, useTheme } from '@/theme';
import { BannerHero, Button, CountUp, ErrorState, Icon, IconButton, ListRow, ProgressBar, Pressable, Screen, Skeleton, StickyCTA, STICKY_CTA_SPACE, Text, go } from '@/ui';

/** §2.9 moment 6 kept: the bar fills and the amount counts up; after a gift it animates old → new. */
export default function CampaignPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const tr = useT();
  const lang = useLang();
  const loc = useLocalized();
  const q = useCampaign(id);
  const mine = useActivity((s) => s.donations.filter((d) => d.campaignId === id).reduce((n, d) => n + d.amountCents, 0));
  const c = q.data;
  const [now] = useState(() => Date.now());
  if (q.isError) return <Screen title=""><ErrorState onRetry={() => q.refetch()} /></Screen>;
  if (!c) return <Screen title="" variant="hero"><Skeleton height={221} radius={0} /></Screen>;
  const raised = c.raisedCents + mine;
  const reached = raised >= c.goalCents;
  const pct = Math.min(100, Math.round((raised / c.goalCents) * 100));
  const daysLeft = Math.ceil((new Date(c.endsAt).getTime() - now) / 86_400_000);
  const latest = c.updates[0];
  const info = (kind: string) => go.push(`/sheets/community-info?campaign=${c.id}&kind=${kind}`);
  const donate = () => requireAccount('donate', `/sheets/donate?campaign=${c.id}`) && go.push(`/sheets/donate?campaign=${c.id}`);
  const share = () => { haptic.light(); Share.share({ message: loc(c.title) }).catch(() => {}); };

  return (
    <Screen title={loc(c.title)} variant="hero" heroHeight={300} contentBottom={reached ? 40 : STICKY_CTA_SPACE}
      headerRight={() => <IconButton icon="square.and.arrow.up" label={tr('common.share', 'Share')} size={44} onPress={share} />}
      footer={reached ? null : (
        <StickyCTA>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <Text variant="caption1" color="textSecondary" style={{ flex: 1 }}>{tr('donate.keepsNothing', 'Movo keeps nothing from donations.')}</Text>
            <View style={{ minWidth: 150 }}><Button label={tr('donate.cta', 'Donate')} icon="gift" onPress={donate} /></View>
          </View>
        </StickyCTA>
      )}>
      <BannerHero image={c.image} />
      <Animated.View entering={FadeIn.duration(200)} style={{ paddingHorizontal: layout.margin, paddingTop: space.md }}>
        <Text variant="title2" weight="700">{loc(c.title)}</Text>
        <Text variant="subheadline" color="textSecondary" style={{ marginTop: 2 }}>{reached ? `${c.ngo} · ${tr('cmp.reached', 'Goal reached')}` : `${c.ngo} · ${tr('cmp.daysLeft', '{{n}} days left', { n: Math.max(0, daysLeft) })}`}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.md }}>
          <View style={{ flex: 1, gap: 2 }}>
            <CountUp variant="title1" to={raised} from={mine ? c.raisedCents : 0} format={(n) => ltr(formatMoney(Math.round(n / 100) * 100))} />
            <Text variant="footnote" color="textSecondary" tabular>{tr('cmp.ofGoalLong', 'of {{goal}} goal · {{n}} donors', { goal: ltr(formatMoney(c.goalCents)), n: c.donors + (mine ? 1 : 0) })}</Text>
          </View>
          <PercentRing pct={pct} />
        </View>
        <ProgressBar value={raised / c.goalCents} from={mine ? c.raisedCents / c.goalCents : 0} height={8} label={tr('cmp.progress', 'Raised')} style={{ marginTop: space.sm }} />
        {mine ? <Text variant="footnote" color="accentText" weight="600" style={{ marginTop: space.xs }}>{tr('cmp.yours', 'Includes your {{amount}}. Thank you.', { amount: ltr(formatMoney(mine)) })}</Text> : null}
      </Animated.View>

      {c.finalReport || latest ? (
        <Pressable onPress={() => info(c.finalReport ? 'report' : 'updates')} feedback="scale" accessibilityRole="button"
          style={{ marginHorizontal: layout.margin, marginTop: space.md, borderRadius: 14, backgroundColor: t.colors.fill, paddingVertical: 11, paddingHorizontal: 14, borderStartWidth: 4, borderStartColor: t.colors.accent, gap: 2 }}>
          <Text variant="caption1" color="textSecondary">{c.finalReport ? tr('cmp.report', 'Final report') : tr('cmp.latest', 'Latest update · {{ago}}', { ago: relativeAgo(latest!.at, lang) })}</Text>
          <Text variant="subheadline" numberOfLines={2}>{c.finalReport ? loc(c.finalReport) : loc(latest!.text)}</Text>
        </Pressable>
      ) : null}

      <Pressable onPress={() => info('story')} feedback="none" accessibilityRole="button" accessibilityLabel={tr('cmp.story', 'The story')} style={{ marginHorizontal: layout.margin, marginTop: space.md, gap: 2 }}>
        <Text variant="body" numberOfLines={3}>{loc(c.story)}</Text>
        <Text variant="subheadline" weight="600" color="accentText">{tr('common.more', 'More')}</Text>
      </Pressable>

      <View style={{ marginHorizontal: layout.margin, marginTop: space.lg, borderRadius: 16, backgroundColor: t.colors.fill, overflow: 'hidden' }}>
        <ListRow leading={<View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: t.colors.bgElevated, alignItems: 'center', justifyContent: 'center' }}><Icon name="checkmark.seal.fill" size={16} color="accentText" /></View>}
          title={tr('cmp.partnerShort', 'Partner NGO · {{ngo}}', { ngo: c.ngo })} subtitle={tr('cmp.partnerSub', 'Receives every dollar and reports back')} onPress={() => info('ngo')} />
        {c.updates.length ? <ListRow icon="doc.text" title={tr('cmp.allUpdates', 'All updates')} subtitle={c.updates.length === 1 ? tr('cmp.updatesOne', '1 update') : tr('cmp.updatesN', '{{n}} updates', { n: c.updates.length })} onPress={() => info('updates')} /> : null}
      </View>
    </Screen>
  );
}
