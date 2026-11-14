import { useT } from '@/i18n';
import { haptic } from '@/lib/haptics';
import { applyDirection } from '@/lib/rtl';
import { useSettings, type Lang } from '@/stores/settings';
import { ListRow, Section, Sheet, go } from '@/ui';

/** Pick the app language. Saves straight away and closes. */
export default function Language() {
  const tr = useT();
  const lang = useSettings((s) => s.lang);
  const set = useSettings((s) => s.set);
  const pick = (l: Lang) => { haptic.selection(); set({ lang: l }); applyDirection(l === 'ar'); go.back(); };
  return (
    <Sheet title={tr('settings.language', 'Language')} detent={0.34}>
      <Section>
        <ListRow title="English" trailing={{ type: 'check', on: lang !== 'ar' }} onPress={() => pick('en')} />
        <ListRow title="العربية" trailing={{ type: 'check', on: lang === 'ar' }} onPress={() => pick('ar')} />
      </Section>
    </Sheet>
  );
}
