/* ============================================================
   notfound.js — the off-map scene on 404.html.

   Two jobs:
   1. Turn the address the visitor actually asked for into a
      readable "coordinate" readout, so the page shows what
      broke instead of just shrugging.
   2. Run the auto-warp countdown back to the menu, which any
      interaction cancels — nobody should be yanked off a page
      they are still reading.

   No inline JS anywhere, because every page ships a strict
   script-src 'self' CSP.
   ============================================================ */

(function () {
  'use strict';

  var SECONDS = 10;

  var countdown = document.getElementById('countdown');
  var track = document.getElementById('warp-track');
  var fill = document.getElementById('warp-fill');
  var statusNode = document.getElementById('lost-status');
  var stayButton = document.getElementById('stay-btn');
  var signal = document.getElementById('lost-signal');

  function set(id, text) {
    var node = document.getElementById(id);
    if (node) node.textContent = text;
  }

  /* ---------- readout ---------- */

  function attemptedPath() {
    var raw;
    try {
      raw = decodeURIComponent(window.location.pathname + window.location.search);
    } catch (error) {
      raw = window.location.pathname || '';
    }
    raw = raw.replace(/\/404\.html$/, '/');
    if (!raw || raw === '/') raw = '/(address not recorded)';
    return raw.length > 58 ? raw.slice(0, 55) + '\u2026' : raw;
  }

  /* FNV-1a: same address always reports the same coordinates, so a
     shared broken link reads the same for everyone who lands on it. */
  function hash(text) {
    var value = 2166136261;
    for (var i = 0; i < text.length; i += 1) {
      value ^= text.charCodeAt(i);
      value = (value * 16777619) >>> 0;
    }
    return value;
  }

  function paintReadout() {
    var path = attemptedPath();
    var seed = hash(path);
    var x = ((seed % 24000) / 100 - 120).toFixed(2);
    var y = (((seed >>> 9) % 18000) / 100 - 90).toFixed(2);
    var block = (seed >>> 5) % 99;

    set('lost-path', path);
    set('lost-coords', 'X ' + x + '   Y ' + y);
    set('lost-sector', String.fromCharCode(65 + (seed % 26)) +
      '-' + (block < 10 ? '0' + block : block) + ' \u00B7 UNCHARTED');
  }

  /* ---------- auto-warp ---------- */

  var left = SECONDS;
  var stopped = false;
  var timer = null;

  function paintMeter() {
    if (fill) fill.style.transform = 'scaleX(' + (left / SECONDS) + ')';
  }

  function stop() {
    if (stopped) return;
    stopped = true;
    if (timer) window.clearInterval(timer);
    if (countdown) countdown.textContent = 'AUTO-WARP CANCELLED \u2014 TAKE YOUR TIME';
    if (track) track.classList.add('is-stopped');
    if (fill) fill.style.transform = 'scaleX(0)';
    if (signal) {
      signal.classList.add('is-holding');
      signal.textContent = 'SIGNAL: HOLDING';
    }
    if (statusNode) statusNode.textContent = 'Auto-return cancelled. Use the menu links whenever you are ready.';
    if (stayButton) {
      stayButton.disabled = true;
      stayButton.textContent = 'STAYING';
    }
  }

  function tick() {
    left -= 1;
    if (left <= 0) {
      window.clearInterval(timer);
      window.location.href = './index.html';
      return;
    }
    if (countdown) countdown.textContent = 'AUTO-WARP TO MENU IN ' + left;
    paintMeter();
  }

  paintReadout();

  if (countdown) {
    paintMeter();

    ['keydown', 'pointerdown', 'wheel'].forEach(function (type) {
      window.addEventListener(type, stop, { once: true, passive: true });
    });
    if (stayButton) stayButton.addEventListener('click', stop);

    timer = window.setInterval(tick, 1000);
  }
})();
