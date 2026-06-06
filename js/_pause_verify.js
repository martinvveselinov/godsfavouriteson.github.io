// Mirrors the new pause logic exactly as edited in game.js / screens.js / main.js.

let gameState  = 'PLAYING';
let pausedFrom = 'PLAYING';
let tick = 0;
let waveMsg = { text: 'LEVEL 5', timer: 100, color: '#ffaa00' };
const sfxMenu = () => {};

function handleMenuKey(code, key) {
  if (gameState === 'PLAYING' && (code === 'KeyP' || code === 'Escape')) {
    sfxMenu(); pausedFrom = gameState; gameState = 'PAUSED';
    return;
  } else if (gameState === 'PAUSED' && (code === 'KeyP' || code === 'Escape' || code === 'Enter')) {
    sfxMenu(); gameState = pausedFrom;
    return;
  }
}

// Mirrors the waveMsg.timer guard added to drawPlaying()
function simulateDrawTick() {
  if (waveMsg.timer > 0) {
    if (gameState === 'PLAYING') waveMsg.timer--;
  }
}

let errors = [];
try {
  // 1. Initially playing — timer ticks down
  simulateDrawTick(); simulateDrawTick();
  if (waveMsg.timer !== 98) errors.push(`expected 98 after 2 ticks, got ${waveMsg.timer}`);

  // 2. Press P — should pause
  handleMenuKey('KeyP', 'p');
  if (gameState !== 'PAUSED') errors.push(`expected PAUSED, got ${gameState}`);

  // 3. While paused, timer should NOT decrement
  const before = waveMsg.timer;
  simulateDrawTick(); simulateDrawTick(); simulateDrawTick();
  if (waveMsg.timer !== before) errors.push(`timer changed while paused: ${before} -> ${waveMsg.timer}`);

  // 4. Press Escape — should resume back to PLAYING
  handleMenuKey('Escape', 'Escape');
  if (gameState !== 'PLAYING') errors.push(`expected PLAYING after resume, got ${gameState}`);

  // 5. Timer resumes ticking
  const before2 = waveMsg.timer;
  simulateDrawTick();
  if (waveMsg.timer !== before2 - 1) errors.push(`timer didn't resume ticking: ${before2} -> ${waveMsg.timer}`);

  // 6. Pause again via Escape, resume via Enter
  handleMenuKey('Escape', 'Escape');
  if (gameState !== 'PAUSED') errors.push(`expected PAUSED via Escape, got ${gameState}`);
  handleMenuKey('Enter', 'Enter');
  if (gameState !== 'PLAYING') errors.push(`expected PLAYING via Enter resume, got ${gameState}`);

  // 7. Pause toggle should NOT fire from non-PLAYING states (e.g. TITLE)
  gameState = 'TITLE';
  handleMenuKey('KeyP', 'p');
  if (gameState !== 'TITLE') errors.push(`pause incorrectly triggered from TITLE, got ${gameState}`);

} catch (e) { errors.push(e.message); }

console.log('errors:', errors.length);
console.log(errors.length === 0 ? '✓ PAUSE LOGIC VALIDATED — toggle, resume, and frozen waveMsg timer all correct' : errors.join('\n'));
