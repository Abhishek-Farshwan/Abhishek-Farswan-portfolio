/* ============================================================
   notfound.js — the off-map scene on 404.html.

  Turn the address the visitor actually asked for into a readable
  address readout, and add a tiny countdown so the page feels like
  a live lost-signal scene instead of a flat error stub.
   ============================================================ */

(function () {
  'use strict';

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

  function paintReadout() {
    var path = attemptedPath();
    set('lost-path', path);
  }

  /* ---------- countdown ---------- */

  function initCountdown() {
    var node = document.getElementById('countdown');
    var signal = document.getElementById('lost-signal');
    if (!node) return;

    var left = 10;
    var stopped = false;

    function stop() {
      if (stopped) return;
      stopped = true;
      node.textContent = 'COUNTDOWN STOPPED — TAKE YOUR TIME';
      if (signal) {
        signal.classList.add('is-holding');
        signal.textContent = 'SIGNAL: HOLDING';
      }
    }

    ['keydown', 'pointerdown', 'wheel'].forEach(function (type) {
      window.addEventListener(type, stop, { once: true, passive: true });
    });

    var timer = window.setInterval(function () {
      if (stopped) {
        window.clearInterval(timer);
        return;
      }

      left -= 1;
      if (left <= 0) {
        window.clearInterval(timer);
        node.textContent = 'WOULD RETURN TO MENU NOW';
        return;
      }
      node.textContent = 'RETURNING TO MENU IN ' + left;
    }, 1000);
  }

  paintReadout();
  initCountdown();
})();
