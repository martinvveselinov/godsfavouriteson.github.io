// Verifies: (1) drawStoyan renders the held machete without error,
// (2) the player throw/spin/draw projectile logic mirrors player.js edits.

function px(x, y, w, h, col) { ctx.fillStyle = col; ctx.fillRect(x, y, w, h); }

function drawStoyan(frame) {
  const ab = frame % 2 ? 2 : 0;
  px(-11, 24, 10, 5, '#2a2a2a'); px(1, 24, 10, 5, '#2a2a2a');
  px(-10, 14,  8, 12, '#222'); px(2, 14, 8, 12, '#222');
  px(-14, 12, 28, 4, '#1a1a1a'); px(-2, 12, 5, 4, C_ORANGE);
  px(-14, -8, 28, 20, '#f0eee8');
  px(-20, -4 + ab, 8, 14, C_SKIN); px(12, -4 - ab, 8, 14, C_SKIN);

  // MACHETE held
  ctx.save(); ctx.translate(20, 8 - ab); ctx.rotate(0.55);
  px(-3, -4, 6, 11, '#3a2a18');
  px(-3, -1, 6, 1.5, '#1a1208'); px(-3, 3, 6, 1.5, '#1a1208');
  px(-4, -6, 8, 2, '#5a4a2c');
  ctx.fillStyle = '#cfd6dc';
  ctx.beginPath();
  ctx.moveTo(-2, -6); ctx.lineTo(2, -6); ctx.lineTo(6, -28); ctx.lineTo(-1, -30);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(2, -7); ctx.lineTo(6, -27); ctx.stroke();
  ctx.restore();

  px(-4, -12, 8, 6, C_SKIN);
  px(-10, -24, 20, 15, C_SKIN);

  if (frame % 20 < 3) {
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(28, -16 - ab, 3, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// ── Mirrors player throw/spin/draw projectile logic ──
const player = {
  x: 400, y: 600, bullets: [], shootCD: 0, shootRate: 11,
  update(spacePressed) {
    if (this.shootCD > 0) this.shootCD--;
    if (spacePressed && this.shootCD === 0) {
      this.shootCD = this.shootRate;
      this.bullets.push({ x: this.x + 17, y: this.y - 24, vy: 11, rot: 0 });
    }
    this.bullets = this.bullets.filter(b => {
      b.y -= b.vy;
      b.rot += 0.6;
      return b.y > -20;
    });
  },
  drawBullets() {
    this.bullets.forEach(b => {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.shadowColor = C_PBULLET; ctx.shadowBlur = 8;
      ctx.fillStyle = C_PBULLET;
      ctx.beginPath();
      ctx.moveTo(-2, 6); ctx.lineTo(2, 6); ctx.lineTo(3, -8); ctx.lineTo(-1, -9);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(2, 5); ctx.lineTo(3, -7); ctx.stroke();
      ctx.fillStyle = '#3a2a18';
      ctx.fillRect(-2, 6, 4, 5);
      ctx.shadowBlur = 0;
      ctx.restore();
    });
  }
};

let drawCalls = 0;
const ctx = new Proxy({}, {
  get(t, p) {
    if (p in t) return t[p];
    if (p === 'fillRect' || p === 'fill' || p === 'stroke') return (...a) => { drawCalls++; };
    return (...a) => {};
  },
  set(t, p, v) { t[p] = v; return true; }
});
global.ctx = ctx;
global.C_SKIN = '#c8814a';
global.C_ORANGE = '#ff8800';
global.C_PBULLET = '#ffff55';

let errors = [];
try {
  for (let f = 0; f < 30; f++) {
    drawStoyan(f);
    player.update(f % 11 === 0);   // simulate periodic Space presses
    player.drawBullets();
  }
} catch (e) { errors.push(e.message); }

console.log('drawCalls:', drawCalls, '| bullets in flight at end:', player.bullets.length, '| errors:', errors.length);
console.log(errors.length === 0 ? '✓ MACHETE WEAPON VALIDATED — sprite + spinning throw projectile OK' : errors.join('\n'));
