import { useCallback, useEffect, useRef, useState } from 'react';
import Dice from './Dice';
import RollButton from './RollButton';
import GameStatus from './GameStatus';
import { useShakeDetector } from '../hooks/useShakeDetector';
import { randomDie, restRotation, rollTimings, tumbleTo } from '../utils/dice';
import { playDiceSound, playResultSound, primeAudio } from '../utils/sound';
import bgImage from '../assets/winner.png';

const INITIAL_VALUES = [5, 2];

const isReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function DiceGame() {
  const [result, setResult] = useState({ a: 5, b: 2, total: 7, stamp: 0, rolled: false });
  const [rotations, setRotations] = useState(() => INITIAL_VALUES.map(restRotation));
  const [timings, setTimings] = useState(() => rollTimings(false).dice);
  const [rolling, setRolling] = useState(false);

  const rollingRef = useRef(false);
  const settleTimer = useRef(null);

  const roll = useCallback(() => {
    if (rollingRef.current) return;
    rollingRef.current = true;

    const a = randomDie();
    const b = randomDie();
    const reduced = isReducedMotion();
    const t = rollTimings(reduced);

    setTimings(t.dice);
    setRolling(true);
    setRotations((prev) => [
      tumbleTo(prev[0], a, reduced),
      tumbleTo(prev[1], b, reduced),
    ]);
    playDiceSound();

    settleTimer.current = setTimeout(() => {
      rollingRef.current = false;
      setRolling(false);
      setResult({ a, b, total: a + b, stamp: Date.now(), rolled: true });
      playResultSound();
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate([80, 40, 120]);
      }
    }, t.settleAt);
  }, []);

  const { motionState, requestPermission } = useShakeDetector(roll);

  const handleRollClick = useCallback(() => {
    primeAudio();
    roll();
  }, [roll]);

  const handleEnableMotion = useCallback(async () => {
    primeAudio();
    await requestPermission();
  }, [requestPermission]);

  useEffect(() => () => clearTimeout(settleTimer.current), []);

  let statusTone = 'off';
  let statusText;
  if (rolling) {
    statusTone = 'rolling';
    statusText = 'Rolling…';
  } else if (result.rolled) {
    statusTone = 'result';
    statusText =
      motionState === 'enabled'
        ? `Rolled ${result.total} — shake to roll again`
        : `Rolled ${result.total}`;
  } else if (motionState === 'enabled') {
    statusTone = 'on';
    statusText = 'Shake your phone to roll';
  } else if (motionState === 'needs-permission') {
    statusTone = 'warn';
    statusText = 'Enable motion to shake';
  } else if (motionState === 'denied') {
    statusTone = 'warn';
    statusText = 'Motion blocked — use Roll Dice';
  } else {
    statusTone = 'off';
    statusText = 'Motion unavailable — use Roll Dice';
  }

  return (
    <main
      className="relative grid min-h-dvh place-items-center overflow-hidden bg-cover bg-center bg-no-repeat px-4 
       "
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-black/25 backdrop-blur-[1px]"
        aria-hidden="true"
      />

      <section
        className="relative isolate flex w-[min(100%,450px)] flex-col items-center gap-[clamp(14px,3.5vw,22px)] overflow-hidden rounded-[32px] bg-cover bg-center bg-no-repeat px-[clamp(20px,5vw,36px)] pt-[clamp(24px,6vw,38px)] pb-[calc(clamp(18px,4vw,26px)+env(safe-area-inset-bottom))] shadow-[0_30px_90px_rgba(0,0,0,0.75)] before:absolute before:inset-0 before:-z-10 before:bg-black/45 before:content-['']"
        aria-label="Shake and Roll dice game" style={{ backgroundImage: `url(${bgImage})` }}

      >
        <header className="text-center">
          <p className="mb-2 text-[clamp(0.62rem,2.4vw,0.72rem)] font-bold tracking-[0.42em] text-accent uppercase">
            2 Dice Game
          </p>
          <h1 className="bg-[linear-gradient(180deg,#ffffff_20%,#b9c2d8_90%)] bg-clip-text text-[clamp(2rem,8.5vw,2.9rem)] leading-[1.05] font-black tracking-[0.02em] text-transparent [-webkit-text-fill-color:transparent] [text-shadow:0_0_42px_rgba(245,158,11,0.18)]">
            SHAKE &amp; ROLL
          </h1>
          <p className="mt-2 text-[clamp(0.82rem,3vw,0.95rem)] font-medium text-dim bg-[linear-gradient(180deg,#ffffff_20%,#b9c2d8_90%)] bg-clip-text [-webkit-text-fill-color:transparent]">
            Shake your phone to roll the dice
          </p>
        </header>

        <div className="flex items-start justify-center gap-[clamp(30px,9vw,60px)] pt-[clamp(6px,2vw,14px)]">
          <Dice
            rotation={rotations[0]}
            rolling={rolling}
            duration={timings[0].duration}
            delay={timings[0].delay}
            tiltY={-16}
            label="Die 1"
            color="red"
          />
          <Dice
            rotation={rotations[1]}
            rolling={rolling}
            duration={timings[1].duration}
            delay={timings[1].delay}
            tiltY={14}
            label="Die 2"
            color="blue"
          />
        </div>

        <div
          className={`flex  flex-col items-center justify-center gap-0.5 transition-opacity duration-250${rolling ? ' opacity-35' : ''}`}
          aria-live="polite"
          aria-atomic="true"
        >
          {/* <div className="mb-1 flex items-center gap-3 text-[0.72rem] font-bold tracking-[0.22em] text-dim">
            <span>DIE 1: {result.a}</span>
            <span className="h-1 w-1 rounded-full bg-faint" aria-hidden="true" />
            <span>DIE 2: {result.b}</span>
          </div> */}
          <span className="text-[0.68rem] font-extrabold tracking-[0.5em] ">
            TOTAL
          </span>
          <span
            key={result.stamp}
            className="block animate-result-pop bg-[linear-gradient(180deg,#ffffff_15%,#fbbf24_130%)] bg-clip-text text-[clamp(3.4rem,15vw,4.6rem)] leading-none font-black text-transparent [-webkit-text-fill-color:transparent] motion-reduce:animate-[result-pop_0.2s_ease_both]"
          >
            {result.total}
          </span>
          <span className="text-[clamp(0.9rem,3.4vw,1.05rem)] font-semibold tracking-[0.18em] ">
            {result.a} + {result.b}
          </span>
          <span className="sr-only">
            Die 1 shows {result.a}, die 2 shows {result.b}, total {result.total}
          </span>
        </div>

        <RollButton rolling={rolling} onRoll={handleRollClick} />

        <div className="grid  place-items-center">
          {motionState === 'needs-permission' && (
            <button
              type="button"
              className="rounded-full border border-accent/60 bg-black/55 px-[26px] py-[11px] text-[0.78rem] font-extrabold tracking-[0.22em] text-accent shadow-[0_0_24px_rgba(245,158,11,0.28)] backdrop-blur-md transition-[background,transform,border-color,box-shadow] duration-200 select-none hover:-translate-y-px hover:border-accent hover:bg-accent/10 hover:shadow-[0_0_36px_rgba(245,158,11,0.45)] active:translate-y-0 active:scale-[0.97]"
              onClick={handleEnableMotion}
            >
              ENABLE MOTION
            </button>
          )}
          {motionState === 'enabled' && (
            <span className="inline-flex items-center gap-2 rounded-full border border-green/40 bg-black/50 px-[18px] py-[9px] text-[0.7rem] font-bold tracking-[0.24em] text-green backdrop-blur-md">
              <span
                className="h-[7px] w-[7px] animate-chip-pulse rounded-full bg-green motion-reduce:animate-none"
                aria-hidden="true"
              />
              SHAKE TO ROLL
            </span>
          )}
          {motionState === 'denied' && (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-[18px] py-[9px] text-[0.7rem] font-bold tracking-[0.24em] text-dim backdrop-blur-md">
              Motion off — the button still works
            </span>
          )}
          {motionState === 'unsupported' && (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-[18px] py-[9px] text-[0.7rem] font-bold tracking-[0.24em] text-dim backdrop-blur-md">
              Motion unavailable — use Roll Dice
            </span>
          )}
        </div>

        {/* <GameStatus tone={statusTone}>{statusText}</GameStatus> */}

        
      </section>
    </main>
  );
}
