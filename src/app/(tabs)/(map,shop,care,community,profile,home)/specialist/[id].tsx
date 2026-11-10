import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, ScrollView, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { specialistPhoto } from '@/art/people';
import { sync } from '@/data';
import { specialistExtras } from '@/data/fixtures/specialistExtras';
import { useSpecialist } from '@/data/queries';
import { requireAccount } from '@/features/shell/auth';
import { mobilityLabel } from '@/features/labels';
import { useLang, useLocalized, useT } from '@/i18n';
import { formatMoney } from '@/lib/money';
import { ltr } from '@/lib/rtl';
import { continuous, layout, radii, space, useTheme } from '@/theme';
import { ArtImage, Avatar, BannerBackdrop, BannerHeadline, Button, ErrorState, Icon, Pressable, RatingBadge, Screen, Skeleton, StarRating, StickyCTA, STICKY_CTA_SPACE, Text, useTabNav } from '@/ui';
import type { IconName } from '@/ui/symbols';

const HERO_H = 320;

type Slide = { tone: 'navy' | 'cream'; top: string; bottom: string; caption: string };

/** Swipeable campaign-style banners, auto-advancing gently until the person touches it. */
function HeroCarousel({ slides, label }: { slides: Slide[]; label: string }) {
  const { width } = useWindowDimensions();
  const t = useTheme();
  const [index, setIndex] = useState(0);
  const [touched, setTouched] = useState(false);
  const list = useRef<FlatList<Slide>>(null);
  const viewable = useCallback(({ viewableItems }: { viewableItems: { index?: number | null }[] }) => {
    if (viewableItems[0]?.index != null) setIndex(viewableItems[0].index);
  }, []);
  useEffect(() => {
    if (touched || t.reduceMotion || slides.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => {
        const n = (i + 1) % slides.length;
        list.current?.scrollToIndex({ index: n, animated: true });
        return n;
      });
    }, 4200);
    return () => clearInterval(id);
  }, [touched, t.reduceMotion, slides.length]);
  return (
    <View style={{ height: HERO_H, backgroundColor: '#01212E' }} accessibilityLabel={label}>
      <FlatList
        ref={list}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onScrollBeginDrag={() => setTouched(true)}
        onViewableItemsChanged={viewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <View style={{ width, height: HERO_H }}>
            <BannerBackdrop tone={item.tone} width={width} height={HERO_H} />
            <BannerHeadline tone={item.tone} top={item.top} bottom={item.bottom} caption={item.caption} size={44} style={{ position: 'absolute', top: 108, start: 24, end: 24 }} />
          </View>
        )}
      />
      <View pointerEvents="none" style={{ position: 'absolute', top: 76, end: 16, flexDirection: 'row', gap: 6 }}>
        {slides.map((_, i) => <View key={i} style={{ width: i === index ? 20 : 6, height: 6, borderRadius: 3, backgroundColor: i === index ? '#3CF2B8' : 'rgba(255,255,255,0.45)' }} />)}
      </View>
    </View>
  );
}

function StatTile({ icon, value, label, bg, ink }: { icon: IconName; value: string; label: string; bg: string; ink: string }) {
  return (
    <View style={{ flex: 1, height: 128, backgroundColor: bg, borderRadius: 22, ...continuous, paddingHorizontal: space.sm + 4, paddingVertical: space.sm + 4, justifyContent: 'space-between' }}>
      <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={16} color={{ raw: ink }} />
      </View>
      <Text variant="title2" weight="800" style={{ color: ink }} tabular numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text variant="caption1" weight="600" style={{ color: ink, opacity: 0.85, height: 30, lineHeight: 15 }} numberOfLines={2}>{label}</Text>
    </View>
  );
}

