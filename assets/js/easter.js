/* ============================================================
   easter.js — one hidden thing, done properly.

   The old code still works: up up down down left right left
   right B A. It reveals the /game/secret_level stub, which is
   deliberately a stub (see PROJECT_GUIDE.md sitemap).
   Once found, it stays unlocked for that visitor.
   ============================================================ */

window.EASTER = (function () {
  'use strict';

  var UTIL = window.UTIL;
  var KEY = 'af-portfolio-unlocked';
  var SEQUENCE = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];
  var progress = 0;

  function reveal(announce) {
    var slot = document.getElementById('secret-slot');
    if (slot) slot.hidden = false;
    if (announce) {
      window.SFX.secret();
      UTIL.toast('Secret level unlocked. Check the bottom of Home.', 4200);
    }
  }

  function init() {
    if (UTIL.storage.get(KEY) === 'yes') reveal(false);

    document.addEventListener('keydown', function (event) {
      var key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (key === SEQUENCE[progress]) {
        progress += 1;
        if (progress === SEQUENCE.length) {
          progress = 0;
          UTIL.storage.set(KEY, 'yes');
          if (window.ROUTER && window.ROUTER.current() !== 'home') window.ROUTER.activate('home');
          reveal(true);
        }
      } else {
        progress = key === SEQUENCE[0] ? 1 : 0;
      }
    });
  }

  return { init: init };
})();
