import type { ServiceKind, Specialist } from '../models';

// Richer profile copy for the draft. In the real app each specialist writes
// their own; the team checks credentials before a profile goes live.
type Loc = { en: string; ar: string };
const L = (en: string, ar: string): Loc => ({ en, ar });

export type FocusArea = { label: Loc; icon: 'figure.roll' | 'figure.walk.motion' | 'bandage' | 'stethoscope' | 'house.fill' | 'hand.raised.fill' | 'wrench.and.screwdriver' | 'car' | 'heart.fill' | 'pills' | 'ruler' | 'figure.walk' };

type KindCopy = { bannerTop: Loc; bannerBottom: Loc; tagline: Loc; approach: Loc; focus: FocusArea[]; steps: [Loc, Loc][]; degree: Loc; body: Loc };

const KIND: Record<ServiceKind, KindCopy> = {
  physio: {
    bannerTop: L('MOVE', 'تحرّك'),
    bannerBottom: L('BETTER', 'أفضل'),
    tagline: L('Helps you move further, with less pain', 'تساعدك على الحركة أكثر، بألم أقل'),
    approach: L(
      'Sessions start from what you want to do again: the stairs at home, a walk on the Corniche, a full day in your chair. Every exercise is shown slowly, and you leave with a short plan that fits your day.',
      'تبدأ الجلسات مما تريد أن تعود لفعله: درج البيت، نزهة على الكورنيش، يوم كامل على كرسيك. كل تمرين يُشرح ببطء، وتغادر بخطة قصيرة تناسب يومك.',
    ),
    focus: [
      { label: L('Spinal cord injury', 'إصابات النخاع الشوكي'), icon: 'figure.roll' },
      { label: L('Stroke recovery', 'التعافي من الجلطة'), icon: 'figure.walk.motion' },
      { label: L('Back and neck pain', 'آلام الظهر والرقبة'), icon: 'heart.fill' },
      { label: L('After surgery', 'ما بعد الجراحة'), icon: 'bandage' },
    ],
    steps: [
      [L('Talk it through', 'نتحدث أولًا'), L('What hurts, what you want back, and how you move today.', 'ما يؤلمك، ما تريد استعادته، وكيف تتحرك اليوم.')],
      [L('Hands-on session', 'جلسة عملية'), L('Stretching, strength and balance work, at your pace.', 'تمارين إطالة وقوة وتوازن، على مهلك.')],
      [L('Your plan', 'خطتك'), L('Three or four exercises to keep going until next time.', 'ثلاثة أو أربعة تمارين تتابعها حتى الجلسة القادمة.')],
    ],
    degree: L('BSc Physiotherapy, Lebanese University', 'إجازة في العلاج الفيزيائي، الجامعة اللبنانية'),
    body: L('Order of Physiotherapists in Lebanon', 'نقابة المعالجين الفيزيائيين في لبنان'),
  },
  nursing: {
    bannerTop: L('CARE', 'رعاية'),
    bannerBottom: L('AT HOME', 'في البيت'),
    tagline: L('Calm, careful care at home', 'رعاية هادئة ودقيقة في البيت'),
    approach: L(
      'Visits are unhurried. Dressings, injections and checks are explained as they happen, and family members are shown what to watch for between visits.',
      'الزيارات بلا عجلة. تُشرح الضمادات والحقن والفحوص أثناء القيام بها، ويتعلم أفراد العائلة ما يجب مراقبته بين الزيارات.',
    ),
    focus: [
      { label: L('Wound and pressure care', 'العناية بالجروح وقرح الضغط'), icon: 'bandage' },
      { label: L('Medication', 'الأدوية'), icon: 'pills' },
      { label: L('Catheter care', 'العناية بالقسطرة'), icon: 'stethoscope' },
      { label: L('Support for families', 'دعم العائلات'), icon: 'heart.fill' },
    ],
    steps: [
      [L('Check-in', 'الاطمئنان'), L('Vitals, how the night went, any new worries.', 'العلامات الحيوية، كيف مرت الليلة، أي قلق جديد.')],
      [L('Care', 'الرعاية'), L('Dressings, medicines or injections, done gently.', 'الضمادات أو الأدوية أو الحقن، برفق.')],
      [L('Notes for the family', 'ملاحظات للعائلة'), L('A short written update you can share with your doctor.', 'ملخص مكتوب يمكنك مشاركته مع طبيبك.')],
    ],
    degree: L('BSN Nursing, Saint Joseph University', 'إجازة في التمريض، جامعة القديس يوسف'),
    body: L('Order of Nurses in Lebanon', 'نقابة الممرضات والممرضين في لبنان'),
  },
  ot: {
    bannerTop: L('LIVE', 'عِش'),
    bannerBottom: L('YOUR WAY', 'على طريقتك'),
    tagline: L('Makes home and daily life work for you', 'تجعل البيت والحياة اليومية تناسبك'),
    approach: L(
      'Most of the work happens where you live. We look at doorways, the bathroom and the kitchen together, try simple changes, and only suggest equipment that you will actually use.',
      'معظم العمل يحدث حيث تعيش. ننظر معًا إلى الأبواب والحمام والمطبخ، نجرب تغييرات بسيطة، ولا نقترح إلا المعدات التي ستستخدمها فعلًا.',
    ),
    focus: [
      { label: L('Home set-up', 'تجهيز البيت'), icon: 'house.fill' },
      { label: L('Dressing and washing', 'اللبس والاستحمام'), icon: 'hand.raised.fill' },
      { label: L('Wheelchair seating', 'جلسة الكرسي المتحرك'), icon: 'figure.roll' },
      { label: L('Back to work', 'العودة إلى العمل'), icon: 'figure.walk' },
    ],
    steps: [
      [L('Walk-through', 'جولة في البيت'), L('We go room by room and note what gets in the way.', 'نمر غرفة غرفة ونسجل ما يعيقك.')],
      [L('Try it out', 'نجرب'), L('Practise transfers and tasks with small changes.', 'نتمرن على الانتقال والمهام مع تغييرات صغيرة.')],
      [L('Written plan', 'خطة مكتوبة'), L('What to change, what to buy, and what can wait.', 'ما يجب تغييره، ما يجب شراؤه، وما يمكن تأجيله.')],
    ],
    degree: L('MSc Occupational Therapy, Lebanese University', 'ماجستير في العلاج الوظيفي، الجامعة اللبنانية'),
    body: L('Lebanese Association of Occupational Therapists', 'الجمعية اللبنانية للمعالجين الوظيفيين'),
  },
  prosthetics: {
    bannerTop: L('STEP', 'خطوة'),
    bannerBottom: L('FORWARD', 'إلى الأمام'),
    tagline: L('Limbs and braces that fit how you live', 'أطراف وتقويمات تناسب طريقة عيشك'),
    approach: L(
      'A good fit takes time. Fittings are booked long enough to adjust properly, and small follow-up tweaks are always free in the first three months.',
      'الملاءمة الجيدة تحتاج وقتًا. تُحجز جلسات التركيب بوقت كافٍ للتعديل كما يجب، والتعديلات الصغيرة مجانية دائمًا في الأشهر الثلاثة الأولى.',
    ),
    focus: [
      { label: L('Below-knee limbs', 'أطراف تحت الركبة'), icon: 'figure.walk' },
      { label: L('Above-knee limbs', 'أطراف فوق الركبة'), icon: 'figure.walk.motion' },
      { label: L('Braces and orthotics', 'الجبائر والتقويم'), icon: 'ruler' },
      { label: L('Socket comfort', 'راحة التجويف'), icon: 'hand.raised.fill' },
    ],
    steps: [
      [L('Assessment', 'التقييم'), L('Measurements, skin check and your daily routine.', 'القياسات، فحص الجلد وروتينك اليومي.')],
      [L('Fitting', 'التركيب'), L('Try the limb or brace and walk it in with us.', 'جرب الطرف أو الجبيرة وامشِ به معنا.')],
      [L('Follow-up', 'المتابعة'), L('Free adjustments for three months.', 'تعديلات مجانية لثلاثة أشهر.')],
    ],
    degree: L('BSc Prosthetics and Orthotics, ISPO Category I', 'إجازة في الأطراف والتقويم، فئة ISPO الأولى'),
    body: L('International Society for Prosthetics and Orthotics', 'الجمعية الدولية للأطراف الصناعية والتقويم'),
  },
  repair: {
    bannerTop: L('KEEP', 'ابقَ'),
    bannerBottom: L('ROLLING', 'متحركًا'),
    tagline: L('Gets your chair rolling again, fast', 'يعيد كرسيك للعمل بسرعة'),
    approach: L(
      'Most repairs are done on the spot from a fully stocked van. If a part has to be ordered, you get a loan chair the same day.',
      'معظم التصليحات تتم في المكان من سيارة مجهزة بالكامل. وإذا احتاجت قطعة إلى طلب، تحصل على كرسي بديل في اليوم نفسه.',
    ),
    focus: [
      { label: L('Punctures and tyres', 'الثقوب والإطارات'), icon: 'wrench.and.screwdriver' },
      { label: L('Brakes and bearings', 'الفرامل والمحامل'), icon: 'wrench.and.screwdriver' },
      { label: L('Power chair batteries', 'بطاريات الكراسي الكهربائية'), icon: 'figure.roll' },
      { label: L('Seat and back fitting', 'ضبط المقعد والظهر'), icon: 'ruler' },
    ],
    steps: [
      [L('Quick check', 'فحص سريع'), L('Tyres, brakes, frame and battery in ten minutes.', 'الإطارات والفرامل والهيكل والبطارية في عشر دقائق.')],
      [L('Fix on the spot', 'تصليح في المكان'), L('Most parts are in the van.', 'معظم القطع موجودة في السيارة.')],
      [L('Loan chair', 'كرسي بديل'), L('If a part must be ordered, you are never left without a chair.', 'إن احتجنا لطلب قطعة، لن تبقى بلا كرسي.')],
    ],
    degree: L('Certified wheelchair technician, WHO basic level', 'فني كراسي متحركة معتمد، المستوى الأساسي لمنظمة الصحة العالمية'),
    body: L('Partner workshop of Movo', 'ورشة شريكة لموفو'),
  },
  transport: {
    bannerTop: L('GO', 'انطلق'),
    bannerBottom: L('ANYWHERE', 'إلى أي مكان'),
    tagline: L('Door-to-door rides that wait for you', 'رحلات من الباب إلى الباب تنتظرك'),
    approach: L(
      'Every van has a ramp and proper wheelchair tie-downs. Drivers help from your door to the destination door, and wait at hospital appointments at no extra cost for the first hour.',
      'كل سيارة فيها منحدر وأحزمة تثبيت مناسبة للكرسي. يساعدك السائق من بابك حتى باب الوجهة، وينتظر في مواعيد المستشفى دون كلفة إضافية في الساعة الأولى.',
    ),
    focus: [
      { label: L('Hospital trips', 'مشاوير المستشفى'), icon: 'stethoscope' },
      { label: L('Power chairs welcome', 'الكراسي الكهربائية مرحب بها'), icon: 'figure.roll' },
      { label: L('Airport transfers', 'التوصيل إلى المطار'), icon: 'car' },
      { label: L('Help door to door', 'مساعدة من الباب إلى الباب'), icon: 'hand.raised.fill' },
    ],
    steps: [
      [L('Book', 'احجز'), L('Tell us your chair type and any stairs.', 'أخبرنا بنوع كرسيك وإن كان هناك درج.')],
      [L('Pick-up', 'الانطلاق'), L('The driver calls ten minutes before arriving.', 'يتصل السائق قبل وصوله بعشر دقائق.')],
      [L('Safe ride', 'رحلة آمنة'), L('Four-point tie-downs and a smooth drive.', 'تثبيت من أربع نقاط وقيادة هادئة.')],
    ],
    degree: L('Accessible transport training, Lebanese Red Cross', 'تدريب على النقل المجهز، الصليب الأحمر اللبناني'),
    body: L('Partner fleet of Movo', 'أسطول شريك لموفو'),
  },
};

export function specialistExtras(s: Specialist) {
  const k = KIND[s.kind];
  const seen = Math.round(s.reviewCount * 6.5 + s.years * 20);
  return { ...k, patients: seen, responds: s.nextFreeInHours < 12 ? L('Usually replies within an hour', 'يرد عادة خلال ساعة') : L('Usually replies the same day', 'يرد عادة في اليوم نفسه') };
}
