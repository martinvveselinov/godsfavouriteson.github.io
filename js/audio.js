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

// ── REAL AUDIO-FILE CLIPS (kill clips + boss hit clips) ───────────
// IMPORTANT: these are decoded into AudioBuffers and played through the SAME
// AudioContext as the synthesized beeps above — deliberately NOT via
// `new Audio()` / <audio> elements.
//
// Why: mobile browsers enforce a SECOND, totally independent autoplay/unlock
// policy for HTMLMediaElement playback, separate from AudioContext. The old
// `clip.cloneNode().play()` approach created a brand-new, never-unlocked
// <audio> element on every single play — and each fresh clone needs its own
// gesture-context unlock before .play() will succeed. That's exactly why
// these clips only played while constantly tapping (each tap happened to
// supply a gesture window for that particular clone) while the AudioContext
// beeps played fine (they ride on the gesture-driven AC.resume() calls).
//
// Routing everything through one AudioContext means there's only one autoplay
// policy to satisfy — the same one already covered by the gesture-driven
// resume calls in game.js — and overlapping plays come for free via
// createBufferSource() (each start() spins up its own one-shot node, no
// cloning needed).
// ── REAL AUDIO-FILE CLIPS (kill clips + boss hit clips) ───────────
// IMPORTANT: these are decoded into AudioBuffers and played through the SAME
// AudioContext as the synthesized beeps above — deliberately NOT via
// `new Audio()` / <audio> elements.
//
// Why: mobile browsers enforce a SECOND, totally independent autoplay/unlock
// policy for HTMLMediaElement playback, separate from AudioContext. The old
// `clip.cloneNode().play()` approach created a brand-new, never-unlocked
// <audio> element on every single play — and each fresh clone needs its own
// gesture-context unlock before .play() will succeed. That's exactly why
// these clips only played while constantly tapping (each tap happened to
// supply a gesture window for that particular clone) while the AudioContext
// beeps played fine (they ride on the gesture-driven AC.resume() calls).
//
// Routing everything through one AudioContext means there's only one autoplay
// policy to satisfy — the same one already covered by the gesture-driven
// resume calls in game.js — and overlapping plays come for free via
// createBufferSource() (each start() spins up its own one-shot node, no
// cloning needed).
const KILL_CLIPS_SRC = {
  kurva: ['sounds/kurva_kill.m4a'],
  delta: ['sounds/delta_kill.m4a'],
};
const HIT_CLIPS_SRC = {
  tosho: ['sounds/tosho_hit.m4a'],
};
const KILL_CLIPS = {};
const HIT_CLIPS  = {};

function loadClip(store, type, src, vol) {
  fetch(src)
    .then(r => r.arrayBuffer())
    .then(ab => getAC().decodeAudioData(ab))
    .then(buffer => {
      if (!store[type]) store[type] = { buffers: [], vol };
      store[type].buffers.push(buffer);
    })
    .catch(() => {});
}
for (const [type, srcs] of Object.entries(KILL_CLIPS_SRC))
  srcs.forEach(src => loadClip(KILL_CLIPS, type, src, 0.7));
for (const [type, srcs] of Object.entries(HIT_CLIPS_SRC))
  srcs.forEach(src => loadClip(HIT_CLIPS, type, src, 0.65));

function playClip(store, type) {
  const clip = store[type];
  if (!clip || clip.buffers.length === 0) return false;
  try {
    const ac     = getAC();
    const src    = ac.createBufferSource();
    const g      = ac.createGain();
    src.buffer   = clip.buffers[Math.floor(Math.random() * clip.buffers.length)];
    g.gain.value = clip.vol;
    src.connect(g);
    g.connect(ac.destination);
    src.start();
  } catch (e) { return false; }
  return true;
}

const playKillClip = type => playClip(KILL_CLIPS, type);
const playHitClip  = type => playClip(HIT_CLIPS,  type);

const playKillClip = type => playClip(KILL_CLIPS, type);
const playHitClip  = type => playClip(HIT_CLIPS,  type);

const sfxShoot = () => beep(780,  0.07, 'square',   0.12);
const sfxHit   = () => beep(280,  0.12, 'sawtooth', 0.22);
const sfxDeath = () => { beep(140, 0.30, 'sawtooth', 0.35); beep(90, 0.55, 'sawtooth', 0.25); };
const sfxWave  = () => [440, 550, 660, 880].forEach((f, i) => setTimeout(() => beep(f, 0.1), i * 80));
const sfxMenu  = () => beep(660,  0.08, 'square',   0.15);
const sfxBoss  = () => { beep(110, 0.50, 'sawtooth', 0.40); beep(165, 0.50, 'sawtooth', 0.30); };
// Power-up pickup — bright ascending arpeggio
const sfxPower  = () => [660, 990, 1320].forEach((f, i) => setTimeout(() => beep(f, 0.10, 'square', 0.18), i * 55));
// Enemy special move — a wind-up charge, then the aimed shot
const sfxCharge = () => beep(240, 0.22, 'triangle', 0.10);
const sfxSniper = () => { beep(520, 0.06, 'square', 0.12); beep(300, 0.14, 'sawtooth', 0.16); };
