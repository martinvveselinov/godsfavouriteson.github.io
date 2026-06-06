const fs = require('fs');
const src = fs.readFileSync(__dirname + '/campaign.js', 'utf8');

const D = 'delta', K = 'kurva';
let errors = [];

// Extract and eval the STAGES array
let STAGES;
try {
  const m = src.match(/const STAGES = \[([\s\S]*?)\n\];/);
  if (!m) throw new Error('STAGES array not found');
  STAGES = eval('[' + m[1] + ']');
} catch (e) { errors.push('STAGES parse error: ' + e.message); }

if (STAGES) {
  // 1. Exactly 50 levels
  if (STAGES.length !== 50) errors.push(`expected 50 stages, got ${STAGES.length}`);

  // 2. Boss order & types: Tosho, Inked, Djokov, Yovko(final)
  const bosses = STAGES.map((s, i) => ({ i: i + 1, type: s.type, bossType: s.bossType }))
                       .filter(s => s.type === 'boss' || s.type === 'final_boss');
  const expectedBosses = [
    { level: 13, bossType: 'tosho' },
    { level: 26, bossType: 'inked' },
    { level: 38, bossType: 'jokov' },
    { level: 50, bossType: 'yovko' },
  ];
  if (bosses.length !== expectedBosses.length) {
    errors.push(`expected ${expectedBosses.length} boss stages, found ${bosses.length}: ${JSON.stringify(bosses)}`);
  } else {
    expectedBosses.forEach((eb, idx) => {
      const b = bosses[idx];
      if (b.i !== eb.level) errors.push(`boss #${idx+1}: expected at level ${eb.level}, found at ${b.i}`);
      if (b.bossType !== eb.bossType) errors.push(`boss #${idx+1}: expected bossType '${eb.bossType}', got '${b.bossType}'`);
    });
  }
  // Yan Kick / Jakuza should NOT appear anywhere in the campaign
  const banned = STAGES.filter(s => s.bossType === 'yankick' || s.bossType === 'jakuza');
  if (banned.length) errors.push(`yankick/jakuza should not appear in STAGES, found: ${JSON.stringify(banned)}`);

  // 3. Level labels are sequential 1-50 (extract leading number from label)
  STAGES.forEach((s, i) => {
    const mnum = s.label.match(/LEVEL (\d+)/);
    if (!mnum) errors.push(`stage ${i+1}: label missing LEVEL number: "${s.label}"`);
    else if (parseInt(mnum[1]) !== i + 1) errors.push(`stage ${i+1}: label says LEVEL ${mnum[1]}, position is ${i+1}`);
  });

  // 4. Special stage types present exactly once at expected positions
  if (STAGES[44].type !== 'ambush') errors.push(`expected ambush at level 45, got ${STAGES[44].type}`);
  for (let i = 45; i <= 48; i++) {
    if (STAGES[i].type !== 'healing') errors.push(`expected healing at level ${i+1}, got ${STAGES[i].type}`);
  }
  if (STAGES[49].type !== 'final_boss') errors.push(`expected final_boss at level 50, got ${STAGES[49].type}`);

  // 5. Every swarm/healing/ambush stage has a non-empty `rows`
  STAGES.forEach((s, i) => {
    if (['swarm','healing','ambush'].includes(s.type)) {
      if (!Array.isArray(s.rows) || s.rows.length === 0) errors.push(`stage ${i+1} (${s.type}) missing rows`);
      else s.rows.forEach((row, ri) => {
        if (!Array.isArray(row) || row.length === 0) errors.push(`stage ${i+1} row ${ri} empty`);
        row.forEach(v => { if (v !== D && v !== K) errors.push(`stage ${i+1} row ${ri} has invalid enemy '${v}'`); });
      });
    }
    if (s.type === 'boss' && (!Array.isArray(s.minRows) || s.minRows.length === 0)) {
      errors.push(`boss stage ${i+1} missing minRows`);
    }
  });
}

// 6. Simulate drawKurva with a mock ctx/px to confirm the new hairstyle code runs without error
try {
  const spritesSrc = fs.readFileSync(__dirname + '/sprites.js', 'utf8');
  const fnMatch = spritesSrc.match(/function drawKurva\(frame\) \{[\s\S]*?\n\}/);
  if (!fnMatch) throw new Error('drawKurva not found');

  let fillStyleHistory = [];
  const ctx = {
    fillStyle: '', strokeStyle: '', lineWidth: 1,
    save(){}, restore(){}, translate(){}, scale(){}, rotate(){},
    beginPath(){}, closePath(){}, fill(){ fillStyleHistory.push(this.fillStyle); },
    stroke(){}, moveTo(){}, lineTo(){}, bezierCurveTo(){}, quadraticCurveTo(){},
    arc(){}, ellipse(){}, rect(){}, fillRect(){},
  };
  global.ctx = ctx;
  global.C_SKIN = '#e8b48a';
  global.C_RED = '#ff3344';
  global.px = (x, y, w, h, col) => { ctx.fillStyle = col; ctx.fillRect(x, y, w, h); };

  const fn = eval('(' + fnMatch[0].replace('function drawKurva', 'function') + ')');
  fn(0); fn(1); // both animation frames

  if (!fillStyleHistory.includes('#f0d264')) errors.push('drawKurva: blonde hair fill colour (#f0d264) not used');
  if (fillStyleHistory.includes('#ff44bb')) errors.push('drawKurva: old pink hair colour (#ff44bb) still present');
} catch (e) { errors.push('drawKurva simulation error: ' + e.message); }

console.log('errors:', errors.length);
console.log(errors.length === 0
  ? 'PASS: 50-level campaign restructure (Tosho/Inked/Djokov/Yovko) + blonde Kurva validated'
  : errors.join('\n'));
