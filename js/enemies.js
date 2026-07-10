// =================================================================
//  ENEMIES
//  Swarm types : delta, kurva
//  Boss types  : tosho, yankick, jakuza, inked, jokov, yovko
//  States      : entering | formation | diving | boss_fight | ambush_dash
// =================================================================

const ETYPES = {

  // ── SWARM: DELTA GUARD ─────────────────────────────────────────
  delta: {
    hp:4, pts:8, w:36, h:46, col:'#334466',
    shoot(e) {
      if (e.state==='entering') return;
      if (Math.random() < 0.001*diffMult())
        eBullets.push({x:e.x,y:e.y+22,vx:0,vy:3.0,type:'n'});
    },
    draw(e) {
      ctx.save(); ctx.translate(e.x,e.y); ctx.scale(0.84,0.84);
      drawDeltaGuard(e.frame%2); ctx.restore();
    },
  },

  // ── SWARM: KURVA ───────────────────────────────────────────────
  kurva: {
    hp:2, pts:12, w:34, h:44, col:'#cc2277',
    shoot(e) {
      if (e.state==='entering') return;
      if (Math.random() < 0.0014*diffMult()) {
        [-0.3,0.3].forEach(off =>
          eBullets.push({x:e.x,y:e.y+20,vx:off*2.8,vy:3.5,type:'spread'})
        );
      }
    },
    draw(e) {
      ctx.save(); ctx.translate(e.x,e.y); ctx.scale(0.82,0.82);
      drawKurva(e.frame%2); ctx.restore();
    },
  },

  // ── BOSS: TOSHO KUKATA ─────────────────────────────────────────
  tosho: {
    hp:35, pts:80, w:50, h:58, col:'#1e7a48',
    summon: { types:['delta','kurva'], interval:330, cap:2, count:2, budget:10 },
    specialEvery:280,
    special(e) {
      // Alternate a radial cleaver-fan with an aimed 5-shot volley
      e.specialIx = (e.specialIx||0) + 1;
      if (e.specialIx % 2) bossRing(e, 12, 2.6); else bossVolley(e, 5, 3.2);
      sfxSniper();
    },
    bossMove(e) {
      e.bossTimer++;
      // Sway faster and dip lower when enraged — crowds the player
      const spd = 0.022 * (e.rage||1);
      e.x = W/2 + Math.sin(e.bossTimer*spd)*(W/2-100);
      e.y = 170 + Math.sin(e.bossTimer*0.014)*40;
    },
    shoot(e) {
      if (e.state==='entering') return;
      // Frequent and aimed — active without being oppressive
      if (Math.random() < 0.016*(e.rage||1)) {
        const a = Math.atan2(player.y-e.y, player.x-e.x);
        eBullets.push({x:e.x,y:e.y+26,vx:Math.cos(a)*3.0,vy:Math.abs(Math.sin(a))*3.0+1,type:'hook',life:180});
        eBullets.push({x:e.x,y:e.y+26,vx:Math.cos(a)*2.2,vy:Math.abs(Math.sin(a))*2.2+2.2,type:'n',life:200});
      }
    },
    draw(e) {
      ctx.save(); ctx.translate(e.x,e.y); ctx.scale(1.05,1.05);
      drawTosho(e.frame%2); ctx.restore();
      bossHpBar(e,80,'#00ff88','TOSHO KUKATA');
    },
  },

  // ── BOSS: YAN KICK ─────────────────────────────────────────────
  yankick: {
    hp:80, pts:120, w:52, h:62, col:'#cc1100',
    summon: { types:['kurva'], interval:300, cap:2, count:2, budget:10 },
    specialEvery:220,
    special(e) { bossVolley(e, 3, 4.2); bossVolley(e, 3, 3.0); sfxSniper(); },
    bossMove(e) {
      e.bossTimer++;
      const t = e.bossTimer;
      e.x = W/2 + Math.sin(t*0.032)*(W/2-90);
      e.y = 155 + Math.abs(Math.sin(t*0.018))*30 + Math.sin(t*0.026)*20;
      if (!e.rushing && t%80===40) {
        e.rushing=true; e.rushBaseY=e.y; e.rushTimer=0;
      }
      if (e.rushing) {
        e.rushTimer++;
        e.y = e.rushBaseY + Math.sin(e.rushTimer/18*Math.PI)*100;
        if (e.rushTimer>=18) { e.rushing=false; }
      }
    },
    shoot(e) {
      if (e.state==='entering') return;
      e.comboTimer = (e.comboTimer||0);
      if (e.comboTimer > 0) {
        e.comboTimer--;
        if (e.comboTimer%6===0) {
          const dir = (e.comboCount++%2===0) ? 1 : -1;
          eBullets.push({x:e.x,y:e.y+22,vx:dir*2.5,vy:4.5,type:'spread',life:160});
        }
        return;
      }
      if (Math.random() < 0.010) {
        e.comboTimer=24; e.comboCount=0;
        const dir = e.x>W/2 ? -1 : 1;
        eBullets.push({x:e.x,y:e.y+22,vx:dir*3.5,vy:3.8,type:'n',life:160});
      }
    },
    draw(e) {
      ctx.save(); ctx.translate(e.x,e.y); ctx.scale(1.05,1.05);
      drawYanKick(e.frame%2); ctx.restore();
      bossHpBar(e,80,'#ff6600','YAN KICK');
    },
  },

  // ── BOSS: JAKUZA ──────────────────────────────────────────────
  jakuza: {
    hp:100, pts:150, w:72, h:80, col:'#222244',
    summon: { types:['delta'], interval:360, cap:3, count:2, budget:12 },
    specialEvery:290,
    special(e) { bossRing(e, 10, 2.4); sfxSniper(); },
    bossMove(e) {
      e.bossTimer++;
      e.x += e.vx;
      if (e.x<80)   { e.x=80;   e.vx= Math.abs(e.vx)+0.015; }
      if (e.x>W-80) { e.x=W-80; e.vx=-(Math.abs(e.vx)+0.015); }
      e.y = 170 + Math.sin(e.bossTimer*0.018)*28;
    },
    shoot(e) {
      if (e.state==='entering') return;
      if (Math.random() < 0.009) {
        for (let i=-3; i<=3; i++)
          eBullets.push({x:e.x,y:e.y+36,vx:i*1.5,vy:3.8,type:'boss',life:220});
        sfxHit();
      }
    },
    draw(e) {
      ctx.save(); ctx.translate(e.x,e.y); ctx.scale(1.1,1.1);
      drawJakuza(e.frame%2); ctx.restore();
      bossHpBar(e,90,'#8888ff','JAKUZA');
    },
  },

  // ── BOSS: ANDREY INKED ────────────────────────────────────────
  inked: {
    hp:60, pts:110, w:46, h:56, col:'#ff44bb',
    summon: { types:['kurva'], interval:300, cap:2, count:2, budget:10 },
    specialEvery:210,
    special(e) { bossVolley(e, 5, 4.0); sfxSniper(); },
    bossMove(e) {
      e.bossTimer++;
      if (e.bossTimer%32===0) {
        e.vx=(Math.random()-0.5)*9;
        e.vy=(Math.random()-0.5)*4.5;
      }
      e.x+=e.vx; e.y+=e.vy;
      if (e.x<55)   { e.x=55;   e.vx= Math.abs(e.vx); }
      if (e.x>W-55) { e.x=W-55; e.vx=-Math.abs(e.vx); }
      if (e.y<80)   { e.y=80;   e.vy= Math.abs(e.vy); }
      if (e.y>270)  { e.y=270;  e.vy=-Math.abs(e.vy); }
    },
    shoot(e) {
      if (e.state==='entering') return;
      if (Math.random() < 0.014) {
        [-0.38,0,0.38].forEach(off =>
          eBullets.push({x:e.x,y:e.y+24,vx:off*3.5,vy:4.2,type:'spread'})
        );
      }
    },
    draw(e) {
      ctx.save(); ctx.translate(e.x,e.y); ctx.scale(1.0,1.0);
      drawAndrey(e.frame%2); ctx.restore();
      bossHpBar(e,80,'#ff44bb','ANDREY INKED');
    },
  },

  // ── BOSS: DJOKOV ──────────────────────────────────────────────
  jokov: {
    hp:100, pts:140, w:54, h:62, col:'#2244bb',
    summon: { types:['delta','kurva'], interval:340, cap:3, count:2, budget:12 },
    specialEvery:270,
    special(e) { bossRing(e, 14, 3.0); sfxSniper(); },
    bossMove(e) {
      e.bossTimer++;
      if (!e.charging) {
        e.x = W/2 + Math.sin(e.bossTimer*0.016)*(W/2-110);
        e.y = 190 + Math.sin(e.bossTimer*0.009)*35;
        if (e.bossTimer%100===0 && e.bossTimer>80) {
          e.charging=true;
          e.chargeAngle=Math.atan2(player.y-e.y, player.x-e.x);
          e.chargeTimer=0;
        }
      } else {
        e.x += Math.cos(e.chargeAngle)*7;
        e.y += Math.sin(e.chargeAngle)*7;
        e.chargeTimer++;
        if (e.chargeTimer>22 || e.y>330) {
          e.charging=false;
          e.x=Math.max(80,Math.min(W-80,e.x));
          e.y=Math.max(120,Math.min(290,e.y));
        }
      }
    },
    shoot(e) {
      if (e.state==='entering') return;
      if (Math.random() < 0.010) {
        e.shootAngle=(e.shootAngle||0)+0.28;
        for (let i=0; i<6; i++) {
          const a = e.shootAngle+(Math.PI*2/6)*i;
          eBullets.push({x:e.x,y:e.y+26,vx:Math.cos(a)*3.0,vy:Math.abs(Math.sin(a))*3.0+0.5,type:'n',life:190});
        }
        sfxHit();
      }
    },
    draw(e) {
      ctx.save(); ctx.translate(e.x,e.y); ctx.scale(1.18,1.18);
      drawDjokov(e.frame%2); ctx.restore();
      bossHpBar(e,90,'#4488ff','DJOKOV');
    },
  },

  // ── BOSS: YOVKO TIHOV ─────────────────────────────────────────
  yovko: {
    hp:280, pts:400, w:80, h:84, col:'#990000',
    summon: { types:['kurva','delta'], interval:280, cap:3, count:2, budget:12 },
    specialEvery:200,
    special(e) {
      e.specialIx = (e.specialIx||0) + 1;
      if (e.specialIx % 2) bossRing(e, 16, 3.0); else bossVolley(e, 7, 3.6);
      sfxSniper();
    },
    bossMove(e) {
      e.bossTimer++;
      const phase = e.hp<140 ? 2 : 1;
      const spd   = phase===2 ? 3.6 : 2.2;
      e.x += e.vx*spd;
      if (e.x<85)   { e.x=85;   e.vx= Math.abs(e.vx); }
      if (e.x>W-85) { e.x=W-85; e.vx=-Math.abs(e.vx); }
      e.y = 160 + Math.sin(e.bossTimer*0.016)*(phase===2 ? 52 : 30);
      if (phase===2 && e.bossTimer%38===0) {
        const a = Math.atan2(player.y-e.y, player.x-e.x);
        [-0.18,0,0.18].forEach(da =>
          eBullets.push({x:e.x,y:e.y+32,vx:Math.cos(a+da)*3.6,vy:Math.sin(a+da)*3.6+0.4,type:'boss',life:280})
        );
      }
    },
    shoot(e) {
      if (e.state==='entering' || e.state==='ambush_dash') return;
      const phase = e.hp<140 ? 2 : 1;
      if (Math.random() < (phase===2 ? 0.016 : 0.010)) {
        const count = phase===2 ? 7 : 5;
        for (let i=-(count-1)/2; i<=(count-1)/2; i++)
          eBullets.push({x:e.x,y:e.y+34,vx:i*1.5,vy:3.6,type:'boss',life:250});
        sfxHit();
      }
    },
    draw(e) {
      ctx.save(); ctx.translate(e.x,e.y); ctx.scale(1.18,1.18);
      drawYovko(e.frame%2); ctx.restore();
      if (e.state!=='ambush_dash') {
        bossHpBar(e,100,C_RED,'YOVKO TIHOV');
        if (e.hp<140) {
          ctx.font='bold 10px Courier New'; ctx.textAlign='center';
          ctx.fillStyle=C_YELLOW; ctx.shadowColor=C_YELLOW; ctx.shadowBlur=8;
          ctx.fillText('PHASE 2 - ENRAGED', e.x, e.y-70);
          ctx.shadowBlur=0;
        }
      }
    },
  },
};

