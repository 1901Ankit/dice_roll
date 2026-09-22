/**
 * One face of a die: an ivory tile with pips laid out on a 3x3 grid.
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

export default function DiceFace({ face, value }) {
  const pips = PIP_CELLS[value];
  return (
    <div className={`die-face die-face--${face}`} data-value={value}>
      <div className="pips">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className="pip-cell">
            {pips.includes(i) && <span className="pip" />}
          </span>
        ))}
      </div>
    </div>
  );
}
