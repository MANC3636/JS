// sound.js — Web Audio helper and exported sound functions
let audioCtx = null;

export function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

export function beep(freq, duration, type = 'square', vol = 0.15, startOffset = 0) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startOffset);
    gain.gain.setValueAtTime(vol, ctx.currentTime + startOffset);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + duration);
    osc.start(ctx.currentTime + startOffset);
    osc.stop(ctx.currentTime + startOffset + duration);
  } catch (_) { /* audio not available */ }
}

export function sndWallHit()    { beep(250, 0.05, 'square', 0.12); }
export function sndPlayerHit()  { beep(480, 0.07, 'square', 0.18); }
export function sndAiHit()      { beep(320, 0.07, 'square', 0.12); }
export function sndGameOver()   {
  beep(392, 0.25, 'sine', 0.18, 0.0);
  beep(330, 0.25, 'sine', 0.18, 0.25);
  beep(262, 0.45, 'sine', 0.18, 0.50);
}

export function sndCorrect(delayS = 0) {
  beep(523, 0.12, 'sine', 0.15, delayS);
  beep(659, 0.16, 'sine', 0.15, delayS + 0.12);
}
export function sndWrong(delayS = 0) {
  beep(180, 0.22, 'sawtooth', 0.10, delayS);
}
export function sndQuizPassed() {
  [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.18, 'sine', 0.20, i * 0.14));
}
export function sndQuizFailed() {
  beep(349, 0.20, 'sawtooth', 0.10, 0.0);
  beep(294, 0.30, 'sawtooth', 0.10, 0.22);
}

export default {
  getAudioCtx, beep, sndWallHit, sndPlayerHit, sndAiHit, sndGameOver, sndCorrect, sndWrong, sndQuizPassed, sndQuizFailed,
};
