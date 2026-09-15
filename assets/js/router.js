/* ============================================================
   router.js — moves the cursor and swaps the detail panel.
   Also owns the keyboard, because this is a menu first and a
   web page second.
   ============================================================ */

window.ROUTER = (function () {
  'use strict';

  var UTIL = window.UTIL;
  var tabs = [];
  var tabbarButtons = [];
  var panels = [];
  var crumb = null;
  var detail = null;
  var current = null;
  var listeners = [];
  var mode = 'tabs'; // 'tabs' = arrow keys browse the roster; 'detail' = arrow keys scroll the open panel

  function isTypingTarget(node) {
    if (!node) return false;
    var tag = (node.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || node.isContentEditable;
  }

  function onChange(callback) { listeners.push(callback); }

  function activate(name, options) {
    options = options || {};
    if (!panels.some(function (panel) { return panel.id === 'panel-' + name; })) name = 'home';
    if (name === current && !options.force) return;

    tabs.forEach(function (tab) {
      var active = tab.getAttribute('data-panel') === name;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    tabbarButtons.forEach(function (button) {
      button.setAttribute('aria-selected', String(button.getAttribute('data-panel') === name));
    });

    panels.forEach(function (panel) {
      var active = panel.id === 'panel-' + name;
      panel.classList.toggle('active', active);
      panel.hidden = !active;
    });

    if (crumb) crumb.textContent = 'PROFILE / ' + name.toUpperCase();

    if (options.updateHash !== false) {
      try { history.replaceState(null, '', '#' + name); }
      catch (error) { location.hash = name; }
    }

    var behavior = UTIL.prefersReducedMotion() ? 'auto' : 'smooth';
    if (detail && typeof detail.scrollTo === 'function') {
      detail.scrollTo({ top: 0, behavior: behavior });
    }
    if (UTIL.isMobile() && typeof window.scrollTo === 'function') {
      try { window.scrollTo({ top: 0, behavior: behavior }); } catch (error) { /* older engines */ }
    }

    current = name;
    listeners.forEach(function (callback) { callback(name); });
  }

  function move(step) {
    if (!tabs.length) return;
    var index = tabs.findIndex(function (tab) { return tab.getAttribute('data-panel') === current; });
    if (index < 0) index = 0;
    var next = (index + step + tabs.length) % tabs.length;
    // Up and Down move the cursor while the horizontal keys keep their
    // classic menu meanings: Right selects and Left backs out.
    tabs[next].focus();
    window.SFX.move();
    activate(tabs[next].getAttribute('data-panel'));
  }

  function enterDetail() {
    if (!detail || mode === 'detail') return;
    mode = 'detail';
    detail.setAttribute('tabindex', '-1');
    detail.classList.add('detail-focused');
    detail.focus({ preventScroll: true });
    window.SFX.select();
  }

  function exitDetail() {
    if (mode !== 'detail') return;
    mode = 'tabs';
    detail.classList.remove('detail-focused');
    var activeTab = tabs.find(function (tab) { return tab.getAttribute('data-panel') === current; });
    if (activeTab) activeTab.focus();
    window.SFX.back();
  }

  function bindKeys(page) {
    document.addEventListener('keydown', function (event) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      if (document.body.classList.contains('modal-open')) return;

      var key = event.key;

      if (key === 'm' || key === 'M') {
        var toggle = document.getElementById('sound-toggle');
        if (toggle) { event.preventDefault(); toggle.click(); }
        return;
      }

      if (page !== 'home') {
        if (key === 'p' || key === 'P') { event.preventDefault(); window.print(); }
        if (key === 'Backspace' || key === 'ArrowLeft') {
          event.preventDefault();
          window.SFX.back();
          location.href = window.CHROME.root() + 'index.html';
        }
        return;
      }

      // Reading mode: the panel already has keyboard focus and scrolls
      // itself natively (Up/Down/Space/PageUp/PageDown/Home/End all just
      // work on a focused scrollable element). We only step in to handle
      // the "pop back out to the roster" key.
      if (mode === 'detail') {
        if (key === 'Backspace' || key === 'ArrowLeft' || key === 'Escape') {
          event.preventDefault();
          exitDetail();
        }
        return;
      }

      if (key === 'ArrowDown') { event.preventDefault(); move(1); return; }
      if (key === 'ArrowUp')   { event.preventDefault(); move(-1); return; }

      if (key === 'Enter' || key === ' ' || key === 'ArrowRight') {
        event.preventDefault();
        enterDetail();
        return;
      }

      if (key === 'Backspace' || key === 'ArrowLeft') {
        event.preventDefault();
        window.SFX.back();
        var homeTab = tabs[0];
        if (homeTab) homeTab.focus();
        activate('home');
        return;
      }

      if (key === 'Home') { event.preventDefault(); window.SFX.move(); activate('home'); return; }
      if (key === 'End')  { event.preventDefault(); window.SFX.move(); activate('contact'); return; }

      if (/^[1-9]$/.test(key)) {
        var target = tabs[Number(key) - 1];
        if (target) {
          event.preventDefault();
          window.SFX.select();
          activate(target.getAttribute('data-panel'));
        }
        return;
      }

      if (key === 'r' || key === 'R') {
        event.preventDefault();
        window.SFX.select();
        location.href = 'resume.html';
      }
    });
  }

  function init(page) {
    tabs = UTIL.qsa('.menu-btn[data-panel]');
    tabbarButtons = UTIL.qsa('.tabbar-btn[data-panel]');
    panels = UTIL.qsa('.panel');
    crumb = document.getElementById('crumb');
    detail = document.getElementById('detail');

    bindKeys(page);
    if (page !== 'home') return;

    tabs.concat(tabbarButtons).forEach(function (control) {
      control.addEventListener('click', function () {
        window.SFX.select();
        activate(control.getAttribute('data-panel'));
      });
      control.addEventListener('mouseenter', function () { window.SFX.move(); });
    });

    UTIL.qsa('[data-goto]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        window.SFX.select();
        activate(link.getAttribute('data-goto'));
      });
    });

    window.addEventListener('hashchange', function () {
      activate((location.hash || '').replace('#', '') || 'home', { updateHash: false });
    });
  }

  function start() {
    if (!panels.length) return;
    var initial = (location.hash || '').replace('#', '');
    activate(initial || 'home', { updateHash: false, force: true });
  }

  return {
    init: init,
    start: start,
    activate: activate,
    onChange: onChange,
    current: function () { return current; }
  };
})();
