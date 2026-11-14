import { useLocalSearchParams } from 'expo-router';

import { sync } from '@/data';
import { SAVED_ADDRESSES } from '@/features/shop/checkout';
import { useCareDraft, whereFor } from '@/features/care/booking';
import { useLocalized, useT } from '@/i18n';
import { haptic } from '@/lib/haptics';
import { formatMoney } from '@/lib/money';
import { ltr } from '@/lib/rtl';
import { ListRow, PaymentMethodPicker, Section, Sheet, go } from '@/ui';

type Kind = 'address' | 'where' | 'service' | 'pay';

/** Change one booking choice. Every pick saves straight away and closes the sheet. */
export default function CareEdit() {
  const { kind = 'where', id = '' } = useLocalSearchParams<{ kind?: Kind; id?: string }>();
  const tr = useT();
  const loc = useLocalized();
  const [d, set] = useCareDraft();
  const s = sync.specialist(id);
  const clinic = s?.clinic ? sync.place(s.clinic.placeId) : null;
  const where = s ? whereFor(s, d.where) : d.where;
  const pick = (patch: Parameters<typeof set>[0]) => { haptic.selection(); set(patch); go.back(); };
  const title = { address: tr('care.visitsTo', 'Visits to'), where: tr('care.whereTitle', 'Where'), service: tr('care.serviceTitle', 'Service'), pay: tr('checkout.payWithHeader', 'Pay with') }[kind];

  return (
    <Sheet title={title} dismissLabel="done" detent={kind === 'pay' ? 0.62 : 0.5}>
      {kind === 'pay' ? (
        <PaymentMethodPicker value={d.pay} onChange={(m) => pick({ pay: m })} cashLabel={tr('pay.cashSession', 'Pay cash at the session')} />
      ) : kind === 'service' && s ? (
        <Section>
          {s.services.map((sv) => (
            <ListRow key={sv.id} icon="stethoscope" title={loc(sv.name)} subtitle={`${tr('care.minutes', '{{n}} min', { n: sv.minutes })} · ${ltr(formatMoney(sv.priceCents))}`} trailing={{ type: 'check', on: (d.service || s.services[0].id) === sv.id }} onPress={() => pick({ service: sv.id })} />
          ))}
        </Section>
      ) : (
        <Section header={kind === 'where' && s?.homeVisit ? tr('care.homeVisit', 'Home visit') : undefined}>
          {kind === 'address' || s?.homeVisit
            ? SAVED_ADDRESSES.map((a) => <ListRow key={a.id} icon="house.fill" title={a.title} subtitle={a.sub} subtitleLines={1} trailing={{ type: 'check', on: where === 'home' && d.addr === a.id }} onPress={() => pick({ where: 'home', addr: a.id })} />)
            : null}
          {kind === 'where' && clinic ? (
            <ListRow icon="building.2" title={loc(clinic.name)} subtitle={`${tr('care.atClinic', 'At the clinic')} · ${loc(clinic.street)}`} subtitleLines={1} trailing={{ type: 'check', on: where === 'clinic' }} onPress={() => pick({ where: 'clinic' })} />
          ) : null}
        </Section>
      )}
    </Sheet>
  );
}
