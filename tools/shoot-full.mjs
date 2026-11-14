// Full-length shot: node tools/shoot-full.mjs out.png /path [--dark] [--click text]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [out, path = '/', ...flags] = process.argv.slice(2);
const has = (f) => flags.includes(f);
const clicks = flags.flatMap((f, i) => (f === '--click' ? [flags[i + 1]] : []));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, colorScheme: has('--dark') ? 'dark' : 'light' });
await page.goto('http://localhost:8081/', { waitUntil: 'domcontentloaded' });
await page.evaluate(({ dark }) => {
  localStorage.clear();
  const put = (k, s) => localStorage.setItem(k, JSON.stringify({ state: s, version: 0 }));
  put('movo.settings', { lang: 'en', onboarded: true, appearance: dark ? 'dark' : 'light', highContrast: false, reduceMotion: true, textScale: 1, mobility: ['manual'], mobilityOther: '', forWhom: 'me', checkIn: 'encouragement', quietHours: true, pausedUntil: null, notify: { bookings: true, orders: true, events: true, places: true, news: false } });
  put('movo.dev', { latency: false, forceError: false, forceEmpty: false, offline: false, homeTab: false, paymentOutcome: 'success', slotTaken: false });
  put('movo.session', { user: { id: 'usr_karim', firstName: 'Karim', fullName: 'Karim Haddad', email: 'karim.haddad@example.com' } });
}, { dark: has('--dark') });
await page.goto('http://localhost:8081' + path, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
await page.addStyleTag({ content: '#error-toast{display:none!important}' });
for (const c of clicks) { await page.getByText(c, { exact: true }).locator('visible=true').first().click(); await page.waitForTimeout(1500); }
if (!has('--noscroll')) {
  const extra = await page.evaluate(() => { let m = 0; for (const el of document.querySelectorAll('div')) { const d = el.scrollHeight - el.clientHeight; const st = getComputedStyle(el).overflowY; if (d > m && el.clientHeight > 400 && (st === 'auto' || st === 'scroll')) m = d; } return m; });
  if (extra > 0) { await page.setViewportSize({ width: 393, height: 852 + extra }); await page.waitForTimeout(1500); }
  console.log(out, 'screens', ((852 + extra) / 852).toFixed(2));
}
await page.screenshot({ path: out });
await browser.close();
