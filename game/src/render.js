// Twin Lanterns — frame rendering: header, the two panels, find markers,
// the HUD and the title / pause / level-complete / game-over overlays.
// Canvas space is a fixed 1280 x 800, scaled to the window by main.js.

import { PANEL_W, PANEL_H } from './scenes.js';
import { drawScene } from './draw.js';

export const VIEW_W = 1280;
export const VIEW_H = 800;
export const PANEL_X = [40, 660];
export const PANEL_Y = 90;
export const HINT_BUTTON = { x: 1050, y: 706, w: 190, h: 52 };

const INK = '#fff3d6';
const DIM = '#cbb8e8';

function fmtTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function panelPath(ctx, px, py) {
  ctx.beginPath();
  ctx.rect(px, py, PANEL_W, PANEL_H);
}

function drawPanelFrame(ctx, px, py, label) {
  ctx.save();
  ctx.strokeStyle = '#5b3a8c';
  ctx.lineWidth = 3;
  ctx.strokeRect(px - 3, py - 3, PANEL_W + 6, PANEL_H + 6);
  ctx.fillStyle = '#1a1030';
  ctx.fillRect(px - 3, py - 26, 110, 22);
  ctx.fillStyle = INK;
  ctx.font = 'bold 14px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, px + 2, py - 15);
  ctx.restore();
}

function drawFoundRing(ctx, x, y, now, born) {
  const age = now - born;
  const pop = age < 160 ? 0.6 + (age / 160) * 0.4 : 1;
  const r = 26 * pop;
  ctx.save();
  ctx.strokeStyle = '#7CFC9A';
  ctx.lineWidth = 4;
  ctx.shadowColor = '#7CFC9A';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#7CFC9A';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x - 10, y + 1);
  ctx.lineTo(x - 2, y + 9);
  ctx.lineTo(x + 12, y - 9);
  ctx.stroke();
  ctx.restore();
}

function drawWrongX(ctx, x, y, now, born) {
  const age = now - born;
  if (age > 900) return;
  ctx.save();
  ctx.globalAlpha = age > 600 ? 1 - (age - 600) / 300 : 1;
  ctx.strokeStyle = '#ff5d5d';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x - 12, y - 12); ctx.lineTo(x + 12, y + 12);
  ctx.moveTo(x + 12, y - 12); ctx.lineTo(x - 12, y + 12);
  ctx.stroke();
  ctx.restore();
}

