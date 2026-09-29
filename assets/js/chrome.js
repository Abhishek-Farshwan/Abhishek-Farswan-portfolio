/* ============================================================
   chrome.js — the persistent shell, written once and rendered
   into every page. Nothing here is copy-pasted between pages.

   Pages opt in with:
     <body data-page="home">     panel-switching menu
     <body data-page="resume">   menu links back to index.html
     <body data-page="none">     standalone (404, secret level)

   data-root tells the chrome how far it is from the site root
   (e.g. "../../" inside /game/secret_level/).
   ============================================================ */

window.CHROME = (function () {
  'use strict';

  var SITE = window.SITE;
  var UTIL = window.UTIL;

  function root() {
    return document.body.getAttribute('data-root') || '';
  }

  function menuMarkup(page) {
    var isHome = page === 'home';

    var entries = SITE.nav.map(function (item, index) {
      var icon = '<img class="menu-icon" src="' + UTIL.escapeHtml(root() + 'assets/icon/selected/' + item.icon) + '" alt="" aria-hidden="true" />';
      var label = '<span class="menu-label">' + item.label.toUpperCase() + '</span>';
      if (isHome) {
        return '<button class="menu-btn" role="tab" id="tab-' + item.id + '" ' +
          'aria-controls="panel-' + item.id + '" aria-selected="' + (index === 0) + '" ' +
          'tabindex="' + (index === 0 ? '0' : '-1') + '" data-panel="' + item.id + '">' +
          icon + label + '</button>';
      }
      return '<a class="menu-btn" href="' + root() + 'index.html#' + item.id + '">' +
        icon + label + '</a>';
    }).join('');

    var resumeCurrent = page === 'resume' ? ' aria-current="page"' : '';
    var resumeEntry = '<div class="menu-divider" role="presentation"></div>' +
      '<a class="menu-btn is-external" href="' + root() + 'resume.html"' + resumeCurrent + '>' +
      '<img class="menu-icon" src="' + UTIL.escapeHtml(root() + 'assets/icon/selected/document.svg') + '" alt="" aria-hidden="true" />' +
      '<span class="menu-label">RESUME</span></a>';

    return '<nav class="menu"' + (isHome ? ' role="tablist" aria-label="Portfolio sections"' : ' aria-label="Site sections"') + '>' +
      entries + resumeEntry + '</nav>';
  }

  function rosterMarkup(page) {
    return '' +
      '<aside class="roster scroller" aria-label="Profile and menu">' +
        '<div class="roster-header">' +
          '<span>ROSTER // 001</span>' +
          '<span class="roster-status">OPEN</span>' +
        '</div>' +

        '<section class="profile-card" aria-label="Artist profile">' +
          '<div class="profile-name">' + UTIL.escapeHtml(SITE.identity.shortName.toUpperCase()) + '</div>' +
          '<div class="profile-role">' + UTIL.escapeHtml(SITE.identity.role) + '</div>' +
          '<p class="profile-note">' + UTIL.escapeHtml(SITE.identity.note) + '</p>' +
          '<button class="sound-toggle sound-toggle--mobile" id="sound-toggle-mobile" type="button" aria-label="Toggle UI sounds" aria-pressed="false">' +
            '<img class="sound-glyph" src="' + root() + 'assets/icon/selected/mute.svg" alt="" aria-hidden="true" /><span class="sound-label">SOUND OFF</span>' +
          '</button>' +
        '</section>' +

        menuMarkup(page) +

        '<div class="roster-footer">' +
          '<button class="sound-toggle sound-toggle--desktop" id="sound-toggle" type="button" aria-label="Toggle UI sounds" aria-pressed="false">' +
            '<img class="sound-glyph" src="' + root() + 'assets/icon/selected/mute.svg" alt="" aria-hidden="true" /><span class="sound-label">SOUND OFF</span>' +
          '</button>' +
          '<p class="roster-hint">Up/down browse.<br>Right reads, Left exits.</p>' +
        '</div>' +
      '</aside>';
  }

  function tabbarMarkup(page) {
    var isHome = page === 'home';
    var buttons = SITE.nav.map(function (item, index) {
      var glyph = '<img class="tab-glyph" src="' + UTIL.escapeHtml(root() + 'assets/icon/selected/' + item.icon) + '" alt="" aria-hidden="true" />';
      var label = '<span>' + item.label.toUpperCase() + '</span>';
      var aria = ' aria-label="' + UTIL.escapeHtml(item.label) + '"';
      if (isHome) {
        return '<button class="tabbar-btn" type="button" data-panel="' + item.id + '" ' +
          'aria-selected="' + (index === 0) + '"' + aria + '>' + glyph + label + '</button>';
      }
      return '<a class="tabbar-btn" href="' + root() + 'index.html#' + item.id + '"' + aria + '>' + glyph + label + '</a>';
    }).join('');

    return '<nav class="tabbar" id="tabbar" aria-label="Sections">' + buttons + '</nav>';
  }
  function promptBarMarkup(page) {
    var prompts = page === 'home'
      ? [
          ['\u2191\u2193', 'MOVE'],
          ['\u2192', 'SELECT'],
          ['\u2190', 'BACK'],
          ['1-5', 'JUMP'],
          ['M', 'SOUND']
        ]
      : [
          ['\u2190', 'BACK'],
          ['P', 'PRINT'],
          ['M', 'SOUND']
        ];

    var items = prompts.map(function (pair) {
      return '<span class="prompt"><span class="key-cap">' + pair[0] + '</span>' + pair[1] + '</span>';
    }).join('');

    return '<div class="prompt-bar" aria-hidden="true">' + items + '</div>';
  }

  function footerLine() {
    return UTIL.escapeHtml(SITE.identity.tagline.toUpperCase());
  }

  function wireSoundToggle() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.sound-toggle'));
    if (!buttons.length) return;

    function paint() {
      var on = window.SFX.isEnabled();
      buttons.forEach(function (button) {
        button.setAttribute('aria-pressed', String(on));
        var glyph = button.querySelector('.sound-glyph');
        if (glyph) glyph.src = root() + 'assets/icon/selected/' + (on ? 'volume.svg' : 'mute.svg');
        var label = button.querySelector('.sound-label');
        if (label) label.textContent = on ? 'SOUND ON' : 'SOUND OFF';
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var on = window.SFX.toggle();
        paint();
        UTIL.toast(on ? 'UI sounds on.' : 'UI sounds off.', 1800);
      });
    });

    paint();
  }

  function mount() {
    var page = document.body.getAttribute('data-page') || 'none';
    if (page === 'none') { wireSoundToggle(); return page; }

    var rosterSlot = document.getElementById('roster-slot');
    if (rosterSlot) rosterSlot.outerHTML = rosterMarkup(page);

    var footerSlot = document.getElementById('footer-slot');
    if (footerSlot) {
      footerSlot.className = 'footer-line';
      footerSlot.textContent = footerLine();
    }

    document.body.insertAdjacentHTML('beforeend', tabbarMarkup(page));
    document.body.insertAdjacentHTML('beforeend', promptBarMarkup(page));

    wireSoundToggle();
    return page;
  }

  return { mount: mount, root: root };
})();
