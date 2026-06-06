// =================================================================
//  CONFIG — canvas setup, palette, leaderboard credentials
//
//  ONLINE LEADERBOARD (free, 2 min setup):
//  1. Go to https://dreamlo.com -> "Get a free leaderboard"
//  2. Paste your codes below
//  3. Set USE_ONLINE_LB = true
// =================================================================

const C   = document.getElementById('c');
const ctx = C.getContext('2d');
const W   = C.width  = 600;
const H   = C.height = 750;

// Colour palette
const C_BG      = '#020208';
const C_ORANGE  = '#ff6a00';
const C_YELLOW  = '#ffcc00';
const C_RED     = '#ff2244';
const C_PBULLET = '#ffff55';
const C_EBULLET = '#ff2244';
const C_SKIN    = '#c8906a';

// Online leaderboard
const USE_ONLINE_LB   = false;
const LB_PUBLIC_CODE  = 'YOUR_PUBLIC_CODE_HERE';
const LB_PRIVATE_CODE = 'YOUR_PRIVATE_CODE_HERE';
