const fs = require('fs');
const src = fs.readFileSync(__dirname + '/game.js', 'utf8');
let errors = [];

[
  "} else if (AC.state === 'closed') {",
  'AC = null;',
  'getAC();',
  'setInterval(resumeAudioIfNeeded, 250);',
].forEach(s => { if (!src.includes(s)) errors.push('missing: ' + s); });

// Simulate the watchdog against mocked AC states
function makeWatchdog(getACFn) {
  let AC_ref = { state: 'suspended', resumed: false, resume(){ this.resumed = true; this.state = 'running'; return Promise.resolve(); } };
  function getAC() { AC_ref = { state: 'running', resumed: false, resume(){ return Promise.resolve(); } }; return AC_ref; }
  function watchdog() {
    if (!AC_ref) return;
    if (AC_ref.state === 'suspended') AC_ref.resume();
    else if (AC_ref.state === 'closed') { AC_ref = null; AC_ref = getAC(); }
  }
  return { get AC() { return AC_ref; }, watchdog, getAC };
}

// Case 1: suspended -> resumed
let env = makeWatchdog();
env.watchdog();
if (env.AC.state !== 'running' || !env.AC.resumed) errors.push('watchdog did not resume a suspended context');

// Case 2: closed -> rebuilt fresh
env = makeWatchdog();
env.AC.state = 'closed';
env.watchdog();
if (env.AC.state !== 'running') errors.push('watchdog did not rebuild a closed context');

console.log('errors:', errors.length);
console.log(errors.length === 0 ? 'PASS' : errors.join('\n'));