// ── BOSS HP BAR ───────────────────────────────────────────────────
function bossHpBar(e, bw, col, label) {
  const pct = Math.max(0, e.hp/ETYPES[e.type].hp);
  px(e.x-bw/2, e.y-55, bw,       7, '#110000');
  px(e.x-bw/2, e.y-55, bw*pct,   7, 'hsl('+Math.round(pct*120)+',100%,50%)');
  ctx.strokeStyle='#fff'; ctx.lineWidth=1;
  ctx.strokeRect(e.x-bw/2, e.y-55, bw, 7);
  ctx.font='bold 10px Courier New'; ctx.textAlign='center';
  ctx.fillStyle=col; ctx.fillText(label, e.x, e.y-60);
}

function diffMult() { return 1 + currentStage*0.04; }

// ── BOSS AGGRESSION LAYER ─────────────────────────────────────────
// Bosses used to just drift and take pot-shots. tickBossAI() runs every
// frame during boss_fight and layers three behaviours on top of each boss's
// own shoot():
//   • MINION SUMMONS — periodically spits swarm enemies at the player. They
//     fight (and drop loot) normally, so they double as bonus piñatas — a
//     way to re-arm mid-boss.
//   • SPECIAL ATTACK — a telegraphed heavy bullet pattern on a cooldown.
//   • RAGE — 1 → ~1.9 as HP drops; summons come faster, specials fire sooner.
// Per-boss knobs live in ETYPES: `summon`, `special`, `specialEvery`.

