/* Smoke test: load the real pages in jsdom, run the real scripts,
   mock the Sketchfab API, and assert the interactions work. */

const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const SITE = path.resolve(__dirname, '..');
let failures = 0;

function check(name, condition, extra) {
  const mark = condition ? 'PASS' : 'FAIL';
  if (!condition) failures += 1;
  console.log(`${mark}  ${name}${!condition && extra ? '  -> ' + extra : ''}`);
}

function fakeModels(count) {
  const ids = [
    '2a1563b0a4ef40d79b52c3112d2d9437',
    '699ee2e05bce46749ef93e3330cfb7d4',
    '1fe25295ecc84383a65a109dcb42f60d',
    '951d2ca02d2b468391e738d065cebc87'
  ];
  return Array.from({ length: count }, (_, i) => ({
    uid: ids[i] || 'uid' + i,
    name: 'Model ' + (i + 1) + (i === 0 ? ' Throne' : ''),
    description: 'Test description for model ' + (i + 1),
    viewCount: 100 * (count - i),
    likeCount: 10 * (i + 1),
    faceCount: 1400 + i,
    publishedAt: '2025-0' + ((i % 9) + 1) + '-01T00:00:00Z',
    staffpickedAt: i === 1 ? '2025-02-01T00:00:00Z' : null,
    embedUrl: 'https://sketchfab.com/models/' + (ids[i] || 'uid' + i) + '/embed',
    viewerUrl: 'https://sketchfab.com/3d-models/x-' + (ids[i] || 'uid' + i),
    thumbnails: { images: [{ width: 640, height: 480, url: 'https://example.test/t' + i + '.jpg' }] }
  }));
}

