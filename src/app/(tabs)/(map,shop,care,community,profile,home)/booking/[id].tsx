import { specialistPhoto } from '@/art/people';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { sync } from '@/data';
import { PLAN } from '@/features/care/booking';
import { PlanBars } from '@/features/care/components';
import { paymentLabel } from '@/features/labels';
import { useLang, useLocalized, useT } from '@/i18n';
import { fmtLongDay, fmtTime, useNow } from '@/lib/dates';
import { call, directions, openWhatsApp } from '@/lib/whatsapp';
import { useActivity } from '@/stores/activity';
import { continuous, layout, space, useTheme } from '@/theme';
import { Avatar, EmptyState, Icon, Pressable, Screen, Tag, Text, TicketCard, go, useTabNav } from '@/ui';
import type { IconName } from '@/ui/symbols';

/** Round action under the ticket, like Wallet or a ride app. */
function Action({ icon, label, onPress, disabledNote }: { icon: IconName; label: string; onPress: () => void; disabledNote?: string | null }) {
  const t = useTheme();
  const off = !!disabledNote;
  return (
    <Pressable feedback="scale" onPress={off ? undefined : onPress} disabled={off} accessibilityRole="button" accessibilityLabel={off ? `${label}. ${disabledNote}` : label} accessibilityState={{ disabled: off }}
      style={{ flex: 1, alignItems: 'center', gap: 6, opacity: off ? 0.45 : 1 }}>
      <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: t.colors.bgSelected, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={22} color="accentText" fill />
      </View>
      <Text variant="caption1" weight="600" numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

export default function BookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
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
  const clinic = b.where === 'clinic' && s.clinic ? sync.place(s.clinic.placeId) : null;
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
      {!cancelled ? (
        <>
          <View style={{ flexDirection: 'row', paddingHorizontal: layout.margin }}>
            <Action icon="phone.fill" label={tr('booking.callShort', 'Call')} onPress={() => call('+96170000001')} disabledNote={hoursAway > 24 ? tr('booking.callFrom', 'You can call from the day before') : null} />
            <Action icon="message.fill" label={tr('booking.message', 'Message')} onPress={() => openWhatsApp(`About my booking ${b.id.toUpperCase()} with ${s.name}`)} />
            <Action icon="clock.arrow.circlepath" label={tr('booking.reschedule', 'Reschedule')} onPress={() => push(`/book/${s.id}?where=${b.where}&service=${svc.id}`)} />
            {clinic ? <Action icon="arrow.triangle.turn.up.right.diamond.fill" label={tr('place.directions', 'Directions')} onPress={() => directions(clinic.lat, clinic.lng, loc(clinic.name))} /> : null}
          </View>
          {hoursAway > 24 ? <Text variant="caption1" color="textSecondary" align="center" style={{ marginTop: space.xs, marginHorizontal: layout.margin }}>{tr('booking.callFrom', 'You can call from the day before')}</Text> : null}
        </>
      ) : null}
      <View accessibilityLabel={tr('plan.a11y', '{{done}} sessions done, {{left}} to go', { done: PLAN.done, left: PLAN.total - PLAN.done })}
        style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginHorizontal: layout.margin, marginTop: space.lg, padding: space.md, borderRadius: 16, ...continuous, backgroundColor: t.colors.bgElevated }}>
        <Text variant="subheadline" weight="600" tabular>{tr('care.yourPlan', 'Your plan')}</Text>
        <PlanBars done={PLAN.done} total={PLAN.total} />
        <Text variant="footnote" color="textSecondary" tabular>{tr('care.planShort', '{{done}} of {{total}}', { done: PLAN.done, total: PLAN.total })}</Text>
      </View>
      {!cancelled ? (
        <Pressable feedback="highlight" onPress={() => go.push(`/sheets/confirm?kind=cancelBooking&id=${b.id}`)} accessibilityRole="button" style={{ alignSelf: 'center', paddingVertical: space.md, paddingHorizontal: space.lg, marginTop: space.md, marginBottom: space.lg }}>
          <Text variant="body" weight="600" color="danger">{tr('booking.cancel', 'Cancel booking')}</Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}
