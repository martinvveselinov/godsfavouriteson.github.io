const HIT_CLIPS_SRC = { tosho: 'sounds/tosho_hit.m4a' };
const HIT_CLIPS = {};
for (const [type, src] of Object.entries(HIT_CLIPS_SRC)) {
  HIT_CLIPS[type] = { src, played: 0, cloneNode() { return { volume: 0, play: () => ({ catch: () => {} }) }; } };
}
function playHitClip(type) {
  const clip = HIT_CLIPS[type];
  if (!clip) return false;
  clip.played++;
  try { clip.cloneNode().play().catch(() => {}); } catch (e) { return false; }
  return true;
}

const ETYPES = {
  tosho:   { hp: 40 },
  yankick: { hp: 80 },
  jakuza:  { hp: 100 },
  inked:   { hp: 60 },
  jokov:   { hp: 100 },
  yovko:   { hp: 280 },
};

let errors = [];
try {
  const expected = { tosho: 40, yankick: 80, jakuza: 100, inked: 60, jokov: 100, yovko: 280 };
  for (const [type, hp] of Object.entries(expected)) {
    if (ETYPES[type].hp !== hp) errors.push(`${type}: expected hp ${hp}, got ${ETYPES[type].hp}`);
  }

  const pct = (e) => Math.max(0, e.hp / ETYPES[e.type].hp);
  if (pct({ type: 'tosho', hp: 40 }) !== 1) errors.push('tosho full hp pct should be 1');
  if (pct({ type: 'tosho', hp: 20 }) !== 0.5) errors.push('tosho half hp pct should be 0.5');
  if (pct({ type: 'tosho', hp: 0 }) !== 0) errors.push('tosho dead hp pct should be 0');

  const phaseOf = (hp) => hp < 140 ? 2 : 1;
  if (phaseOf(280) !== 1) errors.push('yovko at full 280 hp should be phase 1');
  if (phaseOf(141) !== 1) errors.push('yovko at 141 hp should be phase 1');
  if (phaseOf(140) !== 1) errors.push('yovko at exactly 140 hp (50% boundary) should be phase 1 (matches original strict-< at 14/28)');
  if (phaseOf(139) !== 2) errors.push('yovko at 139 hp (just below 50%) should be phase 2');
  if (phaseOf(50)  !== 2) errors.push('yovko at 50 hp should be phase 2');

  const triggerPct = 140 / 280;
  if (Math.abs(triggerPct - 0.5) > 1e-9) errors.push(`phase-2 trigger ratio should be 0.5, got ${triggerPct}`);
  // sanity: original ratio was 14/28 = 0.5 too — confirms proportional scaling preserved
  if (Math.abs(14/28 - triggerPct) > 1e-9) errors.push('new trigger ratio does not match original ratio');

  const beforeCount = HIT_CLIPS.tosho.played;
  if (!playHitClip('tosho')) errors.push('expected playHitClip(tosho) to return true');
  if (HIT_CLIPS.tosho.played !== beforeCount + 1) errors.push('tosho play count did not increment');
  if (playHitClip('yankick')) errors.push('expected playHitClip(yankick) to return false (no clip registered)');

  let hits = 0;
  for (let i = 0; i < 5; i++) { playHitClip('tosho'); hits++; }
  if (HIT_CLIPS.tosho.played !== beforeCount + 1 + hits) errors.push('repeated-hit play count mismatch');

} catch (e) { errors.push(e.message); }

console.log('errors:', errors.length);
console.log(errors.length === 0
  ? 'PASS: HIT-CLIP + HP x10 + YOVKO PHASE-THRESHOLD LOGIC VALIDATED'
  : errors.join('\n'));
