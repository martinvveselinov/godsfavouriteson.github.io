// Verification copy — auto-generated to bypass a bash-mount cache issue.
// Mirrors sprites.js exactly as confirmed via the Read tool. Safe to delete.

// ── PIXEL RECT SHORTHAND ──────────────────────────────────────────
function px(x, y, w, h, col) { ctx.fillStyle = col; ctx.fillRect(x, y, w, h); }

// ── TOSHO KUKATA (green guy with a hook) ─────────────────────────
function drawTosho(frame) {
  const hb   = frame % 2 ? 3 : 0;   // hook bob
  const step = frame % 2 ? 2 : -2;  // walk-cycle leg offset

  // Boots
  px(-9, 26, 8, 6, '#161616'); px(2, 26, 8, 6, '#161616');
  // Cargo pants (olive green)
  px(-9, 14 + (step>0?step:0), 8, 14, '#3a5126');
  px( 2, 14 + (step<0?-step:0), 8, 14, '#3a5126');
  px(-9, 14, 8, 3, '#2c3d1d'); px(2, 14, 8, 3, '#2c3d1d'); // pocket seams
  // Belt + hanging chain
  px(-10, 11, 20, 3, '#1a1a1a');
  px(-2, 12, 2, 2, '#1a1a1a');
  ctx.strokeStyle = '#999'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(2, 14); ctx.quadraticCurveTo(7, 19, 4, 24); ctx.stroke();
  // Torso — black tee, broad build
  px(-12, -8, 24, 22, '#161616');
  px(-12, -8,  5, 22, '#0a0a0a'); // shadow side
  // Right arm (hook side)
  px(8, -2, 7, 12, C_SKIN);
  px(8, -2, 7, 12, 'rgba(0,0,0,0.12)');
  // Left arm — bare, tattoo sleeve
  px(-19, -2, 7, 12, C_SKIN);
  px(-19, 0, 7, 3, '#1f6b46'); px(-18, 4, 5, 2, '#1f6b46'); px(-19, 7, 6, 2, '#1f6b46');
  // Neck + thick chain necklace
  px(-3, -12, 6, 4, C_SKIN);
  ctx.strokeStyle = '#cfcfcf'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, -8, 7, 0.05 * Math.PI, 0.95 * Math.PI); ctx.stroke();
  for (let i = -5; i <= 5; i += 2.5) px(i, -2 + Math.abs(i)*0.15, 1.6, 1.6, '#cfcfcf');
  // Head — bald, heavy brow, side profile
  ctx.fillStyle = C_SKIN;
  ctx.beginPath(); ctx.arc(0, -19, 10, 0, Math.PI * 2); ctx.fill();
  px(-10, -27, 20, 6, C_SKIN);
  px(-9, -25, 18, 2, 'rgba(255,255,255,0.18)'); // bald scalp shine
  px(-8, -22, 7, 3, '#7a5a40'); // brow
  px(-7, -20, 4, 3, '#000');   // glaring eye
  px(-3, -13, 7, 2, '#7a4030'); // grimace
  // THE HOOK — silver cuff + curved blade (animated bob)
  px(13, 1 + hb, 6, 7, '#888');
  ctx.strokeStyle = '#d8d8d8'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(16, 4 + hb); ctx.lineTo(16, 13 + hb);
  ctx.arc(13, 13 + hb, 3, 0, Math.PI * 1.4);
  ctx.stroke();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(16, 5 + hb); ctx.lineTo(16, 11 + hb); ctx.stroke();
}

