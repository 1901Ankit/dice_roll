import DiceFace from './DiceFace';
import { DIE_FACES } from '../utils/dice';

/**
 * A single CSS 3D die.
 *
 * Element layers (outside -> in):
 *   .die-scene   - perspective + ground shadow
 *   .die-hop     - vertical bounce animation while rolling
 *   .die-tilt    - fixed slight tilt so the cube reads as 3D at rest
 *   .die-cube    - the cube; its transform is transitioned to the value
 *                  rotation, so the front face always shows the rolled value
 */
export default function Dice({ rotation, rolling, duration, delay, tiltY, label }) {
  const timingStyle = { '--hop-dur': `${duration}ms`, '--hop-delay': `${delay}ms` };

  return (
    <div className="die-wrap">
      <div className="die-scene" aria-hidden="true">
        <div
          className={`die-hop${rolling ? ' is-rolling' : ''}`}
          style={timingStyle}
        >
          <div
            className="die-tilt"
            style={{ transform: `rotateX(-14deg) rotateY(${tiltY}deg)` }}
          >
            <div
              className="die-cube"
              style={{
                transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
                transitionDuration: `${duration}ms`,
                transitionDelay: `${delay}ms`,
              }}
            >
              {DIE_FACES.map((f) => (
                <DiceFace key={f.name} face={f.name} value={f.value} />
              ))}
            </div>
          </div>
        </div>
        <div
          className={`die-shadow${rolling ? ' is-rolling' : ''}`}
          style={timingStyle}
        />
      </div>
      <span className="die-label">{label}</span>
    </div>
  );
}