// Shared bullet patterns bosses can fire as their special.
function bossRing(e, n, spd) {
  for (let i = 0; i < n; i++) {
    const a = (Math.PI*2/n)*i + e.frame*0.02;
    eBullets.push({ x:e.x, y:e.y, vx:Math.cos(a)*spd, vy:Math.sin(a)*spd*0.7 + 0.8, type:'boss', life:230 });
  }
}
function bossVolley(e, count, spd) {
  const a = Math.atan2(player.y - e.y, player.x - e.x);
  for (let i = -(count-1)/2; i <= (count-1)/2; i++)
    eBullets.push({ x:e.x, y:e.y+20, vx:Math.cos(a)*spd + i*0.9, vy:Math.abs(Math.sin(a))*spd + 1.2, type:'boss', life:220 });
}

// Spawn one swarm minion bursting out of the boss, already diving at you.
function summonMinion(e) {
  const cfg  = ETYPES[e.type].summon;
  const type = cfg.types[Math.floor(Math.random()*cfg.types.length)];
  const m = createEnemy({ type, col: Math.floor(Math.random()*5), row: 0, totalCols: 5 });
  m.x = e.x; m.y = e.y + 16;
  m.state = 'diving';
  m.diveAngle = Math.atan2(player.y - m.y, player.x - m.x);
  m.diveSpd = 3.0; m.divePhase = 0;
  enemies.push(m);
  spawnParticles(e.x, e.y + 16, ETYPES[type].col, 8);
}

