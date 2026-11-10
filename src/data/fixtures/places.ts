import { hasPlacePhoto } from '@/art/photos';
import type { Place, PlaceCategory, RatingLevel, Review } from '../models';

// ~60 hand-seeded places in Hamra, downtown and Saida across every category and
// all three rating levels. Names from the brief: Café Rami, Barbar, Zaitunay Bay.
type Seed = [id: string, en: string, ar: string, cat: PlaceCategory, area: Place['area'], level: RatingLevel, lat: number, lng: number, streetEn: string, streetAr: string];

const S: Seed[] = [
  ['plc_cafe_rami', 'Café Rami', 'مقهى رامي', 'cafe', 'hamra', 'accessible', 33.89705, 35.48195, 'Makdessi Street', 'شارع المقدسي'],
  ['plc_barbar', 'Barbar', 'بربر', 'restaurant', 'hamra', 'partly', 33.89612, 35.48032, 'Spears Street', 'شارع سبيرز'],
  ['plc_zaitunay', 'Zaitunay Bay promenade', 'زيتونة باي', 'outdoor', 'downtown', 'accessible', 33.90128, 35.49412, 'Zaitunay Bay', 'زيتونة باي'],
  ['plc_hamra_pharm', 'Hamra Central Pharmacy', 'صيدلية الحمرا المركزية', 'pharmacy', 'hamra', 'accessible', 33.89640, 35.48290, 'Hamra Street', 'شارع الحمرا'],
  ['plc_clinic_cedars', 'Cedars Rehab Clinic', 'عيادة الأرز للتأهيل', 'clinic', 'hamra', 'accessible', 33.89810, 35.47960, 'Bliss Street', 'شارع بليس'],
  ['plc_bank_hamra', 'BLC Bank, Hamra branch', 'بنك BLC، فرع الحمرا', 'bank', 'hamra', 'partly', 33.89580, 35.48410, 'Hamra Street', 'شارع الحمرا'],
  ['plc_bookshop', 'Antoine Books', 'مكتبة أنطوان', 'shop', 'hamra', 'partly', 33.89670, 35.48510, 'Hamra Street', 'شارع الحمرا'],
  ['plc_spinneys_hamra', 'Spinneys Hamra', 'سبينيس الحمرا', 'supermarket', 'hamra', 'accessible', 33.89520, 35.47880, 'Abdel Aziz Street', 'شارع عبد العزيز'],
  ['plc_tawlet', 'Tawlet Hamra', 'طاولة الحمرا', 'restaurant', 'hamra', 'not', 33.89750, 35.48630, 'Sadat Street', 'شارع السادات'],
  ['plc_younes', 'Café Younes', 'مقهى يونس', 'cafe', 'hamra', 'partly', 33.89690, 35.48360, 'Nehme Yafet Street', 'شارع نعمة يافث'],
  ['plc_kalei', 'Kalei Coffee', 'كالي كوفي', 'cafe', 'hamra', 'accessible', 33.89470, 35.48120, 'Mar Mikhael', 'مار مخايل'],
  ['plc_aub_clinic', 'University Medical Clinics', 'العيادات الطبية الجامعية', 'clinic', 'hamra', 'accessible', 33.89940, 35.48120, 'Cairo Street', 'شارع القاهرة'],
  ['plc_mazen_pharm', 'Mazen Pharmacy', 'صيدلية مازن', 'pharmacy', 'hamra', 'not', 33.89420, 35.48450, 'Jeanne d’Arc Street', 'شارع جان دارك'],
  ['plc_bank_audi', 'Bank Audi, Clemenceau', 'بنك عوده، كليمنصو', 'bank', 'hamra', 'accessible', 33.89880, 35.48780, 'Clemenceau Street', 'شارع كليمنصو'],
  ['plc_falafel', 'Falafel Sahyoun', 'فلافل صهيون', 'restaurant', 'downtown', 'not', 33.88960, 35.50210, 'Damascus Road', 'طريق الشام'],
  ['plc_abc_mall', 'ABC Verdun', 'أ ب ث فردان', 'shop', 'hamra', 'accessible', 33.88720, 35.48280, 'Verdun Street', 'شارع فردان'],
  ['plc_t_marbouta', 'T-Marbouta', 'تاء مربوطة', 'restaurant', 'hamra', 'partly', 33.89590, 35.48240, 'Pavillon Center', 'مركز بافيون'],
  ['plc_carrefour', 'Smart Supermarket', 'سمارت سوبرماركت', 'supermarket', 'hamra', 'partly', 33.89350, 35.48010, 'Sidani Street', 'شارع السيداني'],
  ['plc_dar_bistro', 'Dar Bistro & Books', 'دار بيسترو', 'cafe', 'hamra', 'accessible', 33.89530, 35.48660, 'Emile Edde Street', 'شارع إميل إده'],
  ['plc_rawda', 'Rawda Café', 'مقهى الروضة', 'cafe', 'hamra', 'partly', 33.89820, 35.47500, 'Corniche', 'الكورنيش'],
  ['plc_manara', 'Manara Corniche walk', 'كورنيش المنارة', 'outdoor', 'hamra', 'accessible', 33.90150, 35.47700, 'Corniche Beirut', 'كورنيش بيروت'],
  ['plc_physio_plus', 'Physio Plus Centre', 'مركز فيزيو بلس', 'clinic', 'hamra', 'partly', 33.89410, 35.48720, 'Abdel Baki Street', 'شارع عبد الباقي'],
  ['plc_wardieh_pharm', 'Wardieh Pharmacy', 'صيدلية الوردية', 'pharmacy', 'hamra', 'accessible', 33.89740, 35.47830, 'Wardieh Square', 'ساحة الوردية'],
  ['plc_bank_byblos', 'Byblos Bank, Bliss', 'بنك بيبلوس، بليس', 'bank', 'hamra', 'not', 33.89900, 35.48450, 'Bliss Street', 'شارع بليس'],
  ['plc_virgin', 'Hamra Electronics', 'إلكترونيات الحمرا', 'shop', 'hamra', 'not', 33.89620, 35.48870, 'Hamra Street', 'شارع الحمرا'],
  ['plc_bay_rest', 'Bay Rock restaurant', 'مطعم باي روك', 'restaurant', 'hamra', 'accessible', 33.89160, 35.47160, 'Raouché', 'الروشة'],
  ['plc_paul', 'Paul Saifi', 'بول الصيفي', 'cafe', 'downtown', 'accessible', 33.89640, 35.50630, 'Gouraud Street', 'شارع غورو'],
  ['plc_souks', 'Beirut Souks', 'أسواق بيروت', 'shop', 'downtown', 'accessible', 33.89980, 35.50170, 'Weygand Street', 'شارع ويغان'],
  ['plc_garden', 'Sanayeh Garden', 'حديقة الصنائع', 'outdoor', 'hamra', 'partly', 33.89350, 35.48900, 'Sanayeh', 'الصنائع'],
  ['plc_bliss_house', 'Bliss House', 'بليس هاوس', 'restaurant', 'hamra', 'partly', 33.89960, 35.48330, 'Bliss Street', 'شارع بليس'],
  ['plc_moustache', 'Moustache Dental Care', 'عيادة أسنان', 'clinic', 'hamra', 'not', 33.89480, 35.48590, 'Commodore Street', 'شارع الكومودور'],
  ['plc_hamra_mkt', 'Hamra Fresh Market', 'سوق الحمرا الطازج', 'supermarket', 'hamra', 'accessible', 33.89770, 35.48530, 'Makdessi Street', 'شارع المقدسي'],
  ['plc_uncle_deek', 'Uncle Deek', 'أنكل ديك', 'restaurant', 'hamra', 'partly', 33.89560, 35.48920, 'Hamra Street', 'شارع الحمرا'],
  ['plc_bank_fransa', 'Fransabank, Verdun', 'فرنسبنك، فردان', 'bank', 'hamra', 'accessible', 33.88850, 35.48530, 'Verdun Street', 'شارع فردان'],
  ['plc_sanayeh_pharm', 'Sanayeh Pharmacy', 'صيدلية الصنائع', 'pharmacy', 'hamra', 'partly', 33.89250, 35.48760, 'Spears Street', 'شارع سبيرز'],
  ['plc_saida_souk', 'Old Souk of Saida', 'سوق صيدا القديم', 'shop', 'saida', 'not', 33.56280, 35.37180, 'Old City', 'المدينة القديمة'],
  ['plc_saida_castle', 'Sea Castle walkway', 'ممر قلعة البحر', 'outdoor', 'saida', 'partly', 33.56610, 35.37150, 'Sea Castle', 'قلعة البحر'],
  ['plc_saida_cafe', 'Café Sidon Port', 'مقهى ميناء صيدا', 'cafe', 'saida', 'accessible', 33.56500, 35.37300, 'Port Road', 'طريق المرفأ'],
  ['plc_saida_hosp', 'Hammoud Hospital clinics', 'عيادات مستشفى حمود', 'clinic', 'saida', 'accessible', 33.55900, 35.38200, 'Riad El Solh Street', 'شارع رياض الصلح'],
  ['plc_saida_pharm', 'Saida Main Pharmacy', 'صيدلية صيدا الرئيسية', 'pharmacy', 'saida', 'accessible', 33.56050, 35.37600, 'Riad El Solh Street', 'شارع رياض الصلح'],
  ['plc_saida_bank', 'BLOM Bank, Saida', 'بنك لبنان والمهجر، صيدا', 'bank', 'saida', 'partly', 33.56150, 35.37750, 'Riad El Solh Street', 'شارع رياض الصلح'],
  ['plc_saida_rest', 'Abou Rami sweets', 'حلويات أبو رامي', 'restaurant', 'saida', 'partly', 33.56350, 35.37420, 'Old City', 'المدينة القديمة'],
  ['plc_saida_super', 'Charcutier Aoun Saida', 'شاركوتييه عون صيدا', 'supermarket', 'saida', 'accessible', 33.55700, 35.37900, 'East Boulevard', 'الأوتوستراد الشرقي'],
  ['plc_saida_corniche', 'Saida corniche', 'كورنيش صيدا', 'outdoor', 'saida', 'accessible', 33.55800, 35.37000, 'Corniche', 'الكورنيش'],
  ['plc_saida_shop', 'Saida City Mall', 'صيدا سيتي مول', 'shop', 'saida', 'accessible', 33.55400, 35.38000, 'Highway', 'الأوتوستراد'],
  ['plc_saida_clinic2', 'South Physio Clinic', 'عيادة الجنوب للعلاج الفيزيائي', 'clinic', 'saida', 'partly', 33.56000, 35.38400, 'Dekerman', 'الدكرمان'],
  ['plc_saida_cafe2', 'Khan café', 'مقهى الخان', 'cafe', 'saida', 'not', 33.56420, 35.37250, 'Khan el Franj', 'خان الإفرنج'],
  ['plc_cafe_younes2', 'Younes Roastery', 'محمصة يونس', 'cafe', 'hamra', 'accessible', 33.89330, 35.48330, 'Maamari Street', 'شارع المعماري'],
  ['plc_kababji', 'Kababji', 'كبابجي', 'restaurant', 'hamra', 'accessible', 33.89440, 35.48180, 'Hamra Street', 'شارع الحمرا'],
  ['plc_pharm_bliss', 'Bliss Pharmacy', 'صيدلية بليس', 'pharmacy', 'hamra', 'accessible', 33.89870, 35.48210, 'Bliss Street', 'شارع بليس'],
  ['plc_opticians', 'Hamra Opticians', 'نظارات الحمرا', 'shop', 'hamra', 'partly', 33.89600, 35.48150, 'Hamra Street', 'شارع الحمرا'],
  ['plc_clinic_eye', 'Clemenceau Eye Clinic', 'عيادة كليمنصو للعيون', 'clinic', 'hamra', 'accessible', 33.89700, 35.48960, 'Clemenceau Street', 'شارع كليمنصو'],
  ['plc_super_tsc', 'TSC Signature', 'تي إس سي', 'supermarket', 'hamra', 'partly', 33.89100, 35.48650, 'Mar Elias', 'مار الياس'],
  ['plc_meat', 'Le Chef', 'لو شيف', 'restaurant', 'downtown', 'not', 33.89380, 35.51270, 'Gouraud Street', 'شارع غورو'],
  ['plc_bank_sgbl', 'SGBL, Hamra', 'سوسيتيه جنرال، الحمرا', 'bank', 'hamra', 'accessible', 33.89680, 35.47990, 'Hamra Street', 'شارع الحمرا'],
  ['plc_cafe_ta', 'Ta-Marbouta terrace', 'تراس تاء مربوطة', 'cafe', 'hamra', 'not', 33.89520, 35.48380, 'Hamra Street', 'شارع الحمرا'],
  ['plc_shop_aishti', 'Hamra Shoe House', 'بيت الأحذية', 'shop', 'hamra', 'accessible', 33.89650, 35.48690, 'Hamra Street', 'شارع الحمرا'],
  ['plc_super_hamra2', 'Le Charcutier Hamra', 'لو شاركوتييه الحمرا', 'supermarket', 'hamra', 'accessible', 33.89290, 35.48170, 'Abdel Aziz Street', 'شارع عبد العزيز'],
  ['plc_clinic_ot', 'Hand & OT Studio', 'استوديو العلاج الوظيفي', 'clinic', 'hamra', 'accessible', 33.89560, 35.47790, 'Jeanne d’Arc Street', 'شارع جان دارك'],
  ['plc_pharm_raouche', 'Raouché Pharmacy', 'صيدلية الروشة', 'pharmacy', 'hamra', 'partly', 33.89250, 35.47450, 'Raouché', 'الروشة'],
];

