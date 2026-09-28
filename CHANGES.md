# Glow-up pass — what changed

Same Bright Ledger theme. No dark/secondary theme, per brief.

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
