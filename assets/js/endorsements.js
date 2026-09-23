/* ============================================================
   endorsements.js - NPC dialogue for professional recommendations.
   ============================================================ */

window.ENDORSEMENTS = (function () {
  'use strict';

  var current = 0;
  var assignments = [];
  var characters = window.CHARACTERS || [];
  var portraits = window.NPC_PORTRAITS || {};
  var root = './assets/pixel-npc/';
  var expanded = false;

  function pickPortrait(character, index) {
    var profile = character.profilePic || {};
    if (profile.mode === 'specific' && profile.file) return profile.file;

    var pool = portraits[profile.gender || character.gender] || portraits.M || [];
    if (!pool.length) return '';
    return pool[index % pool.length];
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
    portrait.alt = character.name + ' pixel portrait';
    name.textContent = character.name.toUpperCase();
    role.textContent = character.role;
    quoteText.textContent = '\u201c' + (character.preview || character.endorsement) + '\u201d';
    quote.classList.remove('is-expanded');
    more.setAttribute('aria-expanded', 'false');
    more.textContent = character.preview && character.preview !== character.endorsement ? '[MORE]' : '';
    more.hidden = !character.preview || character.preview === character.endorsement;
    counter.textContent = (current + 1) + ' / ' + characters.length;
  }

  function move(step) {
    current = (current + step + characters.length) % characters.length;
    paint();
  }

  function init() {
    if (!characters.length || !document.getElementById('endorsement-dialogue')) return;

    assignments = characters.map(function (character, index) {
      return pickPortrait(character, index);
    });

    document.getElementById('npc-prev').addEventListener('click', function () { move(-1); });
    document.getElementById('npc-next').addEventListener('click', function () { move(1); });
    document.getElementById('npc-more').addEventListener('click', function () {
      var quote = document.getElementById('npc-endorsement');
      var quoteText = document.getElementById('npc-endorsement-text');
      var more = document.getElementById('npc-more');
      var dialogue = document.getElementById('endorsement-dialogue');
      expanded = !expanded;
      quoteText.textContent = '\u201c' + (expanded ? characters[current].endorsement : (characters[current].preview || characters[current].endorsement)) + '\u201d';
      quote.classList.toggle('is-expanded', expanded);
      dialogue.classList.toggle('is-expanded', expanded);
      more.setAttribute('aria-expanded', String(expanded));
      more.textContent = expanded ? '[LESS]' : '[MORE]';
    });
    document.addEventListener('keydown', function (event) {
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
