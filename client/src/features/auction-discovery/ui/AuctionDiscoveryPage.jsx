import { useState } from "react";
import { useAuctions } from "../hooks/useAuctions.js";
import AuctionCard from "./AuctionCard.jsx";
import Loader from "../../../shared/components/Loader.jsx";

const filters = ["all", "live", "upcoming", "completed"];

export default function AuctionDiscoveryPage() {
  const [filter, setFilter] = useState("all");
  const { auctions, isLoading } = useAuctions();

  const visible = filter === "all" ? auctions : auctions.filter((a) => a.status === filter);

  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <div className="reveal mb-2 inline-flex items-center gap-2 border border-line rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-ink-dim">
        <span className="w-1.5 h-1.5 rounded-full bg-brand pulse-dot" />
        {auctions.filter((a) => a.status === "live").length} auctions live right now
      </div>

      <h1 className="reveal font-display font-black text-[clamp(34px,4.5vw,54px)] leading-tight" style={{ animationDelay: "0.06s" }}>
        Find your next <span className="text-brand">winning bid.</span>
      </h1>

      <div
        className="reveal panel-strong sticky top-18.25 z-40 flex gap-2 mt-8 mb-8 px-3 py-3 rounded-2xl flex-wrap"
        style={{ animationDelay: "0.12s" }}
      >
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-semibold capitalize transition ${
              filter === f
                ? "bg-brand text-[#1A0F04]"
                : "text-ink-dim hover:text-ink hover:bg-white/5"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((auction, i) => (
            <AuctionCard key={auction.id} auction={auction} index={i} />
          ))}
        </div>
      )}

      {!isLoading && visible.length === 0 && (
        <p className="text-ink-dim text-center py-16">No auctions in this category yet.</p>
      )}
    </div>
  );
}