// ── YOVKO TIHOV (the BOSS — bodybuilder, pink hair) ───────────────
function drawYovko(frame) {
  const ab = frame % 2 ? 3 : 0;
  const fl = frame % 2 ? 1 : 0; // flex pulse for muscle highlights

  // Thick legs + boots
  px(-15, 22, 12, 14, '#1a1a1a'); px(3,  22, 12, 14, '#1a1a1a');
  px(-17, 32, 14,  5, '#0a0a0a'); px(2,  32, 14,  5, '#0a0a0a');

  // Massive bodybuilder torso — tight black tee, V-taper
  px(-20, -8, 40, 30, '#161616');
  px(-20, -8,  6, 30, '#0a0a0a'); px(14, -8, 6, 30, '#0a0a0a'); // shading sides
  // Pec/ab striations (flex highlight alternates)
  ctx.fillStyle = fl ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.05)';
  px(-13, -4, 11, 5, ctx.fillStyle); px(2, -4, 11, 5, ctx.fillStyle);
  px(-9, 4, 18, 3, ctx.fillStyle);
  px(-9, 9, 18, 3, ctx.fillStyle);

  // Massive arms (bob) — bulging biceps
  px(-33, -6 + ab, 14, 9, C_SKIN); px(19, -6 + ab, 14, 9, C_SKIN);
  ctx.fillStyle = C_SKIN;
  ctx.beginPath(); ctx.arc(-27, 6 + ab, 9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc( 27, 6 + ab, 9, 0, Math.PI * 2); ctx.fill();
  // Bicep peak highlight
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  px(-31, -4 + ab, 5, 3, ctx.fillStyle); px(26, -4 + ab, 5, 3, ctx.fillStyle);

  // Trap/neck mass
  px(-9, -16, 18, 9, C_SKIN);

  // Head — broad jaw, stubble
  ctx.fillStyle = C_SKIN;
  ctx.beginPath(); ctx.arc(0, -23, 12, 0, Math.PI * 2); ctx.fill();
  px(-10, -16, 20, 6, C_SKIN); // jawline mass
  ctx.fillStyle = 'rgba(110,80,60,0.45)'; // stubble shadow
  px(-9, -15, 18, 5, ctx.fillStyle);

  // PINK HAIR — short spiky/buzzed with longer top spikes
  ctx.fillStyle = '#ff5fc0';
  px(-12, -34, 24, 7, '#ff5fc0');
  ctx.beginPath();
  ctx.moveTo(-11, -33); ctx.lineTo(-9, -41); ctx.lineTo(-5, -33);
  ctx.lineTo(-2, -42); ctx.lineTo( 2, -33); ctx.lineTo( 6, -41);
  ctx.lineTo( 9, -33); ctx.closePath(); ctx.fill();
  px(-13, -30, 4, 9, '#ff5fc0'); px(9, -30, 4, 9, '#ff5fc0'); // sideburns/fade

  // Glowing eyes (menace)
  ctx.fillStyle = C_RED; ctx.shadowColor = C_RED; ctx.shadowBlur = 10;
  px(-9, -25, 6, 5, C_RED); px(3, -25, 6, 5, C_RED);
  ctx.shadowBlur = 0;
  // Heavy brow
  px(-10, -28, 7, 2, '#cc4499'); px(3, -28, 7, 2, '#cc4499');
  // Snarling mouth
  px(-7, -15, 14, 3, '#000');
  px(-6, -15, 3, 3, '#eee'); px(-1, -15, 3, 3, '#eee'); px(4, -15, 3, 3, '#eee');
  // Scar
  ctx.strokeStyle = '#8a4020'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(8, -27); ctx.lineTo(10, -19); ctx.stroke();
}

// ── YAN KICK (boss) ───────────────────────────────────────────────
function drawYanKick(frame) {
  const kick = frame % 2;
  // Thai boxing shorts (red + gold stripes)
  px(-11, 6, 22, 18, '#cc1100');
  px(-11, 6, 4, 18, '#ffcc00'); // left stripe
  px(7, 6, 4, 18, '#ffcc00');   // right stripe
  // Belt knot
  px(-3, 22, 6, 3, '#fff');

  // Legs + feet (kick pose alternates)
  if (kick) {
    // Right kick extended
    px(-10, 24, 8, 10, '#cc1100');    // standing left leg
    px(-11, 32, 10, 4, '#222');       // left shoe
    px(2, 18, 12, 8, '#cc1100');      // kicking thigh
    px(12, 10, 8, 8, '#cc1100');      // kicking shin
    ctx.fillStyle = '#333';           // kicking foot
    ctx.beginPath(); ctx.ellipse(23, 8, 9, 5, -0.4, 0, Math.PI*2); ctx.fill();
  } else {
    px(-10, 24, 8, 10, '#cc1100');
    px(2, 24, 8, 10, '#cc1100');
    px(-11, 32, 10, 4, '#222');
    px(1, 32, 10, 4, '#222');
  }

  // Shirtless muscular torso (skin)
  px(-12, -12, 24, 20, '#c8814a');
  // Abs definition
  px(-9, -4,  4, 4, '#aa6830'); px(-3, -4,  4, 4, '#aa6830');
  px( 3, -4,  4, 4, '#aa6830');
  px(-9,  2,  4, 4, '#aa6830'); px(-3,  2,  4, 4, '#aa6830');
  px( 3,  2,  4, 4, '#aa6830');
  // Pecs
  px(-9, -10, 8, 6, '#b87038'); px(1, -10, 8, 6, '#b87038');

  // Arms with boxing wraps
  const al = kick ? -4 : 0, ar = kick ? 4 : 0;
  px(-24, -8 + al, 12, 10, '#ffcc00'); // left arm wrap
  px(12,  -8 + ar, 12, 10, '#ffcc00'); // right arm wrap
  // Boxing gloves (fists)
  ctx.fillStyle = '#cc1100';
  ctx.beginPath(); ctx.arc(-26, 4 + al, 7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc( 26, 4 + ar, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff'; // glove wrist tape
  px(-29, -1 + al, 6, 3, '#fff'); px(23, -1 + ar, 6, 3, '#fff');

  // Neck
  px(-3, -16, 6, 4, '#c8814a');
  // Head
  ctx.fillStyle = '#c8814a';
  ctx.beginPath(); ctx.arc(0, -22, 10, 0, Math.PI * 2); ctx.fill();
  // Buzz-cut hair (dark, close-cropped)
  px(-9, -31, 18, 6, '#1a1208');
  px(-9, -29, 18, 2, 'rgba(255,255,255,0.10)');
  // Brow + focused eyes
  px(-7, -25, 5, 2, '#3a2410'); px(2, -25, 5, 2, '#3a2410');
  px(-6, -23, 3, 3, '#000'); px(3, -23, 3, 3, '#000');
  // Determined grimace
  px(-4, -16, 8, 2, '#7a4030');
}

module.exports = { drawTosho, drawYovko, drawYanKick, px };
