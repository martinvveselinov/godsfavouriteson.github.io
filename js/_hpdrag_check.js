const fs = require('fs');
const dir = __dirname;
let errors = [];

// 1. HP changes
const enemiesSrc = fs.readFileSync(dir + '/enemies.js', 'utf8');
if (!/delta:\s*\{\s*hp:4,/.test(enemiesSrc)) errors.push('delta hp is not 4');
if (!/kurva:\s*\{\s*hp:2,/.test(enemiesSrc)) errors.push('kurva hp is not 2');

// 2. game.js: drag-to-move + audio-resume snippets present
const gameSrc = fs.readFileSync(dir + '/game.js', 'utf8');
[
  'const rect   = C.getBoundingClientRect()',
  'const scaleX = W / rect.width',
  'player.x = Math.max(player.w / 2 + 4, Math.min(W - player.w / 2 - 4, player.x + dx))',
  'function resumeAudioIfNeeded',
  "document.addEventListener('visibilitychange'",
  "window.addEventListener('focus', resumeAudioIfNeeded)",
  "window.addEventListener('pageshow', resumeAudioIfNeeded)",
].forEach(s => { if (!gameSrc.includes(s)) errors.push('game.js missing: ' + s); });

// 3. Behavioural sim of the new drag-to-move math
const W = 600;
let player = { x: W/2, w: 52 };
function move(dxCss, displayedWidth) {
  const scaleX = W / displayedWidth;
  const dx = dxCss * scaleX;
  player.x = Math.max(player.w/2 + 4, Math.min(W - player.w/2 - 4, player.x + dx));
}
// On a 390px-wide phone screen, a 100px swipe should move the ship ~153.8 canvas px
player.x = W/2;
move(100, 390);
const moved = player.x - W/2;
if (Math.abs(moved - (100 * (600/390))) > 0.01) errors.push(`drag scaling wrong: moved ${moved}, expected ${100*(600/390)}`);
// Clamping: huge swipe shouldn't push the ship out of bounds
player.x = W/2; move(10000, 390);
if (player.x > W - player.w/2 - 4) errors.push('drag-to-move: right clamp failed');
player.x = W/2; move(-10000, 390);
if (player.x < player.w/2 + 4) errors.push('drag-to-move: left clamp failed');

console.log('errors:', errors.length);
console.log(errors.length === 0 ? 'PASS' : errors.join('\n'));
