/**
 * Dice geometry and roll math.
 *
 * Cube face layout (which pip value lives on which CSS face):
 *   front -> 1, back -> 6, right -> 3, left -> 4, top -> 2, bottom -> 5
 * Opposite faces always sum to 7: 1/6, 2/5, 3/4.
 */

export const DIE_FACES = [
  { name: 'front', value: 1 },
  { name: 'back', value: 6 },
  { name: 'right', value: 3 },
  { name: 'left', value: 4 },
  { name: 'top', value: 2 },
  { name: 'bottom', value: 5 },
];

/**
 * Cube rotation (deg) that brings the face carrying `value` to the front
 * (normal pointing at the viewer, +Z).
 */
const REST_ROTATION = {
  1: { x: 0, y: 0 },
  2: { x: -90, y: 0 },
  3: { x: 0, y: -90 },
  4: { x: 0, y: 90 },
  5: { x: 90, y: 0 },
  6: { x: 0, y: 180 },
};

export const randomDie = () => 1 + Math.floor(Math.random() * 6);

export const restRotation = (value) => ({ ...REST_ROTATION[value], z: 0 });

const mod360 = (deg) => ((deg % 360) + 360) % 360;
const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const randSign = () => (Math.random() < 0.5 ? -1 : 1);

/**
 * Compute the next absolute rotation for a die so it tumbles through extra
 * full spins and lands with `value` facing the viewer.
 *
 * The returned x/y is always congruent to REST_ROTATION[value] (mod 360),
 * so the CSS transition ends on the exact correct face.
 */
export function tumbleTo(current, value, reducedMotion = false) {
  const rest = REST_ROTATION[value];
  if (reducedMotion) {
    return { x: rest.x, y: rest.y, z: 0 };
  }
  return {
    x: current.x + (rest.x - mod360(current.x)) + 360 * randInt(2, 3) * randSign(),
    y: current.y + (rest.y - mod360(current.y)) + 360 * randInt(2, 3) * randSign(),
    z: current.z - mod360(current.z) + 360 * randInt(0, 1) * randSign(),
  };
}

/**
 * Per-die animation timing so the two dice never move in sync.
 * Returns [{ duration, delay }, { duration, delay }] in ms plus the time at
 * which the whole roll is considered settled.
 */
export function rollTimings(reducedMotion = false) {
  if (reducedMotion) {
    const dice = [{ duration: 220, delay: 0 }, { duration: 220, delay: 0 }];
    return { dice, settleAt: 260 };
  }
  const dice = [
    { duration: randInt(940, 1060), delay: 0 },
    { duration: randInt(1040, 1180), delay: randInt(60, 120) },
  ];
  const settleAt = Math.max(dice[0].duration + dice[0].delay, dice[1].duration + dice[1].delay) + 80;
  return { dice, settleAt };
}
