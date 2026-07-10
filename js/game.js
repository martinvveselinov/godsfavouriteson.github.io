// =================================================================
//  GAME — state, input, game control, main update loop
// =================================================================

// ── GAME STATE ────────────────────────────────────────────────────
let gameState    = 'TITLE'; // TITLE | NAME | PLAYING | PAUSED | GAMEOVER | WIN | LEADERBOARD
let pausedFrom   = 'PLAYING'; // state to return to when unpausing
let score        = 0;
let playerName   = '';
let typingName   = '';
let tick         = 0;
let screenFlash  = 0;
let waveMsg      = { text: '', timer: 0, color: C_ORANGE };
let scores       = JSON.parse(localStorage.getItem('stoyanScores') || '[]');
let onlineScores = null;

// Health drops (hearts from killed enemies during healing stages)
let healthDrops  = [];
// Weapon power-up crates falling from killed enemies
let weaponDrops  = [];
// Short-lived floating text (e.g. "SPREAD!" on pickup)
let floaters     = [];
// Screen-shake magnitude in px, decays each tick (juice on hits/pickups)
let shake        = 0;

// ── LEVELING / ROGUELITE UPGRADES ─────────────────────────────────
let levelUpPending = false;   // freezes gameplay while the choice card is up
let levelUpOffers  = [];      // the 3 (or fewer) upgrades on offer
let levelUpSel     = 0;       // highlighted card (keyboard nav)

// XP needed to go from `level` to the next level.
function xpForNext(level) { return 8 + level * 4; }

// Base-weapon upgrade track for the ARSENAL card (each pick moves one tier).
const BASE_TRACK = ['single', 'twin', 'rapid', 'spread', 'pierce'];
function nextBaseWeapon() {
  const i = BASE_TRACK.indexOf(player.baseWeapon);
  return BASE_TRACK[Math.min(i + 1, BASE_TRACK.length - 1)];
}

// The upgrade pool. `available()` (optional) hides an offer when maxed/pointless.
const UPGRADES = [
  { id:'sharp',  name:'SHARP BLADES',  desc:'+1 damage',            col:C_YELLOW,
    apply(){ player.dmgBonus++; } },
  { id:'pierce', name:'PIERCING EDGE', desc:'Punch through +1',     col:C_MAGENTA,
    apply(){ player.pierceBonus++; } },
  { id:'quick',  name:'QUICK HANDS',   desc:'Fire 15% faster',      col:C_CYAN,
    apply(){ player.rateMult *= 0.85; }, available(){ return player.rateMult > 0.42; } },
  { id:'arsenal',name:'ARSENAL',       desc:'Upgrade base weapon',  col:C_ORANGE,
    apply(){ player.baseWeapon = nextBaseWeapon();
             if (player.weaponTimer === 0) player.weapon = player.baseWeapon; },
    available(){ return player.baseWeapon !== 'pierce'; } },
  { id:'endure', name:'ENDURANCE',     desc:'Power-ups last longer',col:C_CYAN,
    apply(){ player.weaponDurMult *= 1.4; }, available(){ return player.weaponDurMult < 3; } },
  { id:'magnet', name:'MAGNET',        desc:'Bigger pickup range',  col:C_ORANGE,
    apply(){ player.pickupR += 16; }, available(){ return player.pickupR < 90; } },
  { id:'swift',  name:'ADRENALINE',    desc:'+1 move speed',        col:C_GREEN,
    apply(){ player.speed += 1; }, available(){ return player.speed < 9; } },
  { id:'iron',   name:'IRON HIDE',     desc:'+1 max life & heal',   col:C_RED,
    apply(){ player.maxLives++; player.lives = player.maxLives; },
    available(){ return player.maxLives < 6; } },
  { id:'heal',   name:'SECOND WIND',   desc:'Refill all lives',     col:C_RED,
    apply(){ player.lives = player.maxLives; },
    available(){ return player.lives < player.maxLives; } },
];

