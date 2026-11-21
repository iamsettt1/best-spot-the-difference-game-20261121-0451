// Twin Lanterns — synthesized sounds. No audio files: every sound is a
// small WebAudio oscillator phrase, created lazily on the first user gesture
// so browsers allow it. M toggles mute.

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.master = null;
  }

  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const AC = window.AudioContext ?? window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.5;
    this.master.connect(this.ctx.destination);
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  tone(freq, at, dur, type, vol, slideTo) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + at;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  // A bright two-note chime when a difference is found.
  found() {
    this.ensure();
    this.tone(880, 0, 0.22, 'sine', 0.35);
    this.tone(1318.5, 0.07, 0.32, 'sine', 0.3);
    this.tone(1760, 0.14, 0.3, 'triangle', 0.12);
  }

  // A soft low thud for a wrong click.
  wrong() {
    this.ensure();
    this.tone(180, 0, 0.18, 'square', 0.12, 110);
  }

  click() {
    this.ensure();
    this.tone(660, 0, 0.07, 'triangle', 0.14);
  }

  hint() {
    this.ensure();
    this.tone(523.25, 0, 0.16, 'sine', 0.22);
    this.tone(783.99, 0.09, 0.22, 'sine', 0.2);
  }

  // Level-complete arpeggio.
  win() {
    this.ensure();
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((f, i) => this.tone(f, i * 0.09, 0.4, 'triangle', 0.22));
  }

  // Gentle descending phrase on timeout.
  lose() {
    this.ensure();
    this.tone(392, 0, 0.3, 'sine', 0.2);
    this.tone(311.13, 0.18, 0.35, 'sine', 0.2);
    this.tone(233.08, 0.36, 0.5, 'sine', 0.18);
  }

  // Short tick in the last ten seconds.
  tick() {
    this.ensure();
    this.tone(1200, 0, 0.05, 'sine', 0.1);
  }
}
