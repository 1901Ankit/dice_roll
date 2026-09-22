export default function RollButton({ rolling, onRoll }) {
  return (
    <button
      type="button"
      className={`roll-button${rolling ? ' is-rolling' : ''}`}
      onClick={onRoll}
      disabled={rolling}
    >
      <span className="roll-button__label">{rolling ? 'ROLLING…' : 'ROLL DICE'}</span>
    </button>
  );
}