// Pick up to 3 distinct available upgrades; SECOND WIND is weighted up when hurt.
function rollOffers() {
  const pool  = UPGRADES.filter(u => !u.available || u.available());
  const picks = [];
  while (picks.length < 3 && pool.length) {
    const weights = pool.map(u => (u.id === 'heal' && player.lives < player.maxLives) ? 3 : 1);
    let r = Math.random() * weights.reduce((a, b) => a + b, 0), idx = 0;
    for (; idx < pool.length; idx++) { r -= weights[idx]; if (r <= 0) break; }
    picks.push(pool[idx]); pool.splice(idx, 1);
  }
  return picks;
}

// Called on every kill. Accrues XP and opens a level-up card when the bar fills.
function addXP(n) {
  player.xp += n;
  if (player.xp >= player.xpNext && !levelUpPending) triggerLevelUp();
}

function triggerLevelUp() {
  const offers = rollOffers();
  if (offers.length === 0) {                 // everything maxed — just level, no pause
    player.xp -= player.xpNext; player.level++; player.xpNext = xpForNext(player.level);
    return;
  }
  levelUpOffers = offers; levelUpSel = 0; levelUpPending = true;
  sfxPower(); shake = 6;
}

function chooseUpgrade(i) {
  const up = levelUpOffers[i];
  if (!up) return;
  up.apply();
  addFloater(up.name + '!', player.x, player.y - 46, up.col || C_YELLOW);
  spawnParticles(player.x, player.y, up.col || C_YELLOW, 20);
  player.xp -= player.xpNext; player.level++; player.xpNext = xpForNext(player.level);
  levelUpPending = false; levelUpOffers = [];
  sfxMenu();
  if (player.xp >= player.xpNext) triggerLevelUp();   // chained level-ups
}

const WEAPON_POOL = ['spread', 'rapid', 'twin', 'pierce'];
function mkWeaponDrop(x, y) {
  return { x, y, vy: 1.1 + Math.random() * 0.5, rot: 0,
           wtype: WEAPON_POOL[Math.floor(Math.random() * WEAPON_POOL.length)] };
}
function addFloater(text, x, y, col) { floaters.push({ text, x, y, life: 70, col }); }
// Damage a boss must soak before it bleeds the next loot crate — randomized
// each time so drops are "damage + luck", never a predictable metronome.
function bossLootThreshold() { return 12 + Math.random() * 9; }

// ── INPUT ─────────────────────────────────────────────────────────
const keys = {};
// Guarded with `|| null`: if index.html is ever out of sync and lacks
// #nameInput, the rest of the game must still load instead of crashing here.
const nameInput = document.getElementById('nameInput') || null;
// Guarded with `|| null`: if index.html is ever out of sync and lacks
// #nameInput, the rest of the game must still load instead of crashing here.
const nameInput = document.getElementById('nameInput') || null;

document.addEventListener('keydown', e => {
  if (nameInput && document.activeElement === nameInput) return; // hidden input handles its own keys (mobile name entry)
  if (nameInput && document.activeElement === nameInput) return; // hidden input handles its own keys (mobile name entry)
  if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))
    e.preventDefault();
  if (!keys[e.code]) handleMenuKey(e.code, e.key);
  keys[e.code] = true;
  if (AC && AC.state === 'suspended') AC.resume();
});
document.addEventListener('keyup', e => { keys[e.code] = false; });

