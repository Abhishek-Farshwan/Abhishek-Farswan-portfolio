/* Smoke test: load the real pages in jsdom, run the real scripts,
   mock the Sketchfab API, and assert the interactions work. */

const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const SITE = '/home/claude/site';
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

function load(file, { fetchImpl } = {}) {
  const virtualConsole = new VirtualConsole();
  const errors = [];
  virtualConsole.on('jsdomError', (e) => errors.push(e.message));
  virtualConsole.on('error', (...args) => errors.push(args.join(' ')));

  const dom = new JSDOM(fs.readFileSync(path.join(SITE, file), 'utf8'), {
    runScripts: 'dangerously',
    resources: undefined,
    url: 'https://example.test/' + file,
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse(window) {
      window.fetch = fetchImpl || (() => Promise.reject(new Error('offline')));
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

  doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  check('arrow right enters the focused panel', doc.activeElement && doc.activeElement.id === 'detail');
  doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
  check('arrow left exits the focused panel', doc.activeElement && doc.activeElement.id === 'tab-about');

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
  sound.click();
  check('sound toggle flips state', sound.getAttribute('aria-pressed') === 'true');
  check('sound toggle relabels', /SOUND ON/.test(sound.textContent));
  sound.click();
  check('sound toggle flips back', sound.getAttribute('aria-pressed') === 'false');

  // konami
  ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']
    .forEach(key => doc.dispatchEvent(new win.KeyboardEvent('keydown', { key, bubbles: true })));
  check('konami reveals secret slot', doc.getElementById('secret-slot').hidden === false);

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

  /* ---------------- resume.html ---------------- */
  console.log('\n=== resume.html ===');
  const resume = load('resume.html');
  const rDoc = resume.dom.window.document;
  check('no script errors', resume.errors.length === 0, resume.errors[0]);
  check('roster mounted as links', rDoc.querySelectorAll('.menu-btn[href]').length === 6);
  check('resume entry marked current', rDoc.querySelector('[aria-current="page"]').textContent === 'RESUME');
  check('menu links point home with hash', rDoc.querySelector('.menu-btn[href="index.html#art"]') !== null);
  check('resume name is the Farswan spelling', /ABHISHEK FARSWAN/.test(rDoc.querySelector('h1').textContent));
  check('three experience entries', rDoc.querySelectorAll('.resume-section .entry').length === 3);

  /* ---------------- 404.html ---------------- */
  console.log('\n=== 404.html ===');
  const notFound = load('404.html');
  const nDoc = notFound.dom.window.document;
  check('no script errors', notFound.errors.length === 0, notFound.errors[0]);
  check('countdown present', !!nDoc.getElementById('countdown'));
  check('return link present', !!nDoc.querySelector('a[href="./index.html"]'));
  check('map frame and landmark pins present', !!nDoc.querySelector('.map-frame') && nDoc.querySelectorAll('.map-pin').length >= 5);

  /* ---------------- secret level ---------------- */
  console.log('\n=== game/secret_level/index.html ===');
  const secret = load('game/secret_level/index.html');
  const sDoc = secret.dom.window.document;
  check('no script errors', secret.errors.length === 0, secret.errors[0]);
  check('states it is a stub', /NOT BUILT/.test(sDoc.body.textContent));

  console.log('\n' + (failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'));
  process.exit(failures === 0 ? 0 : 1);
})();
