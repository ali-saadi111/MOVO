import { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useCaregiver } from '@/stores/caregiver';
import { mobilityIcon, mobilityLabel } from '@/features/labels';
import { deviceLang, useT, type Tr } from '@/i18n';
import { applyDirection } from '@/lib/rtl';
import { useSettings, type Lang, type Mobility } from '@/stores/settings';
import { continuous, space, useTheme } from '@/theme';
import { Button, go, Pressable, Text, TextField } from '@/ui';
import {
  ChatBody, ChatHeader, FeatureList, MeSays, MovoSays, ReplyChip, ReplyChips, ReplyRow, ReplyTray, useChatColors,
} from '@/features/onboarding/chat';

/**
 * The whole onboarding as one conversation in one chat window: language, what Movo does,
 * who it's for, then how you move (or the person you care for). Each answer stays in the
 * thread as your own message and the next question arrives below it. Back undoes the last answer.
 */

type Who = 'me' | 'someone';
type Stage = 'lang' | 'intro' | 'who' | 'move' | 'person' | 'done';

const LABEL: Record<Lang, string> = { en: 'English', ar: 'العربية' };
const MOVES: Mobility[] = ['manual', 'power', 'walker-crutches', 'other', 'none'];
const PERSON_MOVES: Mobility[] = ['manual', 'power', 'walker-crutches', 'other'];
const RELS = ['Parent', 'Child', 'Partner', 'Other'];

/** What Movo says back, so the person sees what their answer changes. */
function moveReply(tr: Tr, sel: Mobility[]) {
  if (sel.includes('manual') || sel.includes('power')) return tr('onb.chat.m.wheel', "Got it. I'll show places with step-free entrances and wide doors first.");
  if (sel.includes('walker-crutches')) return tr('onb.chat.m.walk', "Got it. I'll show places with few steps and handrails first.");
  if (sel.includes('other')) return tr('onb.chat.m.other', 'Thanks. Tell me more below if you like.');
  return tr('onb.chat.m.none', "No problem. You'll see every place with all its details.");
}