function tickBossAI(e) {
  const def = ETYPES[e.type];
  e.rage = 1 + (1 - e.hp/def.hp) * 0.5;

  // Minion summoning — capped both by how many are alive at once (`cap`) and
  // by a lifetime `budget` for the whole fight, so it never spawns forever.
  if (def.summon) {
    e.summonTimer = (e.summonTimer||0) + e.rage;
    const alive     = enemies.filter(en => !en.isBoss && en.state !== 'ambush_dash').length;
    const remaining = def.summon.budget - (e.summonedTotal||0);
    if (e.summonTimer >= def.summon.interval && alive < def.summon.cap && remaining > 0) {
      e.summonTimer = 0; e.summoning = 16;
      const n = Math.min(def.summon.count, def.summon.cap - alive, remaining);
      for (let i = 0; i < n; i++) summonMinion(e);
      e.summonedTotal = (e.summonedTotal||0) + n;
      sfxBoss();
    }
  }
  if (e.summoning > 0) e.summoning--;

  // Telegraphed special attack
  if (def.special) {
    if (e.telegraph > 0) {
      if (--e.telegraph === 0) def.special(e);
    } else {
      e.specialCD = (e.specialCD == null ? (def.specialEvery||220) : e.specialCD) - e.rage;
      if (e.specialCD <= 0) { e.specialCD = def.specialEvery||220; e.telegraph = 22; sfxCharge(); }
    }
  }
}

