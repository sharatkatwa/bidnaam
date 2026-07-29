import { useState, useEffect } from "react";

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

export default function LiveAuctionHero() {
  const [bid, setBid] = useState(42500);
  const [remaining, setRemaining] = useState(47);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setBid((prev) => prev + Math.round((Math.random() * 400 + 100) / 50) * 50);
    }, 2600);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((prev) => (prev <= 0 ? 90 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function handlePointerMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({ x, y });
  }

  const countdownLabel =
    remaining >= 60
      ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`
      : `0:${String(remaining).padStart(2, "0")}`;

  const rooms = useCountUp(3, 900);
  const bidsToday = useCountUp(1208, 1300);

  return (
    <div className="hidden lg:flex flex-col justify-center px-4">
      <div className="reveal flex items-center gap-2 font-bold uppercase tracking-wide text-sm text-white/80">
        <span className="w-2.5 h-2.5 rounded-full bg-bid-gold shadow-[0_0_12px_2px_rgba(255,201,77,0.6)]" />
        BidArena
      </div>

      <div
        className="reveal mt-6 mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-bid-cyan"
        style={{ animationDelay: "0.08s" }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-bid-cyan pulse-dot" />
        214 bidders online now
      </div>

      <h1
        className="reveal font-display leading-[0.98] tracking-tight text-balance text-[clamp(42px,5.6vw,74px)]"
        style={{ animationDelay: "0.14s" }}
      >
        ENTER THE
        <br />
        <span className="shine-text">ARENA.</span>
      </h1>

      <p className="reveal mt-4 max-w-[46ch] text-white/80 leading-relaxed" style={{ animationDelay: "0.2s" }}>
        Real bids. Real time. One deterministic engine settling every lot, to the millisecond.
      </p>

      <div
        className="reveal stack-perspective mt-10"
        style={{ animationDelay: "0.3s" }}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setTilt({ x: 0, y: 0 })}
      >
        <div
          className="relative h-[230px] max-w-[420px] transition-transform duration-200 ease-out"
          style={{ transform: `rotateX(${(-tilt.y * 8).toFixed(2)}deg) rotateY(${(tilt.x * 10).toFixed(2)}deg)` }}
        >
          <div className="stack-inner relative w-full h-full">
            <div className="stack-card back glass" />
            <div className="stack-card mid glass" />
            <div className="stack-card front glass-strong p-6 flex flex-col justify-between shadow-2xl">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-[10px] bg-linear-to-br from-bid-gold to-bid-orange" />
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-white bg-live-red px-2.5 py-1 rounded-full shadow-[0_0_14px_2px_rgba(255,59,78,0.5)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-white pulse-dot-live" />
                  Live
                </span>
              </div>

              <div>
                <div className="text-[13.5px] text-white/75">Lot 014 — Vintage Leica M6</div>
                <div key={bid} className="roll-in font-mono text-2xl font-bold tabular-nums">
                  ₹{bid.toLocaleString("en-IN")}
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-white/55">
                <span>Ends in</span>
                <b key={countdownLabel} className="roll-in font-mono text-bid-gold text-sm">
                  {countdownLabel}
                </b>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="reveal mt-8 flex gap-10" style={{ animationDelay: "0.4s" }}>
        <div className="flex flex-col gap-1">
          <b className="font-mono text-xl tabular-nums">{rooms}</b>
          <span className="text-[11.5px] text-white/55 uppercase tracking-wide">Live rooms</span>
        </div>
        <div className="flex flex-col gap-1">
          <b className="font-mono text-xl tabular-nums">{bidsToday.toLocaleString("en-IN")}</b>
          <span className="text-[11.5px] text-white/55 uppercase tracking-wide">Bids today</span>
        </div>
        <div className="flex flex-col gap-1">
          <b className="font-mono text-xl">&lt;40ms</b>
          <span className="text-[11.5px] text-white/55 uppercase tracking-wide">Sync delay</span>
        </div>
      </div>
    </div>
  );
}
