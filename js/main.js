// =================================================================
//  MAIN — game loop entry point
// =================================================================

function loop() {
  update();
  switch (gameState) {
    case 'TITLE':       drawTitle();       break;
    case 'NAME':        drawName();        break;
    case 'PLAYING':     drawPlaying();     break;
    case 'PAUSED':      drawPaused();      break;
    case 'GAMEOVER':    drawGameOver();    break;
    case 'WIN':         drawWin();         break;
    case 'LEADERBOARD': drawLeaderboard(); break;
  }
  requestAnimationFrame(loop);
}

loop();
