/**
 * game/js/scenes.js
 * Scene system — each scene owns update + draw.
 * Add new scenes here without touching game.js.
 */

/* ── Scene interface ────────────────────────────── */
class Scene {
  onEnter() {}   // called once when scene becomes active
  onExit()  {}   // called once when leaving
  update(dt) {}
  draw(ctx)  {}
}

/* ── Demo / Gameplay Scene ──────────────────────── */
class GameplayScene extends Scene {
  constructor() {
    super();
    this.entities = new EntityManager();
    this.player   = null;
    this.score    = 0;
    this.level    = 1;
    this.spawnTimer = 0;
  }

  onEnter() {
    this.entities.clear();
    this.score = 0;
    this.level = 1;
    this.spawnTimer = 0;

    // Create player
    this.player = this.entities.add(new Player(100, 300));

    // Reset camera
    Renderer.camera.x = 0;
    Renderer.camera.y = 0;

    // Show HUD
    document.getElementById('gameHud').classList.remove('hidden');

    // Update HUD initial values
    this._syncHud();

    Audio.sfx.confirm();
  }

  onExit() {
    document.getElementById('gameHud').classList.add('hidden');
    this.entities.clear();
  }

  update(dt) {
    // Pause check
    if (Input.action.pause()) {
      Game.pushScene('pause');
      return;
    }

    this.entities.update(dt);

    // Spawn enemies on a timer
    this.spawnTimer++;
    const spawnInterval = Math.max(60, 180 - this.level * 10);
    if (this.spawnTimer >= spawnInterval) {
      this.spawnTimer = 0;
      this._spawnEnemy();
    }

    // Collision: enemies vs player
    const enemies = this.entities.byTag('enemy');
    enemies.forEach(e => {
      if (this.player.collidesWith(e)) {
        this.player.takeDamage(e.damage);
      }
    });

    // Check player dead
    if (this.player.hp <= 0) {
      Game.pushScene('gameover', { score: this.score });
      return;
    }

    // Camera follows player (horizontal only)
    const targetX = this.player.x - CONFIG.canvas.width / 2 + this.player.w / 2;
    Renderer.camera.x = Utils.lerp(Renderer.camera.x, Math.max(0, targetX), 0.08);

    // Add points for surviving
    this.score++;
    this._syncHud();
  }

  draw(ctx) {
    // Background grid
    Renderer.applyCamera();
    Renderer.drawGrid(CONFIG.world.tileSize);

    // Ground platform
    Renderer.rect(0, CONFIG.canvas.height - 20, 9999, 20, '#1a2010');
    Renderer.strokeRect(0, CONFIG.canvas.height - 20, 9999, 1, '#3a6020');

    // Entities
    this.entities.draw(ctx);

    // Particles
    Renderer.updateParticles();

    // Score on canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  _spawnEnemy() {
    const side = Math.random() > .5;
    const ex = side
      ? Renderer.camera.x + CONFIG.canvas.width + 32
      : Renderer.camera.x - 32;
    this.entities.add(new Enemy(ex, CONFIG.canvas.height - 44, {
      speed:  Utils.rand(.8, 1.5 + this.level * .2),
      hp:     20 + this.level * 10,
      damage: 8 + this.level * 2,
    }));
  }

  _syncHud() {
    const s = document.getElementById('hudScore');
    const l = document.getElementById('hudLevel');
    if (s) s.textContent = Utils.pad(this.score, 6);
    if (l) l.textContent = this.level;
  }
}

/* ── Scene Registry ─────────────────────────────── */
const Scenes = {
  gameplay: () => new GameplayScene(),
  // Add more scenes here:
  // myLevel2: () => new Level2Scene(),
};
