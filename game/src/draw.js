// Twin Lanterns — procedural scene drawing.
// Every picture is drawn from code: gradients, shapes and a seeded random
// scatter, so the two panels of a level are pixel-identical except for the
// differences the scene definition declares. Nothing is loaded from disk.

import { PANEL_W, PANEL_H } from './scenes.js';

// Small deterministic PRNG so a scene always looks the same.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function star4(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

// Draw one element. `variant` 0 = left panel, 1 = right panel.
function drawElement(ctx, el, variant, rng) {
  const alt = variant === 1 ? (el.alt ?? {}) : {};
  if (alt.hidden || el.hidden) return;
  if (el.rightOnly && variant === 0) return;
  const x = alt.x ?? el.x;
  const y = alt.y ?? el.y;

  switch (el.kind) {
    case 'stars': {
      const r = mulberry32(el.seed);
      for (let i = 0; i < el.count; i++) {
        const sx = 14 + r() * (PANEL_W - 28);
        const sy = 10 + r() * 200;
        const sr = 1 + r() * 2.2;
        ctx.globalAlpha = 0.35 + r() * 0.6;
        star4(ctx, sx, sy, sr, '#fff7d6');
      }
      ctx.globalAlpha = 1;
      break;
    }
    case 'star': {
      star4(ctx, x, y, el.r, '#fff7d6');
      break;
    }
    case 'moon': {
      ctx.fillStyle = '#ffeec2';
      circle(ctx, x, y, el.r);
      ctx.fillStyle = '#f2d894';
      circle(ctx, x - el.r * 0.35, y - el.r * 0.2, el.r * 0.18);
      circle(ctx, x + el.r * 0.3, y + el.r * 0.3, el.r * 0.13);
      if (alt.crescent) {
        ctx.fillStyle = '#1a0b33';
        circle(ctx, x + el.r * 0.55, y - el.r * 0.15, el.r * 0.9);
      }
      break;
    }
    case 'rooftops': {
      ctx.fillStyle = el.color;
      ctx.beginPath();
      ctx.moveTo(0, PANEL_H);
      ctx.lineTo(0, el.y + 40);
      ctx.lineTo(70, el.y);
      ctx.lineTo(140, el.y + 34);
      ctx.lineTo(210, el.y - 14);
      ctx.lineTo(300, el.y + 26);
      ctx.lineTo(380, el.y - 6);
      ctx.lineTo(460, el.y + 30);
      ctx.lineTo(530, el.y + 2);
      ctx.lineTo(PANEL_W, el.y + 26);
      ctx.lineTo(PANEL_W, PANEL_H);
      ctx.closePath();
      ctx.fill();
      // Lit windows in the rooftops.
      ctx.fillStyle = '#ffca6a';
      const r = mulberry32(5);
      for (let i = 0; i < 10; i++) {
        const wx = 24 + r() * (PANEL_W - 60);
        const wy = el.y + 44 + r() * 90;
        ctx.fillRect(wx, wy, 9, 12);
      }
      break;
    }
    case 'stringLights': {
      ctx.strokeStyle = '#1c1030';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, el.y - el.sag);
      ctx.quadraticCurveTo(PANEL_W / 2, el.y + el.sag, PANEL_W, el.y - el.sag);
      ctx.stroke();
      const colors = ['#ffd166', '#ef476f', '#8ecae6', '#ffd166', '#06d6a0'];
      for (let i = 0; i < el.bulbs; i++) {
        if (variant === 1 && el.altBulb === i) continue; // the burnt-out bulb
        const t = (i + 0.5) / el.bulbs;
        const bx = t * PANEL_W;
        const by = el.y - el.sag + 2 * el.sag * t * (1 - t) * 2 + 6;
        ctx.strokeStyle = '#1c1030';
        ctx.beginPath(); ctx.moveTo(bx, by - 8); ctx.lineTo(bx, by); ctx.stroke();
        ctx.fillStyle = colors[i % colors.length];
        circle(ctx, bx, by + 4, 6);
        ctx.fillStyle = 'rgba(255, 209, 102, 0.25)';
        circle(ctx, bx, by + 4, 11);
      }
      break;
    }
    case 'lantern': {
      const color = alt.color ?? el.color;
      ctx.strokeStyle = '#1c1030';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, y - el.r - el.cord); ctx.lineTo(x, y - el.r); ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(x, y, el.r, el.r * 1.12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 1.5;
      for (const k of [-0.45, 0, 0.45]) {
        ctx.beginPath();
        ctx.ellipse(x, y, el.r * Math.abs(k) * 1.4 + 4, el.r * 1.12, 0, -1.1, 1.1);
        ctx.stroke();
      }
      ctx.fillStyle = '#ffd166';
      ctx.fillRect(x - 8, y - el.r * 1.12 - 6, 16, 7);
      ctx.fillRect(x - 8, y + el.r * 1.12 - 1, 16, 7);
      ctx.fillStyle = 'rgba(255, 240, 180, 0.85)';
      circle(ctx, x, y, el.r * 0.28);
      break;
    }
    case 'banner': {
      const dots = alt.dots ?? el.dots;
      ctx.fillStyle = el.color;
      roundRect(ctx, x, y, el.w, el.h, 6);
      ctx.fill();
      ctx.fillStyle = '#fff3d6';
      for (let i = 0; i < dots; i++) {
        circle(ctx, x + 34 + i * 56, y + el.h / 2, 11);
      }
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(x, y, 4, el.h);
      ctx.fillRect(x + el.w - 4, y, 4, el.h);
      break;
    }
    case 'stall': {
      const sign = alt.sign ?? el.sign;
      ctx.fillStyle = '#3a2418';
      ctx.fillRect(x + 8, y + 52, el.w - 16, el.h - 52);
      ctx.fillStyle = el.awning;
      ctx.beginPath();
      ctx.moveTo(x, y + 52);
      ctx.lineTo(x, y + 14);
      ctx.lineTo(x + el.w, y + 14);
      ctx.lineTo(x + el.w, y + 52);
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(x + el.w - i * (el.w / 5), y + 52 + (i % 2 === 0 ? 12 : 4));
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff3d6';
      ctx.fillRect(x + 14, y + 62, el.w - 28, 26);
      ctx.fillStyle = '#3a2418';
      ctx.font = 'bold 17px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sign, x + el.w / 2, y + 76);
      ctx.fillStyle = '#ffd166';
      for (let i = 0; i < (el.jars ?? 2); i++) {
        circle(ctx, x + 34 + i * 34, y + 108, 9);
      }
      break;
    }
    case 'stoneLantern': {
      ctx.fillStyle = '#8d8578';
      ctx.fillRect(x - 26, y, 52, 10);
      ctx.fillRect(x - 8, y - 34, 16, 34);
      ctx.fillRect(x - 22, y - 46, 44, 14);
      ctx.fillStyle = '#ffd166';
      ctx.fillRect(x - 12, y - 58, 24, 12);
      ctx.fillStyle = '#6b6357';
      ctx.beginPath();
      ctx.moveTo(x - 26, y - 58);
      ctx.lineTo(x, y - 76);
      ctx.lineTo(x + 26, y - 58);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'cat': {
      const s = el.scale;
      ctx.fillStyle = '#1c1030';
      ctx.beginPath();
      ctx.ellipse(x, y, 26 * s, 12 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      circle(ctx, x + 24 * s, y - 8 * s, 10 * s);
      ctx.beginPath();
      ctx.moveTo(x + 18 * s, y - 16 * s); ctx.lineTo(x + 21 * s, y - 28 * s); ctx.lineTo(x + 26 * s, y - 16 * s);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 26 * s, y - 16 * s); ctx.lineTo(x + 30 * s, y - 28 * s); ctx.lineTo(x + 34 * s, y - 16 * s);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#1c1030';
      ctx.lineWidth = 4 * s;
      ctx.beginPath();
      ctx.moveTo(x - 24 * s, y);
      ctx.quadraticCurveTo(x - 40 * s, y - 18 * s, x - 30 * s, y - 26 * s);
      ctx.stroke();
      break;
    }
    case 'ground': {
      ctx.fillStyle = '#2a1a3a';
      ctx.fillRect(0, el.y, PANEL_W, PANEL_H - el.y);
      ctx.fillStyle = 'rgba(255, 209, 102, 0.12)';
      for (let i = 0; i < 8; i++) {
        ctx.fillRect(20 + i * 70, el.y + 14 + (i % 3) * 12, 34, 3);
      }
      break;
    }
    case 'puddle': {
      ctx.fillStyle = 'rgba(142, 202, 230, 0.35)';
      ctx.beginPath();
      ctx.ellipse(x, y, el.w / 2, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'sea': {
      const g = ctx.createLinearGradient(0, el.y, 0, PANEL_H);
      g.addColorStop(0, '#1d4e6b');
      g.addColorStop(1, '#0a2036');
      ctx.fillStyle = g;
      ctx.fillRect(0, el.y, PANEL_W, PANEL_H - el.y);
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const wy = el.y + 26 + i * 26;
        ctx.beginPath();
        for (let wx = 0; wx <= PANEL_W; wx += 24) {
          const yy = wy + Math.sin(wx / 46 + i) * 3;
          if (wx === 0) ctx.moveTo(wx, yy); else ctx.lineTo(wx, yy);
        }
        ctx.stroke();
      }
      break;
    }
    case 'moonGlitter': {
      ctx.fillStyle = 'rgba(255, 238, 194, 0.5)';
      for (let i = 0; i < 7; i++) {
        const w = el.w * (0.5 + 0.5 * Math.sin(i * 1.3));
        ctx.fillRect(x - w / 2, el.y + i * 12, w, 4);
      }
      break;
    }
    case 'lighthouse': {
      ctx.fillStyle = '#e8e0d0';
      ctx.beginPath();
      ctx.moveTo(x - 22, el.y + el.h);
      ctx.lineTo(x - 13, el.y);
      ctx.lineTo(x + 13, el.y);
      ctx.lineTo(x + 22, el.y + el.h);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e5484d';
      ctx.fillRect(x - 17, el.y + el.h * 0.45, 34, 18);
      ctx.fillRect(x - 20, el.y + el.h * 0.8, 40, 14);
      ctx.fillStyle = '#2b2b3a';
      ctx.fillRect(x - 14, el.y - 18, 28, 18);
      ctx.fillStyle = alt.lit === false ? '#3a3a4a' : '#ffe9a8';
      ctx.fillRect(x - 10, el.y - 14, 20, 10);
      break;
    }
    case 'lighthouseBeam': {
      const color = alt.color ?? el.beamColor ?? '#ffe9a8';
      const g = ctx.createLinearGradient(x, y, x - 220, y + 60);
      g.addColorStop(0, color);
      g.addColorStop(1, 'rgba(255,233,168,0)');
      ctx.fillStyle = g;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.moveTo(x, y - 8);
      ctx.lineTo(x - 240, y - 34);
      ctx.lineTo(x - 240, y + 92);
      ctx.lineTo(x, y + 12);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      break;
    }
    case 'window': {
      ctx.fillStyle = alt.lit === false ? '#3a3a4a' : '#ffe9a8';
      ctx.fillRect(x - 7, y - 9, 14, 18);
      break;
    }
    case 'boat': {
      const s = el.scale;
      ctx.fillStyle = '#5a3a28';
      ctx.beginPath();
      ctx.moveTo(x - 52 * s, y);
      ctx.lineTo(x + 52 * s, y);
      ctx.lineTo(x + 36 * s, y + 20 * s);
      ctx.lineTo(x - 36 * s, y + 20 * s);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#3a2418';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 56 * s); ctx.stroke();
      ctx.fillStyle = alt.flag ?? el.flag;
      ctx.beginPath();
      ctx.moveTo(x, y - 56 * s);
      ctx.lineTo(x + 26 * s, y - 48 * s);
      ctx.lineTo(x, y - 40 * s);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f2e6c9';
      ctx.beginPath();
      ctx.moveTo(x, y - 52 * s);
      ctx.lineTo(x - 26 * s, y - 6 * s);
      ctx.lineTo(x, y - 6 * s);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'gull': {
      ctx.strokeStyle = '#f2f2f2';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x - 12, y);
      ctx.quadraticCurveTo(x - 5, y - 9, x, y);
      ctx.quadraticCurveTo(x + 5, y - 9, x + 12, y);
      ctx.stroke();
      break;
    }
    case 'fish': {
      ctx.fillStyle = '#8ecae6';
      ctx.beginPath();
      ctx.ellipse(x, y, 16, 7, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 14, y - 2);
      ctx.lineTo(x + 24, y - 9);
      ctx.lineTo(x + 24, y + 5);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'crates': {
      const count = alt.count ?? el.count;
      ctx.fillStyle = '#8a6a3f';
      for (let i = 0; i < count; i++) {
        const cx = x + i * 34;
        const cy = y - (i === 2 ? 30 : 0);
        ctx.fillRect(cx, cy, 30, 30);
        ctx.strokeStyle = '#5a3a28';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx, cy, 30, 30);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 30, cy + 30); ctx.stroke();
      }
      break;
    }
    case 'fishingNet': {
      ctx.strokeStyle = '#c9b18a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 70, y - 26);
      ctx.lineTo(x + 90, y + 18);
      ctx.closePath();
      ctx.stroke();
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(x + i * 18, y - i * 6);
        ctx.lineTo(x + i * 18 + 12, y + 10);
        ctx.stroke();
      }
      break;
    }
    case 'pier': {
      ctx.fillStyle = '#4a3220';
      ctx.fillRect(0, el.y, PANEL_W, 26);
      ctx.fillStyle = '#3a2418';
      for (let i = 0; i < 8; i++) ctx.fillRect(30 + i * 70, el.y + 26, 10, 44);
      break;
    }
    case 'ropeLights': {
      ctx.strokeStyle = '#1c1030';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, el.y);
      ctx.lineTo(PANEL_W, el.y);
      ctx.stroke();
      for (let i = 0; i < el.bulbs; i++) {
        const bx = 40 + i * 72;
        ctx.fillStyle = '#ffd166';
        circle(ctx, bx, el.y + 8, 5);
      }
      break;
    }
    case 'firework': {
      const arms = alt.arms ?? el.arms;
      const color = alt.color ?? el.color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      for (let i = 0; i < arms; i++) {
        const a = (i / arms) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * el.r * 0.3, y + Math.sin(a) * el.r * 0.3);
        ctx.lineTo(x + Math.cos(a) * el.r, y + Math.sin(a) * el.r);
        ctx.stroke();
      }
      ctx.fillStyle = color;
      circle(ctx, x, y, 5);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      circle(ctx, x, y, 2);
      break;
    }
    case 'kite': {
      const color = alt.color ?? el.color;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, y - 26);
      ctx.lineTo(x + 22, y);
      ctx.lineTo(x, y + 26);
      ctx.lineTo(x - 22, y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y - 26); ctx.lineTo(x, y + 26);
      ctx.moveTo(x - 22, y); ctx.lineTo(x + 22, y);
      ctx.stroke();
      if (alt.string !== false) {
        ctx.strokeStyle = '#e8e0d0';
        ctx.beginPath();
        ctx.moveTo(x, y + 26);
        ctx.quadraticCurveTo(x - 14, y + 60, x + 4, y + 88);
        ctx.stroke();
      }
      break;
    }
    case 'stage': {
      ctx.fillStyle = '#3a1c4e';
      ctx.fillRect(x, y, el.w, el.h);
      ctx.fillStyle = '#5b2a72';
      ctx.fillRect(x, y, el.w, 12);
      ctx.fillStyle = '#e5484d';
      ctx.beginPath();
      ctx.moveTo(x + el.w / 2 - 90, y);
      ctx.lineTo(x + el.w / 2 + 90, y);
      ctx.lineTo(x + el.w / 2 + 70, y + 44);
      ctx.lineTo(x + el.w / 2 - 70, y + 44);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff3d6';
      ctx.font = 'bold 20px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★ FESTIVAL ★', x + el.w / 2, y + 26);
      break;
    }
    case 'stageLights': {
      const color = alt.color ?? el.color;
      for (let i = 0; i < 5; i++) {
        const lx = el.x + 30 + i * 80;
        ctx.fillStyle = color;
        circle(ctx, lx, el.y - 8, 9);
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.moveTo(lx - 6, el.y);
        ctx.lineTo(lx + 6, el.y);
        ctx.lineTo(lx + 26, el.y + 90);
        ctx.lineTo(lx - 26, el.y + 90);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case 'drum': {
      ctx.fillStyle = '#a83232';
      circle(ctx, x, y, el.r);
      ctx.fillStyle = '#f2e6c9';
      ctx.beginPath();
      ctx.ellipse(x, y, el.r, el.r * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#5a1f1f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y, el.r * 0.7, el.r * 0.38, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'crowd': {
      const hats = variant === 1 ? (el.altHats ?? el.hats) : el.hats;
      const r = mulberry32(9);
      const skin = ['#f2c89b', '#e8b48a', '#d9a06f', '#f7d7ae'];
      for (let i = 0; i < el.count; i++) {
        const cx = 40 + i * 56 + r() * 10;
        const cy = el.y + r() * 26;
        ctx.fillStyle = skin[i % skin.length];
        circle(ctx, cx, cy, 15);
        ctx.fillStyle = ['#e5484d', '#2f6fb2', '#3fae7a', '#f5b942'][i % 4];
        ctx.beginPath();
        ctx.arc(cx, cy + 26, 20, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(cx - 20, cy + 22, 40, 26);
        if (i < hats) {
          ctx.fillStyle = '#ffd166';
          ctx.beginPath();
          ctx.moveTo(cx - 16, cy - 8);
          ctx.lineTo(cx, cy - 26);
          ctx.lineTo(cx + 16, cy - 8);
          ctx.closePath();
          ctx.fill();
        }
      }
      break;
    }
    case 'foodCart': {
      const wheels = alt.wheels ?? el.wheels;
      ctx.fillStyle = '#7a4a2b';
      ctx.fillRect(x, y, el.w, 56);
      ctx.fillStyle = '#e5484d';
      ctx.beginPath();
      ctx.moveTo(x - 8, y);
      ctx.lineTo(x + el.w + 8, y);
      ctx.lineTo(x + el.w, y - 26);
      ctx.lineTo(x, y - 26);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff3d6';
      ctx.fillRect(x + 16, y + 12, 54, 30);
      ctx.fillStyle = '#3fae7a';
      ctx.fillRect(x + 84, y + 12, 40, 30);
      ctx.fillStyle = '#1c1030';
      for (let i = 0; i < wheels; i++) {
        circle(ctx, x + 30 + i * (el.w - 60), y + 62, 10);
        ctx.fillStyle = '#8d8578';
        circle(ctx, x + 30 + i * (el.w - 60), y + 62, 4);
        ctx.fillStyle = '#1c1030';
      }
      break;
    }
    case 'gateLanterns': {
      const count = alt.count ?? el.count;
      ctx.strokeStyle = '#5a1f1f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 14, y - 60);
      ctx.lineTo(x - 14, y + 40);
      ctx.moveTo(x + 14, y - 60);
      ctx.lineTo(x + 14, y + 40);
      ctx.stroke();
      for (let i = 0; i < count; i++) {
        const ly = y - 44 + i * 26;
        ctx.fillStyle = i % 2 === 0 ? '#e5484d' : '#f5b942';
        ctx.beginPath();
        ctx.ellipse(x, ly, 13, 11, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'balloon': {
      ctx.fillStyle = el.color;
      ctx.beginPath();
      ctx.ellipse(x, y, 18, 23, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y + 23);
      ctx.quadraticCurveTo(x - 8, y + 48, x + 2, y + 70);
      ctx.stroke();
      break;
    }
    case 'torch': {
      ctx.fillStyle = '#5a3a28';
      ctx.fillRect(x - 4, y - 20, 8, 46);
      if (alt.flame !== false) {
        ctx.fillStyle = '#ff9f1c';
        ctx.beginPath();
        ctx.moveTo(x, y - 52);
        ctx.quadraticCurveTo(x + 12, y - 30, x, y - 16);
        ctx.quadraticCurveTo(x - 12, y - 30, x, y - 52);
        ctx.fill();
        ctx.fillStyle = '#ffe66d';
        ctx.beginPath();
        ctx.moveTo(x, y - 40);
        ctx.quadraticCurveTo(x + 6, y - 26, x, y - 18);
        ctx.quadraticCurveTo(x - 6, y - 26, x, y - 40);
        ctx.fill();
      }
      break;
    }
    case 'confetti': {
      const r = mulberry32(el.seed);
      const colors = ['#ffd166', '#ef476f', '#8ecae6', '#06d6a0', '#c77dff'];
      for (let i = 0; i < el.count; i++) {
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(10 + r() * (PANEL_W - 20), 20 + r() * 300, 7, 4);
      }
      break;
    }
    default:
      break;
  }
}

// Draw one panel of a scene into the current transform. The caller clips to
// the panel and translates to its top-left corner.
export function drawScene(ctx, scene, variant) {
  const g = ctx.createLinearGradient(0, 0, 0, PANEL_H);
  g.addColorStop(0, scene.skyTop);
  g.addColorStop(0.62, scene.skyBottom);
  g.addColorStop(0.63, '#1a1030');
  g.addColorStop(1, '#1a1030');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PANEL_W, PANEL_H);
  const rng = mulberry32(scene.seed);
  for (const el of scene.elements) {
    drawElement(ctx, el, variant, rng);
  }
}
