import { useWatchlist } from "../hooks/useWatchlist.js";
import AuctionCard from "../../auction-discovery/ui/AuctionCard.jsx";
import Loader from "../../../shared/components/Loader.jsx";

export default function WatchlistPage() {
  const { watched, endingSoon, isLoading } = useWatchlist();

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <div className="reveal mb-2 inline-flex items-center gap-2 border border-line rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-ink-dim">
        Saved lots
      </div>
      <h1 className="reveal font-display font-black text-[clamp(30px,4vw,44px)]" style={{ animationDelay: "0.06s" }}>
        Your <span className="text-brand">watchlist.</span>
      </h1>

      {endingSoon.length > 0 && (
        <div className="reveal panel border-urgent/40 rounded-xl px-5 py-3 mt-6 text-sm text-ink-dim" style={{ animationDelay: "0.1s" }}>
          <span className="text-urgent font-bold uppercase tracking-wide mr-2">Alert</span>
          {endingSoon.length} watched {endingSoon.length === 1 ? "lot is" : "lots are"} ending in the next 5 minutes.
        </div>
      )}

      {watched.length === 0 ? (
        <p className="text-ink-dim text-center py-16">
          Nothing saved yet — tap the heart on any auction to watch it here.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          {watched.map((auction, i) => (
            <AuctionCard key={auction.id} auction={auction} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
