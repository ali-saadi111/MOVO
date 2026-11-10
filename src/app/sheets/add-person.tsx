import { PersonForm } from '@/features/caregiver/PersonForm';
import { useT } from '@/i18n';
import { Sheet, go } from '@/ui';

export default function AddPerson() {
  const tr = useT();
  return (
    <Sheet title={tr('caregiver.add', 'Add a person')} dismissLabel="cancel" detent={0.92} scroll={false}>
      <PersonForm ctaLabel={tr('caregiver.save', 'Add person')} onSaved={go.back} />
    </Sheet>
  );
}
