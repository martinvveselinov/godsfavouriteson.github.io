// =================================================================
//  PLAYER — Stoyan Kolev
//  Depends on: config, audio, sprites, game (screenFlash, tick, keys)
// =================================================================

// ── WEAPONS ───────────────────────────────────────────────────────
// The default is the single spinning machete. Power-up crates dropped by
// enemies (see game.js) swap in a temporary weapon for `dur` ticks, after
// which the player reverts to `single`. `col` tints both the bullet and the
// HUD indicator so each weapon reads at a glance.
const WEAPONS = {
  single: { name: 'MACHETE', rate: 11, dur: 0,   col: C_PBULLET },
  spread: { name: 'SPREAD',  rate: 12, dur: 560, col: C_ORANGE  },
  rapid:  { name: 'RAPID',   rate: 5,  dur: 560, col: C_CYAN    },
  twin:   { name: 'TWIN',    rate: 10, dur: 560, col: C_GREEN   },
  pierce: { name: 'PIERCE',  rate: 14, dur: 560, col: C_MAGENTA },
};

function mkBullet(x, y, vx, vy, col, dmg, pierce) {
  return { x, y, vx, vy, rot: 0, col, dmg, pierce, hits: pierce > 0 ? [] : null };
}

const player = {
  x: W / 2, y: H - 72,
  w: 52, h: 56,
  speed: 5,
  lives: 3, maxLives: 3,
  shootCD: 0,
  invincible: 0,
  weapon: 'single', weaponTimer: 0,
  bullets: [],

  // ── ROGUELITE BUILD (permanent for the run, chosen at level-ups) ──
  level: 1, xp: 0, xpNext: 12,
  baseWeapon: 'single',   // what timed pickups revert to (ARSENAL upgrades this)
  dmgBonus: 0,            // +damage per shot (SHARP BLADES)
  pierceBonus: 0,         // +pierce per shot (PIERCING EDGE)
  rateMult: 1,            // fire-rate multiplier, <1 = faster (QUICK HANDS)
  pickupR: 26,            // pickup pickup radius (MAGNET)
  weaponDurMult: 1,       // timed-weapon duration multiplier (ENDURANCE)

  reset() {
    this.x = W / 2; this.y = H - 72;
    this.lives = 3; this.maxLives = 3; this.bullets = [];
    this.invincible = 0; this.shootCD = 0;
    this.speed = 5;
    this.weapon = 'single'; this.weaponTimer = 0;
    this.level = 1; this.xp = 0; this.xpNext = 12;
    this.baseWeapon = 'single';
    this.dmgBonus = 0; this.pierceBonus = 0; this.rateMult = 1;
    this.pickupR = 26; this.weaponDurMult = 1;
  },

  // Fire the current weapon's bullet pattern from the muzzle. Build bonuses
  // (dmgBonus / pierceBonus) fold into every bullet.
  fire() {
    const bx = this.x + 2, by = this.y - 24, col = WEAPONS[this.weapon].col;
    const db = this.dmgBonus, pb = this.pierceBonus;
    switch (this.weapon) {
      case 'spread':
        [-0.26, 0, 0.26].forEach(a =>
          this.bullets.push(mkBullet(bx, by, Math.sin(a) * 11, Math.cos(a) * 11, col, 1 + db, pb)));
        break;
      case 'twin':
        this.bullets.push(mkBullet(bx - 11, by, 0, 11, col, 1 + db, pb));
        this.bullets.push(mkBullet(bx + 11, by, 0, 11, col, 1 + db, pb));
        break;
      case 'rapid':
        this.bullets.push(mkBullet(bx, by, 0, 13, col, 1 + db, pb));
        break;
      case 'pierce':
        this.bullets.push(mkBullet(bx, by, 0, 12, col, 2 + db, 3 + pb));
        break;
      default:
        this.bullets.push(mkBullet(bx, by, 0, 11, col, 1 + db, pb));
    }
  },

  update() {
    if (keys['ArrowLeft']  || keys['KeyA']) this.x = Math.max(this.w / 2 + 4,   this.x - this.speed);
    if (keys['ArrowRight'] || keys['KeyD']) this.x = Math.min(W - this.w / 2 - 4, this.x + this.speed);
    if (this.invincible > 0) this.invincible--;
    if (this.shootCD > 0) this.shootCD--;
    if (this.weaponTimer > 0 && --this.weaponTimer === 0) this.weapon = this.baseWeapon;
    if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && this.shootCD === 0) {
      this.shootCD = Math.max(3, Math.round(WEAPONS[this.weapon].rate * this.rateMult));
      this.fire();
      spawnParticles(this.x + 2, this.y - 26, C_PBULLET, 2); // muzzle flash
      sfxShoot();
    }
    this.bullets = this.bullets.filter(b => {
      b.x += b.vx; b.y -= b.vy;
      b.rot += 0.6; // spin while airborne
      return b.y > -20 && b.x > -30 && b.x < W + 30;
    });
  },

  hit() {
    if (this.invincible > 0) return;
    this.lives--; this.invincible = 130;
    sfxDeath();
    spawnParticles(this.x, this.y, C_ORANGE, 12);
    screenFlash = 12; shake = 11;
  },

  draw() {
    // Blink while invincible
    if (this.invincible > 0 && Math.floor(this.invincible / 6) % 2 === 0) return;
    ctx.save(); ctx.translate(this.x, this.y); ctx.scale(1.05, 1.05);
    drawStoyan(tick); ctx.restore();
    // Thrown machetes — spinning blades (tinted by the active weapon)
    this.bullets.forEach(b => {
      const col = b.col || C_PBULLET;
      const s   = b.pierce > 0 ? 1.5 : 1; // heavier piercing blade reads bigger
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.scale(s, s);
      ctx.shadowColor = col; ctx.shadowBlur = 8;
      // Blade
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(-2, 6); ctx.lineTo(2, 6); ctx.lineTo(3, -8); ctx.lineTo(-1, -9);
      ctx.closePath(); ctx.fill();
      // Edge glint
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(2, 5); ctx.lineTo(3, -7); ctx.stroke();
      // Handle
      ctx.fillStyle = '#3a2a18';
      ctx.fillRect(-2, 6, 4, 5);
      ctx.shadowBlur = 0;
      ctx.restore();
    });
  },
};