// ── MOBILE NAME ENTRY (hidden input → summons native keyboard) ───
// Tapping the name box (see touch handler below) focuses this invisible
// input. Its value drives `typingName` directly so the existing NAME-screen
// rendering and confirm/cancel flow keep working unchanged.
if (nameInput) {
  nameInput.addEventListener('input', () => {
    typingName = nameInput.value.toUpperCase().slice(0, 14);
    nameInput.value = typingName;
  });
  nameInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (typingName.trim().length > 0) {
        sfxMenu(); playerName = typingName.trim().toUpperCase();
        nameInput.blur(); nameInput.value = ''; typingName = '';
        startGame();
      }
    } else if (e.key === 'Escape') {
      nameInput.blur(); nameInput.value = ''; typingName = '';
      gameState = 'TITLE';
    }
  });
}
if (nameInput) {
  nameInput.addEventListener('input', () => {
    typingName = nameInput.value.toUpperCase().slice(0, 14);
    nameInput.value = typingName;
  });
  nameInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (typingName.trim().length > 0) {
        sfxMenu(); playerName = typingName.trim().toUpperCase();
        nameInput.blur(); nameInput.value = ''; typingName = '';
        startGame();
      }
    } else if (e.key === 'Escape') {
      nameInput.blur(); nameInput.value = ''; typingName = '';
      gameState = 'TITLE';
    }
  });
}

// ── TOUCH CONTROLS ────────────────────────────────────────────────
// Gameplay: hold anywhere = continuous shoot, swipe left/right = move.
// Menus: a tap acts as "Enter" (start, confirm, resume, leaderboard advance);
// on the NAME screen a tap focuses the hidden input to open the keyboard.
let touchLastX = null;

function touchOnStart(e) {
  e.preventDefault();
  const t = e.changedTouches[0];
  if (!t) return;
  if (AC && AC.state === 'suspended') AC.resume();

  if (gameState === 'PLAYING' && levelUpPending) {
    // Tap the card you want — screen split into N equal columns
    const rect = C.getBoundingClientRect();
    const tapX = (t.clientX - rect.left) * (W / rect.width);
    const n    = levelUpOffers.length;
    chooseUpgrade(Math.max(0, Math.min(n - 1, Math.floor(tapX / (W / n)))));

  } else if (gameState === 'PLAYING') {
    touchLastX = t.clientX;
    keys['Space'] = true; // hold = shoot

  } else if (gameState === 'NAME' && nameInput) {
  } else if (gameState === 'NAME' && nameInput) {
    nameInput.value = typingName;
    nameInput.focus();

  } else if (gameState === 'TITLE') {
    const rect   = C.getBoundingClientRect();
    const tapY   = (t.clientY - rect.top) * (H / rect.height);
    if (tapY > 595 && tapY < 635) {
      handleMenuKey('KeyL', 'l'); // leaderboard button tap zone
    } else {
      handleMenuKey('Enter', 'Enter');
    }

  } else if (gameState === 'TITLE') {
    const rect   = C.getBoundingClientRect();
    const tapY   = (t.clientY - rect.top) * (H / rect.height);
    if (tapY > 595 && tapY < 635) {
      handleMenuKey('KeyL', 'l'); // leaderboard button tap zone
    } else {
      handleMenuKey('Enter', 'Enter');
    }

  } else if (gameState === 'PAUSED'
          || gameState === 'GAMEOVER'
          || gameState === 'WIN'
          || gameState === 'LEADERBOARD') {
    handleMenuKey('Enter', 'Enter');
  }
}

