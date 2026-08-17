/**
 * game/js/input.js
 * Unified keyboard + mouse/touch input state.
 * Poll Input.keys, Input.mouse, or use action helpers.
 */

const Input = (() => {

  /* Key state — true while held */
  const keys = {};

  /* Keys pressed this frame only (cleared each frame) */
  const keysDown = {};
  const keysUp   = {};

  /* Mouse state */
  const mouse = { x: 0, y: 0, left: false, right: false, wheel: 0 };

  /* Touch (first touch only, mapped onto mouse) */
  let _canvas = null;

  /* ── Setup ─────────────────────────────────────── */
  const init = (canvas) => {
    _canvas = canvas;

    window.addEventListener('keydown', e => {
      if (!keys[e.code]) keysDown[e.code] = true;
      keys[e.code] = true;

      // Prevent default for game keys (arrow keys, space)
      if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', e => {
      keys[e.code]   = false;
      keysUp[e.code] = true;
    });

    canvas.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      const scaleX = canvas.width  / r.width;
      const scaleY = canvas.height / r.height;
      mouse.x = (e.clientX - r.left) * scaleX;
      mouse.y = (e.clientY - r.top)  * scaleY;
    });

    canvas.addEventListener('mousedown', e => {
      if (e.button === 0) mouse.left  = true;
      if (e.button === 2) mouse.right = true;
    });

    canvas.addEventListener('mouseup', e => {
      if (e.button === 0) mouse.left  = false;
      if (e.button === 2) mouse.right = false;
    });

    canvas.addEventListener('wheel', e => {
      mouse.wheel = e.deltaY > 0 ? 1 : -1;
    }, { passive: true });

    canvas.addEventListener('touchstart', e => {
      const t = e.touches[0];
      const r = canvas.getBoundingClientRect();
      mouse.x    = (t.clientX - r.left) * (canvas.width  / r.width);
      mouse.y    = (t.clientY - r.top)  * (canvas.height / r.height);
      mouse.left = true;
      e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchend', () => { mouse.left = false; });
  };

  /* ── Frame flush — call at end of each update ─── */
  const flush = () => {
    for (const k in keysDown) delete keysDown[k];
    for (const k in keysUp)   delete keysUp[k];
    mouse.wheel = 0;
  };

  /* ── Convenience action aliases ─────────────────── */
  const action = {
    left:   () => keys['ArrowLeft']  || keys['KeyA'],
    right:  () => keys['ArrowRight'] || keys['KeyD'],
    up:     () => keys['ArrowUp']    || keys['KeyW'],
    down:   () => keys['ArrowDown']  || keys['KeyS'],
    jump:   () => keys['Space']      || keys['ArrowUp'] || keys['KeyW'],
    attack: () => keys['KeyZ']       || keys['KeyJ'],
    dash:   () => keys['ShiftLeft']  || keys['ShiftRight'],
    pause:  () => keysDown['Escape'] || keysDown['KeyP'],

    /* "just pressed" versions */
    jumpDown:   () => keysDown['Space'] || keysDown['ArrowUp'] || keysDown['KeyW'],
    attackDown: () => keysDown['KeyZ']  || keysDown['KeyJ'],
    anyDown:    () => Object.keys(keysDown).length > 0,
  };

  return { keys, keysDown, keysUp, mouse, action, init, flush };
})();
