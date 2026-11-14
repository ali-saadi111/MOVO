import { View } from 'react-native';

import { HeroArt } from '@/art/HeroArt';
import type { ServiceKind } from '@/data';
import { useSpecialists } from '@/data/queries';
import { FacesRail, NextSessionCard, ServiceGrid } from '@/features/care/components';
import { CanvasActions } from '@/features/shell/HeaderButtons';
import { useT } from '@/i18n';
import { useActivity } from '@/stores/activity';
import { useCaregiver } from '@/stores/caregiver';
import { space } from '@/theme';
import { ActingForBar, BlockCard, CanvasHeader, Screen, SectionHeader, useTabNav } from '@/ui';
import { tabRoot } from '@/ui/TabRoot';

const KINDS: ServiceKind[] = ['physio', 'nursing', 'ot', 'prosthetics', 'repair', 'transport'];
const SEEN = ['sp_maya', 'sp_joelle', 'sp_tony', 'sp_rola'];

/** One screen: next session (with plan progress), services to book, people you've seen. */
function CareHome() {
  const tr = useT();
  const { push } = useTabNav();
  const q = useSpecialists();
  const next = useActivity((s) => s.bookings.filter((b) => b.status === 'upcoming').sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0]);
  const switchTo = useCaregiver((s) => s.switchTo);
  const seen = SEEN.map((id) => (q.data ?? []).find((s) => s.id === id)).filter((s) => !!s);
  return (
    <Screen title={tr('tab.care', 'Care')} variant="canvas" fill refreshing={q.isRefetching} onRefresh={() => q.refetch()}
      header={<CanvasHeader title={tr('care.title', 'Your care')} actions={<CanvasActions />} />}>
      <ActingForBar onSwitchBack={() => switchTo(null)} />
      {next ? (
        <NextSessionCard startsAt={next.startsAt} specialistId={next.specialistId} where={next.where} onPress={() => push(`/booking/${next.id}`)} />
      ) : (
        <BlockCard tone="mint" minHeight={150} eyebrow={tr('care.noneEyebrow', 'Care that comes to you')} title={tr('care.noneTitle', 'Book a licensed specialist')} body={tr('care.noneBody', 'Physio, nursing and repairs at home.')} art={<HeroArt name="care" size={130} />} onPress={() => push('/specialists/physio')} />
      )}
      <SectionHeader title={tr('care.services', 'Book a specialist')} style={{ marginTop: space.md }} />
      {/* The grid takes the spare height, so the page ends at the tab bar instead of leaving a gap. */}
      <ServiceGrid kinds={KINDS} onPress={(k) => push(`/specialists/${k}`)} style={{ flexGrow: 1 }} />
      {q.isLoading || seen.length ? (
        <View style={{ marginTop: space.md }}>
          <SectionHeader title={tr('care.past', 'Your specialists')} />
          <FacesRail people={seen} loading={q.isLoading} />
        </View>
      ) : null}
    </Screen>
  );
}

export default tabRoot('(care)', '/(tabs)/(care)/care', CareHome);
