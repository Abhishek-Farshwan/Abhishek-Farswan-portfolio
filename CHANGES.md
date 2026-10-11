# Game-menu ornament pass — what changed

Same Bright Ledger identity, with a game-UI ornament layer on top. One theme, no
switching. (An earlier attempt at a soft "cozy" look was tried and retired; the
site is not split into themes.)

## What it looks like
- Rivets on cards and the profile ID plate, HUD corner brackets on the hero panels,
  pixel checker and scanlines on the roster / tab bar / dialogue headers / loadout
  panel / contact board, chunky bevels on menu slabs and buttons, striped banner tabs.
- Art cards are inventory slots: numbered titles (`#01`), a rarity strip under each
  thumbnail (gold featured, red staff pick, blue otherwise), square tags, bevelled INSPECT.
- Pipeline reads as a crafting bench (STAGE tiles, `+` joints between tools, a gold
  result chip). The career log is a quest log (`Q01`...). The endorsement box is an NPC
  dialogue with a dark name bar. The contact card is a quest board.
- No page copy or markup content changed.

## How it is built
- NEW `assets/css/decor.css` (321 lines): ornament only, no raw colors, screen-only,
  never prints. Its rules are enforced by `npm run lint`.
- `tokens.css`: 43 -> 113 tokens in `:root`. Components now read role tokens
  (`--menu-*`, `--roster-*`, `--cta-*`, `--banner-*`, `--focus-ring`, ...) instead of palette names.
- All 24 inline `style=""` attributes moved into CSS (the 404's five map-pin
  coordinates included). 17 raw colors in the main stylesheets and 10 in the 404
  stylesheet moved into tokens; 0 remain in the main stylesheets.

## Quality checks (new)
- `npm run check` = smoke test + `test/theme-lint.js` + `test/contrast.js`.
- `test/contrast.js`: strict, any failure exits 1. 95 pairs pass. It pairs hover/focus rules
  with their base rule, which found issues a simpler checker missed.
- `test/theme-lint.js`: tokens defined and used, no raw colors, `decor.css` ornament-only and
  screen-only, no inline styles, one cache token.
- `test/render.mjs` (optional, `npm run render`): real headless Chromium, every page at 360 / 768 /
  1280 / 1919px plus a print render, fails on script errors or content past the viewport edge.
- The smoke test is your original 101 checks, unchanged.

## Fixed along the way
- Five inherited contrast problems: white on red close button 4.30 -> 4.95; card outline on the
  roster 2.85 -> 3.22; gold focus ring on cream 1.34 -> navy 8+; muted grey on the gold hover
  3.85 -> ink; cream on red labels on the 404 3.98 -> 4.58. One palette color changed:
  `--red #d64545 -> #c93b3b`. The roster blue is a touch lighter (`--roster-bg #4177ae`).
- Ornaments are screen-only by construction (they were only kept out of print by chance).

## Deliberate decisions
- `PROJECT_GUIDE.md` previously banned "sci-fi HUD styling". The corner brackets are deliberately
  HUD-flavored, so the guide now allows the ornament layer and still bans neon/terminal glow.
- No HUD brackets on the 3D thumbnails: the Sketchfab viewer draws its own UI in all four corners.

## Known gaps
- `404.html` has no CSP meta tag (it never did). See `PROJECT_GUIDE.md`.
- `:has()` (rarity colors), `color-mix()` and `conic-gradient()` need a 2023+ browser.
- Looks were checked by screenshots (yours, and a headless Chromium); taste is not testable.

## Housekeeping
- Cache token `?v=20261009-1` on every page; `site.webmanifest` theme color matches the roster.
- `PROJECT_GUIDE.md` and `README.md` updated; `THEME_PROGRESS.md` is a work log you can delete.

---

# Earlier: Glow-up pass

## Design
- Count/status chips (`#art-count`, "4 RECOMMENDATIONS") use the neutral sky chip, matching "4 STAGES". Gold is reserved for real actions and states.
- Hero tagline restyled as a pull-quote (gold accent bar, no button styling) so it no longer reads as clickable.
- `h1` letter-spacing opened up (`.045em`) so the big pixel name stops crowding.
- More air above Endorsements on the About panel.

## Functionality
- Art cards: descriptions cut on a word boundary and end with an ellipsis.
- Art cards: FEATURED pill for curated pieces while browsing ALL UPLOADS.
- Art cards: viewer placeholder switches to "LOADING MODEL…" + spinner once loading actually starts.
- `hiddenIds` and `descriptionOverrides` hooks in `data.js` (see README).
- Secret-level unlock fires a 🏆 achievement-style toast.

