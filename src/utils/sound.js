/**
 * Lightweight dice-roll sound generated with the Web Audio API.
 * No external audio files. AudioContext is created lazily and only inside
 * (or after) a user interaction so autoplay policies are respected.
 * Everything is best-effort: if audio is unavailable the game still works.
 */

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (typeof AC !== 'function') return null;
  try {
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/** Call from a user gesture (tap/click) so later sounds are allowed. */
export function primeAudio() {
  getAudioContext();
}

/** Short synthesized dice rattle: a few noisy clacks + a soft landing thump. */
export function playDiceSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Shared white-noise buffer for the clacks.
    const len = Math.floor(ctx.sampleRate * 0.5);
    const noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < len; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }

    const clacks = [0, 0.09, 0.16, 0.26, 0.34, 0.46];
    clacks.forEach((offset, i) => {
      const src = ctx.createBufferSource();
      src.buffer = noise;
      src.playbackRate.value = 0.9 + Math.random() * 0.3;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1600 + Math.random() * 2400;
      filter.Q.value = 0.9;

      const gain = ctx.createGain();
      const t = now + offset;
      const peak = 0.08 + 0.26 * (1 - i / (clacks.length + 1));
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(peak, t + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07 + Math.random() * 0.03);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start(t);
      src.stop(t + 0.12);
    });

    // Low "thump" as the dice land.
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    const tEnd = now + 0.5;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, tEnd);
    osc.frequency.exponentialRampToValueAtTime(70, tEnd + 0.12);
    oscGain.gain.setValueAtTime(0.0001, tEnd);
    oscGain.gain.exponentialRampToValueAtTime(0.2, tEnd + 0.012);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, tEnd + 0.16);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(tEnd);
    osc.stop(tEnd + 0.2);
  } catch {
    /* audio is purely decorative — never break the game */
  }
}
