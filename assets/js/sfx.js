/* ============================================================
   sfx.js — menu blips, synthesised with WebAudio so the site
   ships no audio files.

   Off by default and remembered per visitor. Nothing plays
   before a real interaction, so no autoplay fights.
   ============================================================ */

window.SFX = (function () {
  'use strict';

  var KEY = 'af-portfolio-sound';
  var enabled = window.UTIL.storage.get(KEY) === 'on';
  var context = null;

  function ensureContext() {
    if (context) return context;
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    try { context = new Ctor(); } catch (error) { context = null; }
    return context;
  }

  function tone(frequency, duration, type, gainPeak) {
    if (!enabled) return;
    var audio = ensureContext();
    if (!audio) return;
    if (audio.state === 'suspended') audio.resume();

    var oscillator = audio.createOscillator();
    var gain = audio.createGain();
    var now = audio.currentTime;

    oscillator.type = type || 'square';
    oscillator.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainPeak || 0.05, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gain).connect(audio.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }

  return {
    move:    function () { tone(520, 0.06); },
    select:  function () { tone(760, 0.09); window.setTimeout(function () { tone(980, 0.09); }, 55); },
    back:    function () { tone(330, 0.09); },
    confirm: function () { tone(660, 0.08); window.setTimeout(function () { tone(880, 0.14, 'triangle', 0.06); }, 70); },
    error:   function () { tone(180, 0.16, 'sawtooth', 0.045); },
    secret:  function () {
      [523, 659, 784, 1046].forEach(function (note, index) {
        window.setTimeout(function () { tone(note, 0.14, 'triangle', 0.05); }, index * 95);
      });
    },
    isEnabled: function () { return enabled; },
    toggle: function () {
      enabled = !enabled;
      window.UTIL.storage.set(KEY, enabled ? 'on' : 'off');
      if (enabled) { ensureContext(); tone(760, 0.09); }
      return enabled;
    }
  };
})();
