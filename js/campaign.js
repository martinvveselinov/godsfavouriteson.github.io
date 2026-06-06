// =================================================================
//  CAMPAIGN — 50-level scripted progression
//
//  Structure:
//    Levels  1-12  : swarm (Act 1)
//    Level  13     : Boss — Tosho Kukata
//    Levels 14-25  : swarm (Act 2)
//    Level  26     : Boss — Andrey Inked
//    Levels 27-37  : swarm (Act 3)
//    Level  38     : Boss — Djokov
//    Levels 39-44  : swarm (pre-ambush)
//    Level  45     : Yovko SNEAK ATTACK
//    Levels 46-49  : recovery swarms (health drops)
//    Level  50     : FINAL BOSS — Yovko Tihov
//
//  NOTE: Yan Kick and Jakuza remain fully playable bosses (sprites,
//  ETYPES entries, hp/attacks all intact in enemies.js) — they're just
//  not slotted into the current 50-level run. Easy to re-add later.
// =================================================================

let currentStage = -1;
let ambushTriggered = false;
let ambushTimer     = 0;

const D = 'delta', K = 'kurva';

const STAGES = [

  // ── ACT 1: LEVELS 1–12 ────────────────────────────────────────
  { type:'swarm', label:'LEVEL 1',
    rows:[[D,D,D,D,D]] },
  { type:'swarm', label:'LEVEL 2',
    rows:[[K,D,K,D,K]] },
  { type:'swarm', label:'LEVEL 3',
    rows:[[D,D,D,D,D],[K,D,K,D,K]] },
  { type:'swarm', label:'LEVEL 4',
    rows:[[K,K,D,K,K],[D,D,D,D,D]] },
  { type:'swarm', label:'LEVEL 5',
    rows:[[D,K,D,K,D,K],[K,D,K,D,K,D]] },
  { type:'swarm', label:'LEVEL 6',
    rows:[[K,K,D,D,K,K],[D,K,K,D,K,D]] },
  { type:'swarm', label:'LEVEL 7',
    rows:[[K,K,K,D,K,K],[D,K,D,K,D,K],[K,D,K,D,K,D]] },
  { type:'swarm', label:'LEVEL 8',
    rows:[[K,K,K,K,K,K],[D,D,D,D,D,D],[K,D,K,D,K,D]] },
  { type:'swarm', label:'LEVEL 9',
    rows:[[K,K,K,K,K,K],[D,K,D,K,D,K],[K,K,D,D,K,K]] },
  { type:'swarm', label:'LEVEL 10',
    rows:[[K,K,K,K,K]] },
  { type:'swarm', label:'LEVEL 11',
    rows:[[K,D,K,K,D,K],[D,K,D,D,K,D]] },
  { type:'swarm', label:'LEVEL 12',
    rows:[[K,K,D,K,K,D],[D,D,K,D,D,K]] },

  // ── BOSS 1: LEVEL 13 ──────────────────────────────────────────
  { type:'boss', label:'LEVEL 13 — TOSHO KUKATA!', bossType:'tosho',
    minRows:[[D,D,D,D]] },

  // ── ACT 2: LEVELS 14–25 ───────────────────────────────────────
  { type:'swarm', label:'LEVEL 14',
    rows:[[K,K,K,K,K],[D,K,D,K,D],[K,D,K,D,K]] },
  { type:'swarm', label:'LEVEL 15',
    rows:[[K,K,K,K,K,K],[D,K,K,D,K,K],[K,D,D,K,D,D]] },
  { type:'swarm', label:'LEVEL 16',
    rows:[[K,K,K,K,K,K],[K,D,K,D,K,D],[D,K,D,K,D,K]] },
  { type:'swarm', label:'LEVEL 17',
    rows:[[K,K,K,K,K,K],[D,K,K,K,K,D],[K,K,D,D,K,K]] },
  { type:'swarm', label:'LEVEL 18',
    rows:[[K,K,K,K,K,K],[K,K,K,D,K,K],[D,K,K,K,K,D],[K,D,K,D,K,D]] },
  { type:'swarm', label:'LEVEL 19',
    rows:[[K,K,K,K,K,K],[K,K,D,K,K,K],[D,K,K,D,K,K],[K,D,D,K,D,K]] },
  { type:'swarm', label:'LEVEL 20',
    rows:[[K,K,K,K,K,K],[D,D,D,D,D,D]] },
  { type:'swarm', label:'LEVEL 21',
    rows:[[K,K,K,K,K,K],[K,D,K,K,D,K],[D,K,D,D,K,D]] },
  { type:'swarm', label:'LEVEL 22',
    rows:[[K,K,K,K,K,K],[K,K,D,D,K,K],[D,K,K,K,K,D]] },
  { type:'swarm', label:'LEVEL 23',
    rows:[[K,K,K,K,K,K],[D,K,K,D,K,K],[K,D,D,K,D,D],[K,K,K,K,K,K]] },
  { type:'swarm', label:'LEVEL 24',
    rows:[[K,K,K,K,K,K],[K,K,K,K,K,K],[D,K,D,K,D,K],[K,D,K,D,K,D]] },
  { type:'swarm', label:'LEVEL 25',
    rows:[[K,K,K,K,K,K],[K,K,D,K,K,K],[D,K,K,D,K,K],[K,D,D,D,D,K]] },

  // ── BOSS 2: LEVEL 26 ──────────────────────────────────────────
  { type:'boss', label:'LEVEL 26 — ANDREY INKED!', bossType:'inked',
    minRows:[[K,D,D,K,D,K],[D,K,K,D,K,D]] },

  // ── ACT 3: LEVELS 27–37 ───────────────────────────────────────
  { type:'swarm', label:'LEVEL 27',
    rows:[[K,K,K,K,K,K],[K,K,K,D,K,K],[K,D,K,D,K,D],[D,K,D,K,D,K]] },
  { type:'swarm', label:'LEVEL 28',
    rows:[[K,K,K,K,K,K],[K,K,K,K,K,K],[K,D,K,D,K,D],[D,K,D,K,D,K]] },
  { type:'swarm', label:'LEVEL 29',
    rows:[[K,K,K,K,K,K],[K,K,K,K,K,K],[K,K,D,K,K,K],[D,K,K,K,K,D]] },
  { type:'swarm', label:'LEVEL 30',
    rows:[[K,K,K,K,K,K],[K,K,K,K,K,K],[D,D,D,D,D,D]] },
  { type:'swarm', label:'LEVEL 31',
    rows:[[K,K,K,K,K,K],[K,K,D,K,K,K],[D,K,K,K,K,D],[K,D,K,D,K,D]] },
  { type:'swarm', label:'LEVEL 32',
    rows:[[K,K,K,K,K,K],[K,K,K,K,K,K],[K,D,K,K,D,K],[D,K,D,K,D,K]] },
  { type:'swarm', label:'LEVEL 33',
    rows:[[K,K,K,K,K,K],[K,K,K,K,K,K],[K,K,D,D,K,K],[D,K,K,K,K,D]] },
  { type:'swarm', label:'LEVEL 34',
    rows:[[K,K,K,K,K,K],[K,K,K,K,K,K],[K,K,K,D,K,K],[D,K,D,K,D,K],[K,D,K,D,K,D]] },
  { type:'swarm', label:'LEVEL 35',
    rows:[[K,K,K,K,K,K],[K,K,K,K,K,K],[K,D,K,D,K,D],[D,K,D,K,D,K],[K,K,D,D,K,K]] },
  { type:'swarm', label:'LEVEL 36',
    rows:[[K,K,K,K,K,K],[K,K,K,K,K,K],[K,K,K,D,K,K],[D,K,K,K,K,D],[K,D,D,D,D,K]] },
  { type:'swarm', label:'LEVEL 37',
    rows:[[K,K,K,K,K,K],[K,K,K,K,K,K],[K,K,D,K,K,K],[K,D,K,D,K,D],[D,K,D,K,D,K]] },

  // ── BOSS 3: LEVEL 38 ──────────────────────────────────────────
  { type:'boss', label:'LEVEL 38 — DJOKOV!', bossType:'jokov',
    minRows:[[D,K,D,K,D,K],[K,D,K,D,K,D]] },

  // ── PRE-AMBUSH: LEVELS 39–44 ──────────────────────────────────
  { type:'swarm', label:'LEVEL 39',
    rows:[[K,K,K,K,K,K],[K,K,K,K,K,K],[K,K,K,K,K,K],[K,D,K,D,K,D],[D,K,D,K,D,K]] },
  { type:'swarm', label:'LEVEL 40',
    rows:[[K,K,K,K,K,K],[K,D,K,D,K,D]] },
  { type:'swarm', label:'LEVEL 41',
    rows:[[K,K,K,K,K,K],[K,K,D,K,K,K],[D,K,D,K,D,K]] },
  { type:'swarm', label:'LEVEL 42',
    rows:[[K,K,K,K,K,K],[K,K,K,D,K,K],[K,D,K,D,K,D],[D,K,D,K,D,K]] },
  { type:'swarm', label:'LEVEL 43',
    rows:[[K,K,K,K,K,K],[K,K,K,K,K,K],[K,D,K,D,K,D],[D,K,D,K,D,K]] },
  { type:'swarm', label:'LEVEL 44',
    rows:[[K,K,K,K,K,K],[K,K,K,K,K,K],[K,K,K,K,K,K],[D,K,D,K,D,K],[K,D,K,D,K,D]] },

  // ── LEVEL 45: YOVKO SNEAK ATTACK ──────────────────────────────
  { type:'ambush', label:'LEVEL 45',
    rows:[[K,D,K,D,K],[D,K,D,K,D]] },

  // ── RECOVERY: LEVELS 46–49 ────────────────────────────────────
  { type:'healing', label:'LEVEL 46 — RECOVERY',
    rows:[[D,D,D,D]] },
  { type:'healing', label:'LEVEL 47 — RECOVERY',
    rows:[[D,K,D,K,D]] },
  { type:'healing', label:'LEVEL 48 — RECOVERY',
    rows:[[K,D,K,D],[D,D,D,D]] },
  { type:'healing', label:'LEVEL 49 — RECOVERY',
    rows:[[D,K,D,K,D],[K,D,K,D,K]] },

  // ── FINAL BOSS: LEVEL 50 ──────────────────────────────────────
  { type:'final_boss', label:'LEVEL 50 — YOVKO TIHOV', bossType:'yovko' },
];

