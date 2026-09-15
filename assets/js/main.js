/* ============================================================
   main.js — boot order. Loaded last.
   Chrome first (it creates the menu), then behaviours that
   attach to it.
   ============================================================ */

(function () {
  'use strict';

  var booted = false;

  function boot() {
    if (booted) return;
    booted = true;

    var page = window.CHROME.mount();

    window.ROUTER.init(page);

    if (page === 'home') {
      window.ART.init();
      window.INSPECTOR.init();
      window.EASTER.init();
    }

    // fire the initial panel activation only after every module has had a
    // chance to register a ROUTER.onChange listener — otherwise a page
    // loaded directly on e.g. #art would skip the Sketchfab sync entirely.
    window.ROUTER.start();

    window.CONTACT.init();

    var printBtn = document.getElementById('print-btn');
    if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

    var year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());

    document.documentElement.classList.add('ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
