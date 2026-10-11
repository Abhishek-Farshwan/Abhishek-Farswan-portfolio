# Abhishek Farshwan — portfolio

A 3D artist's portfolio built as a console/JRPG menu. Plain HTML, CSS and JS.
No framework, no build step, no dependencies to install.

## Run it

Double-click `index.html`. That's it — everything works from `file://`,
including the Sketchfab sync.

If you'd rather serve it (recommended once you're testing on your phone):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Before you publish

1. **Keep `user.png` at the site root.** It is the favicon and the icon
   referenced in `site.webmanifest` and the JSON-LD block.
2. Domain is already wired in: canonical links, Open Graph/Twitter tags,
   `sitemap.xml`, and `robots.txt` all point at
   `https://abhishek-farshwan.github.io/Abhishek-Farswan-portfolio`. If the
   site ever moves to a different URL, update all of those in one pass —
   `grep -rl "abhishek-farshwan.github.io" *.html *.xml *.txt`.
3. Check the résumé page prints the way you want: open `resume.html`, hit
   `P` (or the PRINT / SAVE PDF button), and choose "Save as PDF".
4. The favicon uses a 512px PNG mark for browser and install-icon sizes.
5. This repo is a GitHub Pages **project** site (served under a subpath).
   Search crawlers only check `robots.txt` at the origin root, which this
   repo doesn't control. The `noindex` meta tag on the secret level and 404
   pages works regardless, so nothing is accidentally exposed.

## Deploying

Any static host works. No build command, publish directory is the project root.

- **GitHub Pages** — push the repo, Settings → Pages → deploy from branch.
  `404.html` is picked up automatically.
- **Netlify / Vercel / Cloudflare Pages** — drag the folder in, or connect the
  repo. Leave the build command empty.

## Cache-busting

Every local CSS/JS reference carries a shared cache token such as `?v=20261009-1`.
**Bump the token whenever you ship a CSS or JS change to the live site** —
otherwise a returning visitor's browser (or an aggressive CDN cache) can keep
serving an old stylesheet or script until its cache naturally expires. Find
and replace the version string across all four HTML files at once:

```bash
grep -rl '?v=20261009-1' *.html game/secret_level/*.html | xargs sed -i 's/?v=20261009-1/?v=YYYYMMDD-N/g'
```

## Art grid controls (all in `assets/js/data.js` → `sketchfab`)

Three hooks let you curate the live Sketchfab sync without touching your
Sketchfab account. Model uids are the long hex string at the end of a
model's Sketchfab URL.

- `featuredIds` — pieces that get the FEATURED pill (while browsing ALL
  UPLOADS) and that the SHOW → FEATURED filter keeps.
- `hiddenIds` — uploads to leave out of the grid entirely, e.g. a WIP test
  piece. Empty by default.
- `descriptionOverrides` — `{ 'uid': 'text' }` replaces a live Sketchfab
  description (typo, draft one-liner). Empty by default.

## Editing

**Facts** (links, résumé, model IDs, bio) live in `CONTENT_SOURCE.md` first,
then `assets/js/data.js`. Static HTML in `index.html` and `resume.html`
carries the same copy for no-JS readers — if you change a fact, grep for it in
both.

**Design values** (colour, type, spacing, motion) live in
`assets/css/tokens.css`, plus the 404 stage tokens at the top of
`assets/css/lost.css` and the fixed print palette. Change a token, the whole
site follows. The game-style ornament (rivets, corner brackets, textures,
bevels) lives in `assets/css/decor.css`.

**Structure, behavior, creative direction, and maintenance rules** live in
`PROJECT_GUIDE.md`. Read it before structural or design changes. This repo
deliberately keeps the guidance in one place so it stays useful instead of
becoming a second work log.

### Common edits

| You want to… | Edit |
|---|---|
| Add or change a social link | `assets/js/data.js` → `links`, and the contact panel in `index.html` |
| Change the featured four models | `assets/js/data.js` → `sketchfab.featuredIds` and `featured` |
| Change a colour or the border weight | `assets/css/tokens.css` (components read role tokens such as `--menu-bg` or `--cta-bg`, so retint a component by editing its role) |
| Change the ornament (rivets, brackets, textures, bevels) | `assets/css/decor.css`, and the `--rivet`, `--bevel-*`, `--tex-dark`, `--bracket*` tints in `tokens.css` |
| Add a menu entry | `assets/js/data.js` → `nav`, then add a matching `<section class="panel" id="panel-…">` in `index.html` |
| Change résumé content | `resume.html` and `assets/js/data.js` → `resume` |
| Send the contact form to a real backend | `assets/js/contact.js` → replace the `mailto:` in `compose()` with a POST, and update the form note copy |

## Keyboard

| Key | Does |
|---|---|
| `↑` `↓` | on Home: browse the highlighted menu item |
| `→` / `Enter` / `Space` | on Home: enter the highlighted panel |
| `←` / `Backspace` | on Home: return to Home or exit an open panel. Elsewhere: return to the main menu |
| `1`–`5` | jump straight to a panel, no confirm needed |
| `Home` | jump to the Home panel |
| `End` | jump to the Contact panel |
| `R` | open the résumé |
| `M` | toggle UI sounds |
| `Esc` | close the model inspector |
| `P` | print (résumé) |

There's one more sequence. It's older than you are.

## Art grid

Opening **Art** syncs live with the Sketchfab account, so new uploads show up
without touching the code. Requests are bounded (10 pages / 60 models) and
time out after 10s. If the API is unreachable, the four curated models stay
and the status line says the sync failed. Viewers only start loading as they
reach the screen, and every model keeps a direct Sketchfab link in case its
embed fails.

## Tests

`test/smoke.js` loads the real pages in jsdom, runs the real scripts, mocks the
Sketchfab API, and asserts the interactions — routing, keyboard, sync and
offline fallback, sorting, search, empty state, the inspector, form validation
and the easter egg.

`test/theme-lint.js` checks the stylesheet and page conventions without a
browser, and `test/contrast.js` measures text and UI contrast and fails on any
problem.

```bash
npm install jsdom   # only dependency, only for tests
npm run check       # smoke test + style lint + contrast
```

Each also runs alone: `npm test`, `npm run lint`, `npm run contrast`.

There is also an optional visual check, `npm run render`, that screenshots every
page at four widths plus a print view in a real headless Chromium and fails on
script errors or content past the screen edge. It needs extra packages (see the
top of `test/render.mjs`), takes several minutes, and accepts `--only <name>`.

Run it for structural or cross-cutting changes to page boot, shared chrome,
routing, keyboard navigation, data/render contracts, or security and embedded
content. It is not needed for isolated copy, CSS, or static-asset edits unless
they affect behavior; use a focused check for those changes.

## Browser support

Modern evergreen browsers (the visual layer uses `color-mix()`,
`conic-gradient()` and `:has()`, all available since 2023; older browsers lose
tints and rarity colours, not content). Graceful degradation is built in: no
`IntersectionObserver` loads every viewer directly, no `matchMedia` falls back
to desktop assumptions, no `localStorage` falls back to memory, no
`AudioContext` silently skips sound, and no JavaScript at all still renders
every panel and the curated art set.