// ── ENEMY SPECIAL MOVE: SNIPER BURST ──────────────────────────────
// Any swarm enemy in formation can occasionally "lock on": it flashes a
// telegraph ring + aim line (drawn in screens.js) for ~0.8s, then fires a
// tight aimed 3-shot straight at the player's position. Telegraphed on
// purpose so it's dodgeable — it adds tension without being cheap.
function tickEnemySpecial(e) {
  if (e.isBoss) return;
  if (e.charging) {
    if (--e.charge <= 0) {
      e.charging = false;
      const a = Math.atan2(player.y - e.y, player.x - e.x);
      [-0.22, 0, 0.22].forEach(da =>
        eBullets.push({ x:e.x, y:e.y+18, vx:Math.cos(a+da)*4.2, vy:Math.sin(a+da)*4.2, type:'boss', life:230 })
      );
      sfxSniper(); spawnParticles(e.x, e.y, C_YELLOW, 7);
    }
    return;
  }
  if (e.state === 'formation' && spawnQueue.length === 0 &&
      Math.random() < 0.0006 * diffMult()) {
    e.charging = true; e.charge = 46; sfxCharge();
  }
}

// ── SHARED STATE ──────────────────────────────────────────────────
let enemies  = [];
let eBullets = [];
let formPhase   = 0;
let formSpeed   = 0.012;
let formAmp     = 130;
let spawnQueue  = [];
let spawnTimer  = 0;
let SPAWN_DELAY = 40;
let waveActive  = false;