function touchOnMove(e) {
  e.preventDefault();
  if (gameState !== 'PLAYING' || touchLastX === null) return;
  const t = e.changedTouches[0];
  if (!t) return;
  // Drag the ship 1:1 with the finger. clientX is in CSS pixels, but the
  // canvas's internal coordinate space is fixed at W=600 — the displayed
  // size on a phone is usually much smaller, so a raw pixel delta would
  // barely move the ship. Scale by (internal width / displayed width) so
  // a full-width swipe moves the ship a full screen-width, every time.
  const rect   = C.getBoundingClientRect();
  const scaleX = W / rect.width;
  const dx     = (t.clientX - touchLastX) * scaleX;
  player.x = Math.max(player.w / 2 + 4, Math.min(W - player.w / 2 - 4, player.x + dx));
  // Drag the ship 1:1 with the finger. clientX is in CSS pixels, but the
  // canvas's internal coordinate space is fixed at W=600 — the displayed
  // size on a phone is usually much smaller, so a raw pixel delta would
  // barely move the ship. Scale by (internal width / displayed width) so
  // a full-width swipe moves the ship a full screen-width, every time.
  const rect   = C.getBoundingClientRect();
  const scaleX = W / rect.width;
  const dx     = (t.clientX - touchLastX) * scaleX;
  player.x = Math.max(player.w / 2 + 4, Math.min(W - player.w / 2 - 4, player.x + dx));
  touchLastX = t.clientX;

  // Keep nudging the AudioContext awake throughout a long drag — not just
  // at the moment the finger first touches down. A click-and-drag session
  // can last many seconds, plenty of time for an interruption (e.g. a
  // volume-button press) to suspend audio mid-drag.
  if (AC && AC.state === 'suspended') AC.resume().catch(() => {});

  // Keep nudging the AudioContext awake throughout a long drag — not just
  // at the moment the finger first touches down. A click-and-drag session
  // can last many seconds, plenty of time for an interruption (e.g. a
  // volume-button press) to suspend audio mid-drag.
  if (AC && AC.state === 'suspended') AC.resume().catch(() => {});
}

function touchOnEnd(e) {
  e.preventDefault();
  touchLastX = null;
  keys['Space']      = false;
  keys['ArrowLeft']  = false;
  keys['ArrowRight'] = false;
}

C.addEventListener('touchstart',  touchOnStart, { passive: false });
C.addEventListener('touchmove',   touchOnMove,  { passive: false });
C.addEventListener('touchend',    touchOnEnd,   { passive: false });
C.addEventListener('touchcancel', touchOnEnd,   { passive: false });

// Swap the keyboard-control hint for a touch-friendly one on touch devices
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
  const hintEl = document.getElementById('hint');
  if (hintEl) hintEl.textContent = 'SWIPE ←→ MOVE   |   HOLD  SHOOT   |   TAP  CONFIRM / RESUME';
}

// ── AUDIO RESUME POLICY ───────────────────────────────────────────
// Mobile browsers auto-suspend the AudioContext whenever the page loses
// "audio focus" (volume-button presses, calls/notifications, app-switch,
// screen lock, etc). The fix is intentionally narrow: browsers only honour
// resume() calls made directly inside a user-gesture handler (a tap or key
// press — see the `keydown`, `touchstart`, and `touchmove` handlers above,
// each of which already calls `AC.resume()` when suspended). Calls made on
// a timer or from visibility/focus events are often silently ignored by the
// browser AND can fight its own audio-session management — which is exactly
// what produces a "sometimes on, sometimes off, out of nowhere" flicker.
// So: no polling, no background listeners — only resume from real input.

// ── AUDIO RESUME POLICY ───────────────────────────────────────────
// Mobile browsers auto-suspend the AudioContext whenever the page loses
// "audio focus" (volume-button presses, calls/notifications, app-switch,
// screen lock, etc). The fix is intentionally narrow: browsers only honour
// resume() calls made directly inside a user-gesture handler (a tap or key
// press — see the `keydown`, `touchstart`, and `touchmove` handlers above,
// each of which already calls `AC.resume()` when suspended). Calls made on
// a timer or from visibility/focus events are often silently ignored by the
// browser AND can fight its own audio-session management — which is exactly
// what produces a "sometimes on, sometimes off, out of nowhere" flicker.
// So: no polling, no background listeners — only resume from real input.

