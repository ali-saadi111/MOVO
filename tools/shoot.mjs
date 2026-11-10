// Screenshot the web preview at iPhone 16 Pro size. Usage:
// node tools/shoot.mjs out.png /path [--dark] [--ar] [--fresh] [--signed] [--click "text"]...
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [out, path = '/', ...flags] = process.argv.slice(2);
const has = (f) => flags.includes(f);
const clicks = flags.flatMap((f, i) => (f === '--click' || f === '--label' ? [[f, flags[i + 1]]] : []));
const waitMs = Number(flags.find((f) => f.startsWith('--wait='))?.slice(7) ?? 1600);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: Number(process.env.DPR ?? 2), colorScheme: has('--dark') ? 'dark' : 'light' });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('http://localhost:8081/', { waitUntil: 'domcontentloaded' });
await page.evaluate(({ fresh, ar, dark, signed, cart }) => {
  localStorage.clear();
  const put = (k, s) => localStorage.setItem(k, JSON.stringify({ state: s, version: 0 }));
  put('movo.settings', { lang: ar ? 'ar' : 'en', onboarded: !fresh, appearance: dark ? 'dark' : 'light', highContrast: false, reduceMotion: false, textScale: 1, mobility: fresh ? [] : ['manual'], mobilityOther: '', forWhom: 'me', checkIn: 'encouragement', quietHours: true, pausedUntil: null, notify: { bookings: true, orders: true, events: true, places: true, news: false } });
  put('movo.dev', { latency: false, forceError: false, forceEmpty: false, offline: false, homeTab: false, paymentOutcome: 'success', slotTaken: false });
  if (signed) put('movo.session', { user: { id: 'usr_karim', firstName: 'Karim', fullName: 'Karim Haddad', email: 'karim.haddad@example.com' } });
  if (cart) put('movo.cart', { lines: [{ productId: 'prd_air-20-self-propelled', qty: 1 }, { productId: 'prd_reacher-pro-82', qty: 2 }] });
}, { fresh: has('--fresh'), ar: has('--ar'), dark: has('--dark'), signed: !has('--signedout'), cart: has('--cart') });
await page.goto('http://localhost:8081' + path, { waitUntil: 'networkidle' });
await page.waitForTimeout(waitMs);
await page.addStyleTag({ content: '#error-toast{display:none!important}' }); // dev-only warning toast
for (const [kind, c] of clicks) {
  await (kind === '--label' ? page.getByLabel(c, { exact: true }) : page.getByText(c, { exact: false })).first().click();
  await page.waitForTimeout(1200);
}
if (has('--scroll')) { await page.mouse.move(196, 500); await page.mouse.wheel(0, 600); await page.waitForTimeout(800); }
await page.screenshot({ path: out });
if (errors.length) console.log('ERRORS in ' + out + ':\n' + [...new Set(errors)].slice(0, 8).join('\n'));
await browser.close();
