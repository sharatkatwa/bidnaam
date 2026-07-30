const statusStyles = {
  live: "bg-brand text-[#1A0F04] shadow-[0_2px_0_rgba(0,0,0,0.3),0_0_0_3px_rgba(221,139,66,0.16)] -rotate-1",
  ending: "bg-urgent text-white shadow-[0_2px_0_rgba(0,0,0,0.3),0_0_0_3px_rgba(193,64,46,0.2)] rotate-1",
  upcoming: "border border-dashed border-line-strong text-ink",
  completed: "bg-white/8 text-ink-dim border border-line -rotate-2",
};

export default function Badge({ status, children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wide ${statusStyles[status]}`}
    >
      {status === "live" && <span className="w-1.5 h-1.5 rounded-full bg-[#1A0F04] pulse-dot-live" />}

      {status === "upcoming" && (
        <span className="relative flex w-1.5 h-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-ink/70 ping-ring" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-ink" />
        </span>
      )}

      {status === "completed" && <span className="text-[10px] leading-none">✓</span>}

      {children}
    </span>
  );
}
