#!/usr/bin/env node
/* Contrast report. Strict: ANY failure exits 1.
 *
 *   node test/contrast.js      (or: npm run contrast)
 *
 * Text pairs need 4.5:1, UI boundaries and focus rings 3:1, large text 3:1.
 *
 * 1. Auto pairs: every CSS rule that sets `color: var(--x)` AND
 *    `background: var(--y)` is measured.
 * 2. State pairs: a hover/focus/selected rule that sets only one side is
 *    paired with the same element's base rule for the other side. This is
 *    the blind spot that let low-contrast hover states slip through before.
 * 3. Manual pairs (below): text that inherits its colour, or descendants of
 *    a state (e.g. a detail line inside a hovered row). Add to the list when
 *    a phase adds a new surface.
 *
 * Not measured: gradients, images, opacity, and anything inherited that is
 * not listed. This is a safety net, not a full audit.
 */
const fs = require('fs');
const path = require('path');

const css = path.join(__dirname, '..', 'assets', 'css');
const read = (f) => fs.readFileSync(path.join(css, f), 'utf8');
const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');

// ---------- tokens ----------
function block(src, headerRe) {
  const m = headerRe.exec(src);
  if (!m) throw new Error('block not found: ' + headerRe);
  let i = m.index + m[0].length, depth = 1;
  const start = i;
  while (depth && i < src.length) {
    const c = src[i++];
    if (c === '{') depth++; else if (c === '}') depth--;
  }
  return src.slice(start, i - 1);
}
const parseVars = (txt) => {
  const out = {}; let m; const re = /--([a-z0-9-]+):\s*([^;]+);/g;
  while ((m = re.exec(txt))) out[m[1]] = m[2].trim();
  return out;
};
const vars = {
  ...parseVars(block(strip(read('tokens.css')), /:root\s*\{/)),
  ...parseVars(block(strip(read('lost.css')), /:root\s*\{/)),
};

function resolveExpr(v, depth = 0) {
  if (!v || depth > 8) return null;
  v = v.trim();
  let m;
  if ((m = /^var\(--([a-z0-9-]+)\)$/.exec(v))) return resolveExpr(vars[m[1]], depth + 1);
  if ((m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v))) {
    let h = m[1];
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  }
  // opaque mixes only: color-mix(in srgb, A 70%, B). Mixes with transparent are skipped.
  if ((m = /^color-mix\(in srgb,\s*(.+?)\s+([\d.]+)%\s*,\s*(.+)\)$/.exec(v)) && !/transparent/.test(v)) {
    const a = resolveExpr(m[1], depth + 1), b = resolveExpr(m[3], depth + 1);
    if (!a || !b) return null;
    const t = parseFloat(m[2]) / 100;
    return a.map((x, i) => Math.round(x * t + b[i] * (1 - t)));
  }
  return null;
}
const resolve = (name) => resolveExpr(vars[name]);

// ---------- contrast math ----------
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// ---------- pairs ----------
const pairs = [];
const manual = [
  ['ink', 'cream', 'body text on page'], ['ink', 'white', 'body text on cards'],
  ['ink', 'paper', 'text on wells'], ['muted', 'cream', 'muted text on page'],
  ['muted', 'white', 'muted text on cards'], ['muted', 'paper', 'muted text on wells'],
  ['ink', 'gold', 'text on gold buttons / selection'], ['white', 'roster-bg', 'roster text'],
  ['white', 'sky', 'text on blue cards'], ['white', 'sky-dark', 'menu buttons / prompt bar'],
  ['white', 'sky-deep', 'dark hero panel text'], ['gold', 'sky-deep', 'hero heading on dark panel'],
  ['gold', 'sky-dark', 'stage number'], ['sky-dark', 'cream', 'profile role / accent text'],
  ['sky-dark', 'paper', 'page chip'], ['white', 'red-dark', 'banners and breadcrumb'],
  ['white', 'red', 'modal close button'], ['red-dark', 'white', 'field error text on cards'],
  ['red-dark', 'cream', 'field error text on page'], ['red-dark', 'paper', 'field error text on wells'],
  ['ink', 'error-bg', 'text inside an invalid field'],
  ['muted', 'gold', 'unstyled muted text on a gold fill (guard)', 3],
  // inherited-colour descendants of a state: the detail line inside a hovered contact row
  ['ink', 'gold', 'contact detail line on hover (rule turns it ink)'],
  // non-text UI (borders, rings) needs 3:1
  ['gold', 'ink', 'dialogue name bar'], ['white', 'step-bg', 'STAGE label on the number tile'],
  ['sky-dark', 'white', 'recipe + joints on a card'], ['red-dark', 'white', 'quest number prefix on a card'],
  ['menu-ring', 'menu-hover-bg', 'hover ring on a menu slab', 3],
  ['outline', 'cream', 'card outline on page', 3], ['outline', 'roster-bg', 'card outline on roster', 3],
  ['outline', 'white', 'input/card outline on white', 3],
  ['focus-ring', 'cream', 'focus ring on page', 3], ['focus-ring', 'white', 'focus ring on cards', 3],
  ['focus-ring', 'paper', 'focus ring on wells', 3],
  // 404 stage ('@86' = that colour at 86% opacity over the stage)
  ['scene-cream', 'scene-bg', '404 heading'], ['scene-text@86', 'scene-bg', '404 body text'],
  ['scene-text@70', 'scene-bg', '404 fine print'], ['scene-gold-lite', 'scene-bg', '404 readout labels and links'],
  ['scene-gold', 'scene-bg', '404 big number (large text)', 3], ['scene-cream', 'scene-x', '404 tag and you-are-here label'],
  ['scene-ink', 'scene-cream', '404 signal label'], ['scene-ink', 'scene-gold', '404 buttons and locked signal'],
  ['scene-cream', 'scene-ink', '404 pin tag'],
  // standalone/secret page headings are large text
  ['red', 'cream', 'secret level heading (large text)', 3], ['sky', 'cream', 'big glyph (large text)', 3],
];
manual.forEach(([fg, bg, label, min]) => pairs.push({ fg, bg, label: label + ' (manual)', min: min || 4.5 }));

// collect rules
const STATE = /:(hover|focus-visible|focus|active)|\[aria-(?:selected|current|pressed)="[^"]*"\]/g;
const rules = []; // {sel, fg, bg, file}
const skip = ['tokens.css', 'print.css', 'lost.css'];
for (const f of fs.readdirSync(css).filter((n) => n.endsWith('.css') && !skip.includes(n))) {
  const src = strip(read(f));
  for (const m of src.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const body = m[2];
    const fg = /(?:^|[;\s])color:\s*var\(--([a-z0-9-]+)\)\s*(?:;|$)/.exec(body);
    const bg = /background(?:-color)?:\s*var\(--([a-z0-9-]+)\)\s*(?:;|$)/.exec(body);
    m[1].split(',').map((s) => s.trim().replace(/\s+/g, ' ')).filter((s) => s && !s.startsWith('@')).forEach((sel) =>
      rules.push({ sel, fg: fg && fg[1], bg: bg && bg[1], file: f }));
  }
}
const base = new Map(); // selector -> merged declarations (later rules win)
rules.forEach((r) => {
  const cur = base.get(r.sel) || {};
  base.set(r.sel, { fg: r.fg || cur.fg, bg: r.bg || cur.bg });
});
rules.forEach((r) => {
  if (r.fg && r.bg) { pairs.push({ fg: r.fg, bg: r.bg, min: 4.5, label: `${r.file}: ${r.sel.slice(0, 60)}` }); return; }
  const baseSel = r.sel.replace(STATE, '').trim();
  if (baseSel === r.sel || !base.has(baseSel)) return; // not a state rule, or no base to inherit from
  const b = base.get(baseSel);
  if (r.bg && !r.fg && b.fg) pairs.push({ fg: b.fg, bg: r.bg, min: 4.5, label: `${r.file}: ${r.sel.slice(0, 50)} (bg from state, text from base)` });
  if (r.fg && !r.bg && b.bg) pairs.push({ fg: r.fg, bg: b.bg, min: 4.5, label: `${r.file}: ${r.sel.slice(0, 50)} (text from state, bg from base)` });
});

// ---------- report ----------
const seen = new Set();
let ok = 0, skipped = 0; const failures = [];
for (const p of pairs) {
  const key = `${p.fg}|${p.bg}|${p.label}`;
  if (seen.has(key)) continue; seen.add(key);
  const [fgName, alpha] = p.fg.split('@');
  let a = resolve(fgName); const b = resolve(p.bg);
  if (a && b && alpha) a = a.map((x, i) => Math.round(x * alpha / 100 + b[i] * (1 - alpha / 100)));
  if (!a || !b) { skipped++; continue; }
  const r = ratio(a, b);
  if (r < p.min) failures.push(`FAIL  ${r.toFixed(2)} < ${p.min}  --${p.fg} on --${p.bg}   [${p.label}]`);
  else ok++;
}
console.log(failures.join('\n') || 'no failures');
console.log(`\n${ok} pairs pass (4.5:1 text, 3:1 UI/large) | ${failures.length} fail | ${skipped} skipped (non-flat colours)`);
process.exit(failures.length ? 1 : 0);