// ── MOVEMENT STATE MACHINE ────────────────────────────────────────
function moveEnemy(e) {

  if (e.state==='ambush_dash') {
    e.x += e.vx;
    if (e.frame%8===0) {
      const a = Math.atan2(player.y-e.y, player.x-e.x);
      for (let i=-1; i<=1; i++)
        eBullets.push({x:e.x,y:e.y+32,vx:Math.cos(a+i*0.25)*4,vy:Math.sin(a+i*0.25)*4+0.5,type:'boss',life:200});
    }
    return;
  }

  if (e.state==='boss_fight') {
    ETYPES[e.type].bossMove(e);
    return;
  }

  if (e.state==='entering') {
    const dx=e.targetX-e.x, dy=e.targetY-e.y;
    e.x += dx*0.09 + (Math.sign(dx)||0)*0.5;
    e.y += dy*0.09 + 1.8;
    if (Math.abs(dx)<4 && e.y>=e.targetY-4) {
      e.x=e.targetX; e.y=e.targetY;
      e.state = e.isBoss ? 'boss_fight' : 'formation';
      if (e.isBoss) e.bossTimer=0;
      beep(330,0.06,'square',0.08);
    }
    return;
  }

  if (e.state==='formation') {
    const fx = W/2 + Math.sin(formPhase)*formAmp;
    e.x = Math.max(30, Math.min(W-30, e.targetX+(fx-W/2)));
    e.y = e.targetY;
    const divers    = enemies.filter(en=>en.state==='diving').length;
    const maxDivers = currentStage<8 ? 1 : 2;
    if (divers<maxDivers && spawnQueue.length===0
        && Math.random() < 0.0005*diffMult()*Math.max(1,currentStage)) {
      e.state     = 'diving';
      e.diveAngle = Math.atan2(player.y-e.y, player.x-e.x);
      e.diveSpd   = Math.min(8.5, 3.5+currentStage*0.05);
      e.divePhase = 0;
    }
    return;
  }

  if (e.state==='diving') {
    e.divePhase++;
    if (e.frame%3===0) spawnParticles(e.x, e.y, ETYPES[e.type].col, 1); // dive trail
    const spd = e.diveSpd;
    if (e.type==='kurva') {
      e.x += Math.cos(e.diveAngle)*spd + Math.sin(e.divePhase*0.3)*4;
      e.y += Math.sin(e.diveAngle)*spd + 1.5;
    } else {
      e.x += Math.cos(e.diveAngle)*spd;
      e.y += Math.sin(e.diveAngle)*spd + 0.5;
    }
    if (e.y>H+60 || e.x<-80 || e.x>W+80) {
      e.y=-70-Math.random()*30;
      e.x=e.targetX;
      e.state='entering';
    }
    return;
  }
}

// ── ENEMY FACTORY ─────────────────────────────────────────────────
function createEnemy(spec) {
  if (spec.ambushDash) {
    const fromLeft = Math.random()<0.5;
    return {
      type:'yovko', x:fromLeft?-100:W+100, y:220+(Math.random()-0.5)*80,
      vx:fromLeft?9:-9, state:'ambush_dash',
      targetX:W/2, targetY:220, isBoss:false,
      hp:999, pts:0, frame:0, bossTimer:0,
      divePhase:0, diveAngle:0, diveSpd:0,
    };
  }
  if (spec.boss) {
    return {
      type:spec.type, x:W/2, y:-110, vx:2.2, vy:0,
      // `vy` matters for velocity-driven bosses (e.g. ANDREY INKED's bossMove,
      // which only re-randomizes vx/vy every 32 ticks): without an initial
      // value here it's `undefined` on the very first boss_fight tick, so
      // `e.y += e.vy` becomes NaN and stays NaN forever (the y-bounds clamps
      // never trigger on NaN). A NaN translate() is a silent no-op per the
      // Canvas spec, so the sprite freezes wherever the transform last was —
      // the canvas origin / top-left corner — exactly the "boss rushes to a
      // corner and gets stuck" bug.
      state:'entering', isBoss:true,
      targetX:W/2, targetY:130,
      hp:ETYPES[spec.type].hp, pts:ETYPES[spec.type].pts,
      frame:0, bossTimer:0, divePhase:0, diveAngle:0, diveSpd:0,
      rushing:false, rushBaseY:0, rushTimer:0,
      comboTimer:0, comboCount:0,
      charging:false, chargeAngle:0, chargeTimer:0,
      shootAngle:0,
      // Boss aggression layer (tickBossAI)
      rage:1, summonTimer:0, summoning:0, summonedTotal:0, specialCD:null, telegraph:0, specialIx:0,
      // Damage-based loot bleed
      dmgSinceLoot:0, lootThreshold:null,
    };
  }
  const {type,col,row,totalCols} = spec;
  const spacing = Math.min(85,(W-80)/totalCols);
  const targetX = W/2 + (col-(totalCols-1)/2)*spacing;
  const targetY = 108 + row*78;
  return {
    type, isBoss:false,
    x:targetX, y:-70-Math.random()*50, vx:0,
    state:'entering', targetX, targetY,
    hp:ETYPES[type].hp, pts:ETYPES[type].pts,
    frame:Math.floor(Math.random()*30),
    divePhase:0, diveAngle:0, diveSpd:4,
    charging:false, charge:0,
  };
}
