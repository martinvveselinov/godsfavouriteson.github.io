// =================================================================
//  AUDIO — Web Audio API beep engine + named sound effects
// =================================================================

let AC;
function getAC() {
  if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
  return AC;
}

function beep(freq, dur, type = 'square', vol = 0.18) {
  try {
    const ac = getAC();
    const o = ac.createOscillator(), g = ac.createGain();
    o.connect(g); g.connect(ac.destination);
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    o.start(); o.stop(ac.currentTime + dur);
  } catch (e) {}
}

// ── ENEMY KILL CLIPS — real audio files, keyed by enemy type ──────
// Add more entries here as new clips are supplied (e.g. delta: 'sounds/delta_kill.m4a').
const KILL_CLIPS_SRC = {
  kurva: 'sounds/kurva_kill.m4a',
  delta: 'sounds/delta_kill.m4a',
};
const KILL_CLIPS = {};
for (const [type, src] of Object.entries(KILL_CLIPS_SRC)) {
  const a = new Audio(src);
  a.preload = 'auto';
  a.volume = 0.7;
  KILL_CLIPS[type] = a;
}

// Plays the custom kill clip for `type` if one exists; returns true if played.
function playKillClip(type) {
  const clip = KILL_CLIPS[type];
  if (!clip) return false;
  try {
    const c = clip.cloneNode(); // allow overlapping plays
    c.volume = clip.volume;
    c.play().catch(() => {});
  } catch (e) { return false; }
  return true;
}

// ── BOSS HIT CLIPS — real audio files, played on EVERY bullet hit (not just kills) ──
// Add more entries here as new clips are supplied (e.g. yovko: 'sounds/yovko_hit.m4a').
const HIT_CLIPS_SRC = {
  tosho: 'sounds/tosho_hit.m4a',
};
const HIT_CLIPS = {};
for (const [type, src] of Object.entries(HIT_CLIPS_SRC)) {
  const a = new Audio(src);
  a.preload = 'auto';
  a.volume = 0.65;
  HIT_CLIPS[type] = a;
}

// Plays the custom hit clip for `type` if one exists; returns true if played.
function playHitClip(type) {
  const clip = HIT_CLIPS[type];
  if (!clip) return false;
  try {
    const c = clip.cloneNode(); // allow overlapping plays
    c.volume = clip.volume;
    c.play().catch(() => {});
  } catch (e) { return false; }
  return true;
}

const sfxShoot = () => beep(780,  0.07, 'square',   0.12);
const sfxHit   = () => beep(280,  0.12, 'sawtooth', 0.22);
const sfxDeath = () => { beep(140, 0.30, 'sawtooth', 0.35); beep(90, 0.55, 'sawtooth', 0.25); };
const sfxWave  = () => [440, 550, 660, 880].forEach((f, i) => setTimeout(() => beep(f, 0.1), i * 80));
const sfxMenu  = () => beep(660,  0.08, 'square',   0.15);
const sfxBoss  = () => { beep(110, 0.50, 'sawtooth', 0.40); beep(165, 0.50, 'sawtooth', 0.30); };
