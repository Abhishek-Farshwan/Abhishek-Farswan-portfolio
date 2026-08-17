/**
 * game/js/game.js
 * Main game controller — boot sequence, screen routing, game loop.
 * Wires everything together. Loaded last.
 */

const Game = (() => {

  // ── State ──────────────────────────────────────
  let running      = false;
  let lastTime     = 0;
  let rafId        = null;
  let activeScene  = null;
  let settings     = {};

  // ── DOM refs ───────────────────────────────────
  const canvas   = document.getElementById('gameCanvas');
  const screens  = {};   // keyed by screen id suffix, e.g. 'Menu' → #screenMenu

  // ── Screen helpers ─────────────────────────────
  const showScreen = (name) => {
    document.querySelectorAll('.game-screen').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(`screen${name}`);
    if (target) target.classList.add('active');
  };

  // ── Scene management ───────────────────────────
  const setScene = (key, data = {}) => {
    if (activeScene) activeScene.onExit();
    activeScene = Scenes[key] ? Scenes[key]() : null;
    if (activeScene) activeScene.onEnter(data);
  };

  const pushScene = (name, data = {}) => {
    switch (name) {
      case 'pause':
        stopLoop();
        showScreen('Pause');
        break;
      case 'gameover':
        stopLoop();
        if (activeScene) activeScene.onExit();
        activeScene = null;
        document.getElementById('finalScore').textContent = data.score ?? 0;
        showScreen('GameOver');
        Audio.sfx.gameover();
        break;
    }
  };

  // ── Game loop ──────────────────────────────────
  const loop = (timestamp) => {
    if (!running) return;
    rafId = requestAnimationFrame(loop);

    const dt = Math.min((timestamp - lastTime) / 16.67, 3); // delta, capped at 3× frame
    lastTime = timestamp;

    Renderer.clear();
    if (activeScene) {
      activeScene.update(dt);
      activeScene.draw(Renderer.ctx);
    }
    Renderer.updateParticles?.();
    Input.flush();
  };

  const startLoop = () => {
    if (running) return;
    running  = true;
    lastTime = performance.now();
    rafId    = requestAnimationFrame(loop);
  };

  const stopLoop = () => {
    running = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  };

  // ── Boot sequence ──────────────────────────────
  const boot = () => {
    const bar     = document.getElementById('bootBar');
    const log     = document.getElementById('bootLog');
    const steps   = CONFIG.boot.steps;
    const stepMs  = CONFIG.boot.durationMs / steps.length;
    let   step    = 0;

    const tick = () => {
      if (step >= steps.length) {
        setTimeout(() => { showScreen('Menu'); }, 300);
        return;
      }
      bar.style.width = `${((step + 1) / steps.length) * 100}%`;
      const line = document.createElement('div');
      line.className = 'boot-line';
      line.textContent = steps[step];
      log.appendChild(line);
      log.scrollTop = log.scrollHeight;
      step++;
      setTimeout(tick, stepMs);
    };

    showScreen('Boot');
    setTimeout(tick, 200);
  };

  // ── Settings ───────────────────────────────────
  const loadSettings = () => {
    settings = Utils.load(CONFIG.storage.settings, {
      sfx:        true,
      music:      true,
      fullscreen: false,
    });
    document.getElementById('toggleSfx').checked        = settings.sfx;
    document.getElementById('toggleMusic').checked      = settings.music;
    document.getElementById('toggleFullscreen').checked = settings.fullscreen;
    Audio.setSfxEnabled(settings.sfx);
    Audio.setMusicEnabled(settings.music);
  };

  const saveSettings = () => {
    settings.sfx        = document.getElementById('toggleSfx').checked;
    settings.music      = document.getElementById('toggleMusic').checked;
    settings.fullscreen = document.getElementById('toggleFullscreen').checked;
    Utils.save(CONFIG.storage.settings, settings);
    Audio.setSfxEnabled(settings.sfx);
    Audio.setMusicEnabled(settings.music);
    if (settings.fullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (!settings.fullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  // ── Button wiring ──────────────────────────────
  const wireButtons = () => {

    // Menu
    document.getElementById('btnNewGame').addEventListener('click', () => {
      Audio.sfx.confirm();
      showScreen('Game');
      setScene('gameplay');
      startLoop();
    });

    document.getElementById('btnSettings').addEventListener('click', () => {
      Audio.sfx.click();
      showScreen('Settings');
    });

    // Pause
    document.getElementById('btnPause').addEventListener('click', () => {
      Audio.sfx.click();
      stopLoop();
      showScreen('Pause');
    });

    document.getElementById('btnResume').addEventListener('click', () => {
      Audio.sfx.click();
      showScreen('Game');
      startLoop();
    });

    document.getElementById('btnPauseSettings').addEventListener('click', () => {
      Audio.sfx.click();
      showScreen('Settings');
    });

    document.getElementById('btnQuitToMenu').addEventListener('click', () => {
      Audio.sfx.click();
      stopLoop();
      if (activeScene) { activeScene.onExit(); activeScene = null; }
      showScreen('Menu');
    });

    // Game Over
    document.getElementById('btnRetry').addEventListener('click', () => {
      Audio.sfx.confirm();
      showScreen('Game');
      setScene('gameplay');
      startLoop();
    });

    document.getElementById('btnGoMenu').addEventListener('click', () => {
      Audio.sfx.click();
      showScreen('Menu');
    });

    // Settings
    document.getElementById('btnSettingsBack').addEventListener('click', () => {
      Audio.sfx.click();
      saveSettings();
      // Go back to wherever we came from (menu if not in game)
      const inGame = document.getElementById('screenGame').classList.contains('active')
                  || document.getElementById('screenPause').classList.contains('active');
      showScreen(inGame ? 'Pause' : 'Menu');
    });

    // Any button hover — play tick
    document.querySelectorAll('.menu-btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => Audio.sfx.click());
    });
  };

  // ── Init ───────────────────────────────────────
  const init = () => {
    // Init subsystems
    Renderer.init(canvas);
    Input.init(canvas);
    Audio.init();
    loadSettings();

    // Version badge
    const v = document.getElementById('gameVersion');
    if (v) v.textContent = `v${CONFIG.version}`;

    // Wire UI
    wireButtons();

    // Boot!
    boot();
  };

  document.addEventListener('DOMContentLoaded', init);

  return { pushScene, startLoop, stopLoop };
})();
