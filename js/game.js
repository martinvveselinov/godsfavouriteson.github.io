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

document.addEventListener('keydown', e => {
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

  if (gameState === 'PLAYING') {
    touchLastX = t.clientX;
    keys['Space'] = true; // hold = shoot

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
  touchLastX = t.clientX;

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

function handleMenuKey(code, key) {
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

  } else if (gameState === 'WIN' && (code === 'Enter' || code === 'Space')) {
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
      if (player.lives < 3 && Math.random() < 0.35)
        healthDrops.push({ x: e.x, y: e.y + 20, vy: 1.4 });
      else
        weaponDrops.push(mkWeaponDrop(e.x + (Math.random()-0.5)*40, e.y + 20));
    }
  }

  if (e.hp > 0) return;

  score += e.pts;
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

  // Health drops
  healthDrops = healthDrops.filter(h => {
    h.y += h.vy;
    if (Math.abs(h.x - player.x) < 24 && Math.abs(h.y - player.y) < 24 && player.lives < 3) {
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
    if (Math.abs(d.x - player.x) < 26 && Math.abs(d.y - player.y) < 26) {
      const wp = WEAPONS[d.wtype];
      player.weapon = d.wtype; player.weaponTimer = wp.dur;
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
