import { useQueryClient } from '@tanstack/react-query';

import { applyDirection } from '@/lib/rtl';
import { useActivity } from '@/stores/activity';
import { useCaregiver } from '@/stores/caregiver';
import { useCart } from '@/stores/cart';
import { useDev, type PaymentOutcome } from '@/stores/dev';
import { KARIM, useSession } from '@/stores/session';
import { useSettings } from '@/stores/settings';
import { ListRow, Section, Sheet, Switch, go } from '@/ui';

/** Draft-only switches for every state the prompt asks to be reviewable. Not translated. */
export default function DevMenu() {
  const d = useDev();
  const qc = useQueryClient();
  const s = useSettings();
  const user = useSession((x) => x.user);
  const acting = useCaregiver((x) => x.actingFor);
  const flip = (k: 'latency' | 'forceError' | 'forceEmpty' | 'offline' | 'homeTab' | 'slotTaken', label: string) => (
    <ListRow title={label} trailing={{ type: 'node', node: <Switch label={label} value={d[k]} onValueChange={(v) => { d.set({ [k]: v }); qc.invalidateQueries(); }} /> }} />
  );
  const outcomes: PaymentOutcome[] = ['success', 'failed', 'slow'];
  return (
    <Sheet title="Developer menu" dismissLabel="done" detent={0.94}>
      <Section header="Data">
        {flip('latency', 'Simulated network delay')}
        {flip('forceError', 'Every request fails')}
        {flip('forceEmpty', 'Every list is empty')}
        {flip('offline', 'Offline')}
        {flip('slotTaken', 'Chosen time gets taken')}
      </Section>
      <Section header="Payment outcome">
        {outcomes.map((o) => <ListRow key={o} title={o} trailing={{ type: 'check', on: d.paymentOutcome === o }} onPress={() => d.set({ paymentOutcome: o })} />)}
      </Section>
      <Section header="App">
        {flip('homeTab', 'Show Home tab')}
        <ListRow title={`Language: ${s.lang === 'ar' ? 'Arabic' : 'English'}`} onPress={() => { const l = s.lang === 'ar' ? 'en' : 'ar'; s.set({ lang: l }); applyDirection(l === 'ar'); }} />
        <ListRow title={user ? 'Sign out' : 'Sign in as Karim'} onPress={() => (user ? useSession.getState().signOut() : useSession.getState().signIn(KARIM))} />
        <ListRow title={acting ? 'Stop acting for Sara' : 'Act for Sara'} onPress={() => useCaregiver.getState().switchTo(acting ? null : 'cp_sara')} />
        <ListRow title="Fill the cart" onPress={() => { useCart.getState().add('prd_reacher-pro-82'); useCart.getState().add('prd_shower-chair-with-back-50'); }} />
        <ListRow title="Replay onboarding" onPress={() => { s.set({ onboarded: false }); go.dismissTo('/language'); }} />
        <ListRow title="Reset my activity" destructive trailing={{ type: 'none' }} onPress={() => { useActivity.persist.clearStorage(); useActivity.persist.rehydrate(); }} />
        <ListRow title="See session complete (Maya)" onPress={() => go.push('/covers/session-complete?specialist=sp_maya')} />
        <ListRow title="Component gallery" onPress={() => go.push('/dev/gallery')} />
      </Section>
    </Sheet>
  );
}
