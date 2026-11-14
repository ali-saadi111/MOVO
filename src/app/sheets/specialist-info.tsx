import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { sync } from '@/data';
import { specialistExtras } from '@/data/fixtures/specialistExtras';
import { mobilityLabel } from '@/features/labels';
import { useLang, useLocalized, useT } from '@/i18n';
import { layout, space, useTheme } from '@/theme';
import { ArtImage, Avatar, Divider, Icon, ListRow, Pressable, RatingBadge, Section, Sheet, StarRating, Text, go } from '@/ui';
import type { IconName } from '@/ui/symbols';

export type InfoKind = 'about' | 'steps' | 'where' | 'credentials' | 'reviews';

/** One part of a specialist's profile, opened from a row on their page. */
export default function SpecialistInfo() {
  const { id = '', kind = 'about' } = useLocalSearchParams<{ id?: string; kind?: InfoKind }>();
  const t = useTheme();
  const tr = useT();
  const lang = useLang();
  const loc = useLocalized();
  const s = sync.specialist(id);
  if (!s) return <Sheet title="">{null}</Sheet>;
  const x = specialistExtras(s);
  const name = lang === 'ar' ? s.nameAr : s.name;
  const first = name.replace(/^(Dr\.|د\.)\s*/, '').split(' ')[0];
  const clinic = s.clinic ? sync.place(s.clinic.placeId) : null;
  const langs = s.languages.map((l) => ({ ar: 'العربية', en: 'English', fr: 'Français' })[l]);
  const title = {
    about: tr('care.aboutName', 'About {{name}}', { name: first }),
    steps: tr('care.howItGoes', 'How a session goes'),
    where: tr('care.whereSees', 'Where {{name}} sees you', { name: first }),
    credentials: tr('care.credentials', 'Credentials'),
    reviews: tr('place.reviews', 'Reviews'),
  }[kind];

  return (
    <Sheet title={title} dismissLabel="done" detent={kind === 'reviews' || kind === 'about' ? 0.72 : 0.55}>
      {kind === 'about' ? (
        <View style={{ paddingHorizontal: layout.margin, gap: space.md }}>
          <Text variant="body">{loc(s.bio)}</Text>
          <Text variant="body" color="textSecondary">{loc(x.approach)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="clock.fill" size={15} color="accentText" />
            <Text variant="footnote" weight="600" color="accentText">{loc(x.responds)}</Text>
          </View>
        </View>
      ) : kind === 'steps' ? (
        <View style={{ paddingHorizontal: layout.margin }}>
          {x.steps.map(([head, body], i) => (
            <View key={i} style={{ flexDirection: 'row', gap: space.sm }}>
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: t.colors.blockNavy, alignItems: 'center', justifyContent: 'center' }}>
                  <Text variant="headline" weight="800" style={{ color: t.colors.blockNavyInk }}>{i + 1}</Text>
                </View>
                {i < x.steps.length - 1 ? <View style={{ width: 2, flex: 1, minHeight: 16, backgroundColor: t.colors.separator, marginVertical: 4 }} /> : null}
              </View>
              <View style={{ flex: 1, gap: 2, paddingBottom: space.md }}>
                <Text variant="headline">{loc(head)}</Text>
                <Text variant="subheadline" color="textSecondary">{loc(body)}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : kind === 'where' ? (
        <>
          {s.homeVisit ? (
            <Section header={tr('care.visits', 'Home visits')}>
              <ListRow icon="house.fill" title={s.areas.join(' · ')} subtitle={tr('care.visitsSub', '{{name}} comes to you', { name: first })} trailing={{ type: 'none' }} />
            </Section>
          ) : null}
          {clinic ? (
            <View style={{ marginHorizontal: layout.margin }}>
              <Text variant="footnote" color="textSecondary" style={{ marginStart: space.md, marginBottom: 6, textTransform: t.rtl ? 'none' : 'uppercase' }}>{tr('care.clinic', 'At the clinic')}</Text>
              <Pressable feedback="highlight" onPress={() => { go.back(); setTimeout(() => go.push(`/(tabs)/(care)/place/${clinic.id}`), 30); }} accessibilityRole="link"
                style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center', padding: space.sm, borderRadius: 16, backgroundColor: t.colors.bgElevated }}>
                <View style={{ width: 64, height: 64, borderRadius: 14, overflow: 'hidden' }}><ArtImage image={clinic.hero} aspect={1} radius={14} edge={false} /></View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text variant="headline">{loc(clinic.name)}</Text>
                  <Text variant="footnote" color="textSecondary">{loc(clinic.street)}</Text>
                  <RatingBadge level={clinic.rating.level} size="mini" />
                </View>
                <Icon name="chevron.right" size={14} weight="semibold" color="textTertiary" mirrorInRTL />
              </Pressable>
            </View>
          ) : null}
        </>
      ) : kind === 'credentials' ? (
        <Section>
          {([['graduationcap.fill', loc(x.degree)], ['checkmark.seal.fill', loc(x.body)], ['globe.americas.fill', langs.join(' · ')]] as [IconName, string][]).map(([icon, label]) => (
            <ListRow key={icon} icon={icon} title={label} trailing={{ type: 'none' }} />
          ))}
        </Section>
      ) : (
        <View style={{ paddingHorizontal: layout.margin }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingBottom: space.md }}>
            <Text variant="largeTitle" weight="800" tabular style={{ fontSize: 44, lineHeight: 50 }}>{s.stars.toFixed(1)}</Text>
            <View style={{ gap: 2 }}>
              <StarRating value={Math.round(s.stars)} size={16} label={tr('product.rating', 'Rating')} />
              <Text variant="footnote" color="textSecondary">{tr('care.reviewsShort', '{{n}} reviews', { n: s.reviewCount })}</Text>
            </View>
          </View>
          {s.reviews.map((r, i) => (
            <View key={r.id}>
              {i ? <Divider /> : null}
              <View style={{ gap: 6, paddingVertical: space.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
                  <Avatar name={r.author} hue={i} size={32} />
                  <View style={{ flex: 1 }}>
                    <Text variant="headline">{r.author}</Text>
                    <Text variant="caption1" color="textSecondary">{mobilityLabel(tr, r.mobility)}</Text>
                  </View>
                  <StarRating value={r.stars} size={12} label="" />
                </View>
                <Text variant="body" color="textSecondary">{r.text}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </Sheet>
  );
}
