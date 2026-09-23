# CONTENT_SOURCE.md — Everything Real, Theme-Agnostic

This file is the single source of truth for actual content — links, resume
text, bio facts, contact info — independent of whatever theme/CSS/markup
wraps around it. Pull from here when rebuilding, instead of digging back
through old HTML. Nothing in this file is styling; it's all facts, copy,
and URLs that stay true no matter what the site looks like.

---

## Identity

- **Name (as used):** Abhishek Farshwan / Abhishek Farswan — **both spellings
  are intentional**, not a typo. Used interchangeably across site copy, repo
  name, socials, and contact links because domain/handle availability
  differs per platform. Don't silently "fix" one into the other — check
  which spelling is actually correct for the specific context (GitHub handle
  vs. email vs. display copy vs. Sketchfab handle) before touching it.
- **Craft:** 3D Artist — modeling, texturing, and optimizing game-ready
  assets for real-time engines. (Not a gameplay/systems programmer — that
  claim was deliberately removed from the copy in an earlier pass because
  it wasn't backed by real project experience. Keep it that way.)
- **Email:** abhishekfarshwan@gmail.com
- **Location:** Uttarakhand, India (resume lists Gopeshwar; work history spans
  Dehradun and Chamoli)
- **Favicon source file:** `user.png` (referenced from site root in every page)

## Social / external links

| Platform | URL |
|---|---|
| GitHub | https://github.com/Abhishek-Farshwan |
| LinkedIn | https://in.linkedin.com/in/abhishek-farswan |
| ArtStation | https://www.artstation.com/abhishek_farswan |
| Sketchfab | https://sketchfab.com/AbhishekFarswan |

## LinkedIn Recommendations

These recommendations are presented in the About panel as one NPC-style
dialogue at a time. The full text is retained in the character database;
`Preview` is the compact visitor-facing line shown before `[MORE]` is opened.
All four recommendations are from LinkedIn and currently use male NPC
portraits selected from the matching gender pool.

### Andres Gomez
- **Role:** App Developer — RUTZ Studios
- **Gender record:** M
- **Preview:** Abhishek consistently showcased technical prowess, dedication to the craft, and creativity that enhanced our character designs.
- **Recommendation:** I had the pleasure of working with Abhishek at RUTZ Studios, where he served as our 3D artist, specializing in crafting low-poly outfits for our character designs. Throughout his tenure with us, Abhishek consistently showcased not only his technical prowess but also his dedication to the craft. His creativity, combined with the right guidance, led to some of the most innovative and aesthetically pleasing designs that greatly enhanced our projects.

### Antoine Le Flamanc
- **Role:** Head of Procurement & Founder — Turbowares AI
- **Gender record:** M
- **Preview:** Abhishek brought a can-do attitude, learned quickly on the job, and delivered 3D modeling, animation, and scene composition to expectations.
- **Recommendation:** Abhishek joined Ant One Entertainment on 2 projects requiring 3D modeling, 3D animation and scene composition jobs. Abhishek's hardwork and can do attitude were deeply appreciated as well as his capacity to self learn on the job. His contribution to the projects were totally at the level of the expectation and I have no doubt of Abhishek bright future given his mindset and openness to new ideas.

### Zaid Kamal
- **Role:** Game Developer — Creative Technology
- **Gender record:** M
- **Preview:** Abhishek is a smart working individual with a knack for sculpting creative models and bringing out the best details in his creations.
- **Recommendation:** Abhishek is a smart working individual with great skills and experience. He has a knack for sculpting creative models and gives his best to bring out the best details in his creations. He has hands-on almost all creative 3D engines and is ready to learn any given subject due to his curious attitude. He is poised to become a great 3D artist in the future.

### Breno Azevedo
- **Role:** Veteran Game Developer, Balance Designer & Producer
- **Gender record:** M
- **Preview:** Abhishek was polite and timely, took feedback seriously, and did his best to deliver work that kept the client satisfied.
- **Recommendation:** When he did some 3D modeling work for me, Abhishek has been very polite and timely, doing his best to keep me satisfied. He also takes feedback and suggestions very seriously, and tried to implement them. I'll definitely do work with Abhishek in the future!

## NPC Portrait Database

Character records live in `assets/characters/database.js`. Portrait assets live
in `assets/pixel-npc/` and use `_M`, `_F`, or `-M` filename suffixes. A record
may select a portrait from its gender pool with `profilePic.mode: "random"`,
or force a known asset with `profilePic.mode: "specific"` and a filename.
Portrait assignments are stable for the current dialogue session so browsing
does not reshuffle a recommender's character.

## Sketchfab embed base pattern

```
https://sketchfab.com/models/{MODEL_ID}/embed?ui_theme=dark&ui_infos=0&ui_watermark=0&ui_watermark_link=0
```

Params used consistently: dark UI, no info overlay, no watermark, no
watermark link. Reuse this exact query string for any new/future models too,
to stay consistent.

## 3D Art pieces (for the art/portfolio grid)

### 1. Stylized Cattail Plant
- **Tag:** foliage / stylized
- **Description:** Stylized 3D vegetation asset designed for game environments and organic level composition. Drag to orbit.
- **Meta line:** blender · foliage · lowpoly
- **Model ID:** `2a1563b0a4ef40d79b52c3112d2d9437`
- **Embed:** `https://sketchfab.com/models/2a1563b0a4ef40d79b52c3112d2d9437/embed?ui_theme=dark&ui_infos=0&ui_watermark=0&ui_watermark_link=0`
- **View page:** https://sketchfab.com/3d-models/stylized-cattail-plant-2a1563b0a4ef40d79b52c3112d2d9437

### 2. Base Mesh Chibi
- **Tag:** character / basemesh
- **Description:** Lightweight basemesh for small-scale characters — the foundation for an upcoming playable character. Drag to orbit.
- **Meta line:** 1.4k tris · CC BY 4.0
- **Model ID:** `699ee2e05bce46749ef93e3330cfb7d4`
- **Embed:** `https://sketchfab.com/models/699ee2e05bce46749ef93e3330cfb7d4/embed?ui_theme=dark&ui_infos=0&ui_watermark=0&ui_watermark_link=0`
- **View page:** https://sketchfab.com/3d-models/base-mesh-chibi-699ee2e05bce46749ef93e3330cfb7d4

### 3. Stylized Throne
- **Tag:** props / hard surface
- **Description:** Low-poly stylized throne model featuring game-ready topology and hand-crafted proportions. Drag to orbit.
- **Meta line:** blender · props · lowpoly
- **Model ID:** `1fe25295ecc84383a65a109dcb42f60d`
- **Embed:** `https://sketchfab.com/models/1fe25295ecc84383a65a109dcb42f60d/embed?ui_theme=dark&ui_infos=0&ui_watermark=0&ui_watermark_link=0`
- **View page:** https://sketchfab.com/3d-models/stylized-throne-lowpoly-1-1fe25295ecc84383a65a109dcb42f60d

### 4. Stylized Cozy Props
- **Tag:** worldbuilding / props
- **Description:** Atmospheric prop collection exploring cozy environment aesthetics, composition, and readable prop design. Drag to orbit.
- **Meta line:** blender · environment · props
- **Model ID:** `951d2ca02d2b468391e738d065cebc87`
- **Embed:** `https://sketchfab.com/models/951d2ca02d2b468391e738d065cebc87/embed?ui_theme=dark&ui_infos=0&ui_watermark=0&ui_watermark_link=0`
- **View page:** https://sketchfab.com/3d-models/stylized-cozy-props-1-951d2ca02d2b468391e738d065cebc87

## Bio / about copy (current, honest version — keep this framing)

**Short version (hero-length):**
> I model, texture, and optimize 3D assets for real-time games — the kind of props and characters that need to look good AND survive actually running in an engine.

**Long version (about-section-length):**
> I started as a freelance 3D artist shipping 100+ game-ready assets, then spent time as a Quality Verifier — which means I've got an unusually sharp eye for the small stuff that makes an asset actually ship-ready, not just render-ready. I've also taught computer fundamentals, so I'm just as comfortable explaining a workflow as executing one.

**Quick facts (real ones only — the "coffee/weapon/weakness" style flavor
lines from the character-sheet module were dropped here since they aren't
actual facts, just theme flavor; replace with whatever fits the new theme):**
- craft → 3D art for real-time games
- shipped → 100+ game-ready assets
- current → leveling up the pipeline
- focus → game-ready 3D assets
- medium → real-time props & environments

## The Pipeline (skills breakdown — 4 stages)

1. **Modeling** — Low-poly and high-poly workflows in Blender, from a rough block-out to a clean, final mesh ready for the next stage. *(low-poly, high-poly, block-out)*
2. **Texturing** — UV unwrapping, PBR texturing, and baking in Substance Painter — getting materials to read right under real-time lighting, not just in a render. *(UV unwrap, PBR, baking)*
3. **Optimization & QA** — Game-ready topology and tri-count discipline, checked with the same picky eye brought from working as a professional Quality Verifier. *(tri-count, topology, QA-trained eye)*
4. **Engine Integration** — Importing and testing assets in Godot to confirm they actually hold up in-engine — not every asset that looks great in a viewport survives contact with a real scene. *(Godot, in-engine check, real-time)*

## Toolchain / loadout

- Godot — gameplay + prototypes
- Blender — modeling + lookdev
- C# / GDScript — systems + tools
- Git — versioning + experiments
- Photoshop — quick texture / paintover work

---

## Résumé content (full)

### Header
- Name: Abhishek Farswan
- Role line: 3D Artist · Game-Ready Asset Pipeline *(current, honest version — earlier draft said "3D Artist · Game Dev · Systems Design," which overclaimed the same way the old hero copy did; don't revert to that)*
- Email: abhishekfarshwan@gmail.com
- Location: Gopeshwar, Uttarakhand, India
- ArtStation: artstation.com/abhishek_farswan

### Summary
> 3D Artist with 2 years of professional experience creating game-ready assets and stylized 3D models. Passionate about building visually appealing and optimized content for games while continuously learning new techniques and workflows. Always eager to grow as an artist, take on new challenges, and contribute to creative projects through collaboration and attention to detail.

### Experience (reverse-chronological)

**Quality Verifier** — Berg Technologies — 09/2025 – Present — Dehradun
- Contribute to project workflows requiring attention to detail and consistent quality.
- Collaborate effectively within a team while maintaining productivity and accuracy.
- Develop strong workflow management, communication, and quality assurance skills.

**Computer Tutor** — High Tech Institute of Technology — 2024 – 2025 — Chamoli
- Taught computer fundamentals and productivity software.
- Delivered training on Adobe Photoshop, Canva, HTML, Python, and AI fundamentals.
- Designed practical learning exercises for students with different experience levels.
- Improved student engagement through hands-on project-based learning.

**Freelance 3D Artist** — Self-Employed — 2021 – 2024 — Remote
- Delivered 100+ game-ready 3D assets and freelance projects across multiple art styles, focusing on optimized real-time workflows.
- Developed low-poly and high-poly models using Blender.
- Performed UV unwrapping, texture baking, and material creation using Blender and Substance Painter.

### Education
- **B.Tech, Electrical Engineering** — Uttarakhand Technical University — 2023
- **Intermediate** — Uttarakhand Board of School Education — 2019

### Skills (chips)
3D Modeling · Blender · Adobe Photoshop · Substance Painter · Game Assets Creation · UV Unwrapping · PBR Texturing · Asset Optimization · Hard Surface Modeling · Godot Engine

### Interests (chips)
3D Art · Game Development · Digital Sculpting · Artificial Intelligence · Video Editing · Chess · Behavioral Psychology

---

## Footer tagline (used site-wide)
> built like a game menu, shipped like a portfolio

*(This line is itself a design/tone statement, not neutral content — keep
or drop per whatever the new theme's identity ends up being.)*

## Contact section copy
- Heading: "let's make something playable."
- Subline: "Find me around the web, browse my 3D assets, or send me a message."
- Link labels used: resume, email, github, linkedin, artstation, sketchfab

---

## Structural and design guidance

Architecture, sitemap, visual direction, responsive requirements, quality
bar, live-sync behavior, and rules for future AI-assisted changes live in
`PROJECT_GUIDE.md`. Read that file alongside this content source before
making structural or design changes. If the structure or direction changes
in a major way, update `PROJECT_GUIDE.md` in the same change.

---

## Where this content is rendered

`assets/js/data.js` mirrors the identity, links, model IDs, pipeline stages,
loadout, résumé text, and contact copy in this file. Endorsement records and
NPC portrait rules are mirrored separately in `assets/characters/database.js`.
**Change factual copy here first, then mirror it in the matching data file.**
Static HTML in `index.html` and `resume.html` carries the same approved copy
for no-JS readers; if you change a fact, grep for it in both.

## Approved copy added in the rebuild

These strings are approved site copy, not new personal claims. Nothing below
asserts a skill, title, or metric that is not already in this file.

**Home**
- Eyebrow: "PLAYER 01 // ARTIST SELECTED"
- Hero tagline: "Make it readable. Make it game-ready."
- Loadout heading: "STYLIZED WORLDBUILDING"
- Loadout stats: FORM / Low / mid poly · LOOK / Stylized · ENGINE / Godot · ROLE / 3D art
- Mission brief, second paragraph: "Two years of professional work: 100+
  game-ready assets delivered freelance, then quality verification work that
  sharpened the eye for what makes an asset ship-ready instead of
  render-ready." *(restates the résumé summary and the freelance/QV history
  already recorded above — no new claim)*

**Art**
- Panel heading: "ART // INVENTORY"
- Kicker: "Live from the Sketchfab account. Drag inside a viewer to orbit, or
  hit INSPECT to open a model full size."
- Viewer placeholder: "VIEWER STANDBY" / "The 3D viewer starts when this card
  reaches the screen." / link label "OPEN ON SKETCHFAB"
- Failure state: "VIEWER UNAVAILABLE" / "The embedded viewer did not load. The
  model still opens on Sketchfab."
- Empty search state: "NO MATCH FOR \"…\"" / "Try a shorter word, or clear the
  search to see every upload."
- Status line: "N MODELS · SYNCED FROM SKETCHFAB" or "N MODELS · CURATED SET ·
  LIVE SYNC UNAVAILABLE"
- Closing card (below the grid): "WANT TO SEE MORE?" / "This collection keeps
  growing — every piece here started as a block-out and ended up game-ready
  for a real engine. For the full archive, including work-in-progress pieces
  and older uploads, the complete profiles are linked below." **This replaced
  an earlier "HOW THIS GRID WORKS" version that explained the live-sync
  mechanism to visitors** — that was implementation detail for whoever
  maintains the site, not something a visitor needs to know. If this card
  ever needs to explain anything again, keep it about the art, not the code.

**Pipeline**
- Panel heading: "PIPELINE // SHIP LOOP"
- Kicker: "Four stages, in order, from rough shape to an asset that holds up
  inside a real scene."
- Loadout card intro: "The tools that actually get used, and what each one is
  Freelance props, characters, and environment assets are all fair game."
- Topic options: Freelance asset work · Full-time role · Collaboration ·
  Something else
- Form note: "This opens your own mail app with the message pre-filled.
  Nothing is sent through a server, so nothing you type here is stored on this
  `data.js`.** Static HTML in `index.html` and `resume.html` carries the same
  approved copy for no-JS readers; if you change a fact, grep for it in both.
- Validation messages: "Add a name so the reply knows where to go." / "An
  email address is needed to reply." / "That address looks incomplete." / "A
  sentence or two about the work helps."

**404**
- Heading: "PAGE NOT FOUND"
- Body: "There is no level here. The link may be old, or the address may have a
  typo in it."

**Secret level stub** (`/game/secret_level`)
- Heading: "SECRET LEVEL"
- Body: "This one is a stub on purpose. The door exists, the room behind it
  does not — yet. It is reserved for a small playable thing built in Godot
  once there is something worth showing."
- Status line: "STATUS: NOT BUILT · v1 SCOPE"
- This is a statement of intent about an unbuilt page, not a claim of shipped
  work. If the level is never built, delete the page rather than softening the
  copy into something that implies it exists.

## Footer tagline decision

"built like a game menu, shipped like a portfolio" is **kept**. It runs in the
footer of every page and in the desktop prompt bar.
