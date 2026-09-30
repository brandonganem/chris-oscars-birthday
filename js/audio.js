// All sound is synthesized live with WebAudio, so there are no audio files to host.
const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12);
const M = { C4: 60, D4: 62, E4: 64, F4: 65, G4: 67, A4: 69, Bb4: 70, B4: 71, C5: 72, D5: 74, E5: 76, F5: 77, G5: 79, A5: 81, C6: 84 };

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this._playoff = null;
  }

  init() {
    if (this.ctx) { this.ctx.resume?.(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.55;
    const comp = this.ctx.createDynamicsCompressor();
    this.master.connect(comp).connect(this.ctx.destination);
    // A shared noise buffer for drums, cymbals and fireworks.
    const len = this.ctx.sampleRate * 2;
    this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : 0.55, this.ctx.currentTime, 0.05);
    return this.muted;
  }

  get t() { return this.ctx ? this.ctx.currentTime : 0; }

  tone(freq, start, dur, { type = 'sine', gain = 0.2, attack = 0.01, release = 0.12, filter = null, detune = 0, dest = null } = {}) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.detune.value = detune;
    let node = o;
    if (filter) {
      const f = this.ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = filter;
      node.connect(f);
      node = f;
    }
    node.connect(g).connect(dest || this.master);
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(gain, start + attack);
    g.gain.setValueAtTime(gain, start + Math.max(attack, dur - release));
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur + 0.02);
    o.start(start);
    o.stop(start + dur + 0.05);
    return o;
  }

  brass(freq, start, dur, gain = 0.09) {
    [-7, 0, 7].forEach((det) => this.tone(freq, start, dur, { type: 'sawtooth', gain, attack: 0.04, release: 0.2, filter: 2400, detune: det }));
  }

  noiseBurst(start, dur, { gain = 0.3, type = 'highpass', freq = 3000, q = 0.7, dest = null } = {}) {
    if (!this.ctx) return;
    const s = this.ctx.createBufferSource();
    s.buffer = this.noise;
    const f = this.ctx.createBiquadFilter();
    f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    s.connect(f).connect(g).connect(dest || this.master);
    s.start(start, Math.random());
    s.stop(start + dur + 0.05);
  }

  timpani(freq, start, gain = 0.5) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.frequency.setValueAtTime(freq * 1.5, start);
    o.frequency.exponentialRampToValueAtTime(freq, start + 0.08);
    g.gain.setValueAtTime(gain, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + 0.9);
    o.connect(g).connect(this.master);
    o.start(start); o.stop(start + 1);
    this.noiseBurst(start, 0.12, { gain: 0.15, type: 'lowpass', freq: 400 });
  }

  fanfare() {
    if (!this.ctx) return;
    const t = this.t + 0.05;
    const seq = [[M.G4, 0, 0.18], [M.G4, 0.2, 0.12], [M.G4, 0.34, 0.12], [M.C5, 0.5, 0.5], [M.G4, 1.05, 0.25], [M.C5, 1.32, 0.18], [M.E5, 1.52, 0.18], [M.G5, 1.72, 1.2]];
    seq.forEach(([n, s, d]) => this.brass(NOTE(n), t + s, d));
    [M.C4, M.E4, M.G4].forEach((n) => this.brass(NOTE(n), t + 1.72, 1.2, 0.05));
    this.timpani(NOTE(M.C4 - 24), t + 0.5);
    this.timpani(NOTE(M.G4 - 36), t + 1.05, 0.4);
    this.timpani(NOTE(M.C4 - 24), t + 1.72, 0.6);
    this.noiseBurst(t + 1.72, 1.6, { gain: 0.12, freq: 5000 });
  }

  ding() {
    const t = this.t;
    this.tone(NOTE(M.E5 + 12), t, 0.5, { gain: 0.16, release: 0.4 });
    this.tone(NOTE(M.B4 + 24), t + 0.09, 0.7, { gain: 0.14, release: 0.6 });
  }

  sparkle() {
    const t = this.t;
    [M.C6, M.C6 + 4, M.C6 + 7, M.C6 + 12].forEach((n, i) => this.tone(NOTE(n), t + i * 0.05, 0.3, { gain: 0.06, type: 'triangle' }));
  }

  sadTrombone() {
    if (!this.ctx) return;
    const t = this.t;
    const notes = [M.Bb4 - 12, M.A4 - 12, M.A4 - 13, M.G4 - 12];
    notes.forEach((n, i) => {
      const dur = i === 3 ? 1.0 : 0.32;
      const o = this.tone(NOTE(n), t + i * 0.36, dur, { type: 'sawtooth', gain: 0.1, filter: 900, attack: 0.05 });
      if (i === 3 && o) {
        const lfo = this.ctx.createOscillator();
        const lg = this.ctx.createGain();
        lfo.frequency.value = 6; lg.gain.value = 18;
        lfo.connect(lg).connect(o.detune);
        lfo.start(t + i * 0.36); lfo.stop(t + i * 0.36 + dur);
      }
    });
  }

  tick() { this.tone(1800, this.t, 0.03, { type: 'square', gain: 0.03, release: 0.02 }); }

  shutter() {
    const t = this.t;
    this.noiseBurst(t, 0.04, { gain: 0.12, freq: 2500 });
    this.noiseBurst(t + 0.07, 0.05, { gain: 0.08, freq: 3500 });
  }

  whoosh() { this.noiseBurst(this.t, 0.5, { gain: 0.08, type: 'bandpass', freq: 900, q: 0.6 }); }

  boom() {
    const t = this.t;
    this.noiseBurst(t, 0.9, { gain: 0.22, type: 'lowpass', freq: 700 });
    this.noiseBurst(t + 0.03, 1.2, { gain: 0.05, freq: 4000 });
  }

  poof() { this.noiseBurst(this.t, 0.35, { gain: 0.18, type: 'bandpass', freq: 600, q: 0.5 }); }

  drumroll(dur = 2.6) {
    if (!this.ctx) return;
    const t = this.t;
    const hits = Math.floor(dur * 22);
    for (let i = 0; i < hits; i++) {
      const p = i / hits;
      this.noiseBurst(t + i / 22 + Math.random() * 0.006, 0.06, { gain: 0.05 + p * 0.18, type: 'bandpass', freq: 1800, q: 0.8 });
    }
    this.noiseBurst(t + dur, 1.8, { gain: 0.3, freq: 5000 });
    this.timpani(NOTE(M.C4 - 24), t + dur, 0.6);
  }

  // Play-off music that loops until it is stopped.
  startPlayoff() {
    if (!this.ctx || this._playoff) return;
    const bus = this.ctx.createGain();
    bus.gain.value = 0;
    bus.gain.linearRampToValueAtTime(1, this.t + 1.5);
    bus.connect(this.master);
    const melody = [M.C5, M.E5, M.G5, M.C6, M.B4 + 12, M.G5, M.E5, M.G5, M.A5, M.F5, M.D5, M.F5, M.G5, M.E5, M.C5, M.G4];
    const chords = [[M.C4, M.E4, M.G4], [M.G4 - 12, M.B4 - 12, M.D4], [M.F4 - 12, M.A4 - 12, M.C4], [M.G4 - 12, M.B4 - 12, M.D4]];
    const beat = 0.24;
    let bar = 0;
    let next = this.t + 0.05;
    const schedule = () => {
      while (next < this.t + 1.2) {
        const c = chords[bar % 4];
        c.forEach((n) => this.tone(NOTE(n), next, beat * 4, { type: 'sawtooth', gain: 0.035, filter: 1400, attack: 0.08, dest: bus }));
        for (let i = 0; i < 4; i++) {
          const n = melody[(bar % 4) * 4 + i];
          this.tone(NOTE(n), next + i * beat, beat * 0.95, { type: 'triangle', gain: 0.09, dest: bus });
          this.tone(NOTE(n) * 2, next + i * beat, beat * 0.5, { type: 'sine', gain: 0.02, dest: bus });
        }
        this.timpani(NOTE(c[0] - 24), next, 0.25);
        next += beat * 4;
        bar++;
      }
    };
    schedule();
    const id = setInterval(schedule, 300);
    this._playoff = { id, bus };
  }

  stopPlayoff() {
    if (!this._playoff) return;
    const { id, bus } = this._playoff;
    clearInterval(id);
    bus.gain.cancelScheduledValues(this.t);
    bus.gain.setTargetAtTime(0, this.t, 0.2);
    setTimeout(() => bus.disconnect(), 1500);
    this._playoff = null;
  }

  happyBirthday() {
    if (!this.ctx) return;
    // "Happy Birthday to You" is in the public domain.
    const b = 0.42;
    const song = [
      [M.G4, 0.75], [M.G4, 0.25], [M.A4, 1], [M.G4, 1], [M.C5, 1], [M.B4, 2],
      [M.G4, 0.75], [M.G4, 0.25], [M.A4, 1], [M.G4, 1], [M.D5, 1], [M.C5, 2],
      [M.G4, 0.75], [M.G4, 0.25], [M.G5, 1], [M.E5, 1], [M.C5, 1], [M.B4, 1], [M.A4, 2],
      [M.F5, 0.75], [M.F5, 0.25], [M.E5, 1], [M.C5, 1], [M.D5, 1], [M.C5, 3],
    ];
    let t = this.t + 0.1;
    song.forEach(([n, d]) => {
      this.tone(NOTE(n), t, d * b * 0.95, { type: 'triangle', gain: 0.14, release: 0.08 });
      this.tone(NOTE(n + 12), t, d * b * 0.6, { type: 'sine', gain: 0.03 });
      t += d * b;
    });
    return t - this.t;
  }
}

export const Sound = new SoundEngine();