// ── LAUNCH A STAGE ────────────────────────────────────────────────
function startStage(idx) {
  if (idx >= STAGES.length) { gameState = 'WIN'; return; }
  currentStage    = idx;
  ambushTriggered = false;
  ambushTimer     = 0;

  enemies    = [];
  eBullets   = [];
  spawnQueue = [];
  spawnTimer = SPAWN_DELAY;

  formPhase = 0;
  formAmp   = Math.min(200, 90 + idx * 2.2);
  formSpeed = Math.min(0.030, 0.009 + idx * 0.0004);
  SPAWN_DELAY = Math.max(16, 44 - Math.floor(idx * 0.55));
  waveActive  = true;

  const stage = STAGES[idx];
  const stageType = stage.type;

  // Wave announcement colour
  const msgColor = stageType === 'final_boss' ? C_RED
                 : stageType === 'boss'        ? C_YELLOW
                 : stageType === 'ambush'      ? C_RED
                 : stageType === 'healing'     ? '#44ff88'
                 : C_ORANGE;
  waveMsg = { text: stage.label, timer: 150, color: msgColor };

  if (stageType === 'boss' || stageType === 'final_boss') {
    sfxBoss();
    spawnQueue.push({ boss: true, type: stage.bossType });
    if (stage.minRows) {
      stage.minRows.forEach((row, ri) =>
        row.forEach((type, ci) =>
          spawnQueue.push({ type, col: ci, row: ri + 1, totalCols: row.length })
        )
      );
    }
  } else if (stageType === 'ambush') {
    sfxWave();
    buildSwarmQueue(stage.rows);
  } else {
    sfxWave();
    buildSwarmQueue(stage.rows);
  }
}

