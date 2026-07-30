import { useState, useEffect } from "react";
import { Link } from "react-router";
import Badge from "../../../shared/components/Badge.jsx";
import { useInView } from "../../../shared/hooks/useInView.js";
import {
  formatCountdown,
  formatCurrency,
} from "../../../shared/utils/formatTime.js";

const swatches = ["bg-swatch-clay", "bg-swatch-slate", "bg-swatch-rust", "bg-swatch-olive"];

export default function AuctionCard({ auction, index }) {
  const [ref, inView] = useInView();
  const [endsInSec, setEndsInSec] = useState(auction.endsInSec ?? 0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (auction.status !== "live") return;
    const timer = setInterval(() => {
      setEndsInSec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [auction.status]);

  function handlePointerMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({ x, y });
  }

  const swatch = swatches[index % swatches.length];

  const statusRing = {
    live: "ring-2 ring-urgent/50",
    upcoming: "ring-1 ring-line-strong",
    completed: "ring-1 ring-line",
  }[auction.status];

  const statusGlow = {
    live: "0 0 0 4px rgba(193,64,46,0.14), 0 20px 45px -16px rgba(193,64,46,0.35)",
    upcoming: "0 20px 40px -16px rgba(0,0,0,0.5)",
    completed: "0 16px 32px -16px rgba(0,0,0,0.4)",
  }[auction.status];

  return (
    <Link
      ref={ref}
      to={`/auction/${auction.id}`}
      className={inView ? "reveal block" : "opacity-0 block"}
      style={{ animationDelay: `${(index % 6) * 0.06}s`, perspective: "900px" }}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <div
        className={`panel rounded-2xl p-5 transition-transform duration-150 ease-out will-change-transform ${statusRing}`}
        style={{
          transform: `rotateX(${(-tilt.y * 7).toFixed(2)}deg) rotateY(${(tilt.x * 9).toFixed(2)}deg) translateZ(0)`,
          boxShadow: `${-tilt.x * 14}px ${16 + tilt.y * 10}px 32px -14px rgba(0,0,0,0.55), ${statusGlow}`,
        }}
      >
        <div className={`lot-swatch h-32 rounded-xl ${swatch} mb-4`} />

        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-lg leading-snug">{auction.title}</h3>
          <Badge status={auction.status}>{auction.status}</Badge>
        </div>

        <p className="text-ink-dim text-xs mb-4">by {auction.seller}</p>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-ink-dim text-[11px] uppercase tracking-wide">
              {auction.status === "upcoming" ? "Starting bid" : "Current bid"}
            </div>
            <div className="font-mono text-xl font-bold tabular-nums">
              {formatCurrency(auction.currentBid)}
            </div>
          </div>

          <div className="text-right">
            {auction.status === "live" && (
              <>
                <div className="text-ink-dim text-[11px] uppercase tracking-wide">
                  Ends in
                </div>
                <div className="font-mono text-brand font-semibold tabular-nums">
                  {formatCountdown(endsInSec)}
                </div>
              </>
            )}
            {auction.status === "upcoming" && (
              <div className="text-ink-dim text-xs">Not started</div>
            )}
            {auction.status === "completed" && (
              <div className="text-ink-dim text-xs">
                {auction.bidCount} bids
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
