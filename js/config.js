// =================================================================
//  CONFIG — canvas setup, palette, Firebase leaderboard
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

// Firebase leaderboard
const firebaseConfig = {
  apiKey:            'AIzaSyDjWVJweGyZ-GDdhjfQiroRDxZ7og3a2W4',
  authDomain:        'gods-favourite-son.firebaseapp.com',
  databaseURL:       'https://gods-favourite-son-default-rtdb.europe-west1.firebasedatabase.app',
  projectId:         'gods-favourite-son',
  storageBucket:     'gods-favourite-son.firebasestorage.app',
  messagingSenderId: '1039383178035',
  appId:             '1:1039383178035:web:e95c27aad1a819ad67ac46',
  measurementId:     'G-G6LFKZK3BK'
};
firebase.initializeApp(firebaseConfig);