function drawHintPulse(ctx, x, y, now) {
  const pulse = 0.5 + 0.5 * Math.sin(now / 130);
  const r = 22 + pulse * 10;
  ctx.save();
  ctx.strokeStyle = '#ffd166';
  ctx.globalAlpha = 0.65 + pulse * 0.35;
  ctx.lineWidth = 4;
  ctx.shadowColor = '#ffd166';
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawHeader(ctx, game) {
  ctx.fillStyle = '#160d2b';
  ctx.fillRect(0, 0, VIEW_W, 64);
  ctx.fillStyle = '#e5484d';
  ctx.fillRect(0, 64, VIEW_W, 3);

  ctx.fillStyle = INK;
  ctx.font = 'bold 26px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('🏮 Twin Lanterns', 40, 34);

  ctx.font = '16px Georgia, serif';
  ctx.fillStyle = DIM;
  ctx.fillText(`Level ${game.levelIndex + 1} · ${game.scene.name}`, 330, 34);

  // Found counter — always visible while playing.
  ctx.textAlign = 'center';
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillStyle = game.levelDone ? '#7CFC9A' : INK;
  ctx.fillText(`Found ${game.foundCount} / ${game.totalDifferences}`, 700, 32);

  // Timer, red and urgent under ten seconds.
  const urgent = game.timeLeft <= 10 && game.screen === 'playing';
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillStyle = urgent ? '#ff5d5d' : INK;
  ctx.textAlign = 'right';
  ctx.fillText(`⏱ ${fmtTime(game.timeLeft)}`, 980, 34);

  ctx.font = '16px Georgia, serif';
  ctx.fillStyle = DIM;
  ctx.fillText(`Hints: ${game.hintsLeft}  (H)`, 1240, 34);
  ctx.textAlign = 'left';
}

function drawBottomBar(ctx, game) {
  ctx.fillStyle = '#160d2b';
  ctx.fillRect(0, 692, VIEW_W, VIEW_H - 692);
  ctx.fillStyle = '#e5484d';
  ctx.fillRect(0, 692, VIEW_W, 3);

  ctx.font = '15px Georgia, serif';
  ctx.fillStyle = DIM;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText('Click a difference on either picture  ·  P pause  ·  R restart  ·  M mute  ·  1–3 level select', 40, 732);

  // Hint button.
  const b = HINT_BUTTON;
  ctx.fillStyle = game.hintsLeft > 0 ? '#e5484d' : '#4a3a5e';
  ctx.beginPath();
  ctx.roundRect(b.x, b.y, b.w, b.h, 10);
  ctx.fill();
  ctx.fillStyle = '#fff3d6';
  ctx.font = 'bold 17px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(`💡 Hint (${game.hintsLeft})`, b.x + b.w / 2, b.y + b.h / 2 + 1);
  ctx.textAlign = 'left';

  // Wrong-click penalty flash.
  if (game.now - game.flashWrong < 500) {
    ctx.fillStyle = '#ff5d5d';
    ctx.font = 'bold 16px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('−5s', 640, 732);
    ctx.textAlign = 'left';
  }
}

function drawPanels(ctx, game) {
  for (let p = 0; p < 2; p++) {
    const px = PANEL_X[p];
    const py = PANEL_Y;
    ctx.save();
    panelPath(ctx, px, py);
    ctx.clip();
    ctx.translate(px, py);
    drawScene(ctx, game.scene, p);
    ctx.restore();
    drawPanelFrame(ctx, px, py, p === 0 ? 'ORIGINAL' : 'CHANGED');

    // Markers for this panel.
    for (const m of game.marks) {
      if (m.panel !== p) continue;
      const mx = px + m.x;
      const my = py + m.y;
      if (m.kind === 'found') drawFoundRing(ctx, mx, my, game.now, m.born);
      else drawWrongX(ctx, mx, my, game.now, m.born);
    }
    // Hint pulse on both panels.
    if (game.hintPulse && game.now < game.hintPulse.until) {
      const d = game.scene.differences[game.hintPulse.diffIndex];
      drawHintPulse(ctx, px + d.x, py + d.y, game.now);
    }
  }
}

function overlayCard(ctx, w, h) {
  ctx.fillStyle = 'rgba(10, 6, 22, 0.72)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const x = (VIEW_W - w) / 2;
  const y = (VIEW_H - h) / 2;
  ctx.fillStyle = '#241640';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 18);
  ctx.fill();
  ctx.strokeStyle = '#e5484d';
  ctx.lineWidth = 3;
  ctx.stroke();
  return { x, y, w, h };
}

function drawTitle(ctx, game) {
  // A dimmed level-1 scene behind the title card.
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.save();
  panelPath(ctx, PANEL_X[0], PANEL_Y);
  ctx.clip();
  ctx.translate(PANEL_X[0], PANEL_Y);
  drawScene(ctx, game.scene, 0);
  ctx.restore();
  ctx.save();
  panelPath(ctx, PANEL_X[1], PANEL_Y);
  ctx.clip();
  ctx.translate(PANEL_X[1], PANEL_Y);
  drawScene(ctx, game.scene, 1);
  ctx.restore();
  ctx.restore();

  const card = overlayCard(ctx, 760, 500);
  const cx = card.x + card.w / 2;
  let y = card.y + 72;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 58px Georgia, serif';
  ctx.fillText('🏮 Twin Lanterns 🏮', cx, y);
  y += 52;
  ctx.fillStyle = INK;
  ctx.font = '24px Georgia, serif';
  ctx.fillText('Spot the Difference', cx, y);
  y += 40;
  ctx.fillStyle = DIM;
  ctx.font = '17px Georgia, serif';
  ctx.fillText('Two pictures, side by side — almost the same.', cx, y);
  y += 26;
  ctx.fillText('Find every difference before the lanterns burn out.', cx, y);

  y += 52;
  ctx.fillStyle = INK;
  ctx.font = 'bold 19px Georgia, serif';
  ctx.fillText('Choose a level  —  press 1, 2 or 3', cx, y);
  y += 38;
  ctx.font = '17px Georgia, serif';
  const levels = [
    '1 · Lantern Street — 7 differences, 3:00',
    '2 · Harbour Night — 10 differences, 2:30',
    '3 · Festival Finale — 12 differences, 2:00',
  ];
  for (const line of levels) {
    ctx.fillStyle = DIM;
    ctx.fillText(line, cx, y);
    y += 28;
  }
  y += 18;
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.fillText('Press ENTER to play  ·  H hint  ·  P pause  ·  M mute', cx, y);
  ctx.textAlign = 'left';
}