function load(file, { fetchImpl, url, seed } = {}) {
  const virtualConsole = new VirtualConsole();
  const errors = [];
  virtualConsole.on('jsdomError', (e) => errors.push(e.message));
  virtualConsole.on('error', (...args) => errors.push(args.join(' ')));

  const dom = new JSDOM(fs.readFileSync(path.join(SITE, file), 'utf8'), {
    runScripts: 'dangerously',
    resources: undefined,
    url: url || 'https://example.test/' + file,
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse(window) {
      window.fetch = fetchImpl || (() => Promise.reject(new Error('offline')));
      if (seed) seed(window);
      window.HTMLElement.prototype.scrollIntoView = function () {};
      window.Element.prototype.scrollTo = function () {};
    }
  });

  // run local scripts manually (jsdom will not fetch them without a resource loader)
  const scripts = [...dom.window.document.querySelectorAll('script[src]')];
  scripts.forEach((tag) => {
    const src = tag.getAttribute('src').replace(/\?.*$/, '').replace(/^\.\//, '').replace(/^\.\.\/\.\.\//, '');
    const code = fs.readFileSync(path.join(SITE, src), 'utf8');
    dom.window.eval(code);
  });
  if (dom.window.document.readyState === 'loading') dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
  return { dom, errors };
}

function tick(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async function run() {
  /* ---------------- index.html ---------------- */
  const fetchOk = () => Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ results: fakeModels(12), next: null })
  });

  const { dom, errors } = load('index.html', { fetchImpl: fetchOk });
  const win = dom.window;
  const doc = win.document;

  console.log('\n=== index.html ===');
  check('no script errors on boot', errors.length === 0, errors[0]);
  check('roster mounted', !!doc.querySelector('.roster'));
  check('profile name rendered', doc.querySelector('.profile-name').textContent === 'ABHISHEK');
  check('5 panel menu entries', doc.querySelectorAll('.menu-btn[data-panel]').length === 5);
  check('resume entry present', !!doc.querySelector('.menu-btn.is-external'));
  check('resume entry has a document icon', /document\.svg$/.test(doc.querySelector('.menu-btn.is-external .menu-icon').getAttribute('src')));
  const resumeMenuSounds = [];
  win.SFX.select = () => resumeMenuSounds.push('select');
  const resumeMenuLink = doc.querySelector('.menu-btn.is-external');
  resumeMenuLink.addEventListener('click', event => event.preventDefault(), { once: true });
  resumeMenuLink.click();
  check('home resume button plays select cue', resumeMenuSounds[0] === 'select');
  check('tab bar rendered', doc.querySelectorAll('.tabbar-btn').length === 5);
  check('prompt bar rendered', !!doc.querySelector('.prompt-bar'));
  check('footer tagline filled', /SHIPPED LIKE A PORTFOLIO/.test(doc.querySelector('.footer-line').textContent));
  check('home panel active by default', doc.getElementById('panel-home').classList.contains('active'));

  // panel switching
  doc.getElementById('tab-pipeline').click();
  check('pipeline panel activates', doc.getElementById('panel-pipeline').classList.contains('active')
    && doc.getElementById('panel-home').hidden === true);
  check('crumb updates', doc.getElementById('crumb').textContent === 'PROFILE / PIPELINE');
  check('tabbar syncs', doc.querySelector('.tabbar-btn[data-panel="pipeline"]').getAttribute('aria-selected') === 'true');

  // keyboard: number jump
  doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: '4', bubbles: true }));
  check('number key jumps to about', doc.getElementById('panel-about').classList.contains('active'));

  // keyboard: vertical arrows browse and open panels live; horizontal keys
  // keep the classic menu meanings of select and back.
  doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
  check('arrow down switches to the next panel', doc.getElementById('panel-contact').classList.contains('active'));
  check('arrow down moves focus to the next tab', doc.activeElement && doc.activeElement.id === 'tab-contact');

  doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
  check('arrow up switches back to about', doc.getElementById('panel-about').classList.contains('active'));
  check('arrow up moves focus back to about', doc.activeElement && doc.activeElement.id === 'tab-about');

  const endorsementSounds = [];
  win.SFX.move = () => endorsementSounds.push('move');
  win.SFX.confirm = () => endorsementSounds.push('confirm');
  win.SFX.back = () => endorsementSounds.push('back');
  doc.getElementById('tab-about').dispatchEvent(new win.MouseEvent('mouseenter'));
  check('menu hover is silent', endorsementSounds.length === 0);
  doc.getElementById('npc-next').focus();
  doc.activeElement.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  check('focused endorsement handles arrow right', doc.getElementById('npc-counter').textContent === '2 / 4');
  check('endorsement navigation plays move cue', endorsementSounds[0] === 'move');
  doc.getElementById('npc-prev').click();
  doc.getElementById('npc-next').click();
  check('endorsement buttons play move cues', endorsementSounds.slice(1, 3).join(',') === 'move,move');
  doc.getElementById('npc-more').click();
  doc.getElementById('npc-more').click();
  check('endorsement expand and collapse use confirm and back', endorsementSounds.slice(3).join(',') === 'confirm,back');
  doc.getElementById('tab-about').focus();

  doc.activeElement.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  check('arrow right enters the focused panel', doc.getElementById('detail').classList.contains('detail-focused'));
  doc.activeElement.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
  check('arrow left exits the focused panel', !doc.getElementById('detail').classList.contains('detail-focused')
    && doc.activeElement.id === 'tab-about');

  // Backspace is the explicit "come back" shortcut — jumps straight to
  // Home without needing a confirm step.
  doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
  check('backspace returns to home', doc.getElementById('panel-home').classList.contains('active'));
  check('backspace also focuses the home tab', doc.activeElement && doc.activeElement.id === 'tab-home');

  // in-page shortcut buttons
  doc.querySelector('[data-goto="art"]').click();
  await tick(30);
  check('data-goto link switches panel', doc.getElementById('panel-art').classList.contains('active'));

  // sketchfab sync
  await tick(60);
  const cards = doc.querySelectorAll('#art-grid .model-card');
  check('synced models rendered', cards.length === 12, 'got ' + cards.length);
  check('status reports sync', /SYNCED FROM SKETCHFAB/.test(doc.getElementById('art-status').textContent));
  check('embed keeps no-watermark params',
    /ui_watermark=0/.test(cards[0].getAttribute('data-src')) && /ui_theme=dark/.test(cards[0].getAttribute('data-src')));
  check('thumbnail used as poster', /example\.test/.test(cards[0].querySelector('.viewer-placeholder').getAttribute('style') || ''));
  check('every card keeps a sketchfab link', [...cards].every(c => !!c.querySelector('.viewer-placeholder a[href]')));
  check('staff pick badge shown', !!doc.querySelector('.staff-badge'));
  check('count chip updated', doc.getElementById('art-count').textContent === '12 MODELS');

  // sorting
  doc.getElementById('art-sort').value = 'views';
  doc.getElementById('art-sort').dispatchEvent(new win.Event('change'));
  const firstByViews = doc.querySelector('#art-grid .model-card h3').textContent;
  check('sort by views puts highest first', firstByViews === 'Model 1 Throne', firstByViews);

  doc.getElementById('art-sort').value = 'name';
  doc.getElementById('art-sort').dispatchEvent(new win.Event('change'));
  check('sort A-Z works', doc.querySelector('#art-grid .model-card h3').textContent === 'Model 1 Throne');

  // featured filter
  doc.getElementById('art-mode').value = 'featured';
  doc.getElementById('art-mode').dispatchEvent(new win.Event('change'));
  check('featured filters to approved ids', doc.querySelectorAll('#art-grid .model-card').length === 4);
  doc.getElementById('art-mode').value = 'all';
  doc.getElementById('art-mode').dispatchEvent(new win.Event('change'));

  // search
  doc.getElementById('art-search').value = 'throne';
  doc.getElementById('art-search').dispatchEvent(new win.Event('input'));
  await tick(240);
  check('search narrows the grid', doc.querySelectorAll('#art-grid .model-card').length === 1);

  doc.getElementById('art-search').value = 'zzzz';
  doc.getElementById('art-search').dispatchEvent(new win.Event('input'));
  await tick(240);
  check('empty state shown', !!doc.querySelector('.art-empty'));
  doc.querySelector('[data-clear-search]').click();
  await tick(20);
  check('clear search restores grid', doc.querySelectorAll('#art-grid .model-card').length === 12);

  // inspector
  doc.querySelector('[data-inspect="0"]').click();
  const modal = doc.getElementById('inspector');
  check('inspector opens', modal.hidden === false);
  check('inspector title set', modal.querySelector('.modal-title').textContent.length > 0);
  check('inspector counter set', modal.querySelector('.modal-counter').textContent === '1 / 12');
  modal.querySelector('[data-step="1"]').click();
  check('inspector next works', modal.querySelector('.modal-counter').textContent === '2 / 12');
  doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  check('inspector closes on escape', modal.hidden === true);
  check('inspector clears iframe on close', modal.querySelector('iframe').getAttribute('src') === 'about:blank');

  // contact form validation
  doc.getElementById('tab-contact').click();
  win.SFX.select = () => endorsementSounds.push('select');
  const contactLink = doc.querySelector('.contact-links a');
  contactLink.addEventListener('click', event => event.preventDefault(), { once: true });
  contactLink.click();
  check('contact links play select cue', endorsementSounds[endorsementSounds.length - 1] === 'select');
  const form = doc.getElementById('contact-form');
  form.dispatchEvent(new win.Event('submit', { bubbles: true, cancelable: true }));
  check('empty form flags name', doc.getElementById('contact-name-error').textContent.length > 0);
  check('empty form flags email', doc.getElementById('contact-email-error').textContent.length > 0);
  check('empty form flags message', doc.getElementById('contact-message-error').textContent.length > 0);

  doc.getElementById('contact-name').value = 'Studio Person';
  doc.getElementById('contact-email').value = 'not-an-email';
  doc.getElementById('contact-message').value = 'We need a set of stylized props.';
  doc.getElementById('contact-name').dispatchEvent(new win.Event('input'));
  form.dispatchEvent(new win.Event('submit', { bubbles: true, cancelable: true }));
  check('bad email rejected', doc.getElementById('contact-email-error').textContent.length > 0);

  // sound toggle
  const sound = doc.getElementById('sound-toggle');
  check('sound toggle describes UI sounds', sound.getAttribute('aria-label') === 'Toggle UI sounds');
  sound.click();
  check('sound toggle flips state', sound.getAttribute('aria-pressed') === 'true');
  check('sound toggle relabels', /SOUND ON/.test(sound.textContent));
  check('sound toggle toast describes UI sounds', /UI sounds on/i.test(doc.querySelector('.toast').textContent));
  sound.click();
  check('sound toggle flips back', sound.getAttribute('aria-pressed') === 'false');

  // konami
  ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']
    .forEach(key => doc.dispatchEvent(new win.KeyboardEvent('keydown', { key, bubbles: true })));
  check('konami reveals secret slot', doc.getElementById('secret-slot').hidden === false);
  check('konami fires the achievement toast',
    !!doc.querySelector('.toast.toast--achievement') && /SECRET LEVEL FOUND/.test(doc.querySelector('.toast--achievement').textContent));

  /* ---------------- offline fallback ---------------- */
  console.log('\n=== index.html (sketchfab offline) ===');
  const offline = load('index.html', { fetchImpl: () => Promise.reject(new Error('offline')) });
  offline.dom.window.document.getElementById('tab-art').click();
  await tick(80);
  const offDoc = offline.dom.window.document;
  check('curated fallback renders 4 cards', offDoc.querySelectorAll('#art-grid .model-card').length === 4);
  check('status admits sync failure', /LIVE SYNC UNAVAILABLE/.test(offDoc.getElementById('art-status').textContent));
  check('fallback mode switched to featured', offDoc.getElementById('art-mode').value === 'featured');
  check('fallback keeps sketchfab links',
    [...offDoc.querySelectorAll('#art-grid .model-card')].every(c => /sketchfab\.com\/3d-models/.test(c.getAttribute('data-view-url'))));

  /* ---------------- glow-up features ---------------- */
  console.log('\n=== index.html (glow-up features) ===');
  const LONG = 'Stylized props built for a cozy game world with readable silhouettes and restrained detail so every piece holds up under real-time lighting, ' +
    'not just inside a render, plus a few extra sentences of filler to guarantee this runs well past the two hundred character cut line.';
  const fetchFeatures = () => Promise.resolve({
    ok: true,
    status: 200,
    json: () => {
      const models = fakeModels(6);
      models[0].description = LONG;                      // featured uid, long copy
      models[1].uid = 'hideme';  models[1].name = 'Hidden WIP';
      models[2].uid = 'fixme';   models[2].description = 'strenghthen typo draft';
      models[3].uid = 'plainuid'; models[3].name = 'Plain Model';
      return Promise.resolve({ results: models, next: null });
    }
  });
  const feat = load('index.html', { fetchImpl: fetchFeatures });
  const fWin = feat.dom.window;
  const fDoc = fWin.document;
  check('no script errors on boot', feat.errors.length === 0, feat.errors[0]);

  // count chips use the neutral treatment, gold stays reserved for real actions
  check('art count chip is neutral', fDoc.getElementById('art-count').classList.contains('chip--sky')
    && !fDoc.getElementById('art-count').classList.contains('chip--gold'));
  check('no count/status chip uses gold', fDoc.querySelectorAll('.chip--gold').length === 0);

  // copy pass: status is useful + sourced, nothing unearned, no repeated punchline, no sidebar clutter
  const fText = fDoc.body.textContent;
  check('status line says open for freelance', /STATUS: OPEN FOR FREELANCE/.test(fText) && !/BUILDING WORLDS/.test(fText));
  check('art footer makes no unearned claim', /complete archive lives on my Sketchfab and ArtStation/.test(fText) && !/keeps growing|started as a block-out/.test(fText));
  check('render-ready punchline appears once, not on every page', (fText.match(/render-ready/g) || []).length === 1, String((fText.match(/render-ready/g) || []).length));
  check('contact copy leads with what visitors need', /Got a game that needs assets\?/.test(fText) && !/Find me around the web/.test(fText));
  check('profile medium lists props, characters and environments', /Props, characters & environments/.test(fText));
  check('roster footer is just sound + hint (no extra toggles)', fDoc.querySelectorAll('.roster-footer button').length === 1);

  // hidden ids + description overrides go through the real config
  fWin.SITE.sketchfab.hiddenIds.push('hideme');
  fWin.SITE.sketchfab.descriptionOverrides['fixme'] = 'Fixed, portfolio-ready description.';
  fDoc.querySelector('[data-goto="art"]').click();
  await tick(80);
  const fCards = [...fDoc.querySelectorAll('#art-grid .model-card')];
  const titles = fCards.map(c => c.querySelector('h3').textContent);
  check('hidden upload filtered out', fCards.length === 5 && titles.indexOf('Hidden WIP') === -1, titles.join(' | '));
  check('count chip reflects hidden filter', fDoc.getElementById('art-count').textContent === '5 MODELS');

  const byTitle = (t) => fCards.find(c => c.querySelector('h3').textContent === t);
  const descOf = (card) => card.querySelector('.art-desc').textContent;
  const longCard = fCards.find(c => /^Model 1/.test(c.querySelector('h3').textContent));
  const longDesc = descOf(longCard);
  check('long description ends with an ellipsis', /\u2026$/.test(longDesc), longDesc.slice(-20));
  check('truncated description stays near the limit', longDesc.length <= 201, String(longDesc.length));
  const stem = longDesc.replace(/\u2026$/, '');
  check('truncation lands on a word boundary',
    LONG.indexOf(stem) === 0 && (LONG.charAt(stem.length) === ' ' || LONG.charAt(stem.length) === ''), JSON.stringify(LONG.charAt(stem.length)));
  const shortCard = byTitle('Plain Model');
  check('short description left untouched', descOf(shortCard) === 'Test description for model 4');
  const fixedCard = fCards.find(c => /Fixed, portfolio-ready/.test(descOf(c)));
  check('description override replaces live copy', !!fixedCard && !/strenghthen/.test(fDoc.getElementById('art-grid').textContent));

  // featured badge only on curated uids while synced
  check('featured badge on curated uid', !!longCard.querySelector('.featured-badge'));
  check('no featured badge on non-curated uid', !shortCard.querySelector('.featured-badge'));

  // honest loading state (jsdom has no IntersectionObserver, so viewers start immediately)
  const ph = longCard.querySelector('.viewer-placeholder');
  check('loading state applied when viewer starts', ph.classList.contains('is-loading') && /LOADING MODEL/.test(ph.querySelector('b').textContent));
  check('loading hint replaces stale standby copy', /Fetching the viewer/.test(ph.textContent) && !/starts when this card reaches/.test(ph.textContent));
  check('spinner element present', !!ph.querySelector('.spinner-ring'));

  // failure path flips the same placeholder to the unavailable state
  const frame = longCard.querySelector('iframe.viewer');
  frame.dispatchEvent(new fWin.Event('error'));
  check('failed viewer clears loading and says so', !ph.classList.contains('is-loading') && /VIEWER UNAVAILABLE/.test(ph.querySelector('b').textContent)
    && /did not load/.test(ph.textContent));

  /* ---------------- resume.html ---------------- */
  console.log('\n=== resume.html ===');
  const resume = load('resume.html');
  const rWin = resume.dom.window;
  const rDoc = resume.dom.window.document;
  check('no script errors', resume.errors.length === 0, resume.errors[0]);
  check('roster mounted as links', rDoc.querySelectorAll('.menu-btn[href]').length === 6);
  check('resume entry marked current', rDoc.querySelector('[aria-current="page"]').textContent === 'RESUME');
  check('menu links point home with hash', rDoc.querySelector('.menu-btn[href="index.html#art"]') !== null);
  check('resume name is the Farswan spelling', /ABHISHEK FARSWAN/.test(rDoc.querySelector('h1').textContent));
  check('three experience entries', rDoc.querySelectorAll('.resume-section .entry').length === 3);
  let resumeCue = '';
  let printCalled = false;
  rWin.SFX.select = () => { resumeCue = 'select'; };
  rWin.SFX.confirm = () => { resumeCue = 'confirm'; };
  rWin.print = () => { printCalled = true; };
  rDoc.querySelector('.resume-meta a').addEventListener('click', event => event.preventDefault(), { once: true });
  rDoc.querySelector('.resume-meta a').click();
  check('resume links play select cue', resumeCue === 'select');
  rDoc.getElementById('print-btn').click();
  check('print action plays confirm cue', resumeCue === 'confirm' && printCalled);

  /* ---------------- 404.html ---------------- */
  console.log('\n=== 404.html ===');
  const notFound = load('404.html', { url: 'file:///portfolio/404.html' });
  const nDoc = notFound.dom.window.document;
  check('no script errors', notFound.errors.length === 0, notFound.errors[0]);
  check('countdown removed', !nDoc.getElementById('countdown'));
  check('local 404 preview hides filesystem path', nDoc.getElementById('lost-path').textContent === 'LOCAL PREVIEW');
  check('return link present', !!nDoc.querySelector('a[href="./index.html"]'));
  check('map and landmark pins present', !!nDoc.querySelector('.lost-map') && nDoc.querySelectorAll('.map-pin').length >= 5);

  /* ---------------- secret level ---------------- */
  console.log('\n=== game/secret_level/index.html ===');
  const secret = load('game/secret_level/index.html');
  const sDoc = secret.dom.window.document;
  check('no script errors', secret.errors.length === 0, secret.errors[0]);
  check('states it is a stub', /NOT BUILT/.test(sDoc.body.textContent));

  console.log('\n' + (failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'));
  process.exit(failures === 0 ? 0 : 1);
})();
