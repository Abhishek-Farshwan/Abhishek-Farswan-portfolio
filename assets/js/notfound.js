/* ============================================================
   notfound.js — the off-map scene on 404.html.

  Turn the address the visitor actually asked for into a readable
  address readout, so the page shows what broke instead of just shrugging.

   No inline JS anywhere, because every page ships a strict
   script-src 'self' CSP.
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

  paintReadout();
})();