const V = {
  entrance: { accessible: ['Step-free, automatic door', 'مدخل بلا درج، باب تلقائي'], partly: ['One 6 cm step, ramp on request', 'درجة واحدة 6 سم، منحدر عند الطلب'], not: ['Three steps, no ramp', 'ثلاث درجات بلا منحدر'] },
  doorWidth: { accessible: ['92 cm', '92 سم'], partly: ['78 cm', '78 سم'], not: ['68 cm', '68 سم'] },
  spaceInside: { accessible: ['Wide aisles, room to turn', 'ممرات واسعة ومساحة للالتفاف'], partly: ['Tight near the counter', 'ضيق قرب الكاونتر'], not: ['No room to turn', 'لا مساحة للالتفاف'] },
  toilet: { accessible: ['Accessible toilet with grab bars', 'حمام مجهز بمقابض'], partly: ['Toilet on ground floor, no grab bars', 'حمام في الطابق الأرضي بلا مقابض'], not: ['Toilet upstairs', 'الحمام في الطابق العلوي'] },
  parking: { accessible: ['Accessible bay at the door', 'موقف مخصص عند الباب'], partly: ['Street parking 50 m away', 'موقف على الشارع على بعد 50 م'], not: ['No parking nearby', 'لا موقف قريب'] },
} as const;

