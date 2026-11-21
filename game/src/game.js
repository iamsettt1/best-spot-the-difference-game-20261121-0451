// Twin Lanterns — game state, input, timer and hints.
// The state machine: title -> playing -> (paused) -> levelComplete / gameOver.
// A level is won by finding every difference before the timer runs out.
// Wrong clicks cost 5 seconds; a hint pulses an unfound difference.

import { SCENES, sceneById } from './scenes.js';
import { SoundBank } from './audio.js';

export const WRONG_CLICK_PENALTY = 5;
export const HINTS_PER_LEVEL = 3;

export class Game {
  constructor() {
    this.sounds = new SoundBank();
    this.screen = 'title'; // title | playing | paused | levelComplete | gameOver
    this.levelIndex = 0;
    this.found = new Set(); // difference indexes found in this level
    this.hintsLeft = HINTS_PER_LEVEL;
    // Start on the level's full time so the title screen shows a real clock.
    this.timeLeft = SCENES[0].timeLimit;
    this.lastTick = 0;
    this.marks = []; // {x, y, panel, kind: 'found'|'wrong', born}
    this.hintPulse = null; // {diffIndex, until}
    this.stars = 0;
    this.timeBonus = 0;
    this.shakeUntil = 0;
    this.flashWrong = 0;
    this.now = 0;
  }

  get scene() {
    return SCENES[this.levelIndex];
  }

  get totalDifferences() {
    return this.scene.differences.length;
  }

  get foundCount() {
    return this.found.size;
  }

  get levelDone() {
    return this.foundCount >= this.totalDifferences;
  }

  startLevel(index) {
    this.levelIndex = index;
    this.found = new Set();
    this.hintsLeft = HINTS_PER_LEVEL;
    this.timeLeft = this.scene.timeLimit;
    this.lastTick = 0;
    this.marks = [];
    this.hintPulse = null;
    this.stars = 0;
    this.timeBonus = 0;
    this.screen = 'playing';
  }

  backToTitle() {
    this.screen = 'title';
    this.marks = [];
    this.hintPulse = null;
  }

  // Advance the clock. Called every animation frame with a timestamp.
  update(now) {
    this.now = now;
    if (this.screen !== 'playing') return;
    const dt = (now - this.lastTick) / 1000;
    this.lastTick = now;
    if (dt <= 0 || dt > 1) return;
    this.timeLeft -= dt;
    if (this.timeLeft <= 10 && Math.ceil(this.timeLeft) !== Math.ceil(this.timeLeft + dt)) {
      this.sounds.tick();
    }
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.screen = 'gameOver';
      this.sounds.lose();
    }
  }

  // Handle a click in panel space: panel 0 = left, 1 = right; x/y in panel
  // coordinates. Returns 'found' | 'wrong' | 'ignore'.
  clickAt(panel, x, y) {
    if (this.screen !== 'playing') return 'ignore';
    this.sounds.ensure();
    const diffs = this.scene.differences;
    for (let i = 0; i < diffs.length; i++) {
      if (this.found.has(i)) continue;
      const d = diffs[i];
      const dx = x - d.x;
      const dy = y - d.y;
      if (dx * dx + dy * dy <= d.r * d.r) {
        this.found.add(i);
        this.marks.push({ x: d.x, y: d.y, panel: 0, kind: 'found', born: this.now });
        this.marks.push({ x: d.x, y: d.y, panel: 1, kind: 'found', born: this.now });
        this.sounds.found();
        if (this.levelDone) this.completeLevel();
        return 'found';
      }
    }
    // A miss: small X mark on the clicked panel and five seconds lost.
    this.timeLeft = Math.max(0, this.timeLeft - WRONG_CLICK_PENALTY);
    this.marks.push({ x, y, panel, kind: 'wrong', born: this.now });
    this.flashWrong = this.now;
    this.shakeUntil = this.now + 180;
    this.sounds.wrong();
    if (this.timeLeft <= 0) {
      this.screen = 'gameOver';
      this.sounds.lose();
    }
    return 'wrong';
  }

  completeLevel() {
    this.screen = 'levelComplete';
    this.timeBonus = Math.round(this.timeLeft) * 10;
    const frac = this.timeLeft / this.scene.timeLimit;
    this.stars = frac > 0.5 ? 3 : frac > 0.25 ? 2 : 1;
    this.sounds.win();
  }

  useHint() {
    if (this.screen !== 'playing' || this.hintsLeft <= 0) return false;
    const remaining = this.scene.differences
      .map((d, i) => i)
      .filter((i) => !this.found.has(i));
    if (remaining.length === 0) return false;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    this.hintsLeft -= 1;
    this.hintPulse = { diffIndex: pick, until: this.now + 1800 };
    this.sounds.hint();
    return true;
  }

  togglePause() {
    if (this.screen === 'playing') {
      this.screen = 'paused';
      this.lastTick = 0;
    } else if (this.screen === 'paused') {
      this.screen = 'playing';
      this.lastTick = performance.now();
    }
  }

  // Keyboard shortcuts. Returns true when the key did something.
  handleKey(key) {
    const k = key.toLowerCase();
    if (k === 'm') {
      this.sounds.ensure();
      this.sounds.toggleMute();
      return true;
    }
    if (this.screen === 'title') {
      if (k === '1' || k === '2' || k === '3') {
        this.startLevel(Number(k) - 1);
        return true;
      }
      if (k === 'enter' || k === ' ') {
        this.startLevel(this.levelIndex);
        return true;
      }
      return false;
    }
    if (k === 'p' || k === 'escape') {
      this.togglePause();
      return true;
    }
    if (k === 'r') {
      this.startLevel(this.levelIndex);
      return true;
    }
    if (k === 'h') {
      return this.useHint();
    }
    if (this.screen === 'levelComplete' || this.screen === 'gameOver') {
      if (k === 'enter' || k === ' ') {
        if (this.screen === 'levelComplete' && this.levelIndex < SCENES.length - 1) {
          this.startLevel(this.levelIndex + 1);
        } else {
          this.startLevel(this.levelIndex);
        }
        return true;
      }
      if (k === 't') {
        this.backToTitle();
        return true;
      }
    }
    return false;
  }

  // Staged states for screenshots, driven by the real code paths above.
  // `shot` is one of start | play | progress | end; `level` is 1-based.
  applyShot(shot, level) {
    const idx = Math.min(Math.max((level ?? 1) - 1, 0), SCENES.length - 1);
    if (shot === 'start') {
      this.levelIndex = 0;
      this.backToTitle();
      return;
    }
    this.startLevel(idx);
    this.lastTick = performance.now();
    if (shot === 'play') {
      // Mid-game: four differences already found, spread across the scene
      // so their rings never crowd each other.
      for (const i of [0, 1, 4, 7]) this.markFound(i);
      this.timeLeft = this.scene.timeLimit - 63;
    } else if (shot === 'progress') {
      const n = Math.min(8, this.totalDifferences);
      for (let i = 0; i < n; i++) this.markFound(i);
      this.timeLeft = 47;
    } else if (shot === 'end') {
      for (let i = 0; i < this.totalDifferences; i++) this.markFound(i);
      this.completeLevel();
    }
  }

  // Mark a difference found without playing sounds (staging only).
  markFound(i) {
    const d = this.scene.differences[i];
    this.found.add(i);
    this.marks.push({ x: d.x, y: d.y, panel: 0, kind: 'found', born: 0 });
    this.marks.push({ x: d.x, y: d.y, panel: 1, kind: 'found', born: 0 });
  }
}

export { sceneById };
