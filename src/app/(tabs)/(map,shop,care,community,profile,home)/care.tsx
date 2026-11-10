import { View } from 'react-native';

import { HeroArt } from '@/art/HeroArt';
import type { ServiceKind } from '@/data';
import { useSpecialists } from '@/data/queries';
import { CanvasActions } from '@/features/shell/HeaderButtons';
import { serviceIcon, serviceLabel } from '@/features/labels';
import { useT } from '@/i18n';
import { useActivity } from '@/stores/activity';
import { useCaregiver } from '@/stores/caregiver';
import { layout, space } from '@/theme';
import {
  ActingForBar, BlockCard, BlockTile, BookingHeroCard, CanvasHeader, Divider, Screen, SectionHeader, Skeleton, SpecialistRow, StatTile, TONES, go, useTabNav,
} from '@/ui';
import { tabRoot } from '@/ui/TabRoot';

const KINDS: ServiceKind[] = ['physio', 'nursing', 'ot', 'prosthetics', 'repair', 'transport'];

function CareHome() {
  const tr = useT();
  const { push } = useTabNav();
  const q = useSpecialists();
  const next = useActivity((s) => s.bookings.filter((b) => b.status === 'upcoming').sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0]);
  const switchTo = useCaregiver((s) => s.switchTo);
  const past = (q.data ?? []).filter((s) => ['sp_maya', 'sp_tony', 'sp_joelle'].includes(s.id));
  return (
    <Screen title={tr('tab.care', 'Care')} variant="canvas" refreshing={q.isRefetching} onRefresh={() => q.refetch()}
      header={<CanvasHeader title={tr('care.title', 'Your care')} actions={<CanvasActions />} />}>
      <ActingForBar onSwitchBack={() => switchTo(null)} />
      {next ? (
        <View style={{ marginBottom: space.md }}>
          <BookingHeroCard startsAt={next.startsAt} specialistId={next.specialistId} where={next.where} onPress={() => push(`/booking/${next.id}`)} actionLabel={tr('care.seeBooking', 'See booking')} />
        </View>
      ) : (
        <View style={{ marginBottom: space.md }}>
          <BlockCard tone="mint" eyebrow={tr('care.noneEyebrow', 'Care that comes to you')} title={tr('care.noneTitle', 'Book a licensed specialist')} body={tr('care.noneBody', 'Physio, nursing and repairs at home.')} art={<HeroArt name="care" size={180} />} onPress={() => push('/specialists/physio')} />
        </View>
      )}
      <View style={{ flexDirection: 'row', gap: space.sm, paddingHorizontal: layout.margin, marginBottom: space.xxl }}>
        <StatTile value={5} label={tr('care.statDone', 'Sessions done')} icon="checkmark.seal.fill" tone="mint" index={0} onPress={next ? () => push(`/booking/${next.id}`) : undefined} />
        <StatTile value={3} label={tr('care.statLeft', 'To go in your plan')} icon="flame" tone="sand" index={1} />
        <StatTile value={3} label={tr('care.statSpecialists', 'Specialists you’ve seen')} icon="person.2" tone="mist" index={2} />
      </View>
      <SectionHeader title={tr('care.services', 'Book a specialist')} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, paddingHorizontal: layout.margin, marginBottom: space.xxl }}>
        {KINDS.map((k, i) => (
          <BlockTile key={k} tone={TONES[i % 4]} icon={serviceIcon[k]} label={serviceLabel(tr, k)} index={i} onPress={() => go.push(`/sheets/choose-where?kind=${k}`)} />
        ))}
      </View>
      <SectionHeader title={tr('care.past', 'Your specialists')} />
      {q.isLoading ? (
        <View style={{ paddingHorizontal: layout.margin, gap: space.md }}>{[0, 1].map((i) => <View key={i} style={{ flexDirection: 'row', gap: 12 }}><Skeleton shape="circle" width={56} height={56} /><View style={{ flex: 1, gap: 8 }}><Skeleton shape="text" width="60%" /><Skeleton shape="text" width="40%" /></View></View>)}</View>
      ) : past.map((s, i) => (
        <View key={s.id}>{i > 0 ? <Divider inset={layout.margin + 56 + space.sm} /> : null}<SpecialistRow s={s} index={i} onPress={() => push(`/specialist/${s.id}`)} /></View>
      ))}
    </Screen>
  );
}

export default tabRoot('(care)', '/(tabs)/(care)/care', CareHome);
