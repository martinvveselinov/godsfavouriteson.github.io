// =================================================================
//  SPRITES — stars, particles, and all character pixel art
//  All character functions draw centered at (0,0).
//  Caller does: ctx.save() / translate(x,y) / scale(s,s) / draw() / ctx.restore()
// =================================================================

// ── STARS ─────────────────────────────────────────────────────────
const STARS = Array.from({ length: 90 }, () => ({
  x: Math.random() * W,
  y: Math.random() * H,
  r: Math.random() * 1.4 + 0.3,
  s: Math.random() * 0.25 + 0.08,
  a: Math.random() * 0.6 + 0.2,
}));

function drawStars() {
  STARS.forEach(s => {
    s.y += s.s;
    if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
    ctx.globalAlpha = s.a;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
  });
  ctx.globalAlpha = 1;
}

// ── PIXEL RECT SHORTHAND ──────────────────────────────────────────
function px(x, y, w, h, col) { ctx.fillStyle = col; ctx.fillRect(x, y, w, h); }

// ── PARTICLES ─────────────────────────────────────────────────────
let particles = [];

function spawnParticles(x, y, col, n = 10) {
  for (let i = 0; i < n; i++) {
    const a  = Math.random() * Math.PI * 2;
    const sp = 1.5 + Math.random() * 3.5;
    particles.push({
      x, y,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      life: 1, decay: 0.025 + Math.random() * 0.025,
      r: 3 + Math.random() * 3, col,
    });
  }
}

function updateParticles() {
  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.vy += 0.12;
    p.life -= p.decay; p.r *= 0.96;
  });
}

function drawParticles() {
  particles.forEach(p => {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.col;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
  });
  ctx.globalAlpha = 1;
}

