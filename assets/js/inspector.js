/* ============================================================
   inspector.js — the "inspect item" dialogue box.
   One asset at a time, full size, arrow keys to walk the
   inventory, Esc to back out.
   ============================================================ */

window.INSPECTOR = (function () {
  'use strict';

  var UTIL = window.UTIL;
  var modal, stage, frame, titleNode, descNode, metaNode, counterNode, openLink, prevBtn, nextBtn, closeBtn, loadingNode;
  var index = -1;
  var lastFocused = null;

  function render() {
    var model = window.ART.at(index);
    if (!model) return;

    titleNode.textContent = model.name;
    descNode.textContent = model.description || 'Game-ready 3D model. Drag inside the viewer to orbit, scroll to zoom.';
    openLink.href = model.view;
    counterNode.textContent = (index + 1) + ' / ' + window.ART.count();

    var bits = [];
    if (model.views !== null) {
      bits.push('VIEWS ' + UTIL.formatCount(model.views));
      bits.push('LIKES ' + UTIL.formatCount(model.likes));
      bits.push('TRIS ' + UTIL.formatCount(model.tris));
    } else if (model.meta) {
      bits.push(String(model.meta).toUpperCase());
    }
    metaNode.innerHTML = bits.map(function (text) {
      return '<span class="chip">' + UTIL.escapeHtml(text) + '</span>';
    }).join('');

    loadingNode.hidden = false;
    frame.src = model.embed;
    frame.title = model.name + ' \u2014 full size 3D viewer';

    prevBtn.disabled = window.ART.count() < 2;
    nextBtn.disabled = window.ART.count() < 2;
  }

  function open(next) {
    if (!modal) return;
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
    var total = window.ART.count();
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
    modal = document.getElementById('inspector');
    if (!modal) return;

    stage = modal.querySelector('.modal-stage');
    frame = modal.querySelector('iframe');
    titleNode = modal.querySelector('.modal-title');
    descNode = modal.querySelector('.modal-desc');
    metaNode = modal.querySelector('.modal-meta');
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
