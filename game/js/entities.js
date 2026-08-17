/**
 * game/js/entities.js
 * Base Entity class + common game objects (Player, Enemy, Projectile, Pickup).
 * Extend these when building actual game content.
 */

/* ── Base Entity ────────────────────────────────── */
class Entity {
  constructor(x, y, w, h) {
    this.x   = x; this.y   = y;
    this.w   = w; this.h   = h;
    this.vx  = 0; this.vy  = 0;
    this.alive = true;
    this.tags  = new Set();
  }

  get bounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  collidesWith(other) {
    return Utils.aabb(this.bounds, other.bounds);
  }

  /** Override in subclasses */
  update(dt) {}
  draw(ctx)  {}
}

/* ── Player ─────────────────────────────────────── */
class Player extends Entity {
  constructor(x, y) {
    super(x, y, 24, 32);
    this.speed    = CONFIG.player.speed;
    this.jumpForce= CONFIG.player.jumpForce;
    this.hp       = CONFIG.player.maxHp;
    this.maxHp    = CONFIG.player.maxHp;
    this.onGround = false;
    this.facing   = 1;        // 1 = right, -1 = left
    this.invincibleFrames = 0;
    this.tags.add('player');
  }

  update(dt) {
    // Horizontal movement
    if (Input.action.left())  { this.vx -= this.speed * 0.8; this.facing = -1; }
    if (Input.action.right()) { this.vx += this.speed * 0.8; this.facing =  1; }

    // Friction
    this.vx *= CONFIG.world.friction;

    // Jump
    if (Input.action.jumpDown() && this.onGround) {
      this.vy = this.jumpForce;
      this.onGround = false;
      Audio.sfx.jump();
    }

    // Gravity
    this.vy += CONFIG.world.gravity;

    // Move
    this.x += this.vx;
    this.y += this.vy;

    // Simple floor clamp (real collision handled by scene)
    const floor = CONFIG.canvas.height - this.h - 20;
    if (this.y >= floor) {
      this.y = floor;
      this.vy = 0;
      this.onGround = true;
    }

    // Invincibility frames countdown
    if (this.invincibleFrames > 0) this.invincibleFrames--;

    // Sync HUD
    const hudHp = document.getElementById('hudHealth');
    if (hudHp) hudHp.textContent = this.hp;
  }

  takeDamage(amount) {
    if (this.invincibleFrames > 0) return;
    this.hp = Math.max(0, this.hp - amount);
    this.invincibleFrames = 60;
    Audio.sfx.hurt();
    Renderer.shakeCamera(5, 8);
    const hudHp = document.getElementById('hudHealth');
    if (hudHp) { hudHp.classList.add('damage'); setTimeout(() => hudHp.classList.remove('damage'), 400); }
  }

  draw(ctx) {
    // Flicker during invincibility
    if (this.invincibleFrames > 0 && Math.floor(this.invincibleFrames / 4) % 2 === 0) return;

    ctx.fillStyle = '#8fe14a';
    ctx.fillRect(this.x, this.y, this.w, this.h);

    // Eyes
    const eyeX = this.facing === 1 ? this.x + this.w - 8 : this.x + 4;
    ctx.fillStyle = '#0a0b0e';
    ctx.fillRect(eyeX, this.y + 8, 5, 4);
  }
}

/* ── Generic Enemy ──────────────────────────────── */
class Enemy extends Entity {
  constructor(x, y, opts = {}) {
    super(x, y, opts.w ?? 24, opts.h ?? 24);
    this.hp      = opts.hp     ?? 30;
    this.speed   = opts.speed  ?? 1.2;
    this.damage  = opts.damage ?? 10;
    this.color   = opts.color  ?? '#e05050';
    this.dir     = 1;
    this.tags.add('enemy');
  }

  update(dt) {
    this.x  += this.speed * this.dir;
    this.vy += CONFIG.world.gravity;
    this.y  += this.vy;

    const floor = CONFIG.canvas.height - this.h - 20;
    if (this.y >= floor) { this.y = floor; this.vy = 0; }

    // Reverse at screen edges
    if (this.x <= 0 || this.x + this.w >= CONFIG.canvas.width) this.dir *= -1;
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.alive = false;
      Renderer.spawnParticles(this.x + this.w / 2, this.y + this.h / 2, 10, { color: this.color, vyMin: -4 });
      Audio.sfx.pickup();
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    // HP bar
    const barW = this.w;
    ctx.fillStyle = '#3a1a1a';
    ctx.fillRect(this.x, this.y - 8, barW, 4);
    ctx.fillStyle = '#e05050';
    ctx.fillRect(this.x, this.y - 8, barW * (this.hp / 30), 4);
  }
}

/* ── Projectile ─────────────────────────────────── */
class Projectile extends Entity {
  constructor(x, y, vx, vy, opts = {}) {
    super(x, y, opts.w ?? 8, opts.h ?? 4);
    this.vx      = vx;
    this.vy      = vy;
    this.damage  = opts.damage ?? 10;
    this.color   = opts.color  ?? '#8fe14a';
    this.lifespan= opts.lifespan ?? 120; // frames
    this.tags.add('projectile');
  }

  update(dt) {
    this.x += this.vx;
    this.y += this.vy;
    this.lifespan--;
    if (this.lifespan <= 0 || this.x < -20 || this.x > CONFIG.canvas.width + 20) {
      this.alive = false;
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.shadowColor  = this.color;
    ctx.shadowBlur   = 6;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.shadowBlur = 0;
  }
}

/* ── Pickup / Collectible ───────────────────────── */
class Pickup extends Entity {
  constructor(x, y, type = 'hp') {
    super(x, y, 16, 16);
    this.type    = type;   // 'hp' | 'score' | 'life'
    this.floatT  = Math.random() * Math.PI * 2;
    this.baseY   = y;
    this.tags.add('pickup');
  }

  update(dt) {
    this.floatT += 0.05;
    this.y = this.baseY + Math.sin(this.floatT) * 4;
  }

  draw(ctx) {
    const colors = { hp: '#e05050', score: '#f0c040', life: '#8fe14a' };
    const labels = { hp: '+HP', score: '★', life: '♥' };
    ctx.fillStyle = colors[this.type] ?? '#fff';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    Renderer.text(labels[this.type] ?? '?', this.x + 8, this.y + 3, {
      font: '700 9px monospace', color: '#0a0b0e', align: 'center',
    });
  }
}

/* ── EntityManager ──────────────────────────────── */
class EntityManager {
  constructor() { this.list = []; }

  add(entity)   { this.list.push(entity); return entity; }

  update(dt) {
    this.list.forEach(e => e.alive && e.update(dt));
    this.list = this.list.filter(e => e.alive);
  }

  draw(ctx) {
    this.list.forEach(e => e.alive && e.draw(ctx));
  }

  byTag(tag)  { return this.list.filter(e => e.tags.has(tag)); }
  clear()     { this.list = []; }
}
