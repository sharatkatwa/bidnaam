const statusStyles = {
  live: "bg-bid-cyan text-[#0A2A28] shadow-[0_0_18px_2px_rgba(77,238,234,0.55)]",
  ending:
    "bg-linear-to-r from-bid-orange to-bid-gold text-[#2A1200] shadow-[0_0_18px_2px_rgba(255,201,77,0.45)]",
  upcoming:
    "bg-bid-violet text-white shadow-[0_0_14px_1px_rgba(155,43,166,0.4)]",
  completed: "bg-white/15 text-white/60",
};

export default function Badge({ status, children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wide ${statusStyles[status]}`}
    >
      {status === "live" && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#0A2A28] pulse-dot" />
      )}
      {children}
    </span>
  );
}
