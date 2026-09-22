/**
 * Small status line with a colored indicator dot.
 * tone: 'on' | 'warn' | 'off' | 'rolling' | 'result'
 */
const TONE_DOT = {
  on: 'bg-green shadow-[0_0_10px_rgba(52,211,153,0.7)]',
  warn: 'bg-amber shadow-[0_0_10px_rgba(251,191,36,0.6)]',
  off: 'bg-slate',
  rolling: 'bg-cyan animate-status-blink motion-reduce:animate-none',
  result: 'bg-violet shadow-[0_0_10px_rgba(167,139,250,0.7)]',
};

export default function GameStatus({ tone = 'off', children }) {
  return (
    <p
      className="flex min-h-[1.2em] items-center gap-[9px] text-[0.78rem] font-semibold tracking-[0.06em] text-dim"
      role="status"
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${TONE_DOT[tone] ?? TONE_DOT.off}`}
        aria-hidden="true"
      />
      <span>{children}</span>
    </p>
  );
}
