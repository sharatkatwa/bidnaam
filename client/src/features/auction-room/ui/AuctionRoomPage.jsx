import { useState } from "react";
import { useParams, Link } from "react-router";
import { useAuctionRoom } from "../../../shared/hooks/useAuctionRoom.js";
import Button from "../../../shared/components/Button.jsx";
import Badge from "../../../shared/components/Badge.jsx";
import { formatCountdown, formatCurrency } from "../../../shared/utils/formatTime.js";
import ChatPanel from "../../chat/ui/ChatPanel.jsx";

export default function AuctionRoomPage() {
  const { id } = useParams();
  const { room, currentBid, currentBidder, bidCount, remaining, heat, timeline, placeBid } = useAuctionRoom();
  const [bidInput, setBidInput] = useState("");
  const [error, setError] = useState("");

  const minNextBid = currentBid + 50;
  const urgent = remaining <= 30 && remaining > 0;
  const ended = remaining <= 0;

  function attemptBid(amount) {
    const result = placeBid(amount);
    if (!result.ok) {
      setError(result.error);
      setTimeout(() => setError(""), 2000);
    } else {
      setBidInput("");
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    attemptBid(Number(bidInput));
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <Link to="/" className="text-white/60 text-sm hover:text-white transition">
        ← Back to discovery
      </Link>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 mt-4">
        <div className="glass reveal rounded-2xl p-6">
          <div className="h-56 rounded-xl bg-linear-to-br from-bid-gold to-bid-orange mb-5" />

          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <h1 className="font-display text-2xl">{room.title}</h1>
              <p className="text-white/55 text-sm mt-1">by {room.seller} · Lot {id}</p>
            </div>
            <Badge status={ended ? "completed" : "live"}>{ended ? "Ended" : "Live"}</Badge>
          </div>

          <p className="text-white/70 text-sm mt-3 leading-relaxed">{room.description}</p>

          <div className="flex items-end justify-between mt-6 pt-6 border-t border-white/10">
            <div>
              <div className="text-white/50 text-xs uppercase tracking-wide">Current bid · {currentBidder}</div>
              <div key={currentBid} className="roll-in font-mono text-4xl font-bold tabular-nums">
                {formatCurrency(currentBid)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-white/50 text-xs uppercase tracking-wide">Time left</div>
              <div className={`font-mono text-3xl font-bold tabular-nums ${urgent ? "text-red-400 animate-pulse" : "text-bid-gold"}`}>
                {formatCountdown(remaining)}
              </div>
            </div>
          </div>

          {!ended ? (
            <>
              <form onSubmit={handleSubmit} className="mt-6 flex gap-3">
                <input
                  type="number"
                  value={bidInput}
                  onChange={(e) => setBidInput(e.target.value)}
                  placeholder={`Min. ${formatCurrency(minNextBid)}`}
                  className="flex-1 bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-bid-gold focus:ring-2 focus:ring-bid-gold/30 transition font-mono"
                />
                <Button type="submit" variant="primary">
                  Place bid
                </Button>
              </form>

              <div className="flex gap-2 mt-3">
                {[50, 100, 500].map((inc) => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => attemptBid(currentBid + inc)}
                    className="glass px-3 py-1.5 rounded-lg text-xs font-semibold text-white/70 hover:text-white transition"
                  >
                    +{formatCurrency(inc)}
                  </button>
                ))}
              </div>

              {error && <p className="text-red-300 text-sm mt-2">{error}</p>}
            </>
          ) : (
            <div className="mt-6 glass rounded-xl p-4 text-center text-white/70">
              Auction closed. Winner: <b className="text-bid-gold">{currentBidder}</b>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="glass reveal rounded-2xl p-5" style={{ animationDelay: "0.08s" }}>
            <div className="grid grid-cols-2 gap-4 text-center">
              <Stat value={bidCount} label="Bids" />
              <Stat value={room.activeBidders} label="Bidders" />
            </div>

            <div className="mt-5">
              <div className="flex justify-between text-xs text-white/50 mb-1.5">
                <span>Auction heat</span>
                <span>{heat}°</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-linear-to-r from-bid-cyan via-bid-gold to-bid-orange transition-all duration-500"
                  style={{ width: `${heat}%` }}
                />
              </div>
            </div>
          </div>

          <div className="glass reveal rounded-2xl p-5" style={{ animationDelay: "0.14s" }}>
            <h3 className="text-sm font-bold text-white/70 uppercase tracking-wide mb-3">Timeline</h3>
            <ul className="flex flex-col gap-2.5 max-h-72 overflow-y-auto">
              {timeline.map((event) => (
                <li key={event.id} className="text-sm text-white/80 border-l-2 border-bid-cyan/40 pl-3">
                  {event.label}
                </li>
              ))}
            </ul>
          </div>

          <ChatPanel />
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <div className="font-mono text-xl font-bold tabular-nums">{value}</div>
      <div className="text-[11px] text-white/50 uppercase tracking-wide">{label}</div>
    </div>
  );
}
