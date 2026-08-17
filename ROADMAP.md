# Project Roadmap & Concept Log

> **DISCLAIMER / IMPORTANT:** This log is a living document. It must be updated whenever there are major updates, conceptual changes, or theme shifts in the site. This ensures that any developer (AI or human) understands the exact vision, current state, and future direction of the project.

---

## 🌌 High-Level Concept
**Identity:** A game-development portfolio that behaves like a fictional sci-fi developer terminal/workstation.
**Core Loop:** Investigate → Build/Fix → Play → Discover.
The website isn't just a container for work; it's a demonstration of skills (Visual Design, 3D, UI, World-building) through an interactive experience.

---

## 🖥️ Section 1: Main Portfolio (The Terminal)
*The outer layer: A futuristic system containing the work.*

- **Visual Language:** Dark, Minimal, Technical, Sci-Fi, Monospaced.
- **Interface:** Folder/File UI designed as "futuristic data containers" (semi-transparent, holographic, subtle glow).
- **Current State:** 
    - [x] Basic HUD/Navigation structure (`js/hud-nav.js`, `css/hud.css`).
    - [x] Sci-fi theme variables defined (`css/variables.css`).
    - [x] Main landing layout (`index.html`).
- **Future Goals:**
    - [ ] Enhancing the "system boot" feel.
    - [ ] Adding more "system panels" and "data objects" for project showcases.

---

## 🎮 Section 2: Games (Secret Level)
*The hidden interactive layer: A "broken" game development environment.*

- **Concept:** The visitor "discovers" a hidden program (`secret_level.html`). The game "crashes," forcing the visitor to become the developer and repair it.
- **Components:**
    - **Repair Puzzles:** Puzzles that look like game editor modules (e.g., `repair_puzzle.html`).
    - **Space Shooter:** The payoff for fixing the game; fighting "manifestations of errors."
    - **Mystery Cards:** Rewards that provide actual game-dev resources (props, licenses, assets).
- **Current State:**
    - [x] Movement prototype/physics testing.
    - [x] Initial puzzle logic (`css/puzzle.css`).
    - [x] Game assets directory structure (`game/assets/`).
- **Future Goals:**
    - [ ] Complete the "Game Recovery" interface.
    - [ ] Fully implement the Space Shooter payoff.
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
- **Cozy Pastel:** A softer, warm identity. Off-white backgrounds, pastel pinks/blues, and soft typography. Designed for a more relaxed, approachable browsing experience.
- **Implementation:** Themes are controlled via the `data-theme` attribute on the `<html>` or `<body>` tag, utilizing the variables in `css/variables.css`.

## 🛠️ Tech Stack & Conventions
- **Frontend:** HTML5, CSS3 (Modern Flex/Grid), Vanilla JavaScript.
- **Styling:** CSS Variables for easy theme switching.
- **Structure:** 
    - `/css`: Modular styles (modals, hud, cards).
    - `/js`: Logic-specific files (main, hud-nav).
    - `/game`: Contained game logic and assets.

---

## 🗺️ Execution Flow
1. **PORTFOLIO WEBSITE** (Fictional Developer Environment)
2. **SECRET LEVEL** (The Discovery)
3. **GAME CRASHES** (The Hook)
4. **RECOVERY MODE** (The Interaction - Repairing Systems)
5. **GAME.EXE WORKS** (The Payoff - Playing the Game)
6. **MYSTERY CARDS** (The Reward - Community Assets)

---
*Last Updated: 2026-08-15*
