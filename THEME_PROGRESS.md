# Theme project — progress

STATUS: ALL PHASES COMPLETE. This file is a work log; delete it whenever you like.

Goal: cozy crafting-sim theme (cream paper, periwinkle roster, amber CTA, lilac
headers, rounded font, soft borders). Mode: `data-theme` toggle, Bright Ledger
kept as the fallback theme. Re-upload this zip in a new chat and say "continue".

Rules for every phase: whole working site at the end, `node test/smoke.js`
green, no half-written files, bump the `?v=` cache token when CSS/JS ships.

## Checklist

- [x] Phase 0 — baseline: smoke test green (101 checks) before any edit
- [x] Phase 1 — token refactor, no visual change (2026-10-05)
- [x] Phase 2 — cozy token block, rounded fonts, soft borders/shadows, font links, contrast report (2026-10-05)
- [x] Phase 3 — shell: roster, menu cards, profile card, crumb, prompt bar, key caps (2026-10-05)
- [x] Phase 4 — components: pill CTAs, tab labels, chips, cards, inputs, modal/inspector (2026-10-06)
- [x] Phase 5a — Home + Art panels (2026-10-06)
- [x] Phase 5b — Pipeline (recipe) + About (dialogue) + Contact (bulletin) (2026-10-06)
- [x] Phase 6 — 404 scene, secret level, resume, print check (2026-10-06)
- [x] Phase 7 — theme toggle, docs, manifest, final QA (2026-10-06)

## Phase 1 log (done)

New tokens in `tokens.css`: `--grid-line`, `--ink-dash-30/35`, `--scrim`,
`--scrim-sky`, `--white-a30/a75`, `--gold-glow-30/35/40/75`, `--sky-glow-22`,
`--shine-55/60`, `--error-bg`, `--icon-on-dark`, `--icon-on-light`.
Derived tints use `color-mix()` on the base palette, so they follow a theme
as long as the theme overrides base colours on `:root` (same element).

- 0 hardcoded colours left in base/components/layout/modal/nav/panels/responsive.
  Still literal on purpose: `print.css` (print stays fixed), `lost.css` (Phase 6).
- 15 inline `style=""` attributes -> utility classes (`.mt-2..5`, `.u-dim`,
  `.u-center-text`, `.u-center-row`, `.u-fs-body`, `.u-title-sm`) at the bottom
  of `components.css`. Only `404.html` keeps inline styles (map-pin coordinates).
- Cache token is now `?v=20261005-1` on all 4 pages.
- Verified: CSS reverse-expands byte-identical to the original, all 14 tint
  tokens numerically equal the old rgba values, smoke test green, HTML balanced.
- Not verifiable here: real-browser rendering (no Chromium in the sandbox).

## Phase 2 log (done)

- `tokens.css`: new `:root[data-theme="cozy"]` block inside `@media screen`
  (print keeps the fixed ledger look). Values only, no rule changes yet.
  Remove `data-theme="cozy"` from `<html>` (or set `ledger`) to get Bright Ledger back.
- New tokens, ledger-identical by default: `--outline`, `--lilac`, `--olive`,
  `--coral`, `--fs-h1`, `--fs-h2`, `--ls-head`, `--ls-h1`, plus semantic roles
  `--roster-bg/-fg`, `--card-bg`, `--header-bg`, `--cta-bg/-fg`, `--text-accent`.
  The semantic roles are DEFINED but not yet WIRED into rules: Phase 3 wires
  roster-*, Phase 4 wires card/header/cta/text-accent.
- `base.css` heading size/tracking now read tokens (ledger parity verified).
- Fonts: `Fredoka:wght@600` (chrome, single semibold weight on purpose) and
  `Nunito` (body) added to the Google Fonts link on all 4 pages; the ledger
  fonts stay loaded for the fallback theme. Sizes step up in cozy because the
  rounded face is narrower than Press Start 2P.
- Cozy palette is tuned to pass 4.5:1: `--sky #5d6fbb`, `--sky-dark #3c4b94`,
  `--sky-deep #2e3a7a`, `--red #c24a27`, `--olive #4f6614`. The brighter coral
  from the references lives in `--coral` for Phase 4 close buttons.
