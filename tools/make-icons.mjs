// Renders the app icon and splash mark from the Movo M mark (navy + mint).
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 40 40"><defs><radialGradient id="g" cx="30%" cy="20%" r="90%"><stop offset="0" stop-color="#03506B"/><stop offset="1" stop-color="#012433"/></radialGradient></defs><rect width="40" height="40" fill="url(#g)"/><path d="M10 27 L10 15 L20 23 L30 15 L30 27" stroke="#22D39C" stroke-width="4.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const splash = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 40 40"><path d="M10 27 L10 15 L20 23 L30 15 L30 27" stroke="#22D39C" stroke-width="4.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const b = await chromium.launch();
for (const [svg, size, out, transparent] of [[icon, 1024, 'assets/images/icon.png', false], [splash, 400, 'assets/images/splash-icon.png', true], [icon, 48, 'assets/images/favicon.png', false]]) {
  const p = await b.newPage({ viewport: { width: size, height: size } });
  await p.setContent(`<html><body style="margin:0;background:transparent"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" width="${size}" height="${size}" style="display:block"></body></html>`);
  await p.screenshot({ path: out, omitBackground: transparent });
}
await b.close();
console.log('icons ok');
