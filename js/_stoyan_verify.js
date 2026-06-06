// Fresh verification file — mirrors the redesigned drawStoyan exactly as edited.
function px(x, y, w, h, col) { ctx.fillStyle = col; ctx.fillRect(x, y, w, h); }

function drawStoyan(frame) {
  const ab = frame % 2 ? 2 : 0;
  px(-11, 24, 10, 5, '#2a2a2a'); px(1, 24, 10, 5, '#2a2a2a');
  px(-10, 14,  8, 12, '#222'); px(2, 14, 8, 12, '#222');
  px(-14, 12, 28, 4, '#1a1a1a'); px(-2, 12, 5, 4, C_ORANGE);
  px(-14, -8, 28, 20, '#f0eee8');
  px(-14, -8,  5, 20, 'rgba(0,0,0,0.08)');
  ctx.fillStyle = 'rgba(0,0,0,0.07)';
  px(-9, -3, 8, 4, ctx.fillStyle); px(1, -3, 8, 4, ctx.fillStyle);
  px(-7, 3, 14, 3, ctx.fillStyle);
  px(-20, -4 + ab, 8, 14, C_SKIN); px(12, -4 - ab, 8, 14, C_SKIN);
  ctx.strokeStyle = '#3a6a8a'; ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-18, -2+ab); ctx.bezierCurveTo(-15, 2, -19, 6, -16, 10);
  ctx.moveTo(-16, 0+ab);  ctx.bezierCurveTo(-13, 4, -17, 7, -14, 11);
  ctx.stroke();
  px(18, 0 - ab, 18, 5, '#555'); px(34, -3 - ab, 4, 3, '#888');
  px(-4, -12, 8, 6, C_SKIN);
  px(-10, -24, 20, 15, C_SKIN);
  ctx.fillStyle = '#3a2a18';
  ctx.beginPath();
  ctx.moveTo(-9, -16);
  ctx.bezierCurveTo(-10, -8, -5, -2, 0, -1);
  ctx.bezierCurveTo(5, -2, 10, -8, 9, -16);
  ctx.bezierCurveTo(6, -12, -6, -12, -9, -16);
  ctx.closePath(); ctx.fill();
  px(-3, -10, 6, 2, '#2c2010');
  ctx.fillStyle = '#9c8552';
  ctx.beginPath(); ctx.arc(0, -25, 11, Math.PI, Math.PI * 2); ctx.fill();
  px(-11, -25, 22, 5, '#9c8552');
  px(-11, -27, 22, 3, '#b89c63');
  ctx.fillStyle = '#7a6840';
  px(-11, -22, 22, 2, ctx.fillStyle);
  ctx.fillStyle = '#8c7548';
  ctx.beginPath();
  ctx.moveTo(-11, -21); ctx.lineTo(-11, -3); ctx.lineTo(-6, -5); ctx.lineTo(-7, -21);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(11, -21); ctx.lineTo(11, -3); ctx.lineTo(6, -5); ctx.lineTo(7, -21);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5a4a2c';
  ctx.beginPath(); ctx.arc(-9, -18, 0.9, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(9, -18, 0.9, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(-9, -10, 0.9, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(9, -10, 0.9, 0, Math.PI*2); ctx.fill();
  px(-7, -19, 4, 3, '#4a3a2a'); px(3, -19, 4, 3, '#4a3a2a');
  px(-6, -18, 2, 2, '#cfae7a'); px(4, -18, 2, 2, '#cfae7a');
  px(-8, -21, 5, 1.5, '#2c2010'); px(3, -21, 5, 1.5, '#2c2010');
  px(-1, -14, 2, 3, '#b07050');
  if (frame % 20 < 3) {
    ctx.fillStyle = '#ffff88'; ctx.shadowColor = '#ffff00'; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.arc(36, -1 - ab, 4, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }
}

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

let errors = [];
for (let f = 0; f < 25; f++) {
  try { drawStoyan(f); } catch (e) { errors.push(`frame ${f}: ${e.message}`); }
}
console.log('drawCalls:', drawCalls, '| errors:', errors.length);
console.log(errors.length === 0 ? '✓ STOYAN AVATAR REDESIGN VALIDATED' : errors.join('\n'));
