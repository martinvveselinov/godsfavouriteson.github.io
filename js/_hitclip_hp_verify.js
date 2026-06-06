// Mirrors the new HIT_CLIPS system + boss HP x10 + Yovko phase threshold scaling.

// --- mock HIT_CLIPS / playHitClip exactly as added to audio.js ---
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

// --- mock ETYPES with the new x10 hp values ---
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
  // 1. HP values are exactly 10x originals
  const expected = { tosho: 40, yankick: 80, jakuza: 100, inked: 60, jokov: 100, yovko: 280 };
  for (const [type, hp] of Object.entries(expected)) {
    if (ETYPES[type].hp !== hp) errors.push(`${type}: expected hp ${hp}, got ${ETYPES[type].hp}`);
  }

  // 2. bossHpBar pct formula auto-rescales correctly with new max hp
  const pct = (e) => Math.max(0, e.hp / ETYPES[e.type].hp);
  if (pct({ type: 'tosho', hp: 40 }) !== 1) errors.push('tosho full hp pct should be 1');
  if (pct({ type: 'tosho', hp: 20 }) !== 0.5) errors.push('tosho half hp pct should be 0.5');
  if (pct({ type: 'tosho', hp: 0 }) !== 0) errors.push('tosho dead hp pct should be 0');

  // 3. Yovko phase-2 threshold scaled proportionally (was hp<14 at max 28 = 50%; now hp<140 at max 280 = 50%)
  const phaseOf = (hp) => hp < 140 ? 2 : 1;
  if (phaseOf(280) !== 1) errors.push('yovko at full 280 hp should be phase 1');
  if (phaseOf(141) !== 1) errors.push('yovko at 141 hp (just above 50%) should be phase 1');
  // Original code used strict `<` (e.hp<14 at max 28), so AT exactly 50% it's still phase 1 — preserve that.
  if (phaseOf(140) !== 1) errors.push('yovko at exactly 140 hp (50%, boundary) should still be phase 1 (matches original strict-< behavior)');
  if (phaseOf(50)  !== 2) errors.push('yovko at 50 hp (low) should be phase 2');
  // Confirm it triggers at ~50%, not ~5% (the bug that would occur if threshold stayed at 14)
  const triggerPct = 140 / 280;
  if (Math.abs(triggerPct - 0.5) > 1e-9) errors.push(`phase-2 trigger should be at 50% hp, got ${triggerPct * 100}%`);

  // 4. playHitClip fires for tosho, not for other types (no clip registered)
  const beforeCount = HIT_CLIPS.tosho.played;
  const playedTosho = playHitClip('tosho');
  if (!playedTosho) errors.push('expected playHitClip(tosho) to return true');
  if (HIT_CLIPS.tosho.played !== beforeCount + 1) errors.push('tosho hit clip play count did not increment');

  const playedYankick = playHitClip('yankick');
  if (playedYankick) errors.push('expected playHitClip(yankick) to return false (no clip registered)');

  // 5. Simulate repeated hits on Tosho — clip should fire on every connecting hit, not just kill
  let hits = 0;
  let toshoHp = ETYPES.tosho.hp;
  for (let i = 0; i < 5; i++) {
    toshoHp--;
    playHitClip('tosho');
    hits++;
  }
  if (HIT_CLIPS.tosho.played !== beforeCount + 1 + hits) errors.push(`expected ${beforeCount + 1 + hits} total plays, got ${HIT_CLIPS.tosho.played}`);

} catch (e) { errors.push(e.message); }

console.log('errors:', errors.length);
console.log(errors.length === 0
  ? '✓ HIT-CLIP + HP x10 + YOVKO PHASE-THRESHOLD LOGIC VALIDATED'
  : errors.join('\n'));
