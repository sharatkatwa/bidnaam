import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useSelector } from "react-redux";
import { useAuctionRoom } from "../../../shared/hooks/useAuctionRoom.js";
import Button from "../../../shared/components/Button.jsx";
import Badge from "../../../shared/components/Badge.jsx";
import {
  formatCountdown,
  formatCurrency,
} from "../../../shared/utils/formatTime.js";

export default function AuctionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { room, currentBid, currentBidder, bidCount, remaining, timeline } =
    useAuctionRoom();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const urgent = remaining <= 30 && remaining > 0;
  const ended = remaining <= 0;

  function handlePointerMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({ x, y });
  }

  function handlePrimaryCta() {
    if (isAuthenticated) {
      navigate(`/auction/${id}/room`);
    } else {
      navigate("/login");
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <Link
        to="/"
        className="group glass reveal inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white/75 hover:text-white transition"
      >
        <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
        Back to discovery
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 mt-4">
        <div className="reveal min-w-0">
          <div
            style={{ perspective: "1100px" }}
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setTilt({ x: 0, y: 0 })}
          >
            <div
              className="h-80 rounded-2xl bg-linear-to-br from-bid-gold to-bid-orange transition-transform duration-150 ease-out will-change-transform"
              style={{
                transform: `rotateX(${(-tilt.y * 5).toFixed(2)}deg) rotateY(${(tilt.x * 6).toFixed(2)}deg)`,
                boxShadow: `${-tilt.x * 16}px ${20 + tilt.y * 12}px 40px -16px rgba(0,0,0,0.55)`,
              }}
            />
          </div>

          <div className="flex items-start justify-between gap-3 mt-6">
            <div>
              <h1 className="font-display text-3xl">{room.title}</h1>
              <p className="text-white/55 text-sm mt-1">
                by {room.seller} · Lot {id}
              </p>
            </div>
            <Badge status={ended ? "completed" : "live"}>
              {ended ? "Ended" : "Live"}
            </Badge>
          </div>

          <p className="text-white/75 mt-4 leading-relaxed max-w-2xl">
            {room.description}
          </p>

          <div className="glass rounded-2xl p-5 mt-6 grid grid-cols-3 gap-4 text-center">
            <Stat value={bidCount} label="Bids" />
            <Stat value={room.activeBidders} label="Bidders" />
            <Stat value={room.spectators} label="Watching" />
          </div>

          <div className="glass rounded-2xl p-5 mt-5">
            <h3 className="text-sm font-bold text-white/70 uppercase tracking-wide mb-3">
              Recent activity
            </h3>
            <ul className="flex flex-col gap-2.5">
              {timeline.slice(0, 4).map((event) => (
                <li
                  key={event.id}
                  className="text-sm text-white/80 border-l-2 border-bid-cyan/40 pl-3"
                >
                  {event.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="reveal min-w-0" style={{ animationDelay: "0.1s" }}>
          <div className="glass-strong rounded-2xl p-6 sticky top-24">
            <div className="text-white/50 text-xs uppercase tracking-wide">
              Current bid · {currentBidder}
            </div>
            <div
              key={currentBid}
              className="roll-in font-mono text-4xl font-bold tabular-nums mt-1"
            >
              {formatCurrency(currentBid)}
            </div>

            <div className="flex items-center justify-between mt-5 pt-5 border-t border-white/10">
              <span className="text-white/50 text-xs uppercase tracking-wide">
                Time left
              </span>
              <span
                className={`font-mono text-2xl font-bold tabular-nums ${urgent ? "text-red-400 animate-pulse" : "text-bid-gold"}`}
              >
                {formatCountdown(remaining)}
              </span>
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <Button
                variant="primary"
                onClick={handlePrimaryCta}
                disabled={ended}
                className="w-full"
              >
                {ended
                  ? "Auction ended"
                  : isAuthenticated
                    ? "Enter the arena →"
                    : "Login to bid"}
              </Button>

              <Link to={`/auction/${id}/spectate`}>
                <Button variant="outline" className="w-full">
                  Watch live
                </Button>
              </Link>
            </div>

            {!isAuthenticated && (
              <p className="text-white/50 text-xs text-center mt-4">
                Browsing is open to everyone.{" "}
                <Link to="/register" className="text-bid-gold hover:underline">
                  Create an account
                </Link>{" "}
                to place a bid.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <div className="font-mono text-xl font-bold tabular-nums">{value}</div>
      <div className="text-[11px] text-white/50 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}
