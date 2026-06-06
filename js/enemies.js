// =================================================================
//  ENEMIES
//  Swarm types : delta, kurva
//  Boss types  : tosho, yankick, jakuza, inked, jokov, yovko
//  States      : entering | formation | diving | boss_fight | ambush_dash
// =================================================================

const ETYPES = {

  // ── SWARM: DELTA GUARD ─────────────────────────────────────────
  delta: {
    hp:1, pts:8, w:36, h:46, col:'#334466',
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
    hp:1, pts:12, w:34, h:44, col:'#cc2277',
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
    hp:40, pts:80, w:50, h:58, col:'#1e7a48',
    bossMove(e) {
      e.bossTimer++;
      e.x = W/2 + Math.sin(e.bossTimer*0.022)*(W/2-100);
      e.y = 170 + Math.sin(e.bossTimer*0.014)*40;
    },
    shoot(e) {
      if (e.state==='entering') return;
      if (Math.random() < 0.008) {
        const a = Math.atan2(player.y-e.y, player.x-e.x);
        eBullets.push({x:e.x,y:e.y+26,vx:Math.cos(a)*2.8,vy:Math.abs(Math.sin(a))*2.8+1,type:'hook',life:180});
        eBullets.push({x:e.x,y:e.y+26,vx:0,vy:3.2,type:'n'});
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
      type:spec.type, x:W/2, y:-110, vx:2.2,
      state:'entering', isBoss:true,
      targetX:W/2, targetY:130,
      hp:ETYPES[spec.type].hp, pts:ETYPES[spec.type].pts,
      frame:0, bossTimer:0, divePhase:0, diveAngle:0, diveSpd:0,
      rushing:false, rushBaseY:0, rushTimer:0,
      comboTimer:0, comboCount:0,
      charging:false, chargeAngle:0, chargeTimer:0,
      shootAngle:0,
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
  };
}
