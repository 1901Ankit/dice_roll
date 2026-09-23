/**
 * One face of a die: a translucent glass tile with pips laid out on a 3x3 grid.
 * Cell indices (0-8) that carry a pip for each value.
 */
const PIP_CELLS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const FACE_TRANSFORM = {
  front: '[transform:rotateY(0deg)_translateZ(calc(var(--die-size)/2))]',
  back: '[transform:rotateY(180deg)_translateZ(calc(var(--die-size)/2))]',
  right: '[transform:rotateY(90deg)_translateZ(calc(var(--die-size)/2))]',
  left: '[transform:rotateY(-90deg)_translateZ(calc(var(--die-size)/2))]',
  top: '[transform:rotateX(90deg)_translateZ(calc(var(--die-size)/2))]',
  bottom: '[transform:rotateX(-90deg)_translateZ(calc(var(--die-size)/2))]',
};

const DIE_COLORS = {
  red: {
    face: 'bg-[radial-gradient(140%_140%_at_26%_18%,rgba(255,255,255,0.65)_0%,rgba(224,17,95,0.4)_15%,rgba(224,17,95,0.75)_45%,rgba(45,2,20,0.95)_100%)]',
    pip: 'bg-[radial-gradient(circle_at_36%_30%,#ffffff_0%,#f1f5f9_62%,#cbd5e1_100%)]',
  },
  blue: {
    face: 'bg-[radial-gradient(140%_140%_at_26%_18%,rgba(255,255,255,0.65)_0%,rgba(15,82,186,0.4)_15%,rgba(15,82,186,0.75)_45%,rgba(3,12,40,0.95)_100%)]',
    pip: 'bg-[radial-gradient(circle_at_36%_30%,#ffffff_0%,#f1f5f9_62%,#cbd5e1_100%)]',
  },
};

export default function DiceFace({ face, value, color = 'red' }) {
  const pips = PIP_CELLS[value];
  const palette = DIE_COLORS[color] ?? DIE_COLORS.red;
  return (
    <div
      className={`absolute inset-0 grid rounded-[13%] border border-white/35 p-[17%] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4),inset_0_-10px_18px_rgba(0,0,0,0.3),inset_0_8px_14px_rgba(255,255,255,0.55)] backdrop-blur-[2px] backface-hidden ${palette.face} ${FACE_TRANSFORM[face]}`}
      data-value={value}
    >
      <div className="grid grid-cols-3 grid-rows-3">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className="grid place-items-center">
            {pips.includes(i) && (
              <span
                className={`aspect-square w-[78%] rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.55),inset_0_-1px_1px_rgba(255,255,255,0.3),0_1px_0_rgba(255,255,255,0.2)] ${palette.pip}`}
              />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
