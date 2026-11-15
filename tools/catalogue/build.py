"""Builds the shop from the supplier catalogue.

Usage: python3 tools/catalogue/build.py "<path to Full Catalogue folder>"

Reads tools/catalogue/selection.txt (which products, names, copy, subcategory)
and the catalogue's prices.csv (image paths), then writes:
  - src/data/fixtures/products.json   (every price is 0 until the price list is set)
  - assets/catalogue/<id>.jpg         (800 px, white background)
  - src/art/catalogue.ts              (require() map for the photos)
"""
import csv
import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = Path(sys.argv[1])
OUT_IMG = ROOT / 'assets' / 'catalogue'
OUT_IMG.mkdir(parents=True, exist_ok=True)

SUB_TO_CAT = {
    'wheelchairs': 'mobility', 'scooters': 'mobility', 'stair-climbers': 'mobility', 'walkers': 'mobility', 'crutches': 'mobility', 'canes': 'mobility', 'accessories': 'mobility',
    'commodes': 'home-care', 'toilet-seats': 'home-care', 'bed-care': 'home-care',
    'cushions': 'cushions', 'mattresses': 'cushions', 'pillows': 'cushions',
    'ankle-foot': 'braces', 'knee': 'braces', 'hand-wrist': 'braces', 'arm-shoulder': 'braces', 'back-neck': 'braces', 'hip': 'braces',
    'exercise': 'therapy', 'tape': 'therapy', 'hot-cold': 'therapy', 'massage': 'therapy', 'traction': 'therapy',
    'blood-pressure': 'health', 'oximeters': 'health', 'thermometers': 'health', 'scales': 'health',
    'nebulizers': 'breathing', 'cpap': 'breathing', 'oxygen': 'breathing', 'spirometers': 'breathing', 'suction': 'breathing',
    'medication': 'daily', 'hearing': 'daily', 'compression': 'daily', 'foot-care': 'daily',
    'kits': 'first-aid', 'bandages': 'first-aid', 'dressings': 'first-aid', 'emergency': 'first-aid',
}
SPEC_AR = {
    'Type': 'النوع', 'Folds': 'قابل للطي', 'Cushion': 'الوسادة', 'Wheels': 'العجلات', 'Frame': 'الهيكل', 'Use': 'الاستخدام', 'Size': 'المقاس', 'Sizes': 'المقاسات',
    'Pack': 'العبوة', 'Base': 'القاعدة', 'Light': 'الضوء', 'Colours': 'الألوان', 'Colour': 'اللون', 'For': 'لـ', 'Shape': 'الشكل', 'Length': 'الطول', 'Pump': 'المنفاخ',
    'Side': 'الجهة', 'Widths': 'العروض', 'Voice': 'الصوت', 'Power': 'الطاقة', 'Capacity': 'السعة', 'Options': 'الخيارات', 'Contents': 'المحتوى',
}
# Items that can't be returned once opened.
NO_RETURN = {'compression', 'foot-care', 'dressings', 'bandages', 'tape', 'cpap', 'nebulizers', 'spirometers', 'medication', 'hearing', 'bed-care'}
BEST = {'P64-3', 'P63-5', 'P65-4', 'P66-3', 'P69-2', 'P63-1', 'P64-1', 'P45-1', 'P40-1', 'P04-2', 'P06-3', 'P70-4'}

def brand(cat_folder: str, name: str) -> str:
    for b in ('Yuwell', 'Kinlee', 'Alphamed', 'OxyWatch', 'Sibote'):
        if b.lower() in name.lower():
            return b
    return 'Sibote' if 'Sibote' in cat_folder else 'Medi Plus'

rows = {r['ID']: r for r in csv.DictReader(open(SRC / 'prices.csv', encoding='utf-8-sig'))}
products, requires = [], []
lines = [l for l in (ROOT / 'tools/catalogue/selection.txt').read_text(encoding='utf-8').splitlines() if l.strip() and not l.startswith('#')]
for i, line in enumerate(lines):
    pid, sub, en, ar, desc, fits, specs = [x.strip() for x in (line.split('|') + [''] * 7)[:7]]
    row = rows[pid]
    key = pid.lower()
    img = SRC / row['Image']
    out = OUT_IMG / f'{key}.jpg'
    if img.exists():
        im = Image.open(img).convert('RGBA')
        bg = Image.new('RGB', im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[3])
        bg.thumbnail((800, 800), Image.LANCZOS)
        bg.save(out, 'JPEG', quality=82, optimize=True, progressive=True)
    elif not out.exists():
        print('missing image', pid, img)
    requires.append(f"  '{key}': require('../../assets/catalogue/{key}.jpg'),")
    key_specs = []
    for s in filter(None, specs.split(';')):
        k, label, value = s.split('=')
        key_specs.append({'key': k, 'label': {'en': label, 'ar': SPEC_AR.get(label)}, 'value': value})
    products.append({
        'id': f'prd_{key}',
        'slug': f"{en.lower().replace(',', '').replace(' ', '-')}-{key}",
        'name': {'en': en, 'ar': ar},
        'brand': brand(row['Category'], row['Product']),
        'category': SUB_TO_CAT[sub],
        'subcategory': sub,
        'priceCents': 0,
        'currency': 'USD',
        'images': [{'art': f'cat:{key}', 'seed': 0, 'alt': {'en': en, 'ar': ar}}],
        'description': {'en': desc, 'ar': None},
        'keySpecs': key_specs,
        'attributes': {'catalogueId': pid, 'cataloguePage': int(row['Catalogue page']), **({'foldsForCar': True} if any(s['key'] == 'folds' for s in key_specs) else {})},
        'fitsMobility': [f for f in fits.split(',') if f],
        'stock': {'status': 'in', 'quantity': 20},
        'rating': {'average': 0, 'count': 0},
        'delivery': {'beirutDays': [1, 2], 'otherDays': [2, 4]},
        'returnable': sub not in NO_RETURN,
        **({'isBestSeller': True} if pid in BEST else {}),
        # Newest first follows catalogue order, so "New" isn't random.
        'createdAt': f'2026-11-{14 - (i // 20):02d}T{23 - (i % 20):02d}:00:00.000Z',
        'source': {'type': 'catalogue', 'id': pid, 'page': int(row['Catalogue page'])},
    })

(ROOT / 'src/data/fixtures/products.json').write_text(json.dumps(products, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
(ROOT / 'src/art/catalogue.ts').write_text(
    '// Generated by tools/catalogue/build.py from the supplier catalogue. Do not edit by hand.\n'
    'export const CATALOGUE_PHOTOS: Record<string, number> = {\n' + '\n'.join(requires) + '\n};\n', encoding='utf-8')
print(len(products), 'products')
