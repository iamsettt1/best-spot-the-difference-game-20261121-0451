// Twin Lanterns — boot, the animation loop, input wiring and ?shot= staging.
// The canvas is a fixed 1280 x 800 view, letterboxed to the window. All
// clicks are mapped back into that view, then into panel space.

import { Game } from './game.js';
import { renderFrame, VIEW_W, VIEW_H, PANEL_X, PANEL_Y, HINT_BUTTON } from './render.js';
import { PANEL_W, PANEL_H } from './scenes.js';

const canvas = document.getElementById('game');
const statusEl = document.getElementById('status');
const ctx = canvas.getContext('2d');

const game = new Game();
window.__twinLanterns = game; // handy for a quick play-test probe

function fitCanvas() {
  const scale = Math.min(window.innerWidth / VIEW_W, window.innerHeight / VIEW_H);
  canvas.width = VIEW_W;
  canvas.height = VIEW_H;
  canvas.style.width = `${Math.floor(VIEW_W * scale)}px`;
  canvas.style.height = `${Math.floor(VIEW_H * scale)}px`;
}

function toView(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * VIEW_W,
    y: ((clientY - rect.top) / rect.height) * VIEW_H,
  };
}

function panelAt(vx, vy) {
  for (let p = 0; p < 2; p++) {
    if (vx >= PANEL_X[p] && vx < PANEL_X[p] + PANEL_W && vy >= PANEL_Y && vy < PANEL_Y + PANEL_H) {
      return { panel: p, x: vx - PANEL_X[p], y: vy - PANEL_Y };
    }
  }
  return null;
}

function announce() {
  if (!statusEl) return;
  if (game.screen === 'playing') {
    statusEl.textContent = `Level ${game.levelIndex + 1}, ${game.scene.name}. Found ${game.foundCount} of ${game.totalDifferences}. ${Math.ceil(game.timeLeft)} seconds left.`;
  } else if (game.screen === 'levelComplete') {
    statusEl.textContent = `Level complete, ${game.stars} stars, time bonus ${game.timeBonus}.`;
  } else if (game.screen === 'gameOver') {
    statusEl.textContent = `Time is up. You found ${game.foundCount} of ${game.totalDifferences}.`;
  } else {
    statusEl.textContent = 'Twin Lanterns, a spot the difference game. Press 1, 2 or 3 to choose a level.';
  }
}

canvas.addEventListener('pointerdown', (event) => {
  const v = toView(event.clientX, event.clientY);
  // The Hint button lives in the bottom bar.
  if (game.screen === 'playing'
    && v.x >= HINT_BUTTON.x && v.x <= HINT_BUTTON.x + HINT_BUTTON.w
    && v.y >= HINT_BUTTON.y && v.y <= HINT_BUTTON.y + HINT_BUTTON.h) {
    game.useHint();
    announce();
    return;
  }
  const hit = panelAt(v.x, v.y);
  if (hit) {
    game.clickAt(hit.panel, hit.x, hit.y);
    announce();
  }
});

window.addEventListener('keydown', (event) => {
  if (event.repeat) return;
  if (game.handleKey(event.key)) {
    event.preventDefault();
    announce();
  }
});

window.addEventListener('resize', fitCanvas);

// A hidden tab freezes requestAnimationFrame, so the clock would jump on
// return; reset the frame anchor instead of charging the player for it.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) game.lastTick = performance.now();
});

// Staged screenshots: ?shot=start | play | progress | end, &level=1..3.
// Each is a real game state produced by the game's own code paths.
function applyShotParam() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return;
  const level = Number(params.get('level') ?? '1');
  game.applyShot(shot, level);
  game.lastTick = performance.now();
}

function frame(now) {
  game.update(now);
  renderFrame(ctx, game);
  requestAnimationFrame(frame);
}

fitCanvas();
applyShotParam();
announce();
requestAnimationFrame(frame);