function handleMenuKey(code, key) {
  // ── LEVEL-UP CARD SELECTION (takes over input while a choice is open) ──
  if (gameState === 'PLAYING' && levelUpPending) {
    const n = levelUpOffers.length;
    if      (code === 'Digit1' || code === 'Numpad1') chooseUpgrade(0);
    else if (code === 'Digit2' || code === 'Numpad2') chooseUpgrade(1);
    else if (code === 'Digit3' || code === 'Numpad3') chooseUpgrade(2);
    else if (code === 'ArrowLeft'  || code === 'KeyA') levelUpSel = (levelUpSel + n - 1) % n;
    else if (code === 'ArrowRight' || code === 'KeyD') levelUpSel = (levelUpSel + 1) % n;
    else if (code === 'Enter' || code === 'Space')     chooseUpgrade(levelUpSel);
    return;
  }

  // ── PAUSE TOGGLE (P or Escape, while actively playing) ──────────
  if (gameState === 'PLAYING' && (code === 'KeyP' || code === 'Escape')) {
    sfxMenu(); pausedFrom = gameState; gameState = 'PAUSED';
    return;
  } else if (gameState === 'PAUSED' && (code === 'KeyP' || code === 'Escape' || code === 'Enter')) {
    sfxMenu(); gameState = pausedFrom;
    return;
  }

  if (gameState === 'TITLE' && code === 'Enter') {
    sfxMenu(); gameState = 'NAME'; typingName = '';

  } else if (gameState === 'TITLE' && code === 'KeyL') {
    sfxMenu(); gameState = 'LEADERBOARD'; loadLeaderboard();
    sfxMenu(); gameState = 'LEADERBOARD'; loadLeaderboard();

  } else if (gameState === 'NAME') {
    if (code === 'Enter' && typingName.trim().length > 0) {
      sfxMenu(); playerName = typingName.trim().toUpperCase(); startGame();
    } else if (code === 'Backspace') {
      typingName = typingName.slice(0, -1);
    } else if (code === 'Escape') {
      gameState = 'TITLE';
    } else if (key.length === 1 && typingName.length < 14) {
      typingName += key.toUpperCase();
    }

  } else if (gameState === 'GAMEOVER' && (code === 'Enter' || code === 'Space')) {
    sfxMenu(); saveScore().then(() => { gameState = 'LEADERBOARD'; loadLeaderboard(); });
    sfxMenu(); saveScore().then(() => { gameState = 'LEADERBOARD'; loadLeaderboard(); });

  } else if (gameState === 'WIN' && (code === 'Enter' || code === 'Space')) {
    sfxMenu(); saveScore().then(() => { gameState = 'LEADERBOARD'; loadLeaderboard(); });
    sfxMenu(); saveScore().then(() => { gameState = 'LEADERBOARD'; loadLeaderboard(); });

  } else if (gameState === 'LEADERBOARD' && (code === 'Enter' || code === 'Space')) {
    sfxMenu(); gameState = 'TITLE';
  }
}

// ── GAME CONTROL ──────────────────────────────────────────────────
function startGame() {
  score        = 0;
  particles    = [];
  healthDrops  = [];
  weaponDrops  = [];
  floaters     = [];
  shake        = 0;
  levelUpPending = false;
  levelUpOffers  = [];
  spawnQueue   = [];
  waveActive   = false;
  player.reset();
  gameState = 'PLAYING';
  setTimeout(() => startStage(0), 500);
}

async function saveScore() {
  scores.push({ name: playerName, score, date: Date.now() });
  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 10);
  localStorage.setItem('stoyanScores', JSON.stringify(scores));
  try {
    await firebase.database().ref('leaderboard').push({ name: playerName, score, date: Date.now() });
  } catch (e) {}
}

let fetchAttempted = false;
  try {
    await firebase.database().ref('leaderboard').push({ name: playerName, score, date: Date.now() });
  } catch (e) {}
}

let fetchAttempted = false;

async function fetchOnlineScores() {
  if (onlineScores) return onlineScores;
  if (fetchAttempted) return null;
  fetchAttempted = true;
  try {
    const timeout = new Promise((_, rej) => setTimeout(() => rej('timeout'), 5000));
    const query   = firebase.database().ref('leaderboard').get();
    const snap = await Promise.race([query, timeout]);
    if (!snap.exists()) return null;
    const entries = Object.values(snap.val());
    entries.sort((a, b) => b.score - a.score);
    onlineScores = entries.slice(0, 10);
  } catch (e) {
    console.error('[Firebase] Fetch failed:', e);
  }
  return onlineScores;
}

