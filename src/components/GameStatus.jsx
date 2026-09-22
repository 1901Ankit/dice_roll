/**
 * Small status line with a colored indicator dot.
 * tone: 'on' | 'warn' | 'off' | 'rolling' | 'result'
 */
export default function GameStatus({ tone = 'off', children }) {
  return (
    <p className={`game-status game-status--${tone}`} role="status">
      <span className="game-status__dot" aria-hidden="true" />
      <span className="game-status__text">{children}</span>
    </p>
  );
}
