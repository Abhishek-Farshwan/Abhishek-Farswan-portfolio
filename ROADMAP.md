# Project Roadmap & Concept Log

> **DISCLAIMER / IMPORTANT:** This log is a living document. It must be updated whenever there are major updates, conceptual changes, or theme shifts in the site. This ensures that any developer (AI or human) understands the exact vision, current state, and future direction of the project.

---

## 🌌 High-Level Concept
**Identity:** A game-development portfolio that behaves like a fictional sci-fi developer terminal/workstation.
**Core Loop:** Investigate → Build/Fix → Play → Discover.
The website isn't just a container for work; it's a demonstration of skills (Visual Design, 3D, UI, World-building) through an interactive experience.

## 🎯 Visual Intent: Purposeful, Attractive, Performance-Aware
This project should never feel like a generic AI-generated interface, but it also should not become sterile or excessively minimal. The design should feel premium, responsive, and crafted — with enough visual richness to be attractive without wasting performance or layering effects for effect alone.

- **No generic AI aesthetic.** Avoid random blob-like gradients, recycled glassmorphism, and decorative effects that feel machine-generated.
- **Polish without overkill.** The interface should look premium, sharp, and intentional, with a stronger sense of visual quality than a bare minimal layout.
- **Responsive design is part of the aesthetic.** The layout should behave elegantly across mobile, tablet, and desktop while keeping content hierarchy clear.
- **Performance is a design constraint.** Avoid stacking multiple heavy blur, gradient, and transparency layers that slow the page.
- **Typography and space create the personality.** Strong type, clear structure, and smart contrast are more valuable than excessive effects.
- **Every visual decision has a purpose.** Buttons, panels, cards, and surfaces should serve the story and clarity of the experience, not add noise.

This means the site should feel like a considered artifact from a specific studio: refined, attractive, responsive, and efficient.

---

## 🖥️ Section 1: Main Portfolio (The Terminal)
*The outer layer: A futuristic system containing the work.*

- **Visual Language:** Dark, Minimal, Technical, Sci-Fi, Monospaced.
- **Interface:** Folder/File UI designed as "futuristic data containers" (semi-transparent, holographic, subtle glow).
- **Current State:** 
    - [x] Basic HUD/Navigation structure (`js/hud-nav.js`, `css/hud.css`).
    - [x] Sci-fi theme variables defined (`css/variables.css`).
    - [x] Main landing layout (`index.html`).
    - [x] Mobile responsive design (`css/mobile.css`).
    - [x] Lazy loading for Sketchfab embeds (`js/lazy-load.js`).
    - [x] Theme persistence (Dark/Cozy modes).
- **Future Goals:**
    - [ ] Enhancing the "system boot" feel.
    - [ ] Adding more "system panels" and "data objects" for project showcases.
    - [ ] Performance monitoring and analytics integration.

---

## 🎮 Section 2: Games (Secret Level)
*The hidden interactive layer: A "discovered" playable experience.*

- **Concept:** The visitor scrolls through the entire portfolio and discovers a secret "PLAY" button. A game build (placeholder for now) awaits implementation.
- **Structure:**
    - Location: `/game/secret_level.html` (moved from root for organization)
    - Current: Placeholder landing showing "build not deployed yet"
- **Future Implementation Phases:**
    - **Phase 1: Recovery Mode** — Visual puzzle interface to repair game systems
    - **Phase 2: Playable Build** — Small interactive game demo
    - **Phase 3: Mystery Rewards** — Unlockable assets and rewards
- **Current State:**
    - [x] Removed AI-generated game code and placeholder structure
    - [x] Created `/game/` folder structure with guidelines
    - [x] Placeholder page ready for implementation
- **Future Goals:**
    - [ ] Complete the "Game Recovery" interface.
    - [ ] Implement a playable game build.
    - [ ] Integrate the Mystery Card reward system.

---

## 📄 Section 3: Resume (Technical Specs)
*The professional profile presented as system documentation.*

- **Concept:** Instead of a generic PDF, the resume is an integrated part of the terminal.
- **Current State:**
    - [x] Interactive/Styled resume page (`resume.html`, `css/resume.css`).
    - [x] Visual consistency with the main theme.
- **Future Goals:**
    - [ ] Add "Download Decrypted PDF" option.
    - [ ] Interactive skill bars/nodes that fit the sci-fi aesthetic.

---

## 🎨 Theme Profiles
The site supports multiple visual identities to match different moods or content types.

- **Default (Dark Sci-Fi):** The original "Developer Terminal" look. Dark background, green accents, high contrast.
- **Cozy Pastel:** A softer, warm identity. Off-white backgrounds, terracotta/amber accents, and soft typography. Designed for a more relaxed, approachable browsing experience.
- **Implementation:** Themes are controlled via the `data-theme` attribute on the `<html>` tag, utilizing the variables in `css/variables.css`.

---

## 📱 Responsive Design
- **Desktop (1024px+):** Full HUD sidebar with expandable panels, multi-column layouts.
- **Tablet (768px - 1023px):** Condensed navigation, simplified grid layouts.
- **Mobile (< 768px):** 
    - Hidden HUD sidebar (displays as bottom "PLAY" button)
    - Single-column layouts for all sections
    - Touch-optimized buttons and controls
    - Lazy-loaded Sketchfab embeds to improve performance

---

