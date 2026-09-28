/* ============================================================
   notfound.js — the off-map scene on 404.html.

   Fills the address readout, then lets the compass and binoculars
   react to the likely destination. This keeps the 404 page useful on
   both live deployments and local previews.
   ============================================================ */

(function () {
  'use strict';

  var doc = document;
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var busy = false;

  var PLACES = [
    { k: 'home', l: 'HOME', h: './index.html', w: ['home', 'index', 'main', 'menu', 'start'] },
    { k: 'art', l: 'ART', h: './index.html#art', w: ['art', 'portfolio', 'work', 'model', 'gallery', 'asset', 'prop', 'project', 'sketchfab', '3d'] },
    { k: 'pipeline', l: 'PIPELINE', h: './index.html#pipeline', w: ['pipeline', 'process', 'workflow', 'tool', 'stage'] },
    { k: 'about', l: 'ABOUT', h: './index.html#about', w: ['about', 'bio', 'profile', 'experience', 'recommend', 'endorse'] },
    { k: 'contact', l: 'CONTACT', h: './index.html#contact', w: ['contact', 'mail', 'email', 'hire', 'freelance', 'message', 'reach'] },
    { k: 'resume', l: 'RESUME', h: './resume.html', w: ['resume', 'cv'] }
  ];

  function $(id) { return doc.getElementById(id); }
  function set(id, text) { var node = $(id); if (node) node.textContent = text; }
  function pinFor(key) { return doc.querySelector('[data-pin="' + key + '"]'); }
  function pins() { return Array.prototype.slice.call(doc.querySelectorAll('.map-pin')); }

  function useLocalPinIcons() {
    var icons = {
      home: 'house.svg',
      art: 'image.svg',
      pipeline: 'tool-kit.svg',
      about: 'user.svg',
      contact: 'mail.svg'
    };
    pins().forEach(function (pin) {
      var icon = pin.querySelector('.map-pin-icon');
      var file = icons[pin.getAttribute('data-pin')];
      if (icon && file) icon.src = './assets/icon/selected/' + file;
    });
  }

  function rawPath() {
    var raw;
    try { raw = decodeURIComponent(window.location.pathname + window.location.search); }
    catch (error) { raw = window.location.pathname || ''; }
    return raw.replace(/\/404\.html$/, '/');
  }

  function attemptedPath() {
    if (window.location.protocol === 'file:') return 'LOCAL PREVIEW';
    var raw = rawPath();
    if (!raw || raw === '/') raw = '/(address not recorded)';
    return raw.length > 58 ? raw.slice(0, 55) + '\u2026' : raw;
  }

  function match() {
    if (window.location.protocol === 'file:') return null;
    var tokens = rawPath().toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    var best = null;
    var top = 0;

    PLACES.forEach(function (place) {
      var score = 0;
      tokens.forEach(function (token) {
        place.w.forEach(function (word) {
          if (token === word) score += 5;
          else if (token.indexOf(word) > -1 && token.length >= 4 && word.length >= 4) score += 1;
        });
      });
      if (score > top) { top = score; best = place; }
    });

    return best;
  }

  function say(text, place) {
    var box = $('lost-spot');
    if (!box) return;
    box.textContent = '';

    var label = doc.createElement('b');
    label.textContent = 'LOOKOUT';
    box.appendChild(label);
    box.appendChild(doc.createTextNode(text + ' '));

    if (place) {
      var link = doc.createElement('a');
      link.href = place.h;
      link.textContent = 'GO TO ' + place.l + ' ▸';
      box.appendChild(link);
    }
  }

  function ping(list) {
    pins().forEach(function (pin) { pin.classList.remove('is-spotted'); });
    list.forEach(function (pin, index) {
      window.setTimeout(function () { pin.classList.add('is-spotted'); }, reduce ? 0 : index * 160);
    });
  }

  function scan(quiet) {
    var map = doc.querySelector('.lost-map');
    var bino = $('lost-bino');
    if (busy || !map) return;

    busy = true;
    if (!quiet && window.SFX && window.SFX.confirm) window.SFX.confirm();

    map.classList.add('is-scanning');
    if (bino) bino.setAttribute('aria-busy', 'true');

    window.setTimeout(function () {
      map.classList.remove('is-scanning');
      if (bino) bino.removeAttribute('aria-busy');

      var found = match();
      var pin = found ? pinFor(found.k) : null;

      if (found) {
        ping(pin ? [pin] : []);
        say('Spotted ' + found.l + ' in range. Was this what you were after?', found);
      } else {
        ping(pins());
        say('Nothing matches that address. These landmarks are in range: pick one on the map.', null);
      }

      busy = false;
    }, reduce ? 60 : 1100);
  }

  function lockNeedle() {
    var compass = doc.querySelector('.lost-compass');
    var hub = doc.querySelector('.compass-hub');
    var home = pinFor('home');
    if (!compass || !hub || !home) return;

    var a = hub.getBoundingClientRect();
    var b = home.querySelector('.badge').getBoundingClientRect();
    var deg = Math.atan2((b.top + b.height / 2) - (a.top + a.height / 2),
      (b.left + b.width / 2) - (a.left + a.width / 2)) * 180 / Math.PI + 90;
    compass.style.setProperty('--needle', deg.toFixed(1) + 'deg');
  }

  function init() {
    set('lost-path', attemptedPath());
    useLocalPinIcons();

    var compass = doc.querySelector('.lost-compass');
    var signal = $('lost-signal');
    var bino = $('lost-bino');

    window.setTimeout(function () {
      if (compass) {
        compass.classList.remove('is-hunting');
        compass.classList.add('is-locked');
        lockNeedle();
      }
      if (signal) {
        signal.textContent = 'SIGNAL: LOCKED ON HOME';
        signal.classList.add('is-locked');
      }
      if (window.SFX && window.SFX.move) window.SFX.move();
      scan(true);
    }, reduce ? 0 : 1700);

    if (bino) bino.addEventListener('click', function () { scan(false); });

    var timer;
    window.addEventListener('resize', function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(lockNeedle, 150);
    });
  }

  init();
})();
