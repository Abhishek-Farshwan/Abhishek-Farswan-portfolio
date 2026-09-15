/* ============================================================
   util.js — small shared helpers. No feature logic here.
   ============================================================ */

window.UTIL = (function () {
  'use strict';

  function qs(selector, scope) { return (scope || document).querySelector(selector); }
  function qsa(selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); }

  function escapeHtml(value) {
    return String(value === null || value === undefined ? '' : value)
      .replace(/[&<>'"]/g, function (character) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[character];
      });
  }

  function formatCount(value) {
    try {
      return new Intl.NumberFormat('en', {
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(value || 0);
    } catch (error) {
      return String(value || 0);
    }
  }

  /* localStorage is not available everywhere (private mode, sandboxed
     previews). Fall back to memory so nothing throws. */
  var memoryStore = {};

  var storage = {
    get: function (key) {
      try {
        var stored = window.localStorage.getItem(key);
        return stored === null ? memoryStore[key] : stored;
      } catch (error) {
        return memoryStore[key];
      }
    },
    set: function (key, value) {
      memoryStore[key] = value;
      try { window.localStorage.setItem(key, value); } catch (error) { /* memory only */ }
    }
  };

  function media(query) {
    if (typeof window.matchMedia !== 'function') return false;
    try { return window.matchMedia(query).matches; }
    catch (error) { return false; }
  }

  function prefersReducedMotion() { return media('(prefers-reduced-motion: reduce)'); }

  function isMobile() { return media('(max-width: 760px)'); }

  function toastZone() {
    var zone = document.getElementById('toast-zone');
    if (!zone) {
      zone = document.createElement('div');
      zone.id = 'toast-zone';
      zone.className = 'toast-zone';
      zone.setAttribute('role', 'status');
      zone.setAttribute('aria-live', 'polite');
      document.body.appendChild(zone);
    }
    return zone;
  }

  function toast(message, ms) {
    var zone = toastZone();
    var node = document.createElement('div');
    node.className = 'toast';
    node.textContent = message;
    zone.appendChild(node);
    window.setTimeout(function () {
      node.classList.add('is-out');
      window.setTimeout(function () { node.remove(); }, 260);
    }, ms || 2600);
  }

  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var field = document.createElement('textarea');
        field.value = text;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        document.execCommand('copy');
        field.remove();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  return {
    qs: qs,
    qsa: qsa,
    escapeHtml: escapeHtml,
    formatCount: formatCount,
    storage: storage,
    prefersReducedMotion: prefersReducedMotion,
    isMobile: isMobile,
    toast: toast,
    copy: copy
  };
})();