export default function OnboardingChat() {
  const tr = useT();
  const c = useChatColors();
  const settings = useSettings();
  const addPerson = useCaregiver((s) => s.add);
  const current: Lang = (useSettings.getState().lang ?? deviceLang()) === 'ar' ? 'ar' : 'en';

  // The answers so far. The stage is derived from them, so Back just clears the last one.
  const [lang, setLang] = useState<Lang | null>(null);
  const [started, setStarted] = useState(false);
  const [who, setWho] = useState<Who | null>(null);
  const [whoPick, setWhoPick] = useState<Who | null>(null);
  const [moves, setMoves] = useState<Mobility[]>([]);
  const [other, setOther] = useState('');
  const [name, setName] = useState('');
  const [pMoves, setPMoves] = useState<Mobility[]>([]);
  const [rel, setRel] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const stage: Stage = done ? 'done' : !lang ? 'lang' : !started ? 'intro' : !who ? 'who' : who === 'me' ? 'move' : 'person';
  const step = stage === 'who' ? 1 : stage === 'move' || stage === 'person' || stage === 'done' ? 2 : undefined;

  const back = () => {
    if (stage === 'move' || stage === 'person') { setWho(null); return; }
    if (stage === 'who') { setStarted(false); return; }
    if (stage === 'intro') setLang(null);
  };

  const chooseLang = (l: Lang) => { settings.set({ lang: l }); setLang(l); };

  const finish = () => {
    if (who === 'me') settings.set({ forWhom: 'me', mobility: moves, mobilityOther: other });
    else {
      settings.set({ forWhom: 'someone' });
      addPerson({ id: `cp_${Date.now()}`, firstName: name.trim(), mobility: pMoves, relationship: rel ?? 'Other' });
    }
    setDone(true);
    // Let the last messages land, then open the app. On iOS an Arabic choice flips the layout here.
    setTimeout(async () => {
      settings.set({ onboarded: true });
      go.replace('/');
      await applyDirection(lang === 'ar');
    }, 1700);
  };

  const pickedMoves = MOVES.filter((m) => moves.includes(m)).map((m) => mobilityLabel(tr, m));
  const relLabel = (r: string) => tr(`rel.${r.toLowerCase()}`, r);
  const personSummary = [name.trim(), rel ? relLabel(rel) : null, ...PERSON_MOVES.filter((m) => pMoves.includes(m)).map((m) => mobilityLabel(tr, m))].filter(Boolean).join(' · ');
  const label = (s: string) => <Text variant="caption1" weight="700" style={{ color: c.muted, textTransform: 'uppercase', letterSpacing: 0.6 }}>{s}</Text>;

  return (
    <View style={{ flex: 1, backgroundColor: c.screen }}>
      <ChatHeader back={stage !== 'lang' && stage !== 'done'} onBack={back} step={step} total={step ? 2 : undefined} />
      <ChatBody>
        {/* 1. Hello and language, in both languages until one is picked. */}
        <MovoSays delay={250} lines={["Hi, I'm Movo 👋", 'I help you find places, gear and care that work for the way you move.', 'Which language should we talk in?']} />
        <MovoSays delay={1700} typing={450} lines={[{ text: 'مرحبا، أنا موڤو. بأي لغة نتكلم؟', lang: 'ar' }]} />

        {/* 2. What Movo does. */}
        {lang ? (
          <>
            <MeSays lines={[LABEL[lang]]} />
            <MovoSays delay={250} lines={[tr('onb.chat.w.hi', "Great. Here's what I can do for you:")]}
              extra={<FeatureList items={[
                { icon: 'checkmark.seal.fill', title: tr('onb.chat.w.c1', 'Places checked in person'), line: tr('onb.chat.w.c1s', 'Step-free entrance, wide door, toilet') },
                { icon: 'house.fill', title: tr('onb.chat.w.c2', 'Gear and care at home'), line: tr('onb.chat.w.c2s', 'Delivered, or a specialist who visits') },
                { icon: 'person.3', title: tr('onb.chat.w.c3', 'Move together'), line: tr('onb.chat.w.c3s', 'Sports, workshops and meetups') },
              ]} />}
              after={[tr('onb.chat.w.next', 'Two quick questions, so I can show you what fits first.')]} />
          </>
        ) : null}

        {/* 3. Who is Movo for. */}
        {started ? (
          <>
            <MeSays lines={[tr('onb.chat.w.go', "Let's go")]} />
            <MovoSays delay={250} lines={[tr('onb.chat.who.q1', 'First, who will use Movo?')]} />
          </>
        ) : null}

        {/* 4a. How you move, or 4b. the person you care for. */}
        {who ? (
          <>
            <MeSays lines={[who === 'me' ? tr('onb.chat.who.me', 'Just me') : tr('onb.who.someone', 'Someone I care for')]} />
            {who === 'me'
              ? <MovoSays delay={250} lines={[tr('onb.chat.who.rMe1', 'Got it. One more question about you.'), tr('onb.chat.m.q', 'How do you get around?'), tr('onb.chat.m.q2', 'Pick all that apply.')]} />
              : <MovoSays delay={250} lines={[tr('onb.chat.who.rSomeone1', 'Lovely. Next, tell me a little about them. You can add more people later.'), tr('onb.chat.person.q', 'Tell me about the person you care for.'), tr('onb.chat.person.q2', 'Their first name and how they get around is enough.')]} />}
          </>
        ) : null}

        {/* 5. The last answer and Movo's goodbye. */}
        {done ? (
          <>
            <MeSays lines={[who === 'me' ? pickedMoves.join(', ') : personSummary]} />
            <MovoSays delay={200} lines={[who === 'me' ? moveReply(tr, moves) : tr('onb.chat.person.done', 'Thanks. I\'ll keep them in mind.'), tr('onb.chat.done', "You're all set. Let's explore!")]} />
          </>
        ) : null}
      </ChatBody>

      {stage === 'lang' ? (
        <ReplyTray key="lang" delay={2300} label={tr('onb.chat.reply', 'Your reply')} footer={
          <View style={{ gap: 8 }} accessibilityRole="radiogroup">
            {/* The device language is the main button, in the same slot as Continue later on. */}
            <LangButton label={LABEL[current === 'ar' ? 'en' : 'ar']} primary={false} onPress={() => chooseLang(current === 'ar' ? 'en' : 'ar')} />
            <LangButton label={LABEL[current]} primary onPress={() => chooseLang(current)} />
            <Text variant="caption1" style={{ color: c.muted, textAlign: 'center', marginTop: 2 }}>{tr('onb.lang.sub', 'You can change this any time in Settings.')}</Text>
          </View>
        } />
      ) : null}

      {stage === 'intro' ? (
        <ReplyTray key="intro" delay={1500} footer={<Button label={tr('onb.chat.w.go', "Let's go")} icon="arrow.right" onPress={() => setStarted(true)} />} />
      ) : null}

      {stage === 'who' ? (
        <ReplyTray key="who" delay={900} label={tr('onb.chat.reply', 'Your reply')} footer={
          <Button label={tr('onb.chat.send', 'Send')} icon="arrow.up" disabledReason={whoPick ? null : tr('onb.who.choose', 'Choose one')} onPress={() => setWho(whoPick)} />
        }>
          <View style={{ gap: 8 }} accessibilityRole="radiogroup">
            <ReplyRow icon="person.fill" title={tr('onb.chat.who.me', 'Just me')} sub={tr('onb.chat.who.meSub', 'I use Movo for myself')} selected={whoPick === 'me'} onPress={() => setWhoPick('me')} />
            <ReplyRow icon="heart.fill" title={tr('onb.who.someone', 'Someone I care for')} sub={tr('onb.chat.who.someoneSub', 'A parent, child or partner')} selected={whoPick === 'someone'} onPress={() => setWhoPick('someone')} />
          </View>
        </ReplyTray>
      ) : null}

      {stage === 'move' ? (
        <ReplyTray key="move" delay={1300} label={tr('onb.chat.replyMany', 'Your reply · pick any')} footer={
          <Button label={tr('onb.finish', 'Start exploring')} disabledReason={moves.length ? null : tr('onb.move.choose', 'Choose at least one')} onPress={finish} />
        }>
          <ReplyChips>
            {MOVES.map((m) => (
              <ReplyChip key={m} grid multi icon={mobilityIcon[m]} label={mobilityLabel(tr, m)} selected={moves.includes(m)}
                onPress={() => setMoves((cur) => (m === 'none' ? (cur.includes('none') ? [] : ['none']) : cur.includes(m) ? cur.filter((x) => x !== m) : [...cur.filter((x) => x !== 'none'), m]))} />
            ))}
          </ReplyChips>
          {moves.includes('other') ? <Animated.View entering={FadeInDown}><TextField label={tr('onb.move.otherLabel', 'Tell us more (optional)')} value={other} onChangeText={setOther} /></Animated.View> : null}
        </ReplyTray>
      ) : null}

      {stage === 'person' ? (
        <ReplyTray key="person" delay={1300} footer={
          <Button label={tr('onb.finish', 'Start exploring')} disabledReason={name.trim() ? null : tr('person.needName', 'Add their first name')} onPress={finish} />
        }>
          <TextField label={tr('person.name', 'First name')} value={name} onChangeText={setName} autoComplete="name" textContentType="name" />
          {label(tr('person.rel', 'They are my…'))}
          <ReplyChips role="radiogroup">
            {RELS.map((r) => <ReplyChip key={r} label={relLabel(r)} selected={rel === r} onPress={() => setRel(rel === r ? null : r)} />)}
          </ReplyChips>
          {label(tr('person.move', 'How they move'))}
          <ReplyChips>
            {PERSON_MOVES.map((m) => <ReplyChip key={m} grid multi icon={mobilityIcon[m]} label={mobilityLabel(tr, m)} selected={pMoves.includes(m)} onPress={() => setPMoves((cur) => (cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m]))} />)}
          </ReplyChips>
        </ReplyTray>
      ) : null}

      {stage === 'done' ? <View style={{ height: space.xxxl }} /> : null}
    </View>
  );
}

function LangButton({ label, primary, onPress }: { label: string; primary: boolean; onPress: () => void }) {
  const t = useTheme();
  const c = useChatColors();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} feedback="scale"
      style={{ height: 54, borderRadius: 27, ...continuous, alignItems: 'center', justifyContent: 'center', backgroundColor: primary ? t.colors.buttonPrimaryBg : c.option, borderWidth: primary ? 0 : 1.5, borderColor: c.optionLine }}>
      <Text variant="headline" weight="700" color={primary ? 'buttonPrimaryFg' : 'textPrimary'}>{label}</Text>
    </Pressable>
  );
}