function drawLevelComplete(ctx, game) {
  const card = overlayCard(ctx, 560, 420);
  const cx = card.x + card.w / 2;
  let y = card.y + 80;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#7CFC9A';
  ctx.font = 'bold 40px Georgia, serif';
  ctx.fillText('Level Complete!', cx, y);
  y += 56;
  ctx.font = 'bold 44px Georgia, serif';
  ctx.fillStyle = '#ffd166';
  ctx.fillText('★'.repeat(game.stars) + '☆'.repeat(3 - game.stars), cx, y);
  y += 52;
  ctx.fillStyle = INK;
  ctx.font = '20px Georgia, serif';
  ctx.fillText(`All ${game.totalDifferences} differences found`, cx, y);
  y += 34;
  ctx.fillText(`Time bonus  +${game.timeBonus}`, cx, y);
  y += 34;
  ctx.fillText(`Time left  ${fmtTime(game.timeLeft)}`, cx, y);
  y += 52;
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.fillText(
    game.levelIndex < 2 ? 'ENTER — next level    ·    T — title' : 'ENTER — play again    ·    T — title',
    cx, y,
  );
  ctx.textAlign = 'left';
}

function drawGameOver(ctx, game) {
  const card = overlayCard(ctx, 560, 380);
  const cx = card.x + card.w / 2;
  let y = card.y + 84;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff5d5d';
  ctx.font = 'bold 40px Georgia, serif';
  ctx.fillText("Time's Up!", cx, y);
  y += 52;
  ctx.fillStyle = INK;
  ctx.font = '20px Georgia, serif';
  ctx.fillText(`You found ${game.foundCount} of ${game.totalDifferences} differences`, cx, y);
  y += 34;
  ctx.fillText('The lanterns burned out before you finished.', cx, y);
  y += 52;
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.fillText('ENTER — try again    ·    T — title', cx, y);
  ctx.textAlign = 'left';
}

function drawPaused(ctx) {
  const card = overlayCard(ctx, 480, 260);
  const cx = card.x + card.w / 2;
  ctx.textAlign = 'center';
  ctx.fillStyle = INK;
  ctx.font = 'bold 36px Georgia, serif';
  ctx.fillText('Paused', cx, card.y + 96);
  ctx.fillStyle = DIM;
  ctx.font = '18px Georgia, serif';
  ctx.fillText('P — resume    ·    R — restart', cx, card.y + 156);
  ctx.textAlign = 'left';
}

export function renderFrame(ctx, game) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#0f0820';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  // Gentle shake right after a wrong click.
  ctx.save();
  if (game.now < game.shakeUntil) {
    const s = 4 * (1 - (game.shakeUntil - game.now) / 180);
    ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
  }
  drawHeader(ctx, game);
  drawPanels(ctx, game);
  drawBottomBar(ctx, game);
  ctx.restore();

  if (game.screen === 'title') drawTitle(ctx, game);
  else if (game.screen === 'paused') drawPaused(ctx);
  else if (game.screen === 'levelComplete') drawLevelComplete(ctx, game);
  else if (game.screen === 'gameOver') drawGameOver(ctx, game);
}