const keys = ['entrance', 'doorWidth', 'spaceInside', 'toilet', 'parking'] as const;

const authors: [string, Review['mobility']][] = [['Rania K.', 'manual'], ['Hadi M.', 'power'], ['Lina S.', 'walker-crutches'], ['Omar F.', 'manual'], ['Maya T.', 'power'], ['Ziad H.', 'other']];
const reviewText: Record<RatingLevel, string[]> = {
  accessible: ['The staff moved a table so I could sit by the window. Toilet was clean and roomy.', 'Smooth ramp, and the door opens on its own. Easy visit.', 'Came with my power chair, plenty of room to turn.'],
  partly: ['The step is small but I needed a hand. They brought the ramp quickly when I asked.', 'Fine once inside, but the toilet is tight for a power chair.', 'Busy at lunch, so the aisles get narrow.'],
  not: ['Three steps at the door and nobody had a ramp.', 'Couldn’t get in. Called ahead and they said there’s no other entrance.'],
};

function levelFor(base: RatingLevel, i: number, k: number): RatingLevel {
  if (base === 'accessible') return k === 4 && i % 3 === 0 ? 'partly' : 'accessible';
  if (base === 'not') return k === 0 ? 'not' : (['partly', 'not', 'accessible', 'not'] as RatingLevel[])[(i + k) % 4];
  return k === (i % 5) || k === 3 ? 'partly' : (['accessible', 'partly'] as RatingLevel[])[(i + k) % 2];
}