function Card({ title, children, delay = 0 }: { title?: string; children: React.ReactNode; delay?: number }) {
  const t = useTheme();
  return (
    <Animated.View entering={t.reduceMotion ? undefined : FadeInDown.delay(delay).springify().damping(22).stiffness(180)} style={{ marginHorizontal: layout.margin, backgroundColor: t.colors.bgElevated, borderRadius: 24, padding: space.lg, gap: space.md, boxShadow: '0 6px 20px rgba(1,52,71,0.06)' }}>
      {title ? <Text variant="title3" weight="700">{title}</Text> : null}
      {children}
    </Animated.View>
  );
}

function Chip({ icon, label }: { icon?: IconName; label: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, height: 34, borderRadius: 17, backgroundColor: t.colors.bgSelected }}>
      {icon ? <Icon name={icon} size={15} color="accentText" fill /> : null}
      <Text variant="footnote" weight="600" color="accentText">{label}</Text>
    </View>
  );
}

export default function SpecialistProfile() {
  const { id, where = 'home' } = useLocalSearchParams<{ id: string; where?: string }>();
  const t = useTheme();
  const tr = useT();
  const lang = useLang();
  const loc = useLocalized();
  const { width } = useWindowDimensions();
  const { push } = useTabNav();
  const q = useSpecialist(id);
  const s = q.data;
  if (q.isError) return <Screen title=""><ErrorState onRetry={() => q.refetch()} /></Screen>;
  if (!s) return <Screen title=""><View style={{ alignItems: 'center', gap: 12, paddingTop: 24 }}><Skeleton shape="circle" width={96} height={96} /><Skeleton shape="text" width={180} height={24} /></View></Screen>;
  const x = specialistExtras(s);
  const clinic = s.clinic ? sync.place(s.clinic.placeId) : null;
  const name = lang === 'ar' ? s.nameAr : s.name;
  const langs = s.languages.map((l) => ({ ar: 'العربية', en: 'English', fr: 'Français' })[l]);
  const from = Math.min(...s.services.map((sv) => sv.priceCents));
  const book = () => { if (requireAccount('book', `/book/${s.id}?where=${where}`)) push(`/book/${s.id}?where=${where}`); };
  const first = name.replace(/^(Dr\.|د\.)\s*/, '').split(' ')[0];
  const slides: Slide[] = [
    { tone: 'navy', top: loc(x.bannerTop), bottom: loc(x.bannerBottom), caption: loc(s.profession).toUpperCase() },
    { tone: 'cream', top: tr('care.bannerYears', '{{n}} years', { n: s.years }).toUpperCase(), bottom: tr('care.bannerCare', 'of care').toUpperCase(), caption: tr('care.bannerVerified', 'Verified by Movo').toUpperCase() },
    { tone: 'navy', top: s.homeVisit ? tr('care.bannerHome', 'At home').toUpperCase() : tr('care.bannerClinic', 'In clinic').toUpperCase(), bottom: tr('care.bannerWith', 'with {{name}}', { name: first }).toUpperCase(), caption: s.areas.join(' · ').toUpperCase() },
  ];
  const cardW = Math.min(300, width * 0.78);

  return (
    <Screen
      title={name}
      variant="hero"
      heroHeight={HERO_H}
      grouped
      contentBottom={STICKY_CTA_SPACE}
      footer={<StickyCTA><Button label={tr('care.chooseTimeFrom', 'Choose a time · from {{p}}', { p: ltr(formatMoney(from)) })} onPress={book} /></StickyCTA>}
    >
      <HeroCarousel slides={slides} label={loc(x.tagline)} />

      {/* Identity card overlapping the photos */}
      <View style={{ marginTop: -32, borderTopLeftRadius: 32, borderTopRightRadius: 32, backgroundColor: t.colors.bgGrouped, paddingTop: space.lg, gap: space.lg }}>
        <View style={{ paddingHorizontal: layout.margin, flexDirection: 'row', gap: space.md, alignItems: 'flex-end', marginTop: -64 }}>
          <View style={{ borderRadius: 60, borderWidth: 4, borderColor: t.colors.bgGrouped, boxShadow: '0 10px 24px rgba(1,52,71,0.22)' }}>
            <Avatar name={s.name} hue={s.avatarHue} size={104} photo={specialistPhoto(s.id)} />
          </View>
          <View style={{ flex: 1, paddingBottom: 6, gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: t.colors.blockMint, paddingHorizontal: 10, height: 26, borderRadius: 13 }}>
              <Icon name="checkmark.seal.fill" size={14} color={{ raw: t.colors.blockMintInk }} />
              <Text variant="caption1" weight="700" style={{ color: t.colors.blockMintInk }}>{tr('care.verified', 'Verified by Movo')}</Text>
            </View>
          </View>
        </View>
        <View style={{ paddingHorizontal: layout.margin, gap: 4 }}>
          <Text variant="title1" weight="800">{name}</Text>
          <Text variant="body" color="textSecondary">{loc(s.profession)}</Text>
          <Text variant="headline" style={{ marginTop: 6 }}>{loc(x.tagline)}</Text>
        </View>

        {/* Big numbers */}
        <View style={{ flexDirection: 'row', gap: space.sm, paddingHorizontal: layout.margin }}>
          <StatTile icon="star.fill" value={s.stars.toFixed(1)} label={tr('care.reviewsShort', '{{n}} reviews', { n: s.reviewCount })} bg={t.colors.blockMint} ink={t.colors.blockMintInk} />
          <StatTile icon="rosette" value={String(s.years)} label={tr('care.yearsExp', 'Years of practice')} bg={t.colors.blockSand} ink={t.colors.blockSandInk} />
          <StatTile icon="person.2.fill" value={`${Math.round(x.patients / 10) * 10}+`} label={tr('care.helped', 'People helped')} bg={t.colors.blockMist} ink={t.colors.blockMistInk} />
        </View>

        <Card title={tr('care.about', 'About')} delay={40}>
          <Text variant="body">{loc(s.bio)}</Text>
          <Text variant="body" color="textSecondary">{loc(x.approach)}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Icon name="clock.fill" size={15} color="accentText" />
            <Text variant="footnote" weight="600" color="accentText">{loc(x.responds)}</Text>
          </View>
        </Card>

        <Card title={tr('care.focus', 'Focus areas')} delay={80}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {x.focus.map((f) => <Chip key={f.label.en} icon={f.icon} label={loc(f.label)} />)}
          </View>
        </Card>

        <Card title={tr('care.howItGoes', 'How a session goes')} delay={120}>
          {x.steps.map(([title, body], i) => (
            <View key={i} style={{ flexDirection: 'row', gap: space.sm }}>
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: t.colors.blockNavy, alignItems: 'center', justifyContent: 'center' }}>
                  <Text variant="headline" weight="800" style={{ color: t.colors.blockNavyInk }}>{i + 1}</Text>
                </View>
                {i < x.steps.length - 1 ? <View style={{ width: 2, flex: 1, minHeight: 16, backgroundColor: t.colors.separator, marginVertical: 4 }} /> : null}
              </View>
              <View style={{ flex: 1, gap: 2, paddingBottom: i < x.steps.length - 1 ? space.sm : 0 }}>
                <Text variant="headline">{loc(title)}</Text>
                <Text variant="subheadline" color="textSecondary">{loc(body)}</Text>
              </View>
            </View>
          ))}
        </Card>

        <View style={{ gap: space.sm }}>
          <Text variant="title3" weight="700" style={{ paddingHorizontal: layout.margin }}>{tr('care.services2', 'Services')}</Text>
          {s.services.map((sv, i) => (
            <Pressable key={sv.id} feedback="scale" onPress={book} accessibilityRole="button" accessibilityLabel={`${loc(sv.name)}, ${sv.minutes} min, ${formatMoney(sv.priceCents)}`}
              style={{ marginHorizontal: layout.margin, flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderRadius: 22, backgroundColor: i === 0 ? t.colors.blockNavy : t.colors.bgElevated }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: i === 0 ? t.colors.accent : t.colors.bgSelected, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={s.kind === 'repair' ? 'wrench.and.screwdriver' : s.kind === 'transport' ? 'car' : i === 0 ? 'heart.fill' : 'stethoscope'} size={20} color={{ raw: i === 0 ? '#013447' : t.colors.accentText }} fill />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="headline" style={i === 0 ? { color: '#FFFFFF' } : undefined}>{loc(sv.name)}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Icon name="clock.fill" size={12} color={{ raw: i === 0 ? 'rgba(255,255,255,0.7)' : t.colors.textSecondary }} />
                  <Text variant="footnote" style={{ color: i === 0 ? 'rgba(255,255,255,0.7)' : t.colors.textSecondary }}>{tr('care.minutes', '{{n}} min', { n: sv.minutes })}</Text>
                </View>
              </View>
              <Text variant="title3" weight="800" tabular style={{ color: i === 0 ? t.colors.accent : t.colors.textPrimary }}>{ltr(formatMoney(sv.priceCents))}</Text>
            </Pressable>
          ))}
        </View>

        <Card title={tr('care.whereSees', 'Where {{name}} sees you', { name: name.replace(/^(Dr\.|د\.)\s*/, '').split(' ')[0] })} delay={160}>
          {s.homeVisit ? (
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="house.fill" size={16} color="accentText" />
                <Text variant="headline">{tr('care.visits', 'Home visits')}</Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{s.areas.map((a) => <Chip key={a} label={a} />)}</View>
            </View>
          ) : null}
          {clinic ? (
            <Pressable feedback="highlight" onPress={() => push(`/place/${clinic.id}`)} accessibilityRole="link" style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
              <View style={{ width: 72, height: 72, borderRadius: 16, overflow: 'hidden' }}><ArtImage image={clinic.hero} aspect={1} radius={16} edge={false} /></View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text variant="headline">{loc(clinic.name)}</Text>
                <Text variant="footnote" color="textSecondary">{loc(clinic.street)}</Text>
                <RatingBadge level={clinic.rating.level} size="mini" />
              </View>
              <Icon name="chevron.right" size={14} weight="semibold" color="textTertiary" mirrorInRTL />
            </Pressable>
          ) : null}
        </Card>

        <Card title={tr('care.credentials', 'Credentials')} delay={200}>
          {([['graduationcap.fill', loc(x.degree)], ['checkmark.seal.fill', loc(x.body)], ['globe.americas.fill', langs.join(' · ')]] as [IconName, string][]).map(([icon, label]) => (
            <View key={icon} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: t.colors.bgSelected, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={icon} size={18} color="accentText" />
              </View>
              <Text variant="body" style={{ flex: 1 }}>{label}</Text>
            </View>
          ))}
        </Card>

        <View style={{ gap: space.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: layout.margin }}>
            <Text variant="title3" weight="700">{tr('place.reviews', 'Reviews')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <StarRating value={s.stars} size={14} label={tr('product.rating', 'Rating')} />
              <Text variant="footnote" color="textSecondary" tabular>{s.stars.toFixed(1)}</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={cardW + space.sm} decelerationRate="fast" contentContainerStyle={{ paddingHorizontal: layout.margin, gap: space.sm }}>
            {s.reviews.map((r, i) => (
              <View key={r.id} style={{ width: cardW, borderRadius: 24, padding: space.lg, gap: space.sm, backgroundColor: [t.colors.blockMist, t.colors.blockSand, t.colors.bgElevated][i % 3] }}>
                <Icon name="quote.opening" size={28} color="accentText" />
                <Text variant="body" style={{ flex: 1 }}>{r.text}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
                  <Avatar name={r.author} hue={i} size={36} />
                  <View style={{ flex: 1 }}>
                    <Text variant="headline">{r.author}</Text>
                    <Text variant="caption1" color="textSecondary">{mobilityLabel(tr, r.mobility)}</Text>
                  </View>
                  <StarRating value={r.stars} size={12} label="" />
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
        <View style={{ height: space.md, borderRadius: radii.tile }} />
      </View>
    </Screen>
  );
}