function buildSwarmQueue(rows) {
  rows.forEach((row, ri) =>
    row.forEach((type, ci) =>
      spawnQueue.push({ type, col: ci, row: ri, totalCols: row.length })
    )
  );
}

// Called every tick during ambush stage
function tickAmbush() {
  if (ambushTriggered) return;
  ambushTimer++;
  // Trigger when half the swarm has entered OR after 4 seconds
  const totalQueued = STAGES[currentStage].rows.flat().length;
  const halfEntered = spawnQueue.length < totalQueued / 2;
  if (ambushTimer > 240 || halfEntered) {
    ambushTriggered = true;
    enemies.push(createEnemy({ ambushDash: true }));
    beep(55, 1.0, 'sawtooth', 0.5);
    beep(80, 0.8, 'sawtooth', 0.4);
    waveMsg = { text: 'YOVKO — SNEAK ATTACK!', timer: 220, color: C_RED };
  }
}

// ── WAVE COMPLETE CHECK ───────────────────────────────────────────
function checkStageComplete() {
  if (!waveActive) return;
  const stage = STAGES[currentStage];

  // Ambush stage: done when swarm cleared (Yovko leaves on his own)
  const onlyAmbush = enemies.length > 0 && enemies.every(e => e.state === 'ambush_dash');

  if (spawnQueue.length === 0 && (enemies.length === 0 || onlyAmbush)) {
    waveActive = false;
    enemies = enemies.filter(e => e.state !== 'ambush_dash');

    if (stage.type === 'final_boss') {
      gameState = 'WIN';
    } else {
      setTimeout(() => startStage(currentStage + 1), 2000);
    }
  }
}