// ── APPLY DAMAGE / HANDLE A KILL ──────────────────────────────────
// Shared by every player-bullet hit. On a kill it scores, plays the death
// clip, and rolls loot: a heart (heavy during healing waves) OR a weapon
// crate. Boss fights are weapon-rich — the boss showers crates on death and
// its summoned minions drop them far more often — so you can re-arm mid-fight.
function damageEnemy(e, idx, dmg, isHealing) {
  const def = ETYPES[e.type];
  e.hp -= dmg;
  spawnParticles(e.x, e.y, def.col, e.hp <= 0 ? 14 : 5);
  playHitClip(e.type); // per-boss hit clip on every connecting hit

  // Damage-based loot (bosses): they bleed crates as you chip their HP, on a
  // randomized damage threshold — so you re-arm throughout the fight, not only
  // at the kill. Drops a heart instead when you're hurting.
  if (e.isBoss && e.hp > 0) {
    e.dmgSinceLoot = (e.dmgSinceLoot || 0) + dmg;
    if (e.lootThreshold == null) e.lootThreshold = bossLootThreshold();
    if (e.dmgSinceLoot >= e.lootThreshold) {
      e.dmgSinceLoot = 0;
      e.lootThreshold = bossLootThreshold();
      if (player.lives < player.maxLives && Math.random() < 0.35)
        healthDrops.push({ x: e.x, y: e.y + 20, vy: 1.4 });
      else
        weaponDrops.push(mkWeaponDrop(e.x + (Math.random()-0.5)*40, e.y + 20));
    }
  }

  if (e.hp > 0) return;

  score += e.pts;
  addXP(e.isBoss ? 15 : 1);   // bosses are a big XP payout
  if (!playKillClip(e.type)) sfxDeath();

  const stageType = STAGES[currentStage]?.type || '';
  const bossStage = stageType === 'boss' || stageType === 'final_boss';

  if (e.isBoss) {
    shake = 16;
    // Death shower — a fistful of weapon crates fans out from the corpse
    for (let i = 0; i < 4; i++)
      weaponDrops.push(mkWeaponDrop(e.x + (Math.random()-0.5)*70, e.y + (Math.random()-0.5)*20));
  } else if (Math.random() < (isHealing ? 0.35 : 0.08)) {
    healthDrops.push({ x: e.x, y: e.y, vy: 1.2 + Math.random() * 0.6 });
  } else if (!isHealing && Math.random() < (bossStage ? 0.30 : 0.05)) {
    // Minions in a boss fight are generous with weapons; normal swarms aren't
    weaponDrops.push(mkWeaponDrop(e.x, e.y));
  }
  enemies.splice(idx, 1);
}

