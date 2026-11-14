import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { sync } from '@/data';
import { PayChoice } from '@/features/community/components';
import { useLocalized, useT } from '@/i18n';
import { haptic } from '@/lib/haptics';
import { formatMoney } from '@/lib/money';
import { ltr } from '@/lib/rtl';
import { useActivity } from '@/stores/activity';
import { layout, space, useTheme } from '@/theme';
import { Button, ListRow, ProgressBar, Pressable, Section, Sheet, Switch, Text, TextField, go, type PayMethod } from '@/ui';

const AMOUNTS = ['10', '25', '50', 'other'] as const;

/** Donate in one short sheet: big amount tiles, where your gift takes the campaign, one payment row. */
export default function Donate() {
  const { campaign } = useLocalSearchParams<{ campaign: string }>();
  const t = useTheme();
  const tr = useT();
  const loc = useLocalized();
  const c = sync.campaign(campaign)!;
  const mine = useActivity((s) => s.donations.filter((d) => d.campaignId === campaign).reduce((n, d) => n + d.amountCents, 0));
  const [amt, setAmt] = useState<(typeof AMOUNTS)[number]>('25');
  const [other, setOther] = useState('');
  const [showName, setShowName] = useState(false);
  const [m, setM] = useState<PayMethod>('whish');
  const dollars = amt === 'other' ? Number(other || 0) : Number(amt);
  const tooLow = dollars < 5;
  const before = c.raisedCents + mine;
  const after = before + dollars * 100;
  const money = (cents: number) => ltr(formatMoney(cents));
  return (
    <Sheet title={tr('donate.title', 'Donate')} detent={amt === 'other' ? 0.72 : 0.62}
      footer={<>
        <Button label={tooLow ? tr('donate.cta', 'Donate') : tr('donate.ctaAmount', 'Donate {{amount}}', { amount: money(dollars * 100) })} disabledReason={tooLow ? tr('donate.min', 'The smallest gift is $5') : null}
          onPress={() => { go.back(); go.push(`/covers/payment?flow=donation&campaign=${c.id}&method=${m}&total=${dollars * 100}`); }} />
        <Text variant="caption1" color="textSecondary" align="center">{tr('donate.keepsNothing', 'Movo keeps nothing from donations.')}</Text>
      </>}>
      <Text variant="subheadline" color="textSecondary" numberOfLines={1} style={{ marginHorizontal: layout.margin, marginBottom: space.md }}>{loc(c.title)} · {c.ngo}</Text>
      <View style={{ flexDirection: 'row', gap: space.xs, marginHorizontal: layout.margin }} accessibilityRole="radiogroup">
        {AMOUNTS.map((a) => {
          const on = amt === a;
          return (
            <Pressable key={a} onPress={() => { haptic.selection(); setAmt(a); }} feedback="scale" accessibilityRole="radio" accessibilityState={{ checked: on }}
              style={{ flex: 1, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? t.colors.buttonPrimaryBg : t.colors.fill }}>
              <Text variant={a === 'other' ? 'subheadline' : 'title3'} weight={a === 'other' ? '600' : '800'} tabular style={{ color: on ? t.colors.buttonPrimaryFg : t.colors.textPrimary }}>{a === 'other' ? tr('donate.other', 'Other') : `$${a}`}</Text>
            </Pressable>
          );
        })}
      </View>
      {amt === 'other' ? (
        <View style={{ marginHorizontal: layout.margin, marginTop: space.sm }}>
          <TextField label={tr('donate.amount', 'Amount in dollars')} value={other} onChangeText={(v) => setOther(v.replace(/[^0-9]/g, ''))} keyboardType="number-pad" helper={tr('donate.min', 'The smallest gift is $5')} />
        </View>
      ) : null}
      <View style={{ marginHorizontal: layout.margin, marginTop: space.md, marginBottom: space.md, gap: 6 }}>
        <Text variant="footnote" color="textSecondary" tabular>
          {tooLow ? tr('donate.afterNone', '{{raised}} of {{goal}} raised so far', { raised: money(before), goal: money(c.goalCents) })
            : tr('donate.after', 'Your {{amount}} takes it to {{after}} of {{goal}}', { amount: money(dollars * 100), after: money(after), goal: money(c.goalCents) })}
        </Text>
        <ProgressBar value={Math.min(1, (tooLow ? before : after) / c.goalCents)} from={before / c.goalCents} height={8} label={tr('cmp.progress', 'Raised')} />
      </View>
      <PayChoice value={m} onChange={setM} />
      <Section footer={undefined}>
        <ListRow title={tr('donate.showName', 'Show my name')} subtitle={tr('donate.nameShort', 'On the campaign page. Off by default.')} trailing={{ type: 'node', node: <Switch value={showName} onValueChange={setShowName} label={tr('donate.showName', 'Show my name')} /> }} />
      </Section>
    </Sheet>
  );
}
