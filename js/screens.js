// =================================================================
//  SCREENS — all draw functions for each game state
// =================================================================

function txt(t, x, y, size, col, align = 'center', glow = '') {
  ctx.font = `bold ${size}px 'Courier New', monospace`;
  ctx.textAlign = align;
  if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = 16; }
  ctx.fillStyle = col; ctx.fillText(t, x, y);
  ctx.shadowBlur = 0;
}

// ── TITLE ─────────────────────────────────────────────────────────
function drawTitle() {
  ctx.fillStyle = C_BG; ctx.fillRect(0, 0, W, H);
  drawStars();

  const pulse = 1 + Math.sin(tick / 22) * 0.04;
  ctx.save(); ctx.translate(W/2, 120); ctx.scale(pulse, pulse);
  txt('STOYAN KOLEV', 0, -20, 44, C_ORANGE, 'center', C_ORANGE);
  txt('THE REVENGE',  0,  28, 33, C_YELLOW, 'center', C_YELLOW);
  ctx.restore();

  txt('BEAT THEM ALL. TAKE BACK WHAT IS YOURS.', W/2, 175, 11, '#555');

  // Enemy showcase (swarms on left, bosses on right)
  const showcaseY = 310;
  const chars = [
    { name:'DELTA',    pts:'8 PTS',   x:  55, fn: drawDeltaGuard, scale:0.82, col:'#334466', txt:'#7fa8e0' },
    { name:'KURVA',    pts:'12 PTS',  x: 148, fn: drawKurva,       scale:0.80, col:'#cc2277', txt:'#ff7fc4' },
    { name:'TOSHO',    pts:'80 PTS',  x: 238, fn: drawTosho,       scale:0.82, col:'#1e7a48', txt:'#5fd896' },
    { name:'INKED',    pts:'110 PTS', x: 328, fn: drawAndrey,      scale:0.80, col:'#ff44bb', txt:'#ff8fd6' },
    { name:'DJOKOV',   pts:'140 PTS', x: 422, fn: drawDjokov,      scale:0.78, col:'#2244bb', txt:'#7f9aff' },
    { name:'YOVKO',    pts:'400 PTS', x: 523, fn: drawYovko,       scale:0.70, col: C_RED,    txt:'#ff6a6a' },
  ];
  chars.forEach(c => {
    ctx.save(); ctx.translate(c.x, showcaseY); ctx.scale(c.scale, c.scale);
    c.fn(Math.floor(tick / 20) % 2); ctx.restore();
    ctx.strokeStyle = c.col + '55'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(c.x, showcaseY, 30, 0, Math.PI*2); ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = 'bold 13px Courier New';
    ctx.fillStyle = '#fff';
    ctx.fillText(c.name, c.x, showcaseY + 49);

    ctx.font = 'bold 12px Courier New';
    ctx.fillStyle = c.txt;
    ctx.shadowColor = c.txt; ctx.shadowBlur = 6;
    ctx.fillText(c.pts, c.x, showcaseY + 65);
    ctx.shadowBlur = 0;
  });

  ctx.save(); ctx.translate(W/2, 490); drawStoyan(tick); ctx.restore();
  txt(playerName || 'YOU', W/2, 530, 10, '#555');

  if (Math.floor(tick / 18) % 2)
    txt('PRESS ENTER / TAP TO START', W/2, 578, 15, '#fff', 'center', '#fff');
  txt('L  LEADERBOARD', W/2, 613, 11, '#444');
  txt('ARROW KEYS / WASD  MOVE   |   SPACE  SHOOT', W/2, 636, 11, '#333');

  if (scores.length > 0)
    txt(`TOP: ${scores[0].name}  ${scores[0].score}`, W/2, 670, 11, C_ORANGE + '88');
}

// ── NAME ENTRY ────────────────────────────────────────────────────
function drawName() {
  ctx.fillStyle = C_BG; ctx.fillRect(0, 0, W, H);
  drawStars();
  ctx.save(); ctx.translate(W/2, 210); drawStoyan(tick); ctx.restore();

  txt('ENTER YOUR NAME', W/2, 310, 22, C_ORANGE, 'center', C_ORANGE);
  txt('WARRIOR', W/2, 336, 12, '#555');

  const bx = W/2 - 160, by = 360, bw = 320, bh = 58;
  ctx.fillStyle = '#0a0a18'; ctx.strokeStyle = C_ORANGE; ctx.lineWidth = 2;
  ctx.fillRect(bx, by, bw, bh); ctx.strokeRect(bx, by, bw, bh);
  txt(typingName + (Math.floor(tick / 15) % 2 ? '|' : ''), W/2, by + 37, 26, '#fff');

  if (Math.floor(tick / 20) % 2) txt('PRESS ENTER TO CONFIRM  •  TAP BOX TO TYPE', W/2, 458, 13, '#888');
  txt('ESC  back', W/2, 490, 11, '#444');
}