## ⚡ Performance Optimizations
- **Lazy Loading:** Sketchfab iframes load only when they enter the viewport
- **CSS Organization:** Modular, separate mobile styles prevent unused rules on desktop
- **Theme Persistence:** LocalStorage-based theme preference
- **Smooth Animations:** Respects `prefers-reduced-motion` preference
- **Minimal Layering:** Avoid stacking multiple heavy blur/filter/gradient layers across large sections
- **Responsive-first styling:** Layout decisions prioritize function and performance while preserving visual polish
- **Efficient visual treatment:** Small number of high-value effects, not dozens of decorative overlays

---

## 🛠️ Tech Stack & Conventions
- **Frontend:** HTML5, CSS3 (Modern Flex/Grid), Vanilla JavaScript.
- **Styling:** CSS Variables for easy theme switching.
- **Accessibility:** WCAG compliance, focus states, semantic HTML.
- **Structure:** 
    - `/css`: Modular styles (variables, main, topbar, hud, cards, modals, mobile).
    - `/js`: Logic-specific files (main, hud-nav, lazy-load).
    - `/game`: Game implementation folder (currently placeholder).
    - `/assets`: External resources (Sketchfab embeds, resume PDFs).

---

## 🗺️ Execution Flow
1. **PORTFOLIO WEBSITE** (Fictional Developer Environment)
2. **HERO SECTION** (Introduction + Desktop/Tablet HUD, Mobile Play Button)
3. **PROJECT SHOWCASE** (3D Art, Systems Design, About sections)
4. **SECRET LEVEL DISCOVERY** (Scrolling reveals the Play button)
5. **GAME LAUNCH** (Modal opens, directs to `/game/secret_level.html`)
6. **GAME PLACEHOLDER** (Ready for Phase 1 implementation)

---

## ✅ Recent Updates (v1.5)
- [x] Redesigned status card to output-focused, professional tone
  - Changed label: "session.status" → "portfolio.index | ongoing"
  - Reframed fields to emphasize what you build, not how you work:
    - role → craft (game dev + 3D art + systems design)
    - stack → shipped (20+ assets · game systems · interactive experiences)
    - current_mode → current (evolving the craft)
    - coffee → mandatory
  - Better communicates experience and deliverables at a glance

## ✅ Recent Updates (v1.4)
- [x] Fixed tab status icons — JavaScript was overwriting semantic icons
- [x] Added icon mapping system for all sections:
  - home: ⌂ (house) | art: 🎨 (palette) | systems: ⚙ (gear) | about: ℹ (info) | contact: ✉ (envelope)
  - Active section shows icon, unlocked sections show ✓, locked show 🔒
- [x] Consistent topbar across all pages (index, resume, 404)
- [x] Updated resume.html topbar with full navigation tabs and icons
- [x] Added theme toggle to resume page with main.js integration
- [x] Highlighted contact button (contact-btn class) on all pages
- [x] Better semantic navigation experience with proper iconography

## ✅ Recent Updates (v1.3)
- [x] Added prominent contact button to topbar navigation
  - Highlighted with accent color, glow effect, and bold styling
  - Never gets lost among other navigation tabs
  - Encourages visitors to connect

## ✅ Recent Updates (v1.2)
- [x] Reframed design intent around polished, attractive, performance-aware aesthetics
- [x] Avoided the generic AI-style look without drifting into sterile minimalism
- [x] Kept sci-fi identity while emphasizing responsive, premium presentation
- [x] Added explicit performance guardrails against over-layered rendering
- [x] Moved secret level to `/game/secret_level.html`
- [x] Removed AI-generated game code (game/index.html, game/js, game/css)
- [x] Added comprehensive mobile responsiveness (css/mobile.css)
- [x] Implemented lazy loading for Sketchfab embeds (js/lazy-load.js)
- [x] Added mobile-specific Play button with responsive visibility
- [x] Updated navigation link to point to new game structure
- [x] Created game folder README with implementation guidelines
- [x] Fixed contact section visibility and accessibility

---

## 🔗 Quick File Reference

| File | Purpose | Edit When |
|------|---------|-----------|
| `index.html` | Main portfolio page | Adding sections, updating content |
| `css/variables.css` | Color theme, fonts | Changing visual style |
| `css/mobile.css` | Responsive layouts | Adjusting mobile breakpoints |
| `js/main.js` | Core interactivity | Changing modal behavior, theme logic |
| `game/secret_level.html` | Game placeholder | Implement Phase 1 game here |
| `game/README.md` | Game guidelines | Reference during implementation |
| `ROADMAP.md` | This roadmap | Update as you add features |

---

## 📱 Testing Mobile

**Desktop View (1024px+):**
- HUD sidebar visible on right
- Play button shows in sidebar
- Multi-column layouts

**Tablet View (768px):**
- HUD hidden, play button at bottom right
- Condensed navigation tabs
- 2-column grid for art becomes 1-column

**Mobile View (<768px):**
- Play button at bottom right (green button)
- Tabs show only icons
- All grids single-column
- Typography scales responsively

---

## 🔧 Troubleshooting

**Embeds not loading?**
- Check browser console for errors
- Ensure Sketchfab URLs are correct
- Lazy loading works by scrolling into view

**Mobile play button not showing?**
- Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
- Check viewport width ≤768px
- Browser DevTools → Responsive Design Mode

**Theme not saving?**
- Check localStorage is enabled
- Browser DevTools → Application → Local Storage
- Should see key "theme" with value "dark" or "cozy"

---

## 🔄 Code Quality
- Clean, semantic HTML with proper accessibility attributes
- CSS variables for maintainable theming
- Vanilla JavaScript (no dependencies) for fast loading
- Mobile-first responsive design
- Performance optimized (lazy loading, efficient selectors)

---

*Last Updated: 2026-08-30 (v1.2)*
*Status: Core portfolio ready, design intent refined for premium polish, responsiveness, and performance discipline*