// ── MAIN UPDATE LOOP ──────────────────────────────────────────────
function update() {
  tick++;
  if (gameState !== 'PLAYING') return;
  if (levelUpPending) return;   // freeze the battlefield while choosing an upgrade

  player.update();

  // Drain spawn queue
  if (spawnQueue.length > 0) {
    spawnTimer++;
    if (spawnTimer >= SPAWN_DELAY) {
      spawnTimer = 0;
      enemies.push(createEnemy(spawnQueue.shift()));
    }
  }

  formPhase += formSpeed;

  // Ambush stage: trigger Yovko drive-by
  if (STAGES[currentStage]?.type === 'ambush') tickAmbush();

  // Move + shoot all enemies
  enemies.forEach(e => {
    e.frame++;
    moveEnemy(e);
    if (e.state === 'ambush_dash') return;
    if (e.state === 'boss_fight') tickBossAI(e); // summons, specials, rage
    tickEnemySpecial(e);                          // sniper telegraph / burst
    if (!e.charging) ETYPES[e.type].shoot(e);     // hold normal fire while locking on
  });

  // Remove ambush Yovko when off screen
  enemies = enemies.filter(e =>
    e.state !== 'ambush_dash' || (e.x > -200 && e.x < W + 200)
  );

  // Advance enemy bullets
  eBullets = eBullets.filter(b => {
    b.x += b.vx; b.y += b.vy;
    if (b.life !== undefined) { b.life--; return b.life > 0 && b.y < H + 30; }
    return b.y < H + 30;
  });

  updateParticles();
  if (screenFlash > 0) screenFlash--;
  if (shake > 0) shake--;
  floaters = floaters.filter(f => { f.y -= 0.6; return --f.life > 0; });

  // Player bullets vs enemies. A normal bullet is consumed on its first hit;
  // a piercing blade damages several enemies (tracked in `bul.hits` so it
  // never re-hits the same one) until its `pierce` budget is spent.
  const isHealing = STAGES[currentStage]?.type === 'healing';
  player.bullets = player.bullets.filter(bul => {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e   = enemies[i];
      if (e.state === 'ambush_dash') continue; // can't shoot Yovko during ambush
      const def = ETYPES[e.type];
      if (Math.abs(bul.x - e.x) < def.w/2 + 2 && Math.abs(bul.y - e.y) < def.h/2 + 2) {
        if (bul.hits && bul.hits.includes(e)) continue; // already pierced this one
        damageEnemy(e, i, bul.dmg || 1, isHealing);
        sfxHit();
        if (bul.pierce > 0) { bul.pierce--; bul.hits.push(e); continue; }
        return false; // consumed
      }
    }
    return true;
  });

  // Health drops (pickup radius grows with the MAGNET upgrade)
  const pr = player.pickupR;
  healthDrops = healthDrops.filter(h => {
    h.y += h.vy;
    if (Math.abs(h.x - player.x) < pr && Math.abs(h.y - player.y) < pr && player.lives < player.maxLives) {
      player.lives++;
      spawnParticles(h.x, h.y, C_RED, 10);
      beep(880, 0.15, 'square', 0.2); beep(1100, 0.15, 'square', 0.15);
      return false;
    }
    return h.y < H + 30;
  });

  // Weapon crates — fall, and on pickup swap in a timed weapon
  weaponDrops = weaponDrops.filter(d => {
    d.y += d.vy; d.rot += 0.05;
    if (Math.abs(d.x - player.x) < pr && Math.abs(d.y - player.y) < pr) {
      const wp = WEAPONS[d.wtype];
      player.weapon = d.wtype; player.weaponTimer = Math.round(wp.dur * player.weaponDurMult);
      spawnParticles(d.x, d.y, wp.col, 18);
      addFloater(wp.name + '!', player.x, player.y - 40, wp.col);
      sfxPower(); shake = 8;
      return false;
    }
    return d.y < H + 30;
  });

  // Enemy bullets vs player
  eBullets = eBullets.filter(b => {
    if (Math.abs(b.x - player.x) < 17 && Math.abs(b.y - player.y) < 20) {
      player.hit(); spawnParticles(b.x, b.y, C_RED, 5); return false;
    }
    return true;
  });

  // Enemy body vs player (diving, boss_fight, ambush_dash)
  enemies = enemies.filter(e => {
    const def = ETYPES[e.type];
    const dangerous = e.state === 'diving' || e.state === 'boss_fight' || e.state === 'ambush_dash';
    if (dangerous &&
        Math.abs(e.x - player.x) < def.w/2 + 10 &&
        Math.abs(e.y - player.y) < def.h/2 + 10) {
      player.hit(); spawnParticles(e.x, e.y, def.col, 14); return false;
    }
    return true;
  });

  if (player.lives <= 0) { gameState = 'GAMEOVER'; return; }

  checkStageComplete();
}