// ── PLAYING ───────────────────────────────────────────────────────
function drawPlaying() {
  ctx.fillStyle = C_BG; ctx.fillRect(0, 0, W, H);
  drawStars();

  if (screenFlash > 0) {
    ctx.fillStyle = `rgba(255,40,40,${screenFlash / 18})`;
    ctx.fillRect(0, 0, W, H);
  }

  ctx.strokeStyle = C_ORANGE + '22'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, H - 38); ctx.lineTo(W, H - 38); ctx.stroke();

  enemies.forEach(e => ETYPES[e.type].draw(e));

  eBullets.forEach(b => {
    const big = b.type === 'boss';
    ctx.fillStyle  = big ? '#ff8800' : C_EBULLET;
    ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = big ? 10 : 6;
    ctx.beginPath(); ctx.arc(b.x, b.y, big ? 5.5 : 3.5, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
  });

  // Health drops
  healthDrops.forEach(h => {
    ctx.font = '22px serif'; ctx.textAlign = 'center';
    ctx.fillStyle = C_RED; ctx.shadowColor = C_RED; ctx.shadowBlur = 10;
    ctx.fillText('♥', h.x, h.y);
    ctx.shadowBlur = 0;
  });

  drawParticles();
  player.draw();
  drawHUD();

  // Stage message
  if (waveMsg.timer > 0) {
    if (gameState === 'PLAYING') waveMsg.timer--;
    ctx.globalAlpha = Math.min(1, waveMsg.timer / 35);
    const big = waveMsg.text.includes('!') || waveMsg.text.includes('FINAL');
    txt(waveMsg.text, W/2, H/2 - 10,
        big ? 36 : 28, waveMsg.color || C_ORANGE, 'center', waveMsg.color || C_ORANGE);
    ctx.globalAlpha = 1;
  }

  // Pending enemies dots
  if (spawnQueue.length > 0) {
    ctx.fillStyle = '#ffffff22';
    for (let i = 0; i < spawnQueue.length; i++) {
      ctx.beginPath();
      ctx.arc(W/2 - (spawnQueue.length-1)*5 + i*10, H-20, 3, 0, Math.PI*2);
      ctx.fill();
    }
  }

  // Healing stage hint
  if (STAGES[currentStage]?.type === 'healing') {
    if (Math.floor(tick / 30) % 2)
      txt('HEALING WAVE - COLLECT HEARTS', W/2, H - 50, 11, '#44ff88');
  }
}

function drawHUD() {
  for (let i = 0; i < 3; i++) {
    ctx.font = '20px serif'; ctx.textAlign = 'left';
    ctx.fillStyle = i < player.lives ? C_RED : '#222';
    ctx.fillText('♥', 10 + i*26, 30);
  }
  ctx.font = '11px Courier New'; ctx.textAlign = 'center'; ctx.fillStyle = '#666';
  ctx.fillText(playerName, W/2, 18);
  // Level label
  const stageType  = STAGES[currentStage]?.type || '';
  const stageLabel = STAGES[currentStage] ? STAGES[currentStage].label : '';
  const levelColor = stageType.includes('boss') ? C_RED
                   : stageType === 'ambush'     ? C_RED
                   : stageType === 'healing'    ? '#44ff88'
                   : C_ORANGE;
  ctx.font = 'bold 13px Courier New'; ctx.textAlign = 'center';
  ctx.fillStyle = levelColor;
  ctx.fillText(stageLabel, W/2, 36);
  // Progress bar (50 levels)
  const barPct = (currentStage + 1) / STAGES.length;
  const barW = 120;
  ctx.fillStyle = '#111'; ctx.fillRect(W/2 - barW/2, 42, barW, 3);
  ctx.fillStyle = levelColor; ctx.fillRect(W/2 - barW/2, 42, barW * barPct, 3);

  ctx.font = 'bold 20px Courier New'; ctx.textAlign = 'right'; ctx.fillStyle = C_ORANGE;
  ctx.fillText(score, W - 14, 28);
  ctx.font = '10px Courier New'; ctx.fillStyle = '#444';
  ctx.fillText('SCORE', W - 14, 42);
}

// ── PAUSED ────────────────────────────────────────────────────────
function drawPaused() {
  // Render the frozen game scene behind the overlay
  drawPlaying();

  // Dim overlay
  ctx.fillStyle = 'rgba(0,0,0,0.62)';
  ctx.fillRect(0, 0, W, H);

  const pulse = 1 + Math.sin(tick / 18) * 0.05;
  ctx.save(); ctx.translate(W/2, H/2 - 30); ctx.scale(pulse, pulse);
  txt('PAUSED', 0, 0, 38, C_YELLOW, 'center', C_YELLOW);
  ctx.restore();

  if (Math.floor(tick / 18) % 2)
    txt('PRESS P / TAP TO RESUME', W/2, H/2 + 30, 15, '#fff', 'center', '#fff');
  txt('ESC ALSO RESUMES', W/2, H/2 + 56, 11, '#777');
}

