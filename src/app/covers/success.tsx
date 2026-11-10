import { useLocalSearchParams } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { specialistPhoto } from '@/art/people';
import { sync } from '@/data';
import { paymentLabel } from '@/features/labels';
import { useLang, useLocalized, useT } from '@/i18n';
import { fmtTime } from '@/lib/dates';
import { formatMoney } from '@/lib/money';
import { ltr } from '@/lib/rtl';
import { useActivity } from '@/stores/activity';
import { layout, space, useTheme } from '@/theme';
import {
  ArtImage, Avatar, Button, Celebration, GlowBackdrop, Pressable, PulseRings, SuccessTick, Text, TicketCard, WalletGlyph, go, showBanner,
} from '@/ui';

const HOME_ADDRESS = 'Hamra, Makdessi St, Bldg 14';

/** Confirmations as tickets: a glowing tick, one line, then a ticket you could show at the door. */
export default function Success() {
  const p = useLocalSearchParams<Record<string, string>>();
  const t = useTheme();
  const tr = useT();
  const lang = useLang();
  const loc = useLocalized();
  const insets = useSafeAreaInsets();
  const orders = useActivity((s) => s.orders);
  const total = p.total ? ltr(formatMoney(Number(p.total))) : '';
  const dayFmt = (iso: string) => new Intl.DateTimeFormat(lang === 'ar' ? 'ar-LB-u-nu-latn' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(iso));

  let title = '';
  let subtitle = '';
  let ticket: ReactNode = null;
  let primary: { label: string; go: () => void; wallet?: boolean } = { label: tr('common.done', 'Done'), go: () => go.dismissTo('/') };
  let secondary: { label: string; go: () => void } | null = null;

  if (p.flow === 'booking') {
    const sp = sync.specialist(p.specialist);
    const svc = sp?.services[0];
    const end = svc ? new Date(new Date(p.at).getTime() + svc.minutes * 60e3).toISOString() : p.at;
    title = tr('done.bookingTitle', 'Booking confirmed!');
    subtitle = tr('done.bookingSub', 'See you on {{when}}', { when: dayFmt(p.at) });
    ticket = sp ? (
      <TicketCard
        head={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <Avatar name={sp.name} hue={sp.avatarHue} size={52} photo={specialistPhoto(sp.id)} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="title3" weight="700" numberOfLines={1}>{svc ? loc(svc.name) : loc(sp.profession)}</Text>
              <Text variant="footnote" color="textSecondary" numberOfLines={1}>{lang === 'ar' ? sp.nameAr : sp.name} · {loc(sp.profession)}</Text>
            </View>
          </View>
        }
        rows={[
          [[tr('done.date', 'Date'), dayFmt(p.at)], [tr('done.time', 'Time'), `${fmtTime(p.at, lang)} – ${fmtTime(end, lang)}`]],
          [[tr('done.where', 'Where'), p.where === 'clinic' ? tr('care.atClinic', 'At the clinic') : tr('care.atHome', 'At your home')], [p.method === 'cash' ? tr('pay.header', 'Payment') : tr('done.paid', 'Paid'), p.method === 'cash' ? tr('pay.cashSessionShort', 'Cash at the session') : `${total} · ${paymentLabel(tr, p.method)}`]],
        ]}
        pass={{ code: p.id || 'BK-1042', label: tr('done.bookingCode', 'Booking code'), lines: [[svc ? tr('care.minutes', '{{n}} min', { n: svc.minutes }) : '', 'clock.fill'], [tr('done.showThis', 'Show this if asked'), 'qrcode']] }}
        footer={{ icon: 'mappin', text: p.where === 'clinic' && sp.clinic ? loc(sync.place(sp.clinic.placeId)?.street ?? { en: '', ar: '' }) : HOME_ADDRESS }}
      />
    ) : null;
    primary = { label: tr('done.wallet', 'Add to Apple Wallet'), go: () => go.dismissTo('/(tabs)/(care)/care'), wallet: true };
    secondary = { label: tr('common.done', 'Done'), go: () => go.dismissTo('/(tabs)/(care)/care') };
  } else if (p.flow === 'order') {
    const o = orders.find((x) => x.id === p.id);
    const lines = (o?.lines ?? []).map((l) => ({ ...l, product: sync.product(l.productId) })).filter((l) => l.product);
    const count = lines.reduce((n, l) => n + l.qty, 0);
    title = tr('done.orderTitle', 'Order placed!');
    subtitle = tr('done.orderSub', 'We’re packing it now');
    ticket = (
      <TicketCard
        head={
          <View style={{ gap: space.sm }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {lines.slice(0, 3).map((l) => (
                <View key={l.productId} style={{ flex: 1, maxWidth: 96, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: t.colors.separator }}>
                  <ArtImage image={l.product!.images[0]} aspect={1} tile radius={18} edge={false} />
                  {l.qty > 1 ? <View style={{ position: 'absolute', top: 6, end: 6, minWidth: 22, height: 22, borderRadius: 11, backgroundColor: t.colors.blockNavy, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 }}><Text variant="caption1" weight="800" style={{ color: '#FFFFFF' }}>×{l.qty}</Text></View> : null}
                </View>
              ))}
            </View>
            <View>
              <Text variant="title3" weight="700">{tr('done.orderNumber', 'Order {{id}}', { id: ltr(`#${p.id}`) })}</Text>
              <Text variant="footnote" color="textSecondary" numberOfLines={1}>{lines.map((l) => loc(l.product!.name)).join(' · ')}</Text>
            </View>
          </View>
        }
        rows={[
          [[tr('done.items', 'Items'), String(count || 1)], [tr('cart.total', 'Total'), total]],
          [[tr('pay.header', 'Payment'), p.method === 'cash' ? tr('pay.cashDelivery', 'Cash on delivery') : paymentLabel(tr, p.method)], [tr('done.eta', 'Arrives'), tr('done.etaShort', 'Tomorrow')]],
        ]}
        barcode={p.id || 'M-1041'}
        footer={{ icon: 'shippingbox', text: HOME_ADDRESS }}
      />
    );
    primary = { label: tr('done.track', 'Track order'), go: () => { go.dismissTo('/(tabs)/(shop)/shop'); setTimeout(() => go.push(`/(tabs)/(shop)/order/${p.id}`), 50); } };
    secondary = { label: tr('done.backShop', 'Back to shop'), go: () => go.dismissTo('/(tabs)/(shop)/shop') };
  } else if (p.flow === 'event') {
    const ev = sync.event(p.event);
    const venue = ev ? sync.place(ev.venuePlaceId) : null;
    title = tr('done.eventTitle', 'You’re in!');
    subtitle = ev ? tr('done.eventSub', 'See you there on {{when}}', { when: dayFmt(ev.startsAt) }) : '';
    ticket = ev ? (
      <TicketCard
        image={<ArtImage image={ev.image} aspect={16 / 9} radius={20} edge={false} />}
        head={
          <View style={{ gap: 2 }}>
            <Text variant="title3" weight="700">{loc(ev.title)}</Text>
            <Text variant="footnote" color="textSecondary">{loc(ev.area)} · {ev.sponsor}</Text>
          </View>
        }
        rows={[
          [[tr('done.date', 'Date'), dayFmt(ev.startsAt)], [tr('done.time', 'Time'), `${fmtTime(ev.startsAt, lang)} – ${fmtTime(ev.endsAt, lang)}`]],
          [[tr('done.entry', 'Entry'), ev.priceCents ? ltr(formatMoney(ev.priceCents)) : tr('common.free', 'Free')], [tr('done.spot', 'Spot'), ltr(p.id)]],
        ]}
        pass={{ code: p.id || 'EV-0001', label: tr('done.code', 'Your spot code'), lines: [[tr('done.stepFree', 'Step-free entrance'), 'figure.roll'], [tr('done.showThis', 'Show this if asked'), 'qrcode']] }}
        footer={{ icon: 'mappin', text: venue ? `${loc(venue.name)}, ${loc(venue.street)}` : loc(ev.area) }}
      />
    ) : null;
    primary = { label: tr('done.wallet', 'Add to Apple Wallet'), go: () => go.dismissTo('/(tabs)/(community)/community'), wallet: true };
    secondary = { label: tr('common.done', 'Done'), go: () => go.dismissTo('/(tabs)/(community)/community') };
  } else if (p.flow === 'donation') {
    const c = sync.campaign(p.campaign);
    title = tr('done.donationTitle', 'Thank you!');
    subtitle = tr('donate.keepsNothing', 'Movo keeps nothing from donations.');
    ticket = c ? (
      <TicketCard
        head={
          <View style={{ gap: 2 }}>
            <Text variant="caption1" color="textSecondary">{tr('done.youGave', 'You gave')}</Text>
            <Text tabular style={{ fontSize: 44, lineHeight: 48, fontWeight: '800', color: t.colors.textPrimary }}>{total}</Text>
          </View>
        }
        rows={[[[tr('done.to', 'To'), loc(c.title)], [tr('done.via', 'Through'), c.ngo]], [[tr('pay.header', 'Payment'), paymentLabel(tr, p.method)], [tr('done.receipt', 'Receipt'), ltr(p.id)]]]}
        footer={{ icon: 'heart.fill', text: tr('done.receiptMail', 'A receipt is on its way to your email') }}
      />
    ) : null;
    primary = { label: tr('common.done', 'Done'), go: () => go.dismissTo('/(tabs)/(community)/community') };
  }

  const flow = p.flow;
  const at = p.at;
  useEffect(() => {
    if (flow !== 'booking' || !at) return;
    const timer = setTimeout(() => showBanner({
      icon: 'bell.fill', tone: 'navy',
      title: tr('banner.reminderTitle', 'Reminder set'),
      body: tr('banner.reminderBody', 'We’ll remind you the evening before, and 1 hour before {{time}}.', { time: fmtTime(at, lang) }),
    }), 1800);
    return () => clearTimeout(timer);
  }, [flow, at, tr, lang]);

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bgGrouped, paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, space.md) }}>
      <GlowBackdrop />
      <ScrollView contentContainerStyle={{ paddingTop: space.xxl, paddingBottom: space.lg }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', gap: space.sm, paddingHorizontal: layout.margin, marginBottom: space.xl }}>
          <View style={{ width: 120, height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: space.xs }}>
            <View style={{ position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(34,211,156,0.18)' }} />
            <PulseRings size={96} />
            <Celebration size={300} />
            <SuccessTick size={84} />
          </View>
          <Animated.View entering={t.reduceMotion ? undefined : FadeInDown.delay(300).springify().damping(24).stiffness(170)} style={{ alignItems: 'center', gap: 4 }}>
            <Text variant="title1" weight="800" align="center" accessibilityRole="header" style={{ color: t.colors.accentText }}>{title}</Text>
            {subtitle ? <Text variant="subheadline" color="textSecondary" align="center">{subtitle}</Text> : null}
          </Animated.View>
        </View>
        {ticket}
      </ScrollView>
      <View style={{ paddingHorizontal: layout.margin, gap: space.xs, paddingTop: space.xs }}>
        {primary.wallet ? (
          <Animated.View entering={t.reduceMotion ? undefined : ZoomIn.delay(700).springify().damping(18)}>
            <Pressable feedback="scale" onPress={primary.go} accessibilityRole="button" accessibilityLabel={primary.label}
              style={{ height: 56, borderRadius: 28, backgroundColor: '#000000', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <WalletGlyph />
              <Text variant="headline" weight="600" style={{ color: '#FFFFFF' }}>{primary.label}</Text>
            </Pressable>
          </Animated.View>
        ) : <Button label={primary.label} onPress={primary.go} />}
        {secondary ? <Button label={secondary.label} variant="plain" onPress={secondary.go} /> : null}
      </View>
    </View>
  );
}

