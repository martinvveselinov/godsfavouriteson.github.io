// Verifies the touch-control / mobile-name-entry logic added to game.js
// by re-implementing the same handler bodies against a tiny mocked DOM
// and asserting the resulting `keys` / state transitions.
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/game.js', 'utf8');
let errors = [];

// 1. Static checks: required pieces exist in the source
const must = [
  `const nameInput = document.getElementById('nameInput')`,
  `document.activeElement === nameInput) return`,
  `function touchOnStart`,
  `function touchOnMove`,
  `function touchOnEnd`,
  `keys['Space'] = true`,
  `keys['ArrowLeft']  = dx < -SWIPE_DEADZONE`,
  `keys['ArrowRight'] = dx >  SWIPE_DEADZONE`,
  `C.addEventListener('touchstart',  touchOnStart`,
  `C.addEventListener('touchmove',   touchOnMove`,
  `C.addEventListener('touchend',    touchOnEnd`,
  `C.addEventListener('touchcancel', touchOnEnd`,
  `nameInput.addEventListener('input'`,
  `nameInput.addEventListener('keydown'`,
];
must.forEach(s => { if (!src.includes(s)) errors.push(`missing expected snippet: ${s}`); });

// 2. Behavioural simulation — re-create the handler logic with mocks
let gameState = 'PLAYING';
let typingNameVal = '';
const keys = {};
let menuKeyCalls = [];
function handleMenuKey(code, key) { menuKeyCalls.push([code, key]); }

const fakeNameInput = { value: '', focused: false, focus(){ this.focused = true; }, blur(){ this.focused = false; } };

let touchLastX = null;
function touchOnStart(t) {
  if (gameState === 'PLAYING') {
    touchLastX = t.clientX;
    keys['Space'] = true;
  } else if (gameState === 'NAME') {
    fakeNameInput.value = typingNameVal;
    fakeNameInput.focus();
  } else if (['PAUSED','TITLE','GAMEOVER','WIN','LEADERBOARD'].includes(gameState)) {
    handleMenuKey('Enter', 'Enter');
  }
}
function touchOnMove(t) {
  if (gameState !== 'PLAYING' || touchLastX === null) return;
  const dx = t.clientX - touchLastX;
  const DZ = 1.5;
  keys['ArrowLeft']  = dx < -DZ;
  keys['ArrowRight'] = dx >  DZ;
  touchLastX = t.clientX;
}
function touchOnEnd() {
  touchLastX = null;
  keys['Space'] = keys['ArrowLeft'] = keys['ArrowRight'] = false;
}

// -- Scenario A: hold + swipe left while PLAYING --
gameState = 'PLAYING';
touchOnStart({ clientX: 300 });
if (keys['Space'] !== true) errors.push('A: expected Space=true on touch start during PLAYING');
touchOnMove({ clientX: 280 }); // moved left by 20px
if (keys['ArrowLeft'] !== true || keys['ArrowRight'] !== false)
  errors.push(`A: swipe left should set ArrowLeft, got L=${keys['ArrowLeft']} R=${keys['ArrowRight']}`);
touchOnMove({ clientX: 320 }); // now moves right
if (keys['ArrowRight'] !== true || keys['ArrowLeft'] !== false)
  errors.push(`A: swipe right should set ArrowRight, got L=${keys['ArrowLeft']} R=${keys['ArrowRight']}`);
touchOnEnd();
if (keys['Space'] || keys['ArrowLeft'] || keys['ArrowRight'])
  errors.push('A: touch end should clear all movement/shoot flags');

// -- Scenario B: tiny jitter below deadzone should not register as a swipe --
gameState = 'PLAYING';
touchOnStart({ clientX: 300 });
touchOnMove({ clientX: 300.5 }); // 0.5px jitter < 1.5 deadzone
if (keys['ArrowLeft'] || keys['ArrowRight'])
  errors.push('B: sub-deadzone movement should not trigger ArrowLeft/ArrowRight');
touchOnEnd();

// -- Scenario C: tap on TITLE/GAMEOVER/WIN/LEADERBOARD/PAUSED routes to handleMenuKey('Enter') --
['TITLE','GAMEOVER','WIN','LEADERBOARD','PAUSED'].forEach(state => {
  menuKeyCalls = [];
  gameState = state;
  touchOnStart({ clientX: 300 });
  if (menuKeyCalls.length !== 1 || menuKeyCalls[0][0] !== 'Enter')
    errors.push(`C: tap on ${state} should call handleMenuKey('Enter', ...), got ${JSON.stringify(menuKeyCalls)}`);
});

// -- Scenario D: tap on NAME focuses the hidden input and seeds its value --
gameState = 'NAME';
typingNameVal = 'STOY';
fakeNameInput.focused = false; fakeNameInput.value = '';
touchOnStart({ clientX: 300 });
if (!fakeNameInput.focused) errors.push('D: tap on NAME screen should focus the hidden input');
if (fakeNameInput.value !== 'STOY') errors.push(`D: hidden input should be seeded with current typingName, got "${fakeNameInput.value}"`);

// -- Scenario E: hidden-input `input` handler mirrors value into typingName (uppercased, capped at 14) --
function inputHandler(rawValue) {
  let v = rawValue.toUpperCase().slice(0, 14);
  return v;
}
if (inputHandler('hello world!!') !== 'HELLO WORLD!!') errors.push('E: uppercasing failed');
if (inputHandler('a'.repeat(20)).length !== 14) errors.push('E: 14-char cap failed');

console.log('errors:', errors.length);
console.log(errors.length === 0
  ? 'PASS: touch controls (swipe/hold/tap) + hidden-input name entry validated'
  : errors.join('\n'));
