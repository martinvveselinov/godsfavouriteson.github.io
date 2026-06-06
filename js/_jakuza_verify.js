// Fresh verification file (bypasses bash-mount cache staleness for sprites.js).
// Contains the redesigned drawJakuza exactly as confirmed via the Read tool.

function px(x, y, w, h, col) { ctx.fillStyle = col; ctx.fillRect(x, y, w, h); }

function drawJakuza(frame) {
  const ab = frame % 2 ? 2 : 0;
  const jb = frame % 2 ? 1 : 0; // belly jiggle

  // Shoes
  px(-14, 33, 12, 5, '#1a1a1a'); px(2, 33, 12, 5, '#1a1a1a');
  // Dark jeans/trousers
  px(-13, 18, 11, 17, '#262626'); px(2, 18, 11, 17, '#262626');
  px(-13, 18, 11, 3, '#1a1a1a'); px(2, 18, 11, 3, '#1a1a1a');

  // Heavyset torso — white tank top stretched over a belly
  ctx.fillStyle = '#f0eee8';
  ctx.beginPath(); ctx.ellipse(0, 4 + jb, 19, 18, 0, 0, Math.PI * 2); ctx.fill();
  px(-19, -12, 38, 18, '#f0eee8'); // chest block under arms
  // Tank-top shading / fabric folds
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  px(-16, 6 + jb, 32, 4, ctx.fillStyle);
  px(-13, 12 + jb, 26, 4, ctx.fillStyle);
  // Tank-top straps
  px(-14, -14, 5, 6, '#f0eee8'); px(9, -14, 5, 6, '#f0eee8');

  // Bare arms — thick, fully tattooed sleeves
  px(-29, -8 + ab, 13, 22, C_SKIN); px(16, -8 - ab, 13, 22, C_SKIN);
  ctx.strokeStyle = '#335577'; ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-26, -6+ab); ctx.bezierCurveTo(-22,-1,-27,5,-23,11);
  ctx.moveTo(-24, -2+ab); ctx.bezierCurveTo(-20, 2,-25, 8,-21,13);
  ctx.moveTo(20, -6-ab); ctx.bezierCurveTo(24,-1,19,5,23,11);
  ctx.moveTo(22, -2-ab); ctx.bezierCurveTo(26, 2,21, 8,25,13);
  ctx.stroke();
  ctx.fillStyle = '#335577';
  ctx.beginPath(); ctx.arc(-23, 4+ab, 2.2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(23, 4-ab, 2.2, 0, Math.PI*2); ctx.fill();
  // Hands
  ctx.fillStyle = C_SKIN;
  ctx.beginPath(); ctx.arc(-23, 16 + ab, 7, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(23, 16 - ab, 7, 0, Math.PI*2); ctx.fill();

  // Neck
  px(-5, -16, 10, 6, C_SKIN);
  // Head — round, balding/shaved
  ctx.fillStyle = C_SKIN;
  ctx.beginPath(); ctx.arc(0, -23, 12, 0, Math.PI * 2); ctx.fill();
  px(-11, -32, 22, 7, C_SKIN);
  px(-10, -31, 20, 2, 'rgba(255,255,255,0.15)'); // shaved-head shine
  px(-11, -31, 6, 4, '#3a2a18'); px(5, -31, 6, 4, '#3a2a18'); // side-hair fringe

  // FULL BEARD (thick, rounded, covering jaw/neck)
  ctx.fillStyle = '#3a2a18';
  ctx.beginPath();
  ctx.moveTo(-12, -22);
  ctx.bezierCurveTo(-14, -8, -8, 4, 0, 6);
  ctx.bezierCurveTo(8, 4, 14, -8, 12, -22);
  ctx.bezierCurveTo(8, -16, -8, -16, -12, -22);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  px(-9, -14, 18, 4, ctx.fillStyle); // beard highlight band
  // Moustache
  px(-7, -16, 14, 3, '#2c2010');

  // Eyes (small, set in a fuller face)
  px(-8, -25, 5, 3, '#000'); px(3, -25, 5, 3, '#000');
  // Brows
  px(-9, -28, 6, 2, '#3a2a18'); px(3, -28, 6, 2, '#3a2a18');
  // Visible mouth through beard gap
  px(-3, -12, 6, 2, '#7a4030');

  // Tattoo hints on neck
  ctx.strokeStyle = '#335577'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-4, -16); ctx.lineTo(-2, -11); ctx.stroke();
}

module.exports = { drawJakuza, px };

// ── Mock canvas + run ──────────────────────────────────────────────
let drawCalls = 0;
const ctx = new Proxy({}, {
  get(target, prop) {
    if (prop in target) return target[prop];
    if (typeof prop === 'string' && (prop === 'fillRect' || prop === 'fill' || prop === 'stroke')) {
      return (...args) => { drawCalls++; };
    }
    return (...args) => {};
  },
  set(target, prop, value) { target[prop] = value; return true; }
});
global.ctx = ctx;
global.C_SKIN = '#c8814a';

let errors = [];
for (let frame = 0; frame < 2; frame++) {
  try { drawJakuza(frame); } catch (e) { errors.push(`frame ${frame}: ${e.message}`); }
}

console.log('drawCalls:', drawCalls, '| errors:', errors.length);
if (errors.length) console.log(errors.join('\n'));
console.log(errors.length === 0 ? '✓ JAKUZA REDESIGN VALIDATED — no runtime errors' : '✗ FAILED');
