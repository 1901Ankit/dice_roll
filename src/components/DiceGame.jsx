import { useCallback, useEffect, useRef, useState } from 'react';
import Dice from './Dice';
import RollButton from './RollButton';
import GameStatus from './GameStatus';
import { useShakeDetector } from '../hooks/useShakeDetector';
import { randomDie, restRotation, rollTimings, tumbleTo } from '../utils/dice';
import { playDiceSound, primeAudio } from '../utils/sound';

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
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate([80, 40, 120]);
      }
    }, t.settleAt);
  }, []);

  const { motionState, requestPermission } = useShakeDetector(roll);

  const handleRollClick = useCallback(() => {
    primeAudio(); // user gesture — unlocks AudioContext for this and future rolls
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
    <main className="game-shell">
      <div className="ambient ambient--a" aria-hidden="true" />
      <div className="ambient ambient--b" aria-hidden="true" />

      <section className="game-card" aria-label="Shake and Roll dice game">
        <header className="game-header">
          <p className="game-eyebrow">2 Dice Game</p>
          <h1 className="game-title">SHAKE &amp; ROLL</h1>
          <p className="game-subtitle">Shake your phone to roll the dice</p>
        </header>

        <div className="dice-row">
          <Dice
            rotation={rotations[0]}
            rolling={rolling}
            duration={timings[0].duration}
            delay={timings[0].delay}
            tiltY={-16}
            label="Die 1"
          />
          <Dice
            rotation={rotations[1]}
            rolling={rolling}
            duration={timings[1].duration}
            delay={timings[1].delay}
            tiltY={14}
            label="Die 2"
          />
        </div>

        <div
          className={`result${rolling ? ' is-rolling' : ''}`}
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="result__values">
            <span>DIE 1: {result.a}</span>
            <span className="result__sep" aria-hidden="true" />
            <span>DIE 2: {result.b}</span>
          </div>
          <span className="result__label">TOTAL</span>
          <span key={result.stamp} className="result__total">
            {result.total}
          </span>
          <span className="result__parts">
            {result.a} + {result.b}
          </span>
          <span className="sr-only">
            Die 1 shows {result.a}, die 2 shows {result.b}, total {result.total}
          </span>
        </div>

        <RollButton rolling={rolling} onRoll={handleRollClick} />

        <div className="motion-area">
          {motionState === 'needs-permission' && (
            <button type="button" className="motion-button" onClick={handleEnableMotion}>
              ENABLE MOTION
            </button>
          )}
          {motionState === 'enabled' && (
            <span className="motion-chip motion-chip--on">
              <span className="motion-chip__pulse" aria-hidden="true" />
              SHAKE TO ROLL
            </span>
          )}
          {motionState === 'denied' && (
            <span className="motion-chip">Motion off — the button still works</span>
          )}
          {motionState === 'unsupported' && (
            <span className="motion-chip">Motion unavailable — use Roll Dice</span>
          )}
        </div>

        <GameStatus tone={statusTone}>{statusText}</GameStatus>

        <footer className="game-footer">
          <span>2D6 · works offline · no app needed</span>
        </footer>
      </section>
    </main>
  );
}
