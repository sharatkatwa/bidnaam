const statusStyles = {
  live: "bg-bid-cyan text-[#14351F]",
  ending: "bg-gradient-to-r from-bid-orange to-bid-gold text-[#2A1200]",
  upcoming: "bg-bid-violet text-white",
  completed: "bg-white/15 text-white/60",
};

export default function Badge({ status, children }) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusStyles[status]}`}
    >
      {children}
    </span>
  );
}
