/* ============================================================
   notfound.js — the off-map scene on 404.html.

  Keep the page functional and readable without relying on brittle
  layout hacks. This only handles the address readout.
   ============================================================ */

(function () {
  'use strict';

  function set(id, text) {
    var node = document.getElementById(id);
    if (node) node.textContent = text;
  }

  function attemptedPath() {
    if (window.location.protocol === 'file:') return 'LOCAL PREVIEW';

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

  function initReadout() {
    set('lost-path', attemptedPath());
  }

  initReadout();
})();
