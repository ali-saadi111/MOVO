import type { Review, ServiceKind, Specialist } from '../models';

const L = (en: string, ar: string) => ({ en, ar });
const prof: Record<ServiceKind, [string, string]> = {
  physio: ['Physiotherapist', 'معالجة فيزيائية'],
  nursing: ['Home nurse', 'ممرضة منزلية'],
  ot: ['Occupational therapist', 'معالج وظيفي'],
  prosthetics: ['Prosthetist and orthotist', 'أخصائي أطراف وتقويم'],
  repair: ['Wheelchair technician', 'فني كراسي متحركة'],
  transport: ['Accessible transport', 'نقل مجهز'],
};

const svc: Record<ServiceKind, [string, string, number][]> = {
  physio: [['Physiotherapy session', 'جلسة علاج فيزيائي', 60], ['Assessment and plan', 'تقييم وخطة علاج', 75]],
  nursing: [['Home nursing visit', 'زيارة تمريض منزلية', 60], ['Wound care', 'العناية بالجروح', 45]],
  ot: [['Home safety visit', 'زيارة سلامة المنزل', 90], ['OT session', 'جلسة علاج وظيفي', 60]],
  prosthetics: [['Fitting and adjustment', 'تركيب وتعديل', 60], ['Socket check', 'فحص التجويف', 30]],
  repair: [['Wheelchair service', 'صيانة الكرسي', 60], ['Puncture repair', 'تصليح ثقب', 30]],
  transport: [['Accessible ride, Beirut', 'رحلة مجهزة داخل بيروت', 60], ['Hospital round trip', 'ذهاب وإياب للمستشفى', 180]],
};

type Seed = [string, string, string, ServiceKind, number, 'f' | 'm', number, number, number, boolean, boolean, string | null, number];
const S: Seed[] = [
  ['sp_maya', 'Dr. Maya Saleh', 'د. مايا صالح', 'physio', 11, 'f', 35, 4.9, 128, false, true, 'plc_clinic_cedars', 3],
  ['sp_karim_n', 'Nadim Khoury', 'نديم خوري', 'physio', 7, 'm', 30, 4.7, 64, true, true, 'plc_physio_plus', 20],
  ['sp_rola', 'Rola Haddad', 'رلى حداد', 'physio', 14, 'f', 40, 4.8, 201, false, false, 'plc_saida_clinic2', 26],
  ['sp_joelle', 'Joelle Abi Nader', 'جويل أبي نادر', 'nursing', 9, 'f', 25, 4.8, 92, false, true, null, 5],
  ['sp_hassan', 'Hassan Mrad', 'حسن مراد', 'nursing', 5, 'm', 22, 4.6, 38, false, true, null, 30],
  ['sp_nour', 'Nour El Hage', 'نور الحاج', 'ot', 8, 'f', 45, 4.9, 57, false, true, 'plc_clinic_ot', 50],
  ['sp_fadi', 'Fadi Sleiman', 'فادي سليمان', 'ot', 12, 'm', 40, 4.5, 41, false, false, 'plc_aub_clinic', 28],
  ['sp_elie', 'Elie Rizk', 'إيلي رزق', 'prosthetics', 16, 'm', 60, 4.8, 77, false, false, 'plc_saida_hosp', 72],
  ['sp_samar', 'Samar Fawaz', 'سمر فواز', 'prosthetics', 10, 'f', 55, 4.7, 33, false, true, 'plc_aub_clinic', 52],
  ['sp_tony', 'Tony’s Wheel Works', 'ورشة طوني للكراسي', 'repair', 18, 'm', 20, 4.9, 156, false, true, null, 4],
  ['sp_bilal', 'Bilal Itani', 'بلال عيتاني', 'repair', 6, 'm', 18, 4.4, 22, false, true, null, 26],
  ['sp_ride', 'Rafiq Accessible Rides', 'رفيق للنقل المجهز', 'transport', 4, 'm', 15, 4.7, 310, false, true, null, 2],
];

const revs: [string, Review['mobility'], string][] = [
  ['Karim H.', 'manual', 'Explained every exercise and checked my chair set-up too. On time both visits.'],
  ['Lina S.', 'walker-crutches', 'Kind and patient. My mother looked forward to each session.'],
  ['Omar F.', 'power', 'Knew exactly what to adjust. I left moving better than I came in.'],
];

export const specialists: Specialist[] = S.map(([id, name, nameAr, kind, years, gender, price, stars, reviewCount, sponsored, homeVisit, clinic, nextFree], i) => ({
  id,
  name,
  nameAr,
  kind,
  profession: L(...prof[kind]),
  years,
  gender,
  languages: i % 3 === 0 ? ['ar', 'en', 'fr'] : i % 3 === 1 ? ['ar', 'en'] : ['ar'],
  priceCents: price * 100,
  stars,
  reviewCount,
  sponsored,
  homeVisit,
  clinic: clinic ? { name: '', placeId: clinic } : null,
  areas: i % 2 === 0 ? ['Hamra', 'Verdun', 'Ras Beirut'] : ['Saida', 'Dekerman', 'Abra'],
  bio: L(
    `${years} years helping people move with more ease, at home and in clinic. Works closely with families and caregivers.`,
    `${years} سنوات في مساعدة الناس على الحركة براحة أكبر، في المنزل والعيادة. تعمل عن قرب مع العائلات ومقدمي الرعاية.`,
  ),
  services: svc[kind].map(([en, ar, minutes], k) => ({ id: `svc_${kind}_${k === 0 ? 'home' : 'b'}`, name: L(en, ar), minutes, priceCents: (price + k * 10) * 100 })),
  reviews: revs.map(([author, mobility, text], r) => ({ id: `${id}_r${r}`, author, mobility, stars: r === 2 ? 4 : 5, text, at: new Date(Date.now() - (r + 1) * 12 * 86400000).toISOString() })),
  nextFreeInHours: nextFree,
  avatarHue: i,
}));
