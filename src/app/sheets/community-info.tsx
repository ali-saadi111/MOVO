import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { sync } from '@/data';
import { useLang, useLocalized, useT } from '@/i18n';
import { relativeAgo } from '@/lib/dates';
import { layout, space } from '@/theme';
import { Divider, ListRow, RatingBadge, Section, Sheet, Text, go } from '@/ui';

type Kind = 'about' | 'there' | 'story' | 'ngo' | 'updates' | 'report';

/** Longer text for an activity or campaign, opened from a row on its page. */
export default function CommunityInfo() {
  const { event, campaign, kind = 'about' } = useLocalSearchParams<{ event?: string; campaign?: string; kind?: Kind }>();
  const tr = useT();
  const lang = useLang();
  const loc = useLocalized();
  const e = event ? sync.event(event) : undefined;
  const c = campaign ? sync.campaign(campaign) : undefined;
  const venue = e ? sync.place(e.venuePlaceId) : undefined;
  const title = {
    about: tr('event.about', 'About'), there: tr('event.gettingThere', 'Getting there'), story: tr('cmp.story', 'The story'),
    ngo: tr('cmp.partner', 'Partner NGO'), updates: tr('cmp.updates', 'Updates'), report: tr('cmp.report', 'Final report'),
  }[kind];
  const para = (s: string) => <Text variant="body" style={{ marginHorizontal: layout.margin }}>{s}</Text>;

  return (
    <Sheet title={title} dismissLabel="done" detent={0.55}>
      {e && kind === 'about' ? (
        <View style={{ gap: space.md }}>
          {para(loc(e.about))}
          <Text variant="subheadline" color="textSecondary" style={{ marginHorizontal: layout.margin }}>{tr('event.by', 'Sponsored by {{s}}', { s: e.sponsor })}</Text>
        </View>
      ) : e && kind === 'there' ? (
        <View style={{ gap: space.md }}>
          {venue ? (
            <Section>
              <ListRow leading={<RatingBadge level={venue.rating.level} size="mini" />} title={loc(venue.name)} subtitle={loc(venue.street)} onPress={() => { go.back(); setTimeout(() => go.push(`/place/${venue.id}`), 60); }} />
            </Section>
          ) : null}
          {para(loc(e.gettingThere))}
        </View>
      ) : c && kind === 'story' ? para(loc(c.story))
        : c && kind === 'ngo' ? para(tr('cmp.partnerBody', '{{ngo}} receives every dollar and reports back on how it was spent.', { ngo: c.ngo }))
        : c && kind === 'report' && c.finalReport ? para(loc(c.finalReport))
        : c ? (
          <View style={{ paddingHorizontal: layout.margin }}>
            {c.updates.length ? c.updates.map((u, i) => (
              <View key={u.at}>
                {i ? <Divider /> : null}
                <View style={{ gap: 2, paddingVertical: space.sm }}>
                  <Text variant="footnote" color="textSecondary">{relativeAgo(u.at, lang)}</Text>
                  <Text variant="body">{loc(u.text)}</Text>
                </View>
              </View>
            )) : <Text variant="body" color="textSecondary">{tr('cmp.noUpdates', 'No updates yet. Arc en Ciel posts one when the money is spent.')}</Text>}
          </View>
        ) : null}
    </Sheet>
  );
}