// ── STOYAN KOLEV (player) ─────────────────────────────────────────
function drawStoyan(frame) {
  const ab = frame % 2 ? 2 : 0; // arm bob — athletic readiness shift

  // Boots
  px(-11, 24, 10, 5, '#2a2a2a'); px(1, 24, 10, 5, '#2a2a2a');
  // Legs (dark combat pants)
  px(-10, 14,  8, 12, '#222'); px(2, 14, 8, 12, '#222');
  // Belt + buckle
  px(-14, 12, 28, 4, '#1a1a1a'); px(-2, 12, 5, 4, C_ORANGE);

  // Athletic torso — white tank top (Achilles-style warrior build)
  px(-14, -8, 28, 20, '#f0eee8');
  px(-14, -8,  5, 20, 'rgba(0,0,0,0.08)'); // shadow side
  // Pec/ab definition
  ctx.fillStyle = 'rgba(0,0,0,0.07)';
  px(-9, -3, 8, 4, ctx.fillStyle); px(1, -3, 8, 4, ctx.fillStyle);
  px(-7, 3, 14, 3, ctx.fillStyle);

  // Bare muscular arms with tattoo sleeve (left/gun-side)
  px(-20, -4 + ab, 8, 14, C_SKIN); px(12, -4 - ab, 8, 14, C_SKIN);
  ctx.strokeStyle = '#3a6a8a'; ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-18, -2+ab); ctx.bezierCurveTo(-15, 2, -19, 6, -16, 10);
  ctx.moveTo(-16, 0+ab);  ctx.bezierCurveTo(-13, 4, -17, 7, -14, 11);
  ctx.stroke();

  // MACHETE — held in right hand, blade angled forward/down, ready to throw
  ctx.save(); ctx.translate(20, 8 - ab); ctx.rotate(0.55);
  // Wrapped grip handle
  px(-3, -4, 6, 11, '#3a2a18');
  px(-3, -1, 6, 1.5, '#1a1208'); px(-3, 3, 6, 1.5, '#1a1208'); // wrap bands
  // Hilt guard
  px(-4, -6, 8, 2, '#5a4a2c');
  // Wide angled blade
  ctx.fillStyle = '#cfd6dc';
  ctx.beginPath();
  ctx.moveTo(-2, -6); ctx.lineTo(2, -6); ctx.lineTo(6, -28); ctx.lineTo(-1, -30);
  ctx.closePath(); ctx.fill();
  // Blade edge glint
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(2, -7); ctx.lineTo(6, -27); ctx.stroke();
  ctx.restore();

  // Neck
  px(-4, -12, 8, 6, C_SKIN);
  // Head — square jaw, weathered warrior face
  px(-10, -24, 20, 15, C_SKIN);

  // FULL BEARD (close-cropped, rugged)
  ctx.fillStyle = '#3a2a18';
  ctx.beginPath();
  ctx.moveTo(-9, -16);
  ctx.bezierCurveTo(-10, -8, -5, -2, 0, -1);
  ctx.bezierCurveTo(5, -2, 10, -8, 9, -16);
  ctx.bezierCurveTo(6, -12, -6, -12, -9, -16);
  ctx.closePath(); ctx.fill();
  px(-3, -10, 6, 2, '#2c2010'); // moustache

  // ACHILLES-STYLE OPEN-FACE HELMET — domed bronze/gold shell + hinged cheek guards
  ctx.fillStyle = '#9c8552';
  ctx.beginPath(); ctx.arc(0, -25, 11, Math.PI, Math.PI * 2); ctx.fill();
  px(-11, -25, 22, 5, '#9c8552');
  px(-11, -27, 22, 3, '#b89c63'); // dome highlight
  ctx.fillStyle = '#7a6840';
  px(-11, -22, 22, 2, ctx.fillStyle); // brim rim
  // Riveted cheek guards (hinged plates framing the face)
  ctx.fillStyle = '#8c7548';
  ctx.beginPath();
  ctx.moveTo(-11, -21); ctx.lineTo(-11, -3); ctx.lineTo(-6, -5); ctx.lineTo(-7, -21);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(11, -21); ctx.lineTo(11, -3); ctx.lineTo(6, -5); ctx.lineTo(7, -21);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5a4a2c'; // rivets
  ctx.beginPath(); ctx.arc(-9, -18, 0.9, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(9, -18, 0.9, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(-9, -10, 0.9, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(9, -10, 0.9, 0, Math.PI*2); ctx.fill();

  // Eyes — focused, determined gaze
  px(-7, -19, 4, 3, '#4a3a2a'); px(3, -19, 4, 3, '#4a3a2a');
  px(-6, -18, 2, 2, '#cfae7a'); px(4, -18, 2, 2, '#cfae7a');
  // Brow
  px(-8, -21, 5, 1.5, '#2c2010'); px(3, -21, 5, 1.5, '#2c2010');
  // Nose / determined mouth
  px(-1, -14, 2, 3, '#b07050');

  // Throw-flick glint when releasing a blade
  if (frame % 20 < 3) {
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(28, -16 - ab, 3, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// ── DJOKOV (round angry blue guy) ────────────────────────────────
function drawDjokov(frame) {
  const ab = frame % 2 ? 2 : 0;
  // Round body
  ctx.fillStyle = '#2244bb';
  ctx.beginPath(); ctx.ellipse(0, 10, 16, 18, 0, 0, Math.PI * 2); ctx.fill();
  px(-10, -2, 5, 18, '#1a3399'); // jacket shadow
  // Arms (bob)
  ctx.fillStyle = C_SKIN;
  ctx.beginPath(); ctx.arc(-20, 6 + ab, 6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc( 20, 6 - ab, 6, 0, Math.PI * 2); ctx.fill();
  // Head
  ctx.fillStyle = C_SKIN;
  ctx.beginPath(); ctx.arc(0, -14, 12, 0, Math.PI * 2); ctx.fill();
  // Side hair + top
  px(-12, -24, 3, 14, '#1a0800'); px(9, -24, 3, 14, '#1a0800');
  px(-10, -25, 20, 6, '#1a0800');
  // Angry red eyes
  px(-7, -19, 4, 4, C_RED); px(3, -19, 4, 4, C_RED);
  // Furrowed brows
  ctx.save(); ctx.translate(-5, -23); px(0, 0, 6, 2, '#111'); ctx.restore();
  ctx.save(); ctx.translate(5, -23); ctx.rotate(0.25); px(0, 0, 6, 2, '#111'); ctx.restore();
  // Gritting teeth
  px(-6, -12, 12, 3, '#111');
  px(-5, -12, 3, 3, '#ddd'); px(-1, -12, 3, 3, '#ddd'); px(3, -12, 3, 3, '#ddd');
}

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

// ── ANDREY INKED (slim tattooed guy) ─────────────────────────────
function drawAndrey(frame) {
  const ab = frame % 2 ? 3 : -3;
  // Legs
  px(-7, 18, 5, 12, '#111'); px(2, 18, 5, 12, '#111');
  // Body
  px(-10, -4, 20, 24, '#0d0d0d');
  // Tattoo lines
  ctx.strokeStyle = '#ff44bb'; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-8,  0); ctx.bezierCurveTo(-11,  6, -5, 12, -8, 18);
  ctx.moveTo( 6,  2); ctx.bezierCurveTo(  9,  8,  5, 13,  7, 18);
  ctx.stroke();
  // Running arms
  px(-18, 0 + ab, 8, 5, C_SKIN); px(10, 0 - ab, 8, 5, C_SKIN);
  // Neck chain
  ctx.strokeStyle = '#aaa'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, -1, 6, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  // Head
  ctx.fillStyle = C_SKIN;
  ctx.beginPath(); ctx.arc(0, -13, 10, 0, Math.PI * 2); ctx.fill();
  // Slick hair
  px(-9, -23, 18, 7, '#000'); px(-9, -25, 3, 12, '#000');
  // Pink shades
  px(-8, -17, 5, 3, '#ff44bb'); px(2, -17, 5, 3, '#ff44bb');
  px(-1, -17, 2, 3, '#220011');
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

// ── DELTA GUARD (swarm) ───────────────────────────────────────────
function drawDeltaGuard(frame) {
  const ab = frame % 2 ? 1 : 0;
  // Boots
  px(-9, 24, 8, 5, '#222233'); px(1, 24, 8, 5, '#222233');
  // Legs (armoured)
  px(-9, 14, 8, 12, '#2a2a44'); px(1, 14, 8, 12, '#2a2a44');
  // Body armour
  px(-12, -6, 24, 22, '#1e2244');
  px(-12, -6, 4, 22, '#161630'); px(8, -6, 4, 22, '#161630'); // arm plates
  // Belt + utility
  px(-12, 12, 24, 4, '#111'); px(0, 12, 4, 4, C_ORANGE);
  // Arms
  px(-18, -2, 7, 12, '#2a2a44'); px(11, -2, 7, 12, '#2a2a44');
  // Baton (right hand)
  ctx.fillStyle = '#666';
  ctx.fillRect(17, -4 + ab, 3, 18);
  ctx.fillStyle = '#888';
  ctx.fillRect(16, -4 + ab, 5, 4);
  // Neck
  px(-3, -10, 6, 5, C_SKIN);
  // Helmet
  px(-10, -26, 20, 18, '#1a1a30');
  px(-12, -14, 24, 6, '#111'); // visor brim
  // Visor (dark reflective)
  px(-9, -23, 18, 8, '#0a0a22');
  ctx.fillStyle = '#1144aa44';
  ctx.fillRect(-9, -23, 18, 8); // blue tint
  // Chin guard
  px(-7, -10, 14, 3, '#1a1a30');
  // Delta symbol on chest
  ctx.strokeStyle = C_ORANGE; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -3); ctx.lineTo(-5, 6); ctx.lineTo(5, 6); ctx.closePath();
  ctx.stroke();
}

// ── KURVA (swarm) ─────────────────────────────────────────────────
function drawKurva(frame) {
  const ab = frame % 2 ? 2 : -2;
  // Heels / shoes
  px(-7, 26, 5, 4, '#ff44aa'); px(2, 26, 5, 4, '#ff44aa');
  px(-7, 28, 2, 3, '#ff44aa'); px(6, 28, 2, 3, '#ff44aa'); // stiletto
  // Legs (fishnet implied by colour)
  px(-7, 14, 5, 14, '#cc3388'); px(2, 14, 5, 14, '#cc3388');
  // Body (tight dress)
  px(-9, -4, 18, 20, '#ee1199');
  // Sequin sparkles
  ctx.fillStyle = '#ffccee'; 
  [[-4,2],[3,0],[-1,8],[4,6],[-5,12],[2,10]].forEach(([dx,dy]) => {
    ctx.beginPath(); ctx.arc(dx, dy, 1.5, 0, Math.PI*2); ctx.fill();
  });
  // Arms (animated)
  px(-17, -2 + ab, 9, 5, C_SKIN); px(8, -2 - ab, 9, 5, C_SKIN);
  // Shoulder straps
  px(-8, -6, 4, 4, '#ee1199'); px(4, -6, 4, 4, '#ee1199');
  // Neck + chest
  px(-3, -9, 6, 6, C_SKIN);
  // Head
  ctx.fillStyle = C_SKIN;
  ctx.beginPath(); ctx.arc(0, -18, 10, 0, Math.PI*2); ctx.fill();
  // Long blonde hair — crown plus flowing strands past the shoulders
  ctx.fillStyle = '#f0d264';
  ctx.beginPath(); ctx.arc(-2, -22, 12, Math.PI, 0); ctx.fill();
  px(-12, -28, 24, 8, '#f0d264');
  ctx.beginPath();
  ctx.moveTo(-12, -25); ctx.bezierCurveTo(-17, -10, -15, 6, -11, 17);
  ctx.lineTo(-5, 16); ctx.bezierCurveTo(-9, 5, -10, -10, -7, -23);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(12, -25); ctx.bezierCurveTo(17, -10, 15, 6, 11, 17);
  ctx.lineTo(5, 16); ctx.bezierCurveTo(9, 5, 10, -10, 7, -23);
  ctx.closePath(); ctx.fill();
  // Highlight streaks
  ctx.strokeStyle = '#fff6dc'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-9, -20); ctx.lineTo(-8, 11);
  ctx.moveTo(9, -20); ctx.lineTo(8, 11);
  ctx.stroke();
  // Eyes (heavy makeup)
  px(-6, -20, 3, 3, '#000'); px(2, -20, 3, 3, '#000');
  px(-7, -21, 5, 2, '#330000'); px(1, -21, 5, 2, '#330000'); // mascara
  // Lips
  px(-3, -14, 6, 3, C_RED);
}

// ── JAKUZA "YAKUDZATA" (boss — bearded, heavyset, tattooed) ───────
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
