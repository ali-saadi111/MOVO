// Generates src/data/fixtures/products.json: ~140 curated products with real spec
// ranges for each category. The build environment has no web access, so §7's
// scraper runs as "gap fill" only (source: curated). See tools/README.md.
import { writeFileSync } from 'node:fs';

let seed = 42;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const between = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const round5 = (n) => Math.round(n / 5) * 5;

const brands = ['Aster Mobility', 'Cedar Care', 'Levant Medical', 'Kinetic Home', 'Atlas Rehab', 'Movo Essentials', 'Northline', 'Pura Health'];

const L = (en, ar) => ({ en, ar });
const spec = (key, en, ar, value, unit) => ({ key, label: L(en, ar), value, ...(unit ? { unit } : {}) });

const T = [];
const add = (o) => T.push(o);

// ---------- Mobility (40)
const wheelchairs = [
  ['manual', 'Self-propelled wheelchair', 'كرسي متحرك يدوي', 'wheelchair', [180, 420], ['manual']],
  ['lightweight', 'Lightweight folding wheelchair', 'كرسي متحرك خفيف قابل للطي', 'wheelchair-light', [380, 890], ['manual']],
  ['transport', 'Transport wheelchair', 'كرسي نقل', 'wheelchair-transport', [160, 340], ['manual', 'other']],
  ['heavy-duty', 'Heavy-duty wheelchair', 'كرسي متحرك للأوزان الثقيلة', 'wheelchair', [420, 780], ['manual']],
  ['power', 'Folding power wheelchair', 'كرسي كهربائي قابل للطي', 'wheelchair-power', [1450, 2450], ['power']],
];
const models = ['Air', 'Lite', 'City', 'Tour', 'Flex', 'Pro', 'Glide', 'Move', 'One', 'Swift', 'Terra', 'Nova'];
for (let i = 0; i < 18; i++) {
  const [sub, en, ar, art, [lo, hi], fits] = wheelchairs[i % wheelchairs.length];
  const seat = pick([41, 43, 46, 46, 48, 51]);
  const limit = sub === 'heavy-duty' ? pick([160, 180, 200]) : pick([100, 113, 120, 136]);
  const weight = sub === 'power' ? between(20, 28) : sub === 'lightweight' ? between(9, 13) : between(14, 19);
  const model = models[i % models.length] + ' ' + between(2, 9) * 10;
  add({
    cat: 'mobility', sub: 'wheelchairs', subKind: sub, art, en: `${model} ${en.toLowerCase()}`.replace(/^./, (c) => c.toUpperCase()), ar, brand: pick(brands),
    price: round5(between(lo, hi)), fits,
    specs: [
      spec('seatWidthCm', 'Seat width', 'عرض المقعد', seat, 'cm'),
      spec('weightLimitKg', 'Weight limit', 'الحد الأقصى للوزن', limit, 'kg'),
      spec('foldedCm', 'Folded size', 'الحجم مطويًا', `${between(28, 38)} × ${between(70, 92)}`, 'cm'),
      spec('itemWeightKg', 'Chair weight', 'وزن الكرسي', weight, 'kg'),
    ],
    attrs: { seatWidthCm: seat, weightLimitKg: limit, itemWeightKg: weight, foldsForCar: sub !== 'heavy-duty', wheelSizeIn: sub === 'transport' ? 12 : 24 },
    desc: sub === 'power'
      ? 'Folds in seconds and fits most car boots. A joystick on either side, and a battery that lasts about 20 km.'
      : 'Folds flat for the car. Quick-release wheels, flip-back armrests and swing-away footrests.',
  });
}
const walkers = [
  ['walkers', 'Folding walker', 'مشاية قابلة للطي', 'walker', [45, 110]],
  ['rollators', 'Rollator with seat', 'مشاية بعجلات ومقعد', 'rollator', [95, 260]],
  ['crutches', 'Forearm crutches (pair)', 'عكازات ساعد (زوج)', 'crutches', [35, 90]],
  ['canes', 'Folding cane', 'عصا قابلة للطي', 'cane', [15, 45]],
  ['canes', 'Quad cane', 'عصا رباعية القاعدة', 'cane-quad', [25, 55]],
];
for (let i = 0; i < 22; i++) {
  const [sub, en, ar, art, [lo, hi]] = walkers[i % walkers.length];
  const limit = pick([100, 113, 136, 150]);
  const h = `${between(72, 80)}–${between(88, 98)}`;
  add({
    cat: 'mobility', sub, art, en: `${models[(i + 3) % models.length]} ${en.toLowerCase()}`.replace(/^./, (c) => c.toUpperCase()), ar, brand: pick(brands),
    price: round5(between(lo, hi)), fits: ['walker-crutches'],
    specs: [
      spec('heightCm', 'Height range', 'نطاق الارتفاع', h, 'cm'),
      spec('weightLimitKg', 'Weight limit', 'الحد الأقصى للوزن', limit, 'kg'),
      spec('itemWeightKg', 'Weight', 'الوزن', (between(5, 85) / 10), 'kg'),
      spec('folds', 'Folds', 'قابل للطي', true),
    ],
    attrs: { weightLimitKg: limit, foldsForCar: true },
    desc: 'Adjusts in 2.5 cm steps with a push button. Soft grips that don’t slip when hands are warm.',
  });
}
// ---------- Bathroom safety (20)
const bath = [
  ['shower-chairs', 'Shower chair with back', 'كرسي استحمام بظهر', 'shower-chair', [35, 95]],
  ['transfer-benches', 'Tub transfer bench', 'مقعد انتقال للحوض', 'transfer-bench', [65, 160]],
  ['toilet-seats', 'Raised toilet seat', 'مقعد مرحاض مرتفع', 'toilet-seat', [30, 80]],
  ['grab-bars', 'Stainless grab bar', 'مقبض أمان ستانلس', 'grab-bar', [15, 55]],
  ['commodes', '3-in-1 commode', 'كرسي حمام 3 في 1', 'commode', [60, 140]],
];
for (let i = 0; i < 20; i++) {
  const [sub, en, ar, art, [lo, hi]] = bath[i % bath.length];
  const limit = pick([113, 136, 150, 180]);
  add({
    cat: 'bathroom-safety', sub, art, en: i >= 5 ? `${en} · ${pick(['Compact', 'Wide', 'Padded', 'Adjustable'])}` : en, ar, brand: pick(brands),
    price: round5(between(lo, hi)), fits: ['manual', 'power', 'walker-crutches', 'other'],
    specs: [
      spec('weightLimitKg', 'Weight limit', 'الحد الأقصى للوزن', limit, 'kg'),
      sub === 'grab-bars' ? spec('lengthCm', 'Length', 'الطول', pick([30, 45, 60]), 'cm') : spec('heightCm', 'Height range', 'نطاق الارتفاع', `${between(38, 44)}–${between(52, 58)}`, 'cm'),
      spec('seatWidthCm', 'Seat width', 'عرض المقعد', between(40, 52), 'cm'),
      spec('material', 'Material', 'المادة', pick(['Aluminium', 'Stainless steel', 'Blow-moulded plastic'])),
    ],
    attrs: { weightLimitKg: limit }, returnable: false,
    desc: 'Rust-proof frame with non-slip rubber feet. Tool-free height adjustment.',
  });
}
// ---------- Daily living (25)
const daily = [
  ['reachers', 'Reacher grabber', 'ملقط التقاط', 'reacher', [12, 34]],
  ['dressing-aids', 'Sock aid', 'أداة لبس الجوارب', 'sock-aid', [9, 22]],
  ['utensils', 'Weighted utensil set', 'أدوات طعام مثقلة', 'utensils', [18, 45]],
  ['pill-organisers', 'Weekly pill organiser', 'منظم أدوية أسبوعي', 'pill-box', [9, 26]],
  ['bed-rails', 'Bed assist rail', 'مقبض مساعد للسرير', 'bed-rail', [45, 120]],
];
for (let i = 0; i < 25; i++) {
  const [sub, en, ar, art, [lo, hi]] = daily[i % daily.length];
  add({
    cat: 'daily-living', sub, art, en: i >= 5 ? `${en}, ${pick(['long', 'compact', 'two-pack', 'easy grip', 'travel'])}` : en, ar, brand: pick(brands),
    price: round5(between(lo, hi)) || 9, fits: ['manual', 'power', 'walker-crutches', 'other'],
    specs: [
      spec('lengthCm', 'Length', 'الطول', between(18, 82), 'cm'),
      spec('weightG', 'Weight', 'الوزن', between(80, 900), 'g'),
      spec('grip', 'Grip', 'المقبض', pick(['Soft foam', 'Trigger', 'Loop', 'Moulded'])),
    ],
    attrs: {}, returnable: sub !== 'utensils',
    desc: 'Made for hands with less grip strength. Light, easy to clean, and sized for daily use.',
  });
}
// ---------- Medical supplies (20)
const med = [
  ['cushions', 'Pressure-relief cushion', 'وسادة لتخفيف الضغط', 'cushion', [45, 260]],
  ['gloves', 'Nitrile gloves', 'قفازات نتريل', 'gloves', [9, 18]],
  ['incontinence', 'Overnight briefs', 'حفاضات ليلية', 'briefs', [14, 32]],
  ['compression', 'Compression stockings', 'جوارب ضاغطة', 'stockings', [18, 48]],
  ['first-aid', 'Home first-aid kit', 'حقيبة إسعافات أولية', 'first-aid', [20, 55]],
];
for (let i = 0; i < 20; i++) {
  const [sub, en, ar, art, [lo, hi]] = med[i % med.length];
  add({
    cat: 'medical-supplies', sub, art, en: i >= 5 ? `${en} · ${pick(['M', 'L', 'XL', 'Pack of 100', 'Pack of 30'])}` : en, ar, brand: pick(brands),
    price: round5(between(lo, hi)) || 9, fits: sub === 'cushions' ? ['manual', 'power'] : ['manual', 'power', 'walker-crutches', 'other'],
    specs: [
      spec('size', 'Size', 'المقاس', pick(['S', 'M', 'L', '43 × 43 cm', '46 × 46 cm'])),
      spec('pack', 'Pack', 'العبوة', pick([1, 10, 30, 100])),
      spec('material', 'Material', 'المادة', pick(['Gel and foam', 'Nitrile', 'Cotton blend', 'Memory foam'])),
    ],
    attrs: {}, returnable: false,
    desc: 'Hygiene item, so it can’t be returned once opened. Ask us if you’re not sure of the size.',
  });
}
// ---------- Home adaptations (15)
const home = [
  ['portable-ramps', 'Folding portable ramp', 'منحدر محمول قابل للطي', 'ramp', [95, 420]],
  ['threshold-ramps', 'Rubber threshold ramp', 'منحدر عتبة مطاطي', 'threshold', [35, 120]],
  ['door-hinges', 'Door-widening hinges (pair)', 'مفصلات لتوسيع الباب', 'hinge', [25, 45]],
  ['stair-rails', 'Stair handrail', 'درابزين درج', 'stair-rail', [45, 160]],
];
for (let i = 0; i < 15; i++) {
  const [sub, en, ar, art, [lo, hi]] = home[i % home.length];
  const len = sub === 'portable-ramps' ? pick([90, 120, 150, 180, 240]) : between(60, 120);
  add({
    cat: 'home-adaptations', sub, art, en: i >= 4 ? `${en}, ${len} cm` : en, ar, brand: pick(brands),
    price: round5(between(lo, hi)), fits: ['manual', 'power'],
    specs: [
      spec('lengthCm', 'Length', 'الطول', len, 'cm'),
      spec('riseCm', 'Rise', 'الارتفاع', between(2, 25), 'cm'),
      spec('loadKg', 'Load capacity', 'الحمولة', pick([270, 300, 360]), 'kg'),
      spec('material', 'Material', 'المادة', pick(['Aluminium', 'Rubber', 'Steel'])),
    ],
    attrs: { weightLimitKg: 300 },
    desc: 'Grip surface for wet days and raised edges so wheels stay on. Carry handle included.',
  });
}
// ---------- Parts and accessories (20)
const parts = [
  ['tyres', 'Puncture-proof tyre, 24"', 'إطار مضاد للثقب 24 إنش', 'tyre', [35, 70]],
  ['tubes', 'Inner tube, 24"', 'أنبوب داخلي 24 إنش', 'tube', [9, 15]],
  ['armrests', 'Padded armrest pads (pair)', 'وسادات مسند الذراع', 'armrest', [18, 40]],
  ['gloves', 'Wheelchair push gloves', 'قفازات دفع للكرسي', 'push-gloves', [15, 35]],
  ['bags', 'Under-seat bag', 'حقيبة تحت المقعد', 'bag', [18, 45]],
  ['batteries', 'Power chair battery, 12 V', 'بطارية كرسي كهربائي', 'battery', [140, 320]],
];
for (let i = 0; i < 20; i++) {
  const [sub, en, ar, art, [lo, hi]] = parts[i % parts.length];
  add({
    cat: 'parts-accessories', sub, art, en: i >= 6 ? `${en} · ${pick(['Black', 'Grey', 'Universal'])}` : en, ar, brand: pick(brands),
    price: round5(between(lo, hi)) || 9, fits: sub === 'batteries' ? ['power'] : ['manual', 'power'],
    specs: [
      spec('compat', 'Fits', 'يناسب', pick(['Most 24" wheels', 'Universal', 'Most folding chairs', 'Aster, Atlas'])),
      spec('size', 'Size', 'المقاس', pick(['24 × 1⅜"', 'One size', 'M / L', '30 × 20 cm'])),
      spec('weightG', 'Weight', 'الوزن', between(120, 9000), 'g'),
    ],
    attrs: {},
    desc: 'A direct replacement part. Not sure it fits your chair? Send us a photo on WhatsApp.',
  });
}

