export default function RollButton({ rolling, onRoll }) {
  return (
    <button
      type="button"
      className="relative w-full rounded-[18px] bg-[linear-gradient(135deg,#fcd34d_0%,var(--color-accent)_45%,var(--color-accent-2)_100%)] px-6 py-[clamp(15px,4.5vw,19px)] text-[clamp(0.95rem,3.6vw,1.08rem)] font-extrabold tracking-[0.18em] text-[#221503] shadow-[0_12px_34px_rgba(249,115,22,0.32),0_2px_6px_rgba(0,0,0,0.4),inset_0_1.5px_0_rgba(255,255,255,0.55),inset_0_-2px_4px_rgba(120,53,15,0.35)] transition-[transform,box-shadow,filter,opacity] duration-200 select-none enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_16px_42px_rgba(249,115,22,0.42),0_2px_6px_rgba(0,0,0,0.4),inset_0_1.5px_0_rgba(255,255,255,0.55),inset_0_-2px_4px_rgba(120,53,15,0.35)] enabled:hover:brightness-[1.07] enabled:active:translate-y-px enabled:active:scale-[0.985] enabled:active:brightness-[0.97] disabled:opacity-75"
      onClick={onRoll}
      disabled={rolling}
    >
      <span
        className={rolling ? 'animate-label-pulse motion-reduce:animate-none' : ''}
      >
        {rolling ? 'ROLLING…' : 'ROLL DICE'}
      </span>
    </button>
  );
}
