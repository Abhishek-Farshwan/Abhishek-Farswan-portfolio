/* ============================================================
   notfound.js — the 404 continue-screen countdown.
   Extracted from an inline <script> so this page has no inline
   JS, which is a prerequisite for a strict Content-Security-Policy.
   ============================================================ */

(function () {
  'use strict';

  var node = document.getElementById('countdown');
  if (!node) return;

  var left = 10;
  var stopped = false;

  function stop() {
    if (stopped) return;
    stopped = true;
    node.textContent = 'COUNTDOWN STOPPED — TAKE YOUR TIME';
  }

  ['keydown', 'pointerdown', 'wheel'].forEach(function (type) {
    window.addEventListener(type, stop, { once: true, passive: true });
  });

  var timer = window.setInterval(function () {
    if (stopped) { window.clearInterval(timer); return; }
    left -= 1;
    if (left <= 0) {
      window.clearInterval(timer);
      window.location.href = './index.html';
      return;
    }
    node.textContent = 'RETURNING TO MENU IN ' + left;
  }, 1000);
})();