const now = Date.now();
export const places: Place[] = S.map(([id, en, ar, category, area, level, lat, lng, sEn, sAr], i) => {
  const checklist = keys.map((key, k) => {
    const lv = level === 'partly' && k === 0 ? 'partly' : levelFor(level, i, k);
    const [ven, var_] = V[key][lv];
    return { key, value: { en: ven, ar: var_ }, level: lv };
  });
  const checkedDaysAgo = i % 11 === 4 ? 420 : 12 + ((i * 37) % 300);
  const rv = reviewText[level];
  return {
    id,
    name: { en, ar },
    category,
    area,
    street: { en: sEn, ar: sAr },
    lat,
    lng,
    phone: `+961 1 ${String(340000 + i * 1371).slice(0, 3)} ${String(100 + i * 7).slice(-3)}`,
    hours: [
      { days: { en: 'Mon–Fri', ar: 'الإثنين – الجمعة' }, time: category === 'bank' ? '08:30–14:00' : '08:00–22:00' },
      { days: { en: 'Sat–Sun', ar: 'السبت – الأحد' }, time: category === 'bank' ? 'Closed' : '09:00–23:00' },
    ],
    hero: { art: hasPlacePhoto(id) ? `place:${id}` : category, seed: i, alt: { en: `${en}, front`, ar: `${ar}، الواجهة` } },
    rating: {
      level,
      checkedAt: new Date(now - checkedDaysAgo * 86400000).toISOString(),
      checklist,
      fits: {
        manual: level !== 'not',
        power: level === 'accessible' && checklist[2].level === 'accessible',
        'walker-crutches': level !== 'not' || i % 2 === 0,
        other: level === 'accessible',
      },
      entrancePhotos: [0, 1, 2].map((n) => ({ art: `entrance-${level}`, seed: i * 3 + n, alt: { en: `Entrance photo ${n + 1}`, ar: `صورة المدخل ${n + 1}` } })),
    },
    amenities: {
      stepFree: checklist[0].level === 'accessible',
      toilet: checklist[3].level === 'accessible',
      parking: checklist[4].level !== 'not',
      elevator: i % 4 === 0,
    },
    reviews: rv.slice(0, 1 + (i % rv.length)).map((text, r) => {
      const [author, mobility] = authors[(i + r) % authors.length];
      return { id: `${id}_r${r}`, author, mobility, stars: level === 'accessible' ? 5 - (r % 2) : level === 'partly' ? 3 + (r % 2) : 2 - (r % 2), text, at: new Date(now - (r + 1) * 9 * 86400000).toISOString() };
    }),
  };
});
