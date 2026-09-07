/**
 * Theme Restoration Script
 * Restores saved theme before first paint to prevent flash
 * Call this inline in <head> on every page
 */
(function() {
  try {
    var t = localStorage.getItem('theme');
    if (t) document.documentElement.setAttribute('data-theme', t);
  } catch (e) { /* localStorage unavailable */ }
})();