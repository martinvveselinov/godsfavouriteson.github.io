// =================================================================
//  PLAYER — Stoyan Kolev
//  Depends on: config, audio, sprites, game (screenFlash, tick, keys)
// =================================================================

const player = {
  x: W / 2, y: H - 72,
  w: 52, h: 56,
  speed: 5,
  lives: 3,
  shootCD: 0, shootRate: 11,
  invincible: 0,
  bullets: [],

  reset() {
    this.x = W / 2; this.y = H - 72;
    this.lives = 3; this.bullets = [];
    this.invincible = 0; this.shootCD = 0;
  },

  update() {
    if (keys['ArrowLeft']  || keys['KeyA']) this.x = Math.max(this.w / 2 + 4,   this.x - this.speed);
    if (keys['ArrowRight'] || keys['KeyD']) this.x = Math.min(W - this.w / 2 - 4, this.x + this.speed);
    if (this.invincible > 0) this.invincible--;
    if (this.shootCD > 0) this.shootCD--;
    if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && this.shootCD === 0) {
      this.shootCD = this.shootRate;
      this.bullets.push({ x: this.x + 17, y: this.y - 24, vy: 11, rot: 0 });
      sfxShoot();
    }
    this.bullets = this.bullets.filter(b => {
      b.y -= b.vy;
      b.rot += 0.6; // spin while airborne
      return b.y > -20;
    });
  },

  hit() {
    if (this.invincible > 0) return;
    this.lives--; this.invincible = 130;
    sfxDeath();
    spawnParticles(this.x, this.y, C_ORANGE, 12);
    screenFlash = 12;
  },

  draw() {
    // Blink while invincible
    if (this.invincible > 0 && Math.floor(this.invincible / 6) % 2 === 0) return;
    ctx.save(); ctx.translate(this.x, this.y); ctx.scale(1.05, 1.05);
    drawStoyan(tick); ctx.restore();
    // Thrown machetes — spinning blades
    this.bullets.forEach(b => {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.shadowColor = C_PBULLET; ctx.shadowBlur = 8;
      // Blade
      ctx.fillStyle = C_PBULLET;
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