- `node test/contrast.js` (or `npm run contrast`; `--strict` exits 1 on a
  regression): 55 pairs pass in cozy, 0 regressions. Cozy also fixes the
  modal-close white-on-red failure that ledger already had.
- Theme-color meta is `#5d6fbb` on index/resume/secret. `404.html` keeps its
  dark scene colour and `site.webmanifest` colours are untouched until Phase 6/7.
- Cache token is `?v=20261005-2`.
- Expected look right now (hybrid until Phases 3-5): cream paper, brown ink,
  periwinkle roster, amber selection, rounded type, thin soft borders and
  diffuse shadows. Hover offsets, pixel-style uppercase labels and `//`
  decorations are still ledger-era; those are restyled in later phases.
- Not verifiable here: live Google Fonts (sandbox can't reach it) and real
  rendering. If the fonts fail to load, the stack falls back to `ui-rounded`/system sans.

## Phase 3 log (done)

- New shell role tokens in `tokens.css` (ledger defaults = the old values):
  `--roster-icon/-rule`, `--roster-chip-bg/-fg/-edge/-hover`, `--menu-bg/-fg`,
  `--menu-hover-bg/-fg`, `--menu-ring`, `--menu-active-bg/-fg`, `--menu-ext-bg/-fg`,
  `--crumb-bg/-fg`. Wired into `layout.css` and `nav.css`; `--text-accent` is now
  wired on `.profile-role`. `--roster-bg/-fg` are wired on `.roster` and `.tabbar`.
- Ledger parity verified: `layout.css` and `nav.css` expand back identical to
  their Phase 2 versions (one deliberate addition: explicit colour on `.roster-status`).
- NEW FILE `assets/css/theme-cozy.css`: cozy-only rules (shape, soft states,
  washi tape on the profile card, dashed stitch divider, sticker crumb, pill
  chips, rounded key caps and tab bar). Every selector is scoped to
  `:root[data-theme="cozy"]`, no raw colours, linked with `media="screen"` after
  `responsive.css` on all 4 pages. Add each later phase as a new section at the bottom.
- Cozy roster is `#a7b6ec` with brown text; menu cards are white; hover = lift +
  deep amber ring (`--menu-ring #bf7410`, 3.6:1 on white); open panel = amber fill,
  slides 3px right; resume entry = dashed lilac.
- Contrast checker now resolves opaque `color-mix()` and supports 3:1 UI
  pairs. It caught a real defect: the cozy outline (70% ink) was 2.45:1 on the
  roster. Fixed with `--outline` = 85% ink (3.7:1 on roster, 6.5:1 on cream).
  Now 60 pairs pass, 0 regressions, 0 skipped.
- Cache token is `?v=20261005-3`.
- Not verifiable here: real rendering. Eyeball: roster (dots, cards, tape on the
  profile card), hover/selected/keyboard states, resume entry, sound toggle,
  prompt bar key caps, and the mobile tab bar under 900px.

## Phase 4 log (done)

- New component role tokens (ledger defaults = old values): `--banner-bg/-fg`,
  `--focus-ring`, `--modal-head-bg/-fg`. Now wired: `--cta-bg/-fg` on `.btn`,
  `--text-accent` on `.stat strong`, `.bullet b`, `.entry-org`, `.modal-counter`,
  `--focus-ring` on form-field focus and the reading-mode ring in `layout.css`.
- Edits to `components.css`, `modal.css`, `layout.css` are token swaps only
  (checked by an exact line diff); `nav.css`, `base.css`, `panels.css`,
  `responsive.css`, `print.css`, `lost.css` are byte-identical to Phase 3.
- `theme-cozy.css` gained a Phase 4 section: notebook-grid `.card--paper` with a
  lilac sheet underneath, stitched pale-green banner tabs (olive text, 5.1:1),
  pill chips, amber pill buttons with gloss + pressed edge (`.btn--sky` has no
  gloss so white text keeps contrast), rounder stat/bullet tiles, round timeline
  markers on a stitched rail, white pill-ish form fields, lilac dashed
  inspector header, round close button.
- Focus ring: cozy uses `#b56c0c` (3.2-4.0:1 on cream/white/paper). Bright Ledger
  keeps gold, which is only 1.5:1 on cream (pre-existing, left alone on purpose).
- `test/contrast.js` gained pairs for focus ring (3:1), field-error text and
  invalid-field text. 67 pairs pass in cozy, 0 regressions, 0 skipped.
- Cache token is `?v=20261005-4`.
- Known limits: the button gloss is a gradient, which the contrast checker
  cannot measure (it only brightens the top of the amber, so ink text gets
  safer, not worse). Toasts and the Art/Pipeline/About/Contact panel internals
  are untouched until Phase 5. `.btn--sky` is currently unused in the markup.
- Not verifiable here: real rendering. Eyeball: hero buttons, section banners,
  skill chips, the About career log, the Contact form (focus ring, invalid
  state), and the Art inspector (header, close button, prev/next buttons).

## Phase 5a log (done)

- New panel role tokens (ledger defaults = old values): `--eyebrow-bg/-fg`,
  `--hero-side-bg/-fg/-accent`, `--badge-staff-bg/-fg`, `--badge-featured-bg/-fg`.
  Wired in `panels.css` (plus `.hero-tagline` now reads `--text-accent`).
  Cozy also sets `--header-bg` to lilac (it was defined since Phase 2 but unused).
- Ledger parity: `panels.css` expands back identical to Phase 4; all other CSS
  files are byte-identical to Phase 4.
- `theme-cozy.css` Phase 5a section:
  - Hero = scrapbook page: sky gradient mat, white copy card with washi tape,
    notebook-grid loadout card (olive heading, lilac label strip), mint eyebrow
    pill, die-cut sticker portrait (white outline + soft shadow, tilted 3deg).
    The loadout card has a full border so it still reads as a card when the
    hero stacks under 900px (overrides the responsive `border-left: 0` rule).
  - Art cards = polaroids: tape strip top-centre of the thumbnail (lilac / mint /
    amber rotating by position; top-centre because Sketchfab draws avatar and
    share buttons in the top corners), roomier body, 15px title, pill INSPECT
    button, featured badge = mint tag, staff pick = amber tag.
- Contrast: 70 pairs pass in cozy, 0 regressions, 0 skipped. New manual pairs for
  the loadout heading/text on its panel.
- Cache token is `?v=20261005-5`.
- Known limits: the checker cannot measure the gradient mat (it holds no text;
  all copy sits on opaque white/cream cards), the load-in light sweep over the
  hero, or Sketchfab's own iframe UI (cannot be styled). Tape sits over the
  thumbnail top-centre and is `pointer-events: none`.
- Not verifiable here: real rendering. Eyeball: hero at desktop and under 900px
  (does the tape clip? does the sticker portrait look right?), the three art card
  tape colours, card hover tilt, badge colours, the INSPECT pill on a loaded viewer.

## Phase 5b log (done)

- NO HTML markup changed (the plan expected edits, but pure CSS was enough, so no
  copy was added or altered). `index.html` is identical apart from the cache token.
- New panel role tokens (ledger defaults = old values): `--step-bg/-fg`,
  `--thread-color`, `--portrait-bg`, `--card-sky-bg/-fg`. Wired in `panels.css`
  and `components.css`; `--text-accent` is now also wired on the endorsement
  source link, speaker name, [MORE] button, counter and the contact-row arrow.
- Parity: `panels.css` and `components.css` match their Phase 5a versions with
  tokens expanded on BOTH sides; every other CSS file is byte-identical.
- `theme-cozy.css` Phase 5b section:
  - Pipeline: tool chips = recipe materials joined by "+", a mint "→ ✓" badge at
    the end of each stage (CSS-generated, with an empty alt so screen readers
    skip it where supported), mint stage-number tiles, stitched divider,
    dotted-brown thread instead of the blue one.
  - About: the endorsement carousel is a white dialogue card with a lilac
    portrait frame, round amber arrow buttons, dashed dividers. Fixed height
    (180px) kept so slides do not jump.
  - Contact: light-periwinkle dotted board with a coral pushpin, dark text.
- Found by manual measurement (not by the checker): muted grey on the amber hover
  fill of contact rows was 3.44:1. Cozy now turns the detail line ink on hover
  (6.68:1). Bright Ledger has the same issue at 3.85:1: pre-existing, left alone.
- BLIND SPOT to remember: the contrast checker only sees colours set in the same
  rule. State changes (hover/focus/selected) where text colour is inherited need
  a manual pair or a manual calculation.
- Contrast: 71 pairs pass in cozy, 0 regressions, 0 skipped. Smoke test green.
- Cache token is `?v=20261005-6`.
- Not verifiable here: real rendering. Eyeball: pipeline "+" joints and "→ ✓"
  badges (especially when chips wrap on narrow screens), endorsement dialogue
  text vs the fixed 180px height (does any quote clip? try [MORE]), the contact
  pin and board, and hover on contact rows.

## Phase 6 log (done)

- KEY FINDING: the 404's `--scene-*` tokens (in `lost.css`) are built from the base
  palette, so the 404 already followed the cozy colours automatically (twilight
  indigo stage, cream map). No separate scene theme was needed.
- `lost.css`: 7 new scene tokens carry the former raw literals (ledger defaults
  identical): `--scene-text/-spot/-shadow/-sweep/-ping/-south/-foam`. Verified by
  exact reverse-expansion against Phase 5b. Cozy re-points text/spot/sweep/ping/south
  in `tokens.css` and uses `--red-dark` for `--scene-x`.
- Still literal on purpose: `.reveal { stroke: #fff }` in `lost.css` (an SVG
  reveal mask, where white means visible, not a theme colour) and the 15 fixed
  colours in `print.css`.
- Map pins: the 5 inline `style="left/top"` moved into `lost.css` as
  `.map-pin[data-pin="..."]` rules. `404.html` now has zero inline styles; the
  coordinates were verified number-for-number against the old inline values.
- `404.html` theme-color meta is now `#2e3a7a` (the cozy stage colour). The old
  `#262b36` never matched the ledger stage either (pre-existing).
- `.readout dt` and `.resume-meta a` now read `--text-accent`.
- `theme-cozy.css` Phase 6 section: pill tag/signal/buttons/pin tags, soft drop
  shadows on map, binoculars and compass, rounded readout and spot line, soft
  text-shadow on the 404 number, round-ended gold bar under the resume name,
  pill countdown on the secret level.
- Contrast checker extended: it now reads `lost.css` tokens and supports
  `name@86` (colour at 86% opacity over its background). New pairs cover the 404
  stage and the large-text headings on the secret page. It found cream-on-red
  labels at 4.31:1 in cozy (3.98:1 in ledger, left alone); cozy now uses the
  deeper red (5.7:1). 82 pairs pass, 0 regressions, 0 skipped.
- Print: `print.css` is byte-identical; cozy tokens sit inside `@media screen` and
  `theme-cozy.css` is linked `media="screen"`, so printing the resume is unchanged.
- Cache token is `?v=20261005-7`.
- Not verifiable here: real rendering, or a real print preview. Eyeball: the 404
  at desktop and under 860px (are the five pins still on their landmarks?), the
  button pills, the resume page, the secret level, and File > Print on the resume.
- `site.webmanifest` colours are still the old ones (Phase 7).

## Phase 7 log (done)

- NEW `assets/js/theme.js`: blocking script in `<head>` (before the stylesheets), so the
  saved theme is on `<html>` before first paint. Guarded `localStorage` (key
  `af-portfolio-theme`), validates values, falls back to memory when storage is blocked,
  exposes `window.THEME`. No colours in JS: `<meta name="theme-color">` carries
  `data-cozy` and `data-ledger`.
- `chrome.js`: `themeToggleMarkup()` + `wireThemeToggle()`. The button renders only
  when `THEME` exists, uses its own class (not `.sound-toggle`, which has its own
  wiring), updates a descriptive `aria-label`, plays the select cue and toasts.
  Desktop: roster footer. Mobile: icon left of the sound icon in the profile card.
- CSS: `.theme-toggle` shares the sound chip styling (selector lists extended in
  `nav.css`, `responsive.css`, `theme-cozy.css`); a swatch previews the active theme
  from its own tokens. Mobile profile card right padding 54px -> 98px (both themes).
- `site.webmanifest` colours now follow the default (cozy) theme.
- NEW `test/theme-lint.js` (conventions as checks) and `npm run check`
  (= smoke + lint + contrast strict).
- Smoke test 101 -> 124 checks (23 new). One original check was updated on purpose:
  "roster footer is just sound + hint" -> "only the sound and theme toggles". A
  negative test proved the new wording still fails on a stray button.
- Docs: `PROJECT_GUIDE.md` rewritten for two themes; `README.md` updated; `CHANGES.md`
  has a new top section with MEASURED numbers (69 new tokens, 24 inline styles
  removed, 17 + 10 raw colours tokenised).
- Final QA: `npm run check` exit 0; 82 contrast pairs pass; 16 JS files parse; JSON
  valid; 92 local references resolve; HTML balanced on all 4 pages.
- Cache token is `?v=20261006-1`.

## Known gaps (honest list)

- NEVER viewed in a real browser: no Chromium in the build sandbox. Layout, fonts,
  tape/sticker details, hover/focus states and print preview are unverified visually.
- Google Fonts (Fredoka, Nunito) could not be fetched from the sandbox; if they fail the
  stack falls back to `ui-rounded` / system sans.
- `404.html` has no CSP meta tag (pre-existing). Documented in PROJECT_GUIDE.md.
- Pre-existing Bright Ledger contrast weak spots were left alone on purpose (gold focus
  ring on cream 1.5:1; muted grey on amber hover 3.85:1; cream on red on the 404 3.98:1).
- The contrast checker only sees colours set in the same rule; hover/focus states with
  inherited text colour need manual pairs.
- `site.webmanifest` is static, so an installed PWA always uses the cozy colours.
- Theme toggle has no keyboard shortcut (the `T` key is free if you want one).

## Notes for later phases

- Keep the Farswan/Farshwan spelling difference. Leave Sketchfab, endorsement
  and contact logic alone. Resume print styles stay fixed.
- Text pairs must hold 4.5:1; brown text on amber CTAs, darker olive for accents.
- `PROJECT_GUIDE.md` still forbids soft/neon/dark looks; rewrite it in Phase 7.

---

# ROUND 2 — ARCADE: ONE standalone game-menu theme. Roadmap agreed (revised), nothing built yet.

Why: reviewers found cozy too soft ("selling cozy stuff", less game-dev). Wanted: bold pixel
text, game-menu feel, KEEP the new extras (pins/labels, textures that fill empty space)
reworked as game UI.

DECISIONS (user): ONE theme, NO switching. Cozy is not an option; keep its files only as
reference until the end, then delete them. Palette: light touch, my call. No copy changes.
Style tile skipped (the base is the look the user already liked; screenshot gates cover new decor).

HOW: the old Bright Ledger values in `:root` ARE the starting point. Arcade = tune `:root`
role tokens (no data-theme, no toggle) + a new unscoped `assets/css/decor.css` (game-UI
ornament: rivets, HUD brackets, textures, slot numbers, quest tags), one section per step.

Rules for every step: whole working site + zip at the end; `npm run check` green; numbers
MEASURED not estimated; parity diffs compare like with like; any changed test gets a negative
test; NO "pre-existing" contrast excuses (strict: zero failures); baseline for diffs = the
previous step's zip (Step 1 baseline = Abhishek-Farswan-portfolio-FINAL.zip).
Docs (PROJECT_GUIDE/README/CHANGES) still describe two themes and are STALE until Step 5.

Known contrast weak spots inherited from the original look (FIVE, to fix inside arcade):
white on red modal-close 4.30; card outline on roster 2.85 (UI 3:1); gold focus ring on
cream fields 1.5 (UI 3:1); muted grey on gold hover 3.85; cream on red labels on the 404 3.98.

## Checklist
- [x] Step 1 (2026-10-07) — RESET + TUNE: remove switching (theme.js, toggle in chrome.js, toggle CSS,
      data-theme, 2nd mobile icon + padding back to 54px, 23 theme smoke checks; restore the
      original "roster footer is just sound + hint" assertion); unlink cozy (keep files); trim
      Fredoka/Nunito from the font link; tune `:root` (fix the five weak spots, light palette
      touch, teal accent used sparingly); retool contrast.js + theme-lint.js for ONE theme
      (strict, absolute; state rules paired with their base rule); add decor.css scaffold;
      revert manifest/theme-color to one colour set; bump cache.
- [ ] Step 2 — shell + components in decor.css (roster checker+scanlines, navy menu slabs with
      pixel cursor, ID-plate profile card with rivets, chunky buttons, square tags, fields, modal)
- [ ] Step 3 — Home (character-select hero: corner brackets, dither band, framed portrait) +
      Art (inventory slots: CSS-counter slot numbers, rarity bar via :has, brackets)
- [ ] Step 4 — Pipeline (crafting bench) + About (quest-log timeline, pixel dialogue box with
      name plate) + Contact (quest board, rivets)
- [ ] Step 5 — 404 / resume / secret level; RETIRE COZY (delete theme-cozy.css, cozy token block,
      prune unused tokens); rewrite docs for a single theme; final QA; final zip
- [ ] Optional — 404 CSP (needs a real browser); faint pixel-icon texture in empty areas

Acceptance gate after Steps 1, 2, 4: user sends screenshots (Home, Art, About at desktop;
Home at phone width) before the next step starts.

## Step 1 log (done)

- Switching removed: `theme.js` deleted; toggle gone from `chrome.js`; toggle CSS and the
  98px mobile padding reverted. PROOF: `chrome.js`, `test/smoke.js` and `site.webmanifest` are
  byte-identical to the ORIGINAL upload; `nav.css`/`responsive.css` equal their Phase 6 state.
- `<html>` has no `data-theme`; cozy is unlinked (theme-cozy.css still on disk, plus its inert
  token block, both deleted in Step 5). Fonts back to Nunito Sans + Press Start 2P only.
- Smoke test = the original 101 checks (the 23 theme checks went with the toggle).
- Palette effect vs the original upload: ONE colour changed, `--red #d64545 -> #c93b3b`.
  Role tokens: `--roster-bg #4177ae` (was = --sky), `--focus-ring` = --sky-dark (was gold).
  One rule added: contact-row detail line turns ink on hover.
- All FIVE inherited contrast weak spots fixed: modal-close white on red (4.30 -> 4.95),
  card outline on roster (2.85 -> 3.22), focus ring (1.34 -> 8.27 on cream), muted on gold
  hover (3.85 -> ink 10+), 404 cream on red labels (3.98 -> 4.58).
- `test/contrast.js` rewritten: ONE theme, strict absolute (any failure exits 1), now pairs
  hover/focus/selected rules with their base rule. Negative-tested (broke 3 tokens on
  purpose, it caught each, including via the new state-rule path). 89 pairs pass, 0 fail.
- `test/theme-lint.js` rewritten for one theme: guards no inline styles, no switching,
  no cozy link, decor.css order, one cache token. INFO list: 5 unused tokens for Step 5:
  --lilac --olive --coral --card-bg --header-bg.
- NEW `assets/css/decor.css` scaffold (comment only) linked after responsive.css on all pages.
- Page theme-color: `#4177ae` (matches the roster on mobile); 404 `#1d3a5c` (the stage; the
  original `#262b36` never matched it).
- Cache token `?v=20261007-1`.
- DOCS ARE STALE (PROJECT_GUIDE/README/CHANGES still describe two themes) until Step 5.
- Not verified here: any rendering. Expect: the original bold look, roster a touch lighter
  blue, red a touch deeper, navy focus rings, no cozy, no toggle.