// ── GAME OVER ─────────────────────────────────────────────────────
function drawGameOver() {
  ctx.fillStyle = C_BG; ctx.fillRect(0, 0, W, H);
  drawStars(); drawParticles(); updateParticles();

  ctx.save(); ctx.translate(W/2, 200);
  const s = 0.85 + Math.sin(tick / 12) * 0.04;
  ctx.scale(s, s); drawStoyan(tick); ctx.restore();

  txt('GAME OVER', W/2, 295, 52, C_RED, 'center', C_RED);
  txt(playerName, W/2, 338, 17, C_ORANGE);
  txt(`SCORE: ${score}`, W/2, 385, 30, C_YELLOW, 'center', C_YELLOW);

  const stageLabel = currentStage >= 0 ? STAGES[currentStage]?.label : '';
  txt(`Fell at: ${stageLabel}`, W/2, 425, 12, '#666');

  const isTop = scores.length === 0 || score >= (scores[0]?.score ?? 0);
  if (isTop) txt('NEW HIGH SCORE!', W/2, 455, 15, C_YELLOW, 'center', C_YELLOW);
  else {
    const rank = scores.filter(s => s.score > score).length + 1;
    txt(`RANK  #${rank}`, W/2, 455, 14, '#888');
  }

  if (Math.floor(tick / 18) % 2)
    txt('PRESS ENTER / TAP — LEADERBOARD', W/2, 500, 13, '#bbb');
}

// ── WIN SCREEN ────────────────────────────────────────────────────
function drawWin() {
  ctx.fillStyle = C_BG; ctx.fillRect(0, 0, W, H);
  drawStars(); drawParticles(); updateParticles();

  ctx.save(); ctx.translate(W/2, 180);
  const s = 0.9 + Math.sin(tick / 10) * 0.06;
  ctx.scale(s, s); drawStoyan(tick); ctx.restore();

  txt('REVENGE ACHIEVED', W/2, 280, 36, C_YELLOW, 'center', C_YELLOW);
  txt('YOVKO HAS FALLEN', W/2, 322, 18, C_ORANGE);
  txt(`FINAL SCORE: ${score}`, W/2, 375, 28, '#fff', 'center', '#fff');

  // Stars burst
  if (tick % 60 < 3) {
    for (let i = 0; i < 20; i++)
      spawnParticles(Math.random()*W, Math.random()*H/2, C_YELLOW, 3);
  }

  if (Math.floor(tick / 18) % 2)
    txt('PRESS ENTER / TAP — LEADERBOARD', W/2, 440, 13, C_YELLOW);
}

// ── LEADERBOARD ───────────────────────────────────────────────────
async function drawLeaderboard() {
  ctx.fillStyle = C_BG; ctx.fillRect(0, 0, W, H);
  drawStars();

  txt('LEADERBOARD', W/2, 56, 28, C_YELLOW, 'center', C_YELLOW);

  const online  = await fetchOnlineScores();
  const display = online || scores;
  txt(online ? 'GLOBAL SCORES' : 'LOCAL SCORES', W/2, 80, 10, '#444');

  if (display.length === 0) {
    txt('NO SCORES YET', W/2, 340, 18, '#444');
    txt('BE THE FIRST TO SEEK REVENGE!', W/2, 370, 13, '#333');
  } else {
    const startY = 118;
    display.slice(0, 10).forEach((s, i) => {
      const y    = startY + i * 50;
      const mine = s.name === playerName && s.score === score;
      ctx.fillStyle = mine ? '#110d00' : i%2===0 ? '#0a0a14' : '#070710';
      ctx.fillRect(28, y-28, W-56, 44);
      if (mine) { ctx.strokeStyle='#ff6a0055'; ctx.lineWidth=1; ctx.strokeRect(28,y-28,W-56,44); }

      const medal = i===0?'1.':i===1?'2.':i===2?'3.':`${i+1}.`;
      ctx.font='bold 15px Courier New'; ctx.textAlign='center';
      ctx.fillStyle = i < 3 ? C_YELLOW : '#555';
      ctx.fillText(medal, 58, y);

      ctx.font='bold 14px Courier New'; ctx.textAlign='left';
      ctx.fillStyle = mine ? C_ORANGE : '#ddd';
      ctx.fillText(s.name, 86, y);

      ctx.font='bold 17px Courier New'; ctx.textAlign='right';
      ctx.fillStyle = mine ? C_YELLOW : C_ORANGE;
      ctx.fillText(s.score.toLocaleString(), W-40, y);
    });
  }

  if (Math.floor(tick / 18) % 2)
    txt('PRESS ENTER / TAP TO PLAY AGAIN', W/2, H-42, 13, '#aaa');
  txt('Global scores via Firebase', W/2, H-20, 9, '#333');
}
