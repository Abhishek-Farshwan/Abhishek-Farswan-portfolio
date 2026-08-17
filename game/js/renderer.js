/**
 * game/js/renderer.js
 * Canvas 2D renderer helpers — drawing primitives, camera, particles.
 * Access via Renderer.ctx after Renderer.init().
 */

const Renderer = (() => {
  let canvas = null;
  let ctx    = null;

  // Camera offset (world → screen)
  const camera = { x: 0, y: 0, shake: 0, shakeDuration: 0 };

  // Simple particle pool
  const particles = [];

  /* ── Init ──────────────────────────────────────── */
  const init = (canvasEl) => {
    canvas = canvasEl;
    ctx    = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    return ctx;
  };

  const resize = () => {
    const parent = canvas.parentElement;
    canvas.width  = CONFIG.canvas.width;
    canvas.height = CONFIG.canvas.height;
  };

  /* ── Clear frame ─────────────────────────────── */
  const clear = () => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = CONFIG.canvas.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  /* ── Camera transform ────────────────────────── */
  const applyCamera = () => {
    let sx = 0, sy = 0;
    if (camera.shakeDuration > 0) {
      sx = (Math.random() - .5) * camera.shake * 2;
      sy = (Math.random() - .5) * camera.shake * 2;
      camera.shakeDuration--;
      if (camera.shakeDuration <= 0) camera.shake = 0;
    }
    ctx.setTransform(1, 0, 0, 1, -camera.x + sx, -camera.y + sy);
  };

  const shakeCamera = (intensity = 8, frames = 12) => {
    camera.shake         = intensity;
    camera.shakeDuration = frames;
  };

  /* ── Primitives ──────────────────────────────── */
  const rect = (x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };

  const strokeRect = (x, y, w, h, color, lineWidth = 1) => {
    ctx.strokeStyle = color;
    ctx.lineWidth   = lineWidth;
    ctx.strokeRect(x + .5, y + .5, w, h);
  };

  const circle = (x, y, r, color) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  };

  const line = (x1, y1, x2, y2, color, lineWidth = 1) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.lineWidth   = lineWidth;
    ctx.stroke();
  };

  const text = (str, x, y, { font = '14px var(--mono, monospace)', color = '#fff', align = 'left', baseline = 'top' } = {}) => {
    ctx.font         = font;
    ctx.fillStyle    = color;
    ctx.textAlign    = align;
    ctx.textBaseline = baseline;
    ctx.fillText(str, x, y);
  };

  const image = (img, x, y, w, h) => {
    ctx.drawImage(img, x, y, w ?? img.width, h ?? img.height);
  };

  /* ── Particles ───────────────────────────────── */
  const spawnParticles = (x, y, count = 8, opts = {}) => {
    for (let i = 0; i < count; i++) {
      particles.push({
        x, y,
        vx:   Utils.rand(opts.vxMin ?? -3, opts.vxMax ?? 3),
        vy:   Utils.rand(opts.vyMin ?? -5, opts.vyMax ?? 0),
        life: Utils.randInt(opts.lifeMin ?? 20, opts.lifeMax ?? 40),
        maxLife: 0,
        size: Utils.rand(opts.sizeMin ?? 2, opts.sizeMax ?? 5),
        color: opts.color ?? '#8fe14a',
        gravity: opts.gravity ?? 0.18,
      });
      particles[particles.length - 1].maxLife = particles[particles.length - 1].life;
    }
  };

  const updateParticles = () => {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += p.gravity;
      p.life--;
      if (p.life <= 0) { particles.splice(i, 1); continue; }

      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      circle(p.x, p.y, p.size * alpha, p.color);
      ctx.globalAlpha = 1;
    }
  };

  /* ── Grid / debug overlay ────────────────────── */
  const drawGrid = (tileSize = 32, color = 'rgba(255,255,255,.04)') => {
    ctx.strokeStyle = color;
    ctx.lineWidth   = 1;
    for (let x = 0; x < canvas.width + camera.x; x += tileSize) {
      ctx.beginPath(); ctx.moveTo(x - camera.x, 0); ctx.lineTo(x - camera.x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height + camera.y; y += tileSize) {
      ctx.beginPath(); ctx.moveTo(0, y - camera.y); ctx.lineTo(canvas.width, y - camera.y); ctx.stroke();
    }
  };

  return {
    init, clear, resize,
    camera, applyCamera, shakeCamera,
    rect, strokeRect, circle, line, text, image,
    spawnParticles, updateParticles,
    drawGrid,
    get ctx() { return ctx; },
    get canvas() { return canvas; },
  };
})();
