#!/usr/bin/env node
/* Static lint for the stylesheet and page conventions in PROJECT_GUIDE.md.
 *
 *   node test/theme-lint.js      (or: npm run lint)
 *
 * No browser needed. Exits 1 on any FAIL. INFO lines never fail.
 * Run with the smoke test and the contrast check via `npm run check`.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CSS = path.join(ROOT, 'assets', 'css');
const JS = path.join(ROOT, 'assets', 'js');
const read = (p) => fs.readFileSync(p, 'utf8');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');
const exists = (p) => fs.existsSync(path.join(ROOT, p));

let failures = 0;
function check(name, ok, detail) {
  if (!ok) failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${!ok && detail ? '  -> ' + detail : ''}`);
}
const info = (msg) => console.log('INFO  ' + msg);

const cssFiles = fs.readdirSync(CSS).filter((f) => f.endsWith('.css'));
const css = Object.fromEntries(cssFiles.map((f) => [f, read(path.join(CSS, f))]));
const jsText = fs.readdirSync(JS).filter((f) => f.endsWith('.js')).map((f) => read(path.join(JS, f))).join('\n');
const RAW = /#[0-9a-fA-F]{3,8}\b|rgba?\(/;

/* ---- tokens ---- */
const defined = new Set();
Object.values(css).forEach((s) => (strip(s).match(/--[a-z0-9-]+(?=\s*:)/g) || []).forEach((n) => defined.add(n)));
const used = new Set();
const undef = new Set();
Object.values(css).forEach((s) => {
  for (const m of strip(s).matchAll(/var\((--[a-z0-9-]+)/g)) {
    used.add(m[1]);
    if (!defined.has(m[1]) && !jsText.includes(m[1])) undef.add(m[1]);
  }
});
check('every var(--token) is defined (or set from JS)', undef.size === 0, [...undef].join(', '));

/* ---- no raw colours outside tokens ---- */
const themeable = ['base.css', 'components.css', 'layout.css', 'modal.css', 'nav.css', 'panels.css', 'responsive.css', 'decor.css'];
const leaks = themeable.filter((f) => css[f] && RAW.test(strip(css[f])));
check('no raw colours in base/components/layout/modal/nav/panels/responsive/decor', leaks.length === 0, leaks.join(', '));

// lost.css: raw colours only inside its :root token block and the .reveal mask
const lost = strip(css['lost.css']).replace(/:root\s*\{[^}]*\}/, '').replace(/^.*\.reveal\s*\{.*$/m, '');
check('lost.css keeps raw colours only in its :root block and the .reveal mask', !RAW.test(lost), (lost.match(RAW) || []).join(' '));

/* ---- decor.css ---- */
const decor = strip(css['decor.css']);
check('decor.css braces balance', decor.split('{').length === decor.split('}').length);
// decoration only: on real elements decor.css may set ornament properties and nothing else.
// Pseudo-elements (::before/::after) are free to size and position their marks.
const ORNAMENT = new Set(['background-image', 'background-size', 'background-repeat', 'background-position', 'background-color', 'color',
  'transition-timing-function', 'animation', 'border-radius', 'box-shadow', 'counter-reset', 'counter-increment']);
const layoutLeaks = [];
for (const m of decor.replace(/@keyframes[^{]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  const sel = m[1].trim();
  if (sel.includes('::') || sel.startsWith('@')) continue;
  for (const d of m[2].split(';')) {
    const prop = d.split(':')[0].trim();
    if (!prop || prop.startsWith('--') || ORNAMENT.has(prop)) continue;
    if (prop === 'position' && d.split(':')[1].trim() === 'relative') continue; // anchor for a pseudo-element ornament
    layoutLeaks.push(`${sel} { ${prop} }`);
  }
}
check('decor.css sets only ornament properties on real elements', layoutLeaks.length === 0, layoutLeaks.slice(0, 3).join(' | '));

/* ---- one theme, no switching ---- */
check('theme.js (switching) is gone', !exists('assets/js/theme.js') && !/THEME|theme-toggle|data-theme/.test(jsText));
const linked = ['tokens.css', 'base.css', 'components.css', 'layout.css', 'modal.css', 'nav.css', 'panels.css', 'responsive.css', 'decor.css', 'lost.css'];
const themed = linked.filter((f) => f !== 'tokens.css' && css[f] && /data-theme/.test(css[f]));
check('no [data-theme] selectors in the stylesheets that ship', themed.length === 0, themed.join(', '));
const tokensRaw = strip(css['tokens.css']);
check('the retired cozy theme stays gone (no stylesheet, no token block)', !exists('assets/css/theme-cozy.css') && !/data-theme|THEME: cozy/.test(tokensRaw));

/* ---- pages ---- */
const pages = ['index.html', 'resume.html', '404.html', 'game/secret_level/index.html'];
const versions = new Set();
pages.forEach((page) => {
  const html = read(path.join(ROOT, page));
  const head = html.slice(0, html.indexOf('</head>'));
  check(`${page}: plain <html> (no data-theme)`, !/data-theme/.test(html));
  check(`${page}: no theme script, no cozy stylesheet`, !/theme\.js|theme-cozy\.css/.test(html));
  check(`${page}: fonts are Nunito Sans + Press Start 2P only`, /Nunito\+Sans/.test(head) && /Press\+Start\+2P/.test(head) && !/Fredoka|family=Nunito:/.test(head));
  check(`${page}: decor.css loads after responsive.css`, head.indexOf('decor.css') > head.indexOf('responsive.css') && head.indexOf('responsive.css') > -1);
  check(`${page}: decor.css is screen-only (never prints)`, /decor\.css\?v=[^"]+"\s+media="screen"/.test(head));
  check(`${page}: single theme-color`, /<meta name="theme-color" content="#[0-9a-f]{6}" \/>/.test(head));
  check(`${page}: no inline style attributes`, !/ style="/.test(html));
  (html.match(/\?v=[0-9]+-[0-9]+/g) || []).forEach((v) => versions.add(v));
});
check('one cache-bust token across all pages', versions.size === 1, [...versions].join(', '));
check('resume.html links print.css with media="print"', /<link[^>]*print\.css[^>]*media="print"/.test(read(path.join(ROOT, 'resume.html'))));

/* ---- info: tokens nobody uses (candidates to prune) ---- */
const refd = new Set();
Object.values(css).forEach((s) => { for (const m of strip(s).matchAll(/var\((--[a-z0-9-]+)/g)) refd.add(m[1]); });
const rootBlock = tokensRaw.slice(tokensRaw.indexOf(':root'), tokensRaw.indexOf('}', tokensRaw.indexOf(':root')));
const unused = (rootBlock.match(/--[a-z0-9-]+(?=\s*:)/g) || []).filter((n) => !refd.has(n) && !jsText.includes(n));
check('no unused tokens in :root', unused.length === 0, unused.join(' '));

console.log('\n' + (failures === 0 ? 'THEME LINT PASSED' : failures + ' THEME LINT CHECK(S) FAILED'));
process.exit(failures === 0 ? 0 : 1);
