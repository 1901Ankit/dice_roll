import DiceFace from './DiceFace';
import { DIE_FACES } from '../utils/dice';


export default function Dice({ rotation, rolling, duration, delay, tiltY, label, color }) {
  const timingStyle = { '--hop-dur': `${duration}ms`, '--hop-delay': `${delay}ms` };

  return (
    <div className="flex flex-col items-center gap-[clamp(14px,4vw,22px)]">
      <div
        className="relative h-[var(--die-size)] w-[var(--die-size)] [--die-size:clamp(92px,26vw,128px)] perspective-[calc(var(--die-size)*5.5)]"
        aria-hidden="true"
      >
        <div
          className={`h-full w-full transform-3d${rolling ? ' animate-dice-hop motion-reduce:animate-none' : ''}`}
          style={timingStyle}
        >
          <div
            className="h-full w-full transform-3d"
            style={{ transform: `rotateX(-20deg) rotateY(${tiltY}deg)` }}
          >
            <div
              className="relative h-full w-full transform-3d transition-transform ease-[cubic-bezier(0.18,0.9,0.3,1.08)] will-change-transform motion-reduce:ease-out"
              style={{
                transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
                transitionDuration: `${duration}ms`,
                transitionDelay: `${delay}ms`,
              }}
            >
              {DIE_FACES.map((f) => (
                <DiceFace key={f.name} face={f.name} value={f.value} color={color} />
              ))}
            </div>
          </div>
        </div>
        {/* <div
          className={`absolute right-[6%] bottom-[-19%] left-[6%] h-[13%] origin-center rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.6)_0%,transparent_68%)] opacity-[0.85] blur-[5px]${rolling ? ' animate-shadow-hop motion-reduce:animate-none' : ''}`}
          style={timingStyle}
        /> */}
      </div>
      <span className="text-[0.78rem] font-bold tracking-[0.28em] text-faint uppercase mt-4 bg-[linear-gradient(180deg,#ffffff_20%,#b9c2d8_90%)] bg-clip-text [-webkit-text-fill-color:transparent]">
        {label}
      </span>
    </div>
  );
}
