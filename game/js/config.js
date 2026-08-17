/**
 * game/js/config.js
 * Central configuration — tweak numbers here, not in game logic.
 */
const CONFIG = Object.freeze({
  version: '0.1.0',

  // Canvas / render
  canvas: {
    width:  960,
    height: 540,
    bgColor: '#0a0b0e',
  },

  // Boot sequence
  boot: {
    durationMs: 2000,   // how long the loading screen shows
    steps: [
      '> initializing engine…',
      '> loading assets…',
      '> compiling shaders…',
      '> spawning entities…',
      '> ready.',
    ],
  },

  // Physics / world (placeholder defaults)
  world: {
    gravity:   0.4,
    friction:  0.85,
    tileSize:  32,
  },

  // Player defaults
  player: {
    speed:      3.5,
    jumpForce: -10,
    maxHp:     100,
    lives:       3,
  },

  // Audio
  audio: {
    masterVolume: 0.7,
    sfxVolume:    0.8,
    musicVolume:  0.5,
  },

  // Local-storage keys
  storage: {
    save:     'gfarswan_save',
    settings: 'gfarswan_settings',
    scores:   'gfarswan_scores',
  },
});
