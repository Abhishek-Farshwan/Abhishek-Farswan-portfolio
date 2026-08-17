document.addEventListener('DOMContentLoaded', () => {
  const sectionList = ['home', 'art', 'systems', 'about', 'contact'];
  const sectionLabels = {
    home: 'home',
    art: 'art_3d',
    systems: 'systems',
    about: 'about',
    contact: 'contact'
  };
  const unlockedSections = new Set(['home']);

  const tabs = [...document.querySelectorAll('.tab')];
  const hudNodes = [...document.querySelectorAll('.hud-node')];
  const sectionEls = sectionList.map(id => document.getElementById(id)).filter(Boolean);
  const viewportHud = document.getElementById('viewportHud');
  const hudStatusBadge = document.getElementById('hudStatusBadge');
  const hudPctText = document.getElementById('hudPctText');
  const hudFill = document.getElementById('hudProgressFill');

  let activeIndex = 0;

  function updateSectionProgress(activeId) {
    const foundIdx = sectionList.indexOf(activeId);
    if (foundIdx !== -1) {
      activeIndex = foundIdx;
    }

    // Unlock sections up to current active index
    for (let i = 0; i <= activeIndex; i++) {
      unlockedSections.add(sectionList[i]);
    }

    // Find highest unlocked index in sequence
    let maxUnlockedIdx = 0;
    for (let i = 0; i < sectionList.length; i++) {
      if (unlockedSections.has(sectionList[i])) {
        maxUnlockedIdx = i;
      }
    }

    const nextLockedIdx = maxUnlockedIdx + 1;

    // Top Tabs: contact is visible from start
    tabs.forEach((tab, index) => {
      const secId = sectionList[index];
      const isUnlocked = unlockedSections.has(secId) || secId === 'contact';
      const isActive = index === activeIndex;
      const statusEl = tab.querySelector('.tab-status');
      const nameEl = tab.querySelector('.tab-name');

      tab.style.filter = 'none';
      tab.style.opacity = '1';

      if (secId === 'contact' || isUnlocked) {
        tab.style.display = '';
        tab.classList.remove('locked');
        if (nameEl) nameEl.textContent = sectionLabels[secId];
        if (statusEl) statusEl.textContent = isActive ? '▸' : '✓';
      } else if (index === nextLockedIdx) {
        tab.style.display = '';
        tab.classList.add('locked');
        if (nameEl) nameEl.textContent = '????';
        if (statusEl) statusEl.textContent = '🔒';
      } else {
        tab.style.display = 'none';
      }

      tab.classList.toggle('active', isActive);
    });

    // Side Panel (HUD Nodes): strictly sequential unlock (contact appears only when reached)
    hudNodes.forEach((node, index) => {
      const secId = sectionList[index];
      const isUnlocked = unlockedSections.has(secId);
      const isActive = index === activeIndex;
      const iconEl = node.querySelector('.node-icon');
      const labelEl = node.querySelector('.node-label');

      node.style.filter = 'none';
      node.style.opacity = '1';

      if (isUnlocked) {
        node.style.display = '';
        node.classList.remove('locked');
        if (labelEl) labelEl.textContent = sectionLabels[secId];
        if (iconEl) iconEl.textContent = isActive ? '▸' : '✓';
      } else if (index === nextLockedIdx) {
        node.style.display = '';
        node.classList.add('locked');
        if (labelEl) labelEl.textContent = '????';
        if (iconEl) iconEl.textContent = '🔒';
      } else {
        node.style.display = 'none';
      }

      node.classList.toggle('active', isActive);
    });

    if (hudStatusBadge) {
      hudStatusBadge.textContent = `LVL ${unlockedSections.size}`;
    }
  }

  // Intersection Observer for scroll spy
  if (sectionEls.length > 0) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          updateSectionProgress(entry.target.id);
        }
      });
    }, { rootMargin: '-30% 0px -50% 0px', threshold: 0 });

    sectionEls.forEach(s => spy.observe(s));
  }

  // Scroll Progress & 100% Collapse Mode
  let ticking = false;
  function updateHudScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const pct = maxScroll > 0 ? Math.round((window.scrollY / maxScroll) * 100) : 0;
    const clampedPct = Math.min(Math.max(pct, 0), 100);

    if (hudFill) hudFill.style.width = clampedPct + '%';
    if (hudPctText) hudPctText.textContent = `EXP: ${clampedPct}%`;

    const is100Percent = clampedPct >= 99 || (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 10);
    if (viewportHud) {
      if (is100Percent) {
        viewportHud.classList.add('hud-complete');
        sectionList.forEach(id => unlockedSections.add(id));
        updateSectionProgress(sectionList[activeIndex]);
      } else {
        viewportHud.classList.remove('hud-complete');
      }
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateHudScroll);
    }
  }, { passive: true });

  updateHudScroll();
});
