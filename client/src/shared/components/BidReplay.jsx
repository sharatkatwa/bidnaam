import { useState, useEffect } from "react";
import { mockReplayEvents } from "../data/mockReplay.js";
import { formatCurrency } from "../utils/formatTime.js";

export default function BidReplay() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    if (step >= mockReplayEvents.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setStep((prev) => prev + 1), 900);
    return () => clearTimeout(timer);
  }, [playing, step]);

  const current = mockReplayEvents[step];

  function handleScrub(e) {
    setPlaying(false);
    setStep(Number(e.target.value));
  }

  function handlePlayPause() {
    if (step >= mockReplayEvents.length - 1) setStep(0);
    setPlaying((prev) => !prev);
  }

  return (
    <div className="panel rounded-2xl p-5 mt-5">
      <h3 className="text-sm font-bold text-ink-dim uppercase tracking-wide mb-4">Auction replay</h3>

      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="text-ink-dim text-xs uppercase tracking-wide">{current.time} · {current.bidder}</div>
          <div key={step} className="roll-in font-mono text-3xl font-bold tabular-nums">
            {formatCurrency(current.amount)}
          </div>
        </div>
        <Button onClick={handlePlayPause} playing={playing} step={step} />
      </div>

      <input
        type="range"
        min={0}
        max={mockReplayEvents.length - 1}
        value={step}
        onChange={handleScrub}
        className="w-full accent-brand"
      />

      <ul className="flex flex-col gap-1.5 mt-4 max-h-40 overflow-y-auto">
        {mockReplayEvents.map((event, i) => (
          <li
            key={event.id}
            className={`text-sm flex justify-between px-2 py-1 rounded ${i === step ? "bg-brand/15 text-ink" : "text-ink-dim"}`}
          >
            <span>{event.time} · {event.bidder}</span>
            <span className="font-mono">{formatCurrency(event.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Button({ onClick, playing, step }) {
  const finished = step >= mockReplayEvents.length - 1;
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2 rounded-lg text-sm font-semibold bg-brand text-[#1A0F04] hover:brightness-110 transition"
    >
      {playing ? "Pause" : finished ? "Replay" : "Play"}
    </button>
  );
}
