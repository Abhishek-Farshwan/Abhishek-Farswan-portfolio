/**
 * game/js/audio.js
 * Web Audio API wrapper — SFX via AudioContext, Music via <audio>.
 * Volumes controlled by CONFIG. Works silently if browser blocks audio.
 */

const Audio = (() => {
  let ctx = null;
  let masterGain = null;
  let sfxGain    = null;
  let musicGain  = null;

  const musicEl = new window.Audio();
  musicEl.loop = true;

  let sfxEnabled   = true;
  let musicEnabled = true;

  /* ── Init (call once after first user gesture) ─── */
  const init = () => {
    if (ctx) return;
    try {
      ctx        = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      sfxGain    = ctx.createGain();
      musicGain  = ctx.createGain();

      sfxGain.connect(masterGain);
      musicGain.connect(masterGain);
      masterGain.connect(ctx.destination);

      masterGain.gain.value = CONFIG.audio.masterVolume;
      sfxGain.gain.value    = CONFIG.audio.sfxVolume;
      musicGain.gain.value  = CONFIG.audio.musicVolume;
    } catch (e) {
      console.warn('[Audio] Web Audio not available:', e);
    }
  };

  /* ── Play a synthesised tone (no asset needed) ── */
  const beep = (freq = 440, type = 'square', durationS = 0.08, vol = 0.3) => {
    if (!sfxEnabled || !ctx) return;
    try {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(sfxGain);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationS);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + durationS);
    } catch (_) {}
  };

  /* ── Built-in SFX presets ───────────────────────── */
  const sfx = {
    click:    () => beep(520, 'square', 0.06, 0.25),
    confirm:  () => { beep(440, 'square', 0.07, 0.2); setTimeout(() => beep(660, 'square', 0.1, 0.2), 70); },
    error:    () => beep(180, 'sawtooth', 0.18, 0.3),
    jump:     () => { beep(300, 'sine', 0.05, 0.2); setTimeout(() => beep(500, 'sine', 0.1, 0.15), 50); },
    pickup:   () => { beep(600, 'sine', 0.05); setTimeout(() => beep(800, 'sine', 0.08), 60); },
    hurt:     () => beep(150, 'sawtooth', 0.2, 0.4),
    levelUp:  () => [440, 550, 660, 880].forEach((f, i) => setTimeout(() => beep(f, 'square', 0.15, 0.25), i * 90)),
    gameover: () => [440, 330, 220, 165].forEach((f, i) => setTimeout(() => beep(f, 'sawtooth', 0.25, 0.3), i * 120)),
  };

  /* ── Music (load an audio file) ─────────────────── */
  const playMusic = (src) => {
    if (!musicEnabled) return;
    musicEl.src = src;
    musicEl.volume = CONFIG.audio.musicVolume;
    musicEl.play().catch(() => {});
  };

  const stopMusic = () => {
    musicEl.pause();
    musicEl.currentTime = 0;
  };

  /* ── Volume controls ────────────────────────────── */
  const setSfxEnabled = (on) => {
    sfxEnabled = on;
    if (sfxGain) sfxGain.gain.value = on ? CONFIG.audio.sfxVolume : 0;
  };

  const setMusicEnabled = (on) => {
    musicEnabled = on;
    if (on) playMusic(musicEl.src);
    else    stopMusic();
  };

  return { init, sfx, beep, playMusic, stopMusic, setSfxEnabled, setMusicEnabled };
})();
