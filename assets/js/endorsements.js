/* ============================================================
   endorsements.js - Collaborator recommendation showcase.
   Shows full text immediately if it fits inside the fixed speech
   window; only shows [MORE] when the text exceeds the window.
   ============================================================ */

window.ENDORSEMENTS = (function () {
  'use strict';

  var current = 0;
  var assignments = [];
  var characters = window.CHARACTERS || [];
  var portraits = window.NPC_PORTRAITS || {};
  var root = './assets/pixel-npc/';
  var expanded = false;

  var FIT_LIMIT = 270;
  var CLIP_LIMIT = 235;

  function pickPortrait(character, index) {
    var profile = character.profilePic || {};
    if (profile.mode === 'specific' && profile.file) return profile.file;

    var pool = portraits[profile.gender || character.gender] || portraits.M || [];
    if (!pool.length) return '';
    return pool[index % pool.length];
  }

  function needsMoreToggle(character) {
    var full = (character.endorsement || '').trim();
    return full.length > FIT_LIMIT;
  }

  function fittedExcerpt(character) {
    var full = (character.endorsement || '').trim();
    if (full.length <= FIT_LIMIT) return full;
    var cut = full.slice(0, CLIP_LIMIT);
    var lastSpace = cut.lastIndexOf(' ');
    if (lastSpace > CLIP_LIMIT * 0.65) cut = cut.slice(0, lastSpace);
    return cut.replace(/[.,;:\u2014\-\s]+$/, '') + '\u2026';
  }

  function paint() {
    if (!characters.length) return;
    var character = characters[current];
    var portrait = document.getElementById('npc-portrait');
    var name = document.getElementById('npc-name');
    var role = document.getElementById('npc-role');
    var quote = document.getElementById('npc-endorsement');
    var quoteText = document.getElementById('npc-endorsement-text');
    var counter = document.getElementById('npc-counter');
    var more = document.getElementById('npc-more');
    var dialogue = document.getElementById('endorsement-dialogue');
    if (!portrait || !name || !role || !quote || !quoteText || !counter || !more || !dialogue) return;

    expanded = false;
    dialogue.classList.remove('is-expanded');
    portrait.src = root + assignments[current];
    portrait.alt = character.name + ' portrait';
    name.textContent = character.name.toUpperCase();
    role.textContent = character.role;

    var requiresMore = needsMoreToggle(character);
    var displayCopy = requiresMore ? fittedExcerpt(character) : character.endorsement;
    quoteText.textContent = '\u201c' + displayCopy + '\u201d';
    quote.classList.remove('is-expanded');
    more.setAttribute('aria-expanded', 'false');
    if (requiresMore) {
      more.hidden = false;
      more.style.display = '';
      more.classList.remove('is-hidden');
      more.textContent = '[MORE]';
    } else {
      more.hidden = true;
      more.style.display = 'none';
      more.classList.add('is-hidden');
      more.textContent = '';
    }
    counter.textContent = (current + 1) + ' / ' + characters.length;

    var pips = document.querySelectorAll('.npc-pip');
    Array.prototype.forEach.call(pips, function (pip, idx) {
      pip.setAttribute('aria-selected', String(idx === current));
    });
  }

  function move(step) {
    current = (current + step + characters.length) % characters.length;
    window.SFX.move();
    if (window.MANUAL) window.MANUAL.unlock('npc');
    paint();
  }

  function init() {
    if (!characters.length || !document.getElementById('endorsement-dialogue')) return;

    assignments = characters.map(function (character, index) {
      return pickPortrait(character, index);
    });

    var pipsNode = document.getElementById('npc-pips');
    if (pipsNode) {
      pipsNode.innerHTML = characters.map(function (c, idx) {
        return '<button class="npc-pip" type="button" data-npc-pip="' + idx + '" ' +
          'aria-label="Recommendation ' + (idx + 1) + ': ' + c.name + '" ' +
          'aria-selected="' + (idx === 0) + '"></button>';
      }).join('');
      Array.prototype.forEach.call(pipsNode.querySelectorAll('.npc-pip'), function (pip) {
        pip.addEventListener('click', function () {
          current = Number(pip.getAttribute('data-npc-pip')) || 0;
          window.SFX.move();
          if (window.MANUAL) window.MANUAL.unlock('npc');
          paint();
        });
      });
    }

    document.getElementById('npc-prev').addEventListener('click', function () { move(-1); });
    document.getElementById('npc-next').addEventListener('click', function () { move(1); });
    document.getElementById('npc-more').addEventListener('click', function () {
      var character = characters[current];
      if (!needsMoreToggle(character)) return;
      var quote = document.getElementById('npc-endorsement');
      var quoteText = document.getElementById('npc-endorsement-text');
      var more = document.getElementById('npc-more');
      var dialogue = document.getElementById('endorsement-dialogue');
      expanded = !expanded;
      if (expanded) window.SFX.confirm();
      else window.SFX.back();
      if (window.MANUAL) window.MANUAL.unlock('npc');
      quoteText.textContent = '\u201c' + (expanded ? character.endorsement : fittedExcerpt(character)) + '\u201d';
      quote.classList.toggle('is-expanded', expanded);
      dialogue.classList.toggle('is-expanded', expanded);
      more.setAttribute('aria-expanded', String(expanded));
      more.textContent = expanded ? '[LESS]' : '[MORE]';
    });
    document.addEventListener('keydown', function (event) {
      var dialogue = document.getElementById('endorsement-dialogue');
      if (!dialogue || !dialogue.contains(event.target)) return;
      var tag = (event.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || event.metaKey || event.ctrlKey || event.altKey) return;
      if (window.ROUTER && window.ROUTER.current() !== 'about') return;
      if (event.key === 'ArrowLeft') { event.preventDefault(); event.stopPropagation(); move(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); event.stopPropagation(); move(1); }
    }, true);

    paint();
  }

  return { init: init, move: move };
})();
