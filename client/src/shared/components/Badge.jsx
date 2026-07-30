const statusStyles = {
  live: "bg-live-red text-white shadow-[0_0_18px_3px_rgba(255,59,78,0.55)]",
  ending: "bg-linear-to-r from-bid-orange to-bid-gold text-[#2A1200] shadow-[0_0_18px_2px_rgba(255,201,77,0.45)]",
  upcoming: "bg-linear-to-r from-bid-magenta to-bid-violet text-white shadow-[0_0_16px_2px_rgba(155,43,166,0.45)]",
  completed: "bg-white/12 text-white/65 border border-white/15",
};

export default function Badge({ status, children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wide ${statusStyles[status]}`}
    >
      {status === "live" && <span className="w-1.5 h-1.5 rounded-full bg-white pulse-dot-live" />}

      {status === "upcoming" && (
        <span className="relative flex w-1.5 h-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-white/80 ping-ring" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
        </span>
      )}

      {status === "completed" && <span className="text-[10px] leading-none">✓</span>}

      {children}
    </span>
  );
}
