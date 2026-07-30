import { useState, useEffect } from "react";
import { usePointerTilt } from "../hooks/usePointerTilt.js";
import SplitFlapText from "./SplitFlapText.jsx";
import Badge from "./Badge.jsx";

function useCountUp(target, duration) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let raf;

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

function useCountdown(startAt) {
  const [remaining, setRemaining] = useState(startAt);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((prev) => (prev <= 0 ? startAt : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [startAt]);

  return `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;
}

export default function LiveAuctionHero() {
  const [bid, setBid] = useState(46050);

  useEffect(() => {
    const timer = setInterval(() => {
      setBid((prev) => prev + Math.round((Math.random() * 300 + 100) / 50) * 50);
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  const endingSoon = useCountdown(71);
  const rooms = useCountUp(3, 900);
  const bidsToday = useCountUp(1208, 1300);
  const tilt = usePointerTilt(5);

  return (
    <div className="hidden lg:flex flex-col justify-center px-4">
      <div className="reveal flex items-center gap-3">
        <SplitFlapText text="BIDARENA" className="text-base" />
      </div>

      <div
        className="reveal mt-6 mb-4 inline-flex w-fit items-center gap-2 border border-line rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-ink-dim"
        style={{ animationDelay: "0.08s" }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-brand pulse-dot" />
        214 bidders online now
      </div>

      <h1
        className="reveal font-display font-black leading-[0.96] tracking-tight text-balance text-[clamp(42px,5.6vw,74px)]"
        style={{ animationDelay: "0.14s" }}
      >
        Enter the
        <br />
        <span className="text-brand">Arena.</span>
      </h1>

      <p className="reveal mt-4 max-w-[46ch] text-ink-dim leading-relaxed" style={{ animationDelay: "0.2s" }}>
        Real bids. Real time. One deterministic engine settling every lot, to the millisecond.
      </p>

      <div className="reveal mt-10 max-w-115" style={{ animationDelay: "0.3s" }}>
        <div className="relative" style={{ perspective: "1400px" }}>
          <div className="panel absolute inset-0 rounded-xl translate-x-1.5 translate-y-2 rotate-1 opacity-40" aria-hidden="true" />
          <div
            ref={tilt.ref}
            onPointerMove={tilt.onPointerMove}
            onPointerLeave={tilt.onPointerLeave}
            style={tilt.style}
            className="panel relative rounded-xl overflow-hidden transition-transform duration-200 ease-out"
          >
            <div className="flex items-center justify-between px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-ink-dim border-b border-line">
              <span>Lot</span>
              <div className="flex items-center gap-8">
                <span>Bid</span>
                <span>Status</span>
              </div>
            </div>

            <div className="hairline-row flex items-center justify-between px-5 py-4">
              <div>
                <div className="font-semibold">Vintage Leica M6</div>
                <div className="text-xs text-ink-dim">Lot 014</div>
              </div>
              <div className="flex items-center gap-6">
                <div key={bid} className="roll-in font-mono font-bold tabular-nums">
                  ₹{bid.toLocaleString("en-IN")}
                </div>
                <Badge status="live">Live</Badge>
              </div>
            </div>

            <div className="hairline-row flex items-center justify-between px-5 py-4">
              <div>
                <div className="font-semibold">Studio Monitor Pair</div>
                <div className="text-xs text-ink-dim">Lot 021</div>
              </div>
              <div className="flex items-center gap-6">
                <div className="font-mono font-bold tabular-nums">₹13,650</div>
                <Badge status="ending">
                  <span key={endingSoon} className="roll-in font-mono">{endingSoon}</span>
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="reveal mt-8 flex gap-10" style={{ animationDelay: "0.4s" }}>
        <div className="flex flex-col gap-1">
          <b className="font-mono text-xl tabular-nums">{rooms}</b>
          <span className="text-[11px] text-ink-dim uppercase tracking-wide">Live rooms</span>
        </div>
        <div className="flex flex-col gap-1">
          <b className="font-mono text-xl tabular-nums">{bidsToday.toLocaleString("en-IN")}</b>
          <span className="text-[11px] text-ink-dim uppercase tracking-wide">Bids today</span>
        </div>
        <div className="flex flex-col gap-1">
          <b className="font-mono text-xl">&lt;40ms</b>
          <span className="text-[11px] text-ink-dim uppercase tracking-wide">Sync delay</span>
        </div>
      </div>

      <p className="reveal mt-8 text-[11px] text-ink-dim/70 uppercase tracking-wide flex items-center gap-2" style={{ animationDelay: "0.45s" }}>
        Domain B settles every bid — this screen only reflects it
        <span className="text-ink-dim/40">·</span>
        <span className="font-mono">SRS FR7 · FR14</span>
      </p>
    </div>
  );
}
