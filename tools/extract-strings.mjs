// Collects every tr('key', 'English default') call into src/i18n/locales/en.json.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const out = {};
const conflicts = [];
const walk = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(f) && scan(readFileSync(p, 'utf8'), p); });
const re = /\btr\(\s*(['"`])([\w.]+)\1\s*,\s*(['"])((?:\\.|(?!\3).)*)\3/g;
function scan(src, p) {
  for (const m of src.matchAll(re)) {
    const v = m[4].replace(/\\'/g, "'").replace(/\\"/g, '"');
    if (out[m[2]] && out[m[2]] !== v) conflicts.push(`${m[2]}: "${out[m[2]]}" vs "${v}" (${p})`);
    out[m[2]] ??= v;
  }
}
walk('src');
Object.assign(out, { 'rel.parent': 'Parent', 'rel.child': 'Child', 'rel.partner': 'Partner', 'rel.other': 'Other', 'rel.daughter': 'Daughter' });
const sorted = Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]));
writeFileSync('src/i18n/locales/en.json', JSON.stringify(sorted, null, 2) + '\n');
console.log(Object.keys(sorted).length, 'strings');
if (conflicts.length) console.log('Conflicts:\n' + conflicts.join('\n'));
