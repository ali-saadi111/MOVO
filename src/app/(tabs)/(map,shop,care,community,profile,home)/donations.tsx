import { sync } from '@/data';
import { useLang, useLocalized, useT } from '@/i18n';
import { fmtDay } from '@/lib/dates';
import { formatMoney } from '@/lib/money';
import { ltr } from '@/lib/rtl';
import { useActivity } from '@/stores/activity';
import { EmptyState, ListRow, Screen, Section, go, useTabNav } from '@/ui';

export default function Donations() {
  const tr = useT();
  const lang = useLang();
  const loc = useLocalized();
  const { push } = useTabNav();
  const list = useActivity((s) => s.donations);
  return (
    <Screen title={tr('profile.donations', 'My donations')} variant="root" grouped>
      {!list.length ? <EmptyState symbol="gift" message={tr('donations.empty', 'No donations yet.')} actionLabel={tr('donations.find', 'See campaigns')} onAction={() => go.push('/(tabs)/(community)/community')} /> : (
        <Section footer={tr('donate.keepsNothing', 'Movo keeps nothing from donations.')}>{list.map((d, i) => { const c = sync.campaign(d.campaignId); return c ? <ListRow key={i} icon="gift" title={loc(c.title)} subtitle={fmtDay(d.at, lang)} trailing={{ type: 'value', text: ltr(formatMoney(d.amountCents)) }} onPress={() => push(`/campaign/${c.id}`)} /> : null; })}</Section>
      )}
    </Screen>
  );
}