## Copy pass (all sourced from claims already in CONTENT_SOURCE.md)
| Where | Before | After | Why |
|---|---|---|---|
| Home status | STATUS: BUILDING WORLDS | STATUS: OPEN FOR FREELANCE | It echoed "STYLIZED WORLDBUILDING" one line above and told visitors nothing. Availability is already in the contact copy and the roster's OPEN badge. **Change it if it stops being true.** |
| Home mission brief, para 1 | Repeated the hero lead almost word for word | Props, characters, environments + "meshes that still behave once they are inside an engine" | One job per block |
| About bio | Repeated Home's "ship-ready, not render-ready" punchline | Career arc: freelance → taught → quality verification | The punchline now lives on Home only |
| Profile data, MEDIUM | Real-time props & environments (duplicated CRAFT) | Props, characters & environments | Matches what the contact page offers |
| Art kicker | Live from the Sketchfab account. | Pulled live from my Sketchfab. | Less system-speak |
| Art footer | "Every piece here started as a block-out and ended up game-ready" | The complete archive lives on my Sketchfab and ArtStation profiles. | The old line overclaimed: some uploads are tutorial follow-alongs or base meshes |
| Contact intro | Find me around the web, browse my 3D assets… | Got a game that needs assets? Tell me what you're building. | Says what to do, matches the form placeholder |
| Secret level | "a stub on purpose" / "v1 SCOPE" | "The door is real. The room behind it is not built yet" / "STATUS: NOT BUILT YET" | Dev jargon out of visitor-facing text |

`data.js` mirrors and `CONTENT_SOURCE.md` were updated to match, including its stale 404 entry.

## Housekeeping
- Cache token bumped to `?v=20260928-2` on all pages.
- README documents the art-grid hooks.
- `test/smoke.js` extended with checks for all of the above. Run `npm install && npm test`.

## Not done on purpose
- Motion-reduction toggle: built, then removed (sidebar clutter; the site still honours the OS Reduce Motion setting).
- No "build log" section: needs your real blockout → high-poly → bake → in-engine shots, and this site's rule is nothing invented.
- Live Sketchfab typos ("strenghthen", the Training_bot blurb) can't be fixed in code; use `descriptionOverrides` with the model uid, or edit on Sketchfab.

## Final polish pass

| Area | Change |
|---|---|
| Endorsements | Speaker name no longer sits on a dark title bar; plain accent text. |
| Art cards | Removed the `#01` slot numbering. Featured/staff-pick text tags are now screen-reader-only; the whole card is tier-coloured instead (featured = legendary gold-orange with a slow foil glint, staff pick = epic purple, rest = common). `art.js` stamps `data-rarity`. |
| Home status | Now an availability readout: STATUS key plate, pulsing green LED, OPEN FOR FREELANCE. Smoke test regex updated to match. |

## 404 pass

| Area | Change |
|---|---|
| Binoculars | No longer sit under the map: raised above it, with room for the "SCAN AREA" caption so it isn't clipped. Recoloured steel blue so gold belongs to the 404 numerals, the primary button and the compass. |
| Map | Bigger, flatter tilt (-3deg), more room above and below. Landmarks are bigger warp buttons: hover/focus lights the badge, turns the tag gold and adds a ▸. |
| Signal chip | Quiet blue plate instead of gold. Hovering or focusing a landmark previews "SIGNAL: LOCKED ON <place>". |
| Closest match | A mistyped URL locks the signal, compass needle, compass link and caption onto the best-matching section (e.g. /my-3d-portfolio → ART); otherwise HOME. |
| Copy | Intro cut to two short sentences. The LOOKOUT box is hidden until it has something to say (a match was found, or the binoculars were clicked). |

## 404 re-theme + fit

| Area | Change |
|---|---|
| Theme | 404 now uses the site's own look: graph-paper cream page, one bordered window with a white message panel and the blue textured map panel (same recipe and HUD corner brackets as the Home hero), red crumb tab, blue signal chip. The dark navy scene, vignette and grain are gone. |
| Fit | Whole page fits one screen at 100% (checked at 1920x932 and 1366x650, no scroll). Binoculars and compass moved into a side column inside the map panel, so nothing overflows or overlaps a caption. Stacks to one column under 860px; side column goes horizontal under 560px. |
