import { useState } from 'react';
import { View } from 'react-native';

import { mobilityIcon, mobilityLabel } from '@/features/labels';
import { useT } from '@/i18n';
import { useCaregiver } from '@/stores/caregiver';
import { useSettings, type Mobility } from '@/stores/settings';
import { Button, go, Text, TextField } from '@/ui';
import { ChatBody, ChatHeader, MeSays, MovoSays, ReplyChip, ReplyChips, ReplyTray, useChatColors } from '@/features/onboarding/chat';

const MOBS: Mobility[] = ['manual', 'power', 'walker-crutches', 'other'];
const RELS = ['Parent', 'Child', 'Partner', 'Other'];

/** Question 2 for carers: the person they care for. The answers build up as one message. */
export default function CaregiverPerson() {
  const tr = useT();
  const c = useChatColors();
  const set = useSettings((s) => s.set);
  const add = useCaregiver((s) => s.add);
  const [name, setName] = useState('');
  const [mob, setMob] = useState<Mobility[]>([]);
  const [rel, setRel] = useState<string | null>(null);
  const relLabel = (r: string) => tr(`rel.${r.toLowerCase()}`, r);
  const summary = [name.trim(), rel ? relLabel(rel) : null, ...MOBS.filter((m) => mob.includes(m)).map((m) => mobilityLabel(tr, m))].filter(Boolean).join(' · ');
  const label = (s: string) => <Text variant="caption1" weight="700" style={{ color: c.muted, textTransform: 'uppercase', letterSpacing: 0.6 }}>{s}</Text>;
  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <ChatHeader step={2} total={2} />
      <ChatBody>
        <MovoSays lines={[tr('onb.chat.who.q1', 'First, who will use Movo?')]} typing={0} />
        <MeSays lines={[tr('onb.who.someone', 'Someone I care for')]} delay={0} />
        <MovoSays delay={150} lines={[tr('onb.chat.person.q', 'Tell me about the person you care for.'), tr('onb.chat.person.q2', 'Their first name and how they get around is enough.')]} />
        {summary ? <MeSays lines={[summary]} /> : null}
      </ChatBody>
      <ReplyTray delay={700} footer={
        <Button label={tr('onb.finish', 'Start exploring')} disabledReason={name.trim() ? null : tr('person.needName', 'Add their first name')}
          onPress={() => { add({ id: `cp_${Date.now()}`, firstName: name.trim(), mobility: mob, relationship: rel ?? 'Other' }); set({ onboarded: true }); go.replace('/'); }} />
      }>
        <TextField label={tr('person.name', 'First name')} value={name} onChangeText={setName} autoComplete="name" textContentType="name" />
        {label(tr('person.rel', 'They are my…'))}
        <ReplyChips role="radiogroup">
          {RELS.map((r) => <ReplyChip key={r} label={relLabel(r)} selected={rel === r} onPress={() => setRel(rel === r ? null : r)} />)}
        </ReplyChips>
        {label(tr('person.move', 'How they move'))}
        <ReplyChips>
          {MOBS.map((m) => <ReplyChip key={m} grid multi icon={mobilityIcon[m]} label={mobilityLabel(tr, m)} selected={mob.includes(m)} onPress={() => setMob((cur) => (cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m]))} />)}
        </ReplyChips>
      </ReplyTray>
    </View>
  );
}
