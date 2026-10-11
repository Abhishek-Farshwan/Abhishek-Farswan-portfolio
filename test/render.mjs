#!/usr/bin/env node
/* Optional visual check: renders every page in a real headless Chromium.
 *
 *   npm install --no-save jsdom puppeteer-core @sparticuz/chromium \
 *     @fontsource/press-start-2p @fontsource/nunito-sans
 *   npm run render                 # all pages x 4 widths + a print render
 *   node test/render.mjs --only about --out my-shots
 *
 * Writes PNGs to ./render-out (override with --out) and exits 1 if any page
 * throws a script error, scrolls sideways, or has a visible element extending
 * past the viewport edge (which catches content clipped by overflow:hidden).
 *
 * Why it is optional: it needs ~100 MB of extra packages, which the project
 * deliberately does not depend on. @sparticuz/chromium ships a Chromium build
 * inside the npm package, so nothing is downloaded from outside the registry.
 * Include jsdom in the same install command, or npm may prune it as extraneous.
 *
 * What it does NOT judge: taste. It proves the pages render without errors
 * and without sideways scroll; a person still decides if they look right.
 *
 * Network: external requests (Sketchfab, icon CDNs) are blocked, so the art
 * grid shows its offline state and contact icons show their text fallbacks.
 * Google Fonts is replaced by the same two families served from node_modules.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, fallback) => { const i = process.argv.indexOf('--' + name); return i > -1 ? process.argv[i + 1] : fallback; };
const OUT = path.resolve(arg('out', path.join(ROOT, 'render-out')));
const ONLY = arg('only', '');

let chromium, puppeteer;
try {
  chromium = (await import('@sparticuz/chromium')).default;
  puppeteer = (await import('puppeteer-core')).default;
} catch (error) {
  console.error('Missing packages. Install them first:\n  npm install --no-save jsdom puppeteer-core @sparticuz/chromium @fontsource/press-start-2p @fontsource/nunito-sans');
  process.exit(2);
}

const PAGES = [
  ['home', '/index.html#home'], ['art', '/index.html#art'], ['pipeline', '/index.html#pipeline'],
  ['about', '/index.html#about'], ['contact', '/index.html#contact'],
  ['resume', '/resume.html'], ['404', '/404.html'], ['secret', '/game/secret_level/index.html'],
];
const VIEWPORTS = [['phone', 360, 740], ['tablet', 768, 1024], ['laptop', 1280, 760], ['desktop', 1919, 914]];
const jobs = [];
for (const [name, url] of PAGES) for (const [vp, w, h] of VIEWPORTS) jobs.push({ name: `${name}-${vp}`, url, w, h, media: 'screen' });
jobs.push({ name: 'resume-print', url: '/resume.html', w: 794, h: 1123, media: 'print', full: true });

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain' };
const FONTS = path.join(ROOT, 'node_modules', '@fontsource');
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  let file;
  if (url.startsWith('/__fonts/')) { const [, , pkg, name] = url.split('/'); file = path.join(FONTS, pkg, 'files', name); }
  else file = path.join(ROOT, url.endsWith('/') ? url + 'index.html' : url);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(0);
await new Promise((resolve) => server.on('listening', resolve));
const origin = `http://localhost:${server.address().port}`;
const face = (family, pkg, weight, file) => `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:swap;src:url(${origin}/__fonts/${pkg}/${file}) format('woff2');}`;
const fontCss = [face('Press Start 2P', 'press-start-2p', 400, 'press-start-2p-latin-400-normal.woff2'),
  ...[400, 600, 700, 800].map((w) => face('Nunito Sans', 'nunito-sans', w, `nunito-sans-latin-${w}-normal.woff2`))].join('\n');

fs.mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({ args: [...chromium.args, '--no-sandbox'], executablePath: await chromium.executablePath(), headless: 'shell' });
let problems = 0, ran = 0;
for (const job of jobs.filter((j) => !ONLY || j.name.includes(ONLY))) {
  const page = await browser.newPage();
  await page.setViewport({ width: job.w, height: job.h, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);   // stable shots
  await page.emulateMediaType(job.media);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) errors.push(m.text()); });
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const u = req.url();
    if (u.startsWith(origin) || u.startsWith('data:')) return req.continue();
    if (u.includes('fonts.googleapis.com')) return req.respond({ status: 200, contentType: 'text/css', body: fontCss });
    return req.abort();
  });
  await page.goto(origin + job.url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Sideways overflow, measured two ways. Scroll width alone is not enough: a
  // parent with overflow:hidden (like the hero) CLIPS an oversized child instead
  // of scrolling, so we also flag any visible element that pokes past the viewport.
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    const vw = doc.clientWidth;
    const scroller = document.querySelector('.detail') || doc;
    const docOver = doc.scrollWidth - window.innerWidth;
    const panelOver = scroller.scrollWidth - scroller.clientWidth;
    const label = (el) => el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : '');
    const offenders = [];
    // Judge CONTENT only: text, images, controls. SVG scenery (like the 404's map trail
    // and contour lines) bleeds off the edge on purpose, and plain wrapper divs are
    // covered by the content inside them.
    const CONTENT = 'img,input,select,textarea,button,iframe,video,canvas';
    const hasOwnText = (el) => Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
    for (const el of document.querySelectorAll('body *')) {
      if (el instanceof SVGElement) continue;
      if (!el.matches(CONTENT) && !hasOwnText(el)) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if (r.right > vw + 1) offenders.push(`${label(el)} (+${Math.round(r.right - vw)}px)`);
    }
    return { docOver, panelOver, offenders: offenders.slice(0, 6), count: offenders.length };
  });
  await page.screenshot({ path: path.join(OUT, `${job.name}.png`), fullPage: !!job.full });
  const sideways = overflow.docOver > 1 || overflow.panelOver > 1 || overflow.count > 0;
  const bad = errors.length > 0 || sideways;
  if (bad) problems++;
  ran++;
  console.log(`${bad ? 'FAIL' : 'ok  '}  ${job.name.padEnd(18)} ${job.w}x${job.h}${errors.length ? '  errors: ' + errors.join(' | ') : ''}${sideways ? `  past the viewport: ${overflow.count} element(s) [${overflow.offenders.join(', ')}]  (scroll: doc +${overflow.docOver}px, panel +${overflow.panelOver}px)` : ''}`);
  await page.close();
}
await browser.close();
server.close();
console.log(`\n${ran} renders -> ${OUT} | ${problems ? problems + ' with problems' : 'no errors, no sideways scroll'}`);
process.exit(problems ? 1 : 0);