const start = new Date('2026-06-01T00:00:00Z').getTime();
const products = T.map((p, i) => {
  const slug = (p.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + (i + 10)).slice(0, 60);
  const r = rnd();
  const status = r < 0.1 ? 'out' : r < 0.3 ? 'low' : 'in';
  const quantity = status === 'out' ? 0 : status === 'low' ? between(1, 3) : between(4, 40);
  const n = p.cat === 'mobility' || p.cat === 'home-adaptations' ? 4 : between(2, 3);
  const id = i === 0 ? 'prd_air-20-self-propelled' : `prd_${slug}`;
  return {
    id: p.sub === 'reachers' && !T.slice(0, i).some((x) => x.sub === 'reachers') ? 'prd_reacher-pro-82' : id,
    slug,
    name: { en: p.en, ar: p.ar },
    brand: p.brand,
    category: p.cat,
    subcategory: p.sub,
    priceCents: Math.max(900, p.price * 100),
    currency: 'USD',
    ...(rnd() < 0.12 ? { compareAtCents: Math.max(900, p.price * 100) + round5(p.price * 0.2) * 100 } : {}),
    images: Array.from({ length: n }, (_, k) => ({ art: p.art, seed: k, alt: { en: `${p.en}, view ${k + 1}`, ar: null } })),
    description: { en: p.desc, ar: null },
    keySpecs: p.specs,
    attributes: p.attrs,
    fitsMobility: p.fits,
    stock: { status, quantity },
    rating: { average: Math.round((3.8 + rnd() * 1.1) * 10) / 10, count: between(0, 120) },
    delivery: { beirutDays: [1, 2], otherDays: [2, 4] },
    returnable: p.returnable ?? true,
    isBestSeller: rnd() < 0.18,
    createdAt: new Date(start + between(0, 150) * 86400000).toISOString(),
    source: { type: 'curated' },
  };
});
writeFileSync(new URL('../src/data/fixtures/products.json', import.meta.url), JSON.stringify(products, null, 1));
const counts = products.reduce((m, p) => ((m[p.category] = (m[p.category] ?? 0) + 1), m), {});
console.log(products.length, counts);
