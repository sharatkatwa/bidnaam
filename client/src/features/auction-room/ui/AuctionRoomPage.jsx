import { useState, useRef } from "react";
import { useParams, Link } from "react-router";
import { useAuctionRoom } from "../../../shared/hooks/useAuctionRoom.js";
import Button from "../../../shared/components/Button.jsx";
import Badge from "../../../shared/components/Badge.jsx";
import {
  formatCountdown,
  formatCurrency,
} from "../../../shared/utils/formatTime.js";
import ChatPanel from "../../chat/ui/ChatPanel.jsx";

const BURST_COLORS = ["#dd8b42", "#f0a256", "#c1402e"];

function spawnBidBurst(el) {
  if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return;
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  for (let i = 0; i < 12; i++) {
    const span = document.createElement("span");
    span.className = "burst-particle";
    const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.3;
    const dist = 60 + Math.random() * 40;
    span.style.left = `${cx}px`;
    span.style.top = `${cy}px`;
    span.style.background = BURST_COLORS[i % BURST_COLORS.length];
    span.style.setProperty("--tx", `${Math.cos(angle) * dist}px`);
    span.style.setProperty("--ty", `${Math.sin(angle) * dist}px`);
    document.body.appendChild(span);
    setTimeout(() => span.remove(), 720);
  }
}

export default function AuctionRoomPage() {
  const { id } = useParams();
  const {
    room,
    currentBid,
    currentBidder,
    bidCount,
    remaining,
    heat,
    timeline,
    placeBid,
  } = useAuctionRoom(id);
  const [bidInput, setBidInput] = useState("");
  const [error, setError] = useState("");
  const bidButtonRef = useRef(null);

  const minNextBid = currentBid + 50;
  const urgent = remaining <= 30 && remaining > 0;
  const ended = remaining <= 0;
  const reserveMet = currentBid >= room.reservePrice;

  function attemptBid(amount, sourceEl) {
    const result = placeBid(amount);
    if (!result.ok) {
      setError(result.error);
      setTimeout(() => setError(""), 2000);
    } else {
      setBidInput("");
      spawnBidBurst(sourceEl);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    attemptBid(Number(bidInput), bidButtonRef.current);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <Link
        to="/"
        className="group panel reveal inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm text-ink-dim hover:text-ink transition"
      >
        <span className="transition-transform duration-200 group-hover:-translate-x-1">
          ←
        </span>
        Back to discovery
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 mt-4">
        <div className="panel reveal rounded-2xl p-6 min-w-0">
          <div className="lot-swatch h-56 rounded-xl bg-swatch-rust mb-5" />

          <div className="flex items-start justify-between gap-3 mb-1">
            <div>
              <h1 className="font-display font-black text-2xl">{room.title}</h1>
              <p className="text-ink-dim text-sm mt-1">
                by {room.seller} · Lot {id}
              </p>
            </div>
            <Badge status={ended ? "completed" : "live"}>
              {ended ? "Ended" : "Live"}
            </Badge>
          </div>

          <p className="text-ink-dim text-sm mt-3 leading-relaxed">
            {room.description}
          </p>

          <div className="flex items-end justify-between mt-6 pt-6 border-t border-line">
            <div>
              <div className="text-ink-dim text-xs uppercase tracking-wide">
                Current bid · {currentBidder}
              </div>
              <div
                key={currentBid}
                className="roll-in font-mono text-4xl font-bold tabular-nums"
              >
                {formatCurrency(currentBid)}
              </div>
              {room.reservePrice && (
                <div className={`text-xs mt-1 ${reserveMet ? "text-brand" : "text-ink-dim/70"}`}>
                  {reserveMet ? "✓ Reserve met" : "Reserve not met yet"}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-ink-dim text-xs uppercase tracking-wide">
                Time left
              </div>
              <div
                className={`font-mono text-3xl font-bold tabular-nums ${urgent ? "text-urgent animate-pulse" : "text-brand"}`}
              >
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
                  className="flex-1 bg-white/5 border border-line-strong rounded-xl px-4 py-3 text-ink placeholder-ink-dim/50 outline-none focus:border-brand focus:ring-2 focus:ring-brand/25 transition font-mono"
                />
                <Button ref={bidButtonRef} type="submit" variant="primary">
                  Place bid
                </Button>
              </form>

              <div className="flex gap-2 mt-3">
                {[50, 100, 500].map((inc) => (
                  <button
                    key={inc}
                    type="button"
                    onClick={(e) =>
                      attemptBid(currentBid + inc, e.currentTarget)
                    }
                    className="panel px-3 py-1.5 rounded-lg text-xs font-semibold text-ink-dim hover:text-ink transition"
                  >
                    +{formatCurrency(inc)}
                  </button>
                ))}
              </div>

              {error && <p className="text-urgent text-sm mt-2">{error}</p>}
            </>
          ) : reserveMet ? (
            <div className="mt-6 panel rounded-xl p-4 text-center text-ink-dim">
              Auction closed. Winner:{" "}
              <b className="text-brand">{currentBidder}</b>
            </div>
          ) : (
            <div className="mt-6 panel rounded-xl p-4 text-center text-ink-dim">
              Auction closed. <b className="text-ink">Reserve price wasn't met</b> — no sale.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5 min-w-0">
          <div
            className="panel reveal rounded-2xl p-5"
            style={{ animationDelay: "0.08s" }}
          >
            <div className="grid grid-cols-2 gap-4 text-center">
              <Stat value={bidCount} label="Bids" />
              <Stat value={room.activeBidders} label="Bidders" />
            </div>

            <div className="mt-5">
              <div className="flex justify-between text-xs text-ink-dim mb-1.5">
                <span>Auction heat</span>
                <span>{heat}°</span>
              </div>
              <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-500"
                  style={{ width: `${heat}%` }}
                />
              </div>
            </div>
          </div>

          <div
            className="panel reveal rounded-2xl p-5"
            style={{ animationDelay: "0.14s" }}
          >
            <h3 className="text-sm font-bold text-ink-dim uppercase tracking-wide mb-3">
              Timeline
            </h3>
            <ul className="flex flex-col gap-2.5 max-h-72 overflow-y-auto">
              {timeline.map((event) => (
                <li
                  key={event.id}
                  className="text-sm text-ink/90 border-l-2 border-brand/40 pl-3"
                >
                  {event.label}
                </li>
              ))}
            </ul>
          </div>

          <ChatPanel auctionId={id} />
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <div className="font-mono text-xl font-bold tabular-nums">{value}</div>
      <div className="text-[11px] text-ink-dim uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}
