/**
 * game/js/utils.js
 * Pure utility helpers — no DOM, no game state.
 */

const Utils = (() => {

  /** Clamp a value between min and max */
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  /** Linear interpolation */
  const lerp = (a, b, t) => a + (b - a) * t;

  /** Random float between lo and hi */
  const rand = (lo, hi) => lo + Math.random() * (hi - lo);

  /** Random integer between lo (inclusive) and hi (inclusive) */
  const randInt = (lo, hi) => Math.floor(rand(lo, hi + 1));

  /** Pick a random item from an array */
  const pick = arr => arr[randInt(0, arr.length - 1)];

  /** Degrees to radians */
  const deg = d => (d * Math.PI) / 180;

  /** Distance between two points */
  const dist = (ax, ay, bx, by) =>
    Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);

  /** Axis-aligned bounding box collision */
  const aabb = (a, b) =>
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y;

  /** Deep clone a plain object */
  const clone = obj => JSON.parse(JSON.stringify(obj));

  /** Format a number as zero-padded string */
  const pad = (n, len = 5) => String(n).padStart(len, '0');

  /** Format milliseconds → "MM:SS" */
  const msToTime = ms => {
    const s = Math.floor(ms / 1000);
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  };

  /** Save data to localStorage safely */
  const save = (key, data) => {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (_) {}
  };

  /** Load data from localStorage safely */
  const load = (key, fallback = null) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) { return fallback; }
  };

  /** Show the global toast notification */
  const toast = (msg, durationMs = 2200) => {
    const el = document.getElementById('gameToast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), durationMs);
  };

  return { clamp, lerp, rand, randInt, pick, deg, dist, aabb, clone, pad, msToTime, save, load, toast };
})();
