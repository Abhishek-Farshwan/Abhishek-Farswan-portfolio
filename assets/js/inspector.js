/* ============================================================
   inspector.js — the "inspect item" dialogue box.
   One asset at a time, full size, arrow keys to walk the
   active list (4 featured models on Home, or visible grid on Art),
   Esc to back out.
   ============================================================ */

window.INSPECTOR = (function () {
  'use strict';

  var UTIL = window.UTIL;
  var modal, stage, frame, titleNode, metaNode, descNode, counterNode, openLink, prevBtn, nextBtn, closeBtn, loadingNode;
  var index = -1;
  var customPool = null;
  var lastFocused = null;
  var initialized = false;

  function itemAt(i) {
    if (customPool && customPool.length) return customPool[i];
    return window.ART.at(i);
  }

  function itemCount() {
    if (customPool && customPool.length) return customPool.length;
    return window.ART.count();
  }

  function render() {
    var model = itemAt(index);
    if (!model) return;

    var total = itemCount();
    titleNode.textContent = model.name;
    openLink.href = model.view;
    counterNode.textContent = (index + 1) + ' / ' + total;

    var bits = [];
    if (model.views !== null && model.views !== undefined) {
      bits.push('VIEWS ' + UTIL.formatCount(model.views));
      bits.push('LIKES ' + UTIL.formatCount(model.likes));
      bits.push('TRIS ' + UTIL.formatCount(model.tris));
    } else if (model.meta) {
      bits.push(String(model.meta).toUpperCase());
    }
    metaNode.innerHTML = bits.map(function (text) {
      return '<span class="chip">' + UTIL.escapeHtml(text) + '</span>';
    }).join('');

    if (descNode) {
      descNode.textContent = model.description || '';
      descNode.hidden = !model.description;
    }

    if (window.MANUAL) window.MANUAL.unlock('inspect');
    loadingNode.hidden = false;
    frame.src = model.embed;
    frame.title = model.name + ' \u2014 full size 3D viewer';

    prevBtn.disabled = total < 2;
    nextBtn.disabled = total < 2;
  }

  function open(next, pool) {
    if (!initialized) init();
    if (!modal) return;
    customPool = Array.isArray(pool) && pool.length ? pool.slice(0, 4) : null;
    index = next;
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    render();
    closeBtn.focus();
  }

  function close() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    frame.src = 'about:blank';
    document.body.classList.remove('modal-open');
    window.SFX.back();
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function step(delta) {
    var total = itemCount();
    if (total < 2) return;
    index = (index + delta + total) % total;
    window.SFX.move();
    render();
  }

  function trapFocus(event) {
    var focusables = UTIL.qsa('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])', modal);
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function init() {
    if (initialized) return;
    modal = document.getElementById('inspector');
    if (!modal) return;
    initialized = true;

    stage = modal.querySelector('.modal-stage');
    frame = modal.querySelector('iframe');
    titleNode = modal.querySelector('.modal-title');
    metaNode = modal.querySelector('.modal-meta');
    descNode = document.getElementById('inspector-desc');
    counterNode = modal.querySelector('.modal-counter');
    openLink = modal.querySelector('[data-open-source]');
    prevBtn = modal.querySelector('[data-step="-1"]');
    nextBtn = modal.querySelector('[data-step="1"]');
    closeBtn = modal.querySelector('.modal-close');
    loadingNode = modal.querySelector('.modal-loading');

    frame.addEventListener('load', function () { loadingNode.hidden = true; });

    closeBtn.addEventListener('click', close);
    modal.querySelector('.modal-backdrop').addEventListener('click', close);
    prevBtn.addEventListener('click', function () { step(-1); });
    nextBtn.addEventListener('click', function () { step(1); });

    document.addEventListener('keydown', function (event) {
      if (modal.hidden) return;
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
      if (event.key === 'Tab') trapFocus(event);
    });
  }

  return { init: init, open: open, close: close };
})();
