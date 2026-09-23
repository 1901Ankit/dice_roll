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

function makeNoiseBuffer(ctx, seconds) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
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

    const master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);

    const noise = makeNoiseBuffer(ctx, 0.8);

    // Shaker swish as the dice are tossed.
    const shakeSrc = ctx.createBufferSource();
    shakeSrc.buffer = noise;
    const shakeFilter = ctx.createBiquadFilter();
    shakeFilter.type = 'bandpass';
    shakeFilter.Q.value = 1.2;
    shakeFilter.frequency.setValueAtTime(900, now);
    shakeFilter.frequency.exponentialRampToValueAtTime(4200, now + 0.12);
    shakeFilter.frequency.exponentialRampToValueAtTime(1400, now + 0.5);
    const shakeGain = ctx.createGain();
    shakeGain.gain.setValueAtTime(0.0001, now);
    shakeGain.gain.exponentialRampToValueAtTime(0.13, now + 0.05);
    shakeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    shakeSrc.connect(shakeFilter);
    shakeFilter.connect(shakeGain);
    shakeGain.connect(master);
    shakeSrc.start(now);
    shakeSrc.stop(now + 0.6);

    // Dice clacks: a sharp noise tick layered with a short woody knock.
    const clacks = [0.05, 0.13, 0.21, 0.3, 0.39, 0.47, 0.56, 0.64];
    clacks.forEach((offset, i) => {
      const t = now + offset + (Math.random() - 0.5) * 0.025;
      const peak = 0.05 + 0.22 * (1 - i / (clacks.length + 1));

      const src = ctx.createBufferSource();
      src.buffer = noise;
      src.playbackRate.value = 0.85 + Math.random() * 0.5;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2200 + Math.random() * 2600;
      filter.Q.value = 1.4;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(peak, t + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05 + Math.random() * 0.03);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      src.start(t);
      src.stop(t + 0.1);

      if (i % 2 === 0) {
        const knock = ctx.createOscillator();
        knock.type = 'triangle';
        knock.frequency.setValueAtTime(320 + Math.random() * 160, t);
        knock.frequency.exponentialRampToValueAtTime(140, t + 0.05);
        const knockGain = ctx.createGain();
        knockGain.gain.setValueAtTime(0.0001, t);
        knockGain.gain.exponentialRampToValueAtTime(peak * 0.9, t + 0.004);
        knockGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
        knock.connect(knockGain);
        knockGain.connect(master);
        knock.start(t);
        knock.stop(t + 0.09);
      }
    });

    // Low "thump" as the dice land, with a soft click on top.
    const tEnd = now + 0.72;
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, tEnd);
    osc.frequency.exponentialRampToValueAtTime(60, tEnd + 0.14);
    oscGain.gain.setValueAtTime(0.0001, tEnd);
    oscGain.gain.exponentialRampToValueAtTime(0.22, tEnd + 0.012);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, tEnd + 0.18);
    osc.connect(oscGain);
    oscGain.connect(master);
    osc.start(tEnd);
    osc.stop(tEnd + 0.22);

    const landSrc = ctx.createBufferSource();
    landSrc.buffer = noise;
    const landFilter = ctx.createBiquadFilter();
    landFilter.type = 'lowpass';
    landFilter.frequency.value = 900;
    const landGain = ctx.createGain();
    landGain.gain.setValueAtTime(0.0001, tEnd);
    landGain.gain.exponentialRampToValueAtTime(0.12, tEnd + 0.006);
    landGain.gain.exponentialRampToValueAtTime(0.0001, tEnd + 0.09);
    landSrc.connect(landFilter);
    landFilter.connect(landGain);
    landGain.connect(master);
    landSrc.start(tEnd);
    landSrc.stop(tEnd + 0.12);
  } catch {
    /* audio is purely decorative — never break the game */
  }
}

/** Gentle two-note chime when the dice settle on a result. */
export function playResultSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    [523.25, 783.99].forEach((freq, i) => {
      const t = now + i * 0.09;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.11, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  } catch {
    /* audio is purely decorative — never break the game */
  }
}
