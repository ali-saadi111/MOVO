import { specialistPhoto } from '@/art/people';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { sync } from '@/data';
import { paymentLabel } from '@/features/labels';
import { useLang, useLocalized, useT } from '@/i18n';
import { fmtLongDay, fmtTime, useNow } from '@/lib/dates';
import { call } from '@/lib/whatsapp';
import { useActivity } from '@/stores/activity';
import { layout, space } from '@/theme';
import { Avatar, Button, EmptyState, PlanProgress, Screen, Section, Tag, Text, TicketCard, go, useTabNav } from '@/ui';

export default function BookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tr = useT();
  const lang = useLang();
  const loc = useLocalized();
  const { push } = useTabNav();
  const b = useActivity((s) => s.bookings.find((x) => x.id === id));
  const now = useNow();
  if (!b) return <Screen title={tr('booking.title', 'Booking')}><EmptyState symbol="calendar" message={tr('booking.missing', 'We couldn’t find this booking.')} /></Screen>;
  const s = sync.specialist(b.specialistId)!;
  const svc = s.services.find((x) => x.id === b.serviceId) ?? s.services[0];
  const hoursAway = (new Date(b.startsAt).getTime() - now) / 3600e3;
  const cancelled = b.status === 'cancelled';
  return (
    <Screen title={tr('booking.title', 'Booking')} variant="detail" grouped>
      <View style={{ paddingTop: space.md, paddingBottom: space.lg }}>
        <TicketCard
          head={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <Avatar name={s.name} hue={s.avatarHue} size={52} photo={specialistPhoto(s.id)} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="title3" weight="700" numberOfLines={1}>{loc(svc.name)}</Text>
                <Text variant="footnote" color="textSecondary" numberOfLines={1}>{lang === 'ar' ? s.nameAr : s.name} · {loc(s.profession)}</Text>
              </View>
              {cancelled ? <Tag label={tr('booking.cancelled', 'Cancelled')} tone="warning" /> : null}
            </View>
          }
          rows={[
            [[tr('done.date', 'Date'), fmtLongDay(b.startsAt, lang)], [tr('done.time', 'Time'), `${fmtTime(b.startsAt, lang)} – ${fmtTime(new Date(new Date(b.startsAt).getTime() + svc.minutes * 60e3).toISOString(), lang)}`]],
            [[tr('done.where', 'Where'), b.where === 'home' ? tr('care.atHome', 'At your home') : tr('care.atClinic', 'At the clinic')], [tr('pay.header', 'Payment'), b.payment === 'cash' ? tr('booking.payAtSession', 'Pay at the session') : `${paymentLabel(tr, b.payment)} · ${tr('booking.paid', 'Paid')}`]],
          ]}
          pass={cancelled ? undefined : { code: b.id.toUpperCase().replace('_', '-'), label: tr('done.bookingCode', 'Booking code'), lines: [[tr('care.minutes', '{{n}} min', { n: svc.minutes }), 'clock.fill'], [tr('done.showThis', 'Show this if asked'), 'qrcode']] }}
          footer={{ icon: 'mappin', text: b.where === 'home' ? tr('care.homeSub', 'Hamra, Makdessi St, Bldg 14') : loc(sync.place(s.clinic?.placeId ?? '')?.street ?? { en: '', ar: '' }) }}
        />
      </View>
      <Section header={tr('booking.plan', 'Your plan')}>
        <View style={{ padding: space.md }}><PlanProgress done={5} total={8} /></View>
      </Section>
      {!cancelled ? (
        <View style={{ paddingHorizontal: layout.margin, gap: space.xs }}>
          <Button label={tr('booking.call', 'Call {{name}}', { name: s.name.split(' ').slice(-1)[0] })} icon="phone" disabledReason={hoursAway > 24 ? tr('booking.callFrom', 'You can call from the day before') : null} onPress={() => call('+96170000001')} />
          <Button label={tr('booking.reschedule', 'Reschedule')} variant="secondary" onPress={() => push(`/book/${s.id}?where=${b.where}`)} />
          <Button label={tr('booking.cancel', 'Cancel booking')} variant="plain" onPress={() => go.push(`/sheets/confirm?kind=cancelBooking&id=${b.id}`)} />
          <Button label={tr('booking.sessionDemo', 'See session complete')} variant="plain" onPress={() => go.push(`/covers/session-complete?specialist=${s.id}`)} />
        </View>
      ) : null}
    </Screen>
  );
}
