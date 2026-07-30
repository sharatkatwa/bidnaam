import { useState } from "react";
import { useCreateAuction } from "../hooks/useCreateAuction.js";
import { durationPresets } from "../data/durationPresets.js";
import Button from "../../../shared/components/Button.jsx";
import Badge from "../../../shared/components/Badge.jsx";
import { formatCurrency } from "../../../shared/utils/formatTime.js";

export default function AuctionCreatePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [startBid, setStartBid] = useState("");
  const [duration, setDuration] = useState(durationPresets[2].seconds);
  const create = useCreateAuction();

  function handleSubmit(e) {
    e.preventDefault();
    create.mutate({
      title,
      description,
      imageUrl,
      startBid: Number(startBid),
      durationSec: duration,
    });
  }

  const durationLabel = durationPresets.find((d) => d.seconds === duration)?.label;

  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <div className="reveal mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-bid-cyan">
        List an item
      </div>
      <h1 className="reveal font-display text-[clamp(30px,4vw,44px)]" style={{ animationDelay: "0.06s" }}>
        Start a new <span className="shine-text">auction.</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 mt-8">
        <form onSubmit={handleSubmit} className="glass reveal rounded-2xl p-6 flex flex-col gap-4 min-w-0" style={{ animationDelay: "0.1s" }}>
          <div>
            <label className="block text-xs font-bold text-white/70 mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Vintage Leica M6"
              className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-bid-gold focus:ring-2 focus:ring-bid-gold/30 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white/70 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Condition, included accessories, provenance..."
              rows={4}
              className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-bid-gold focus:ring-2 focus:ring-bid-gold/30 transition resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white/70 mb-1.5">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-bid-gold focus:ring-2 focus:ring-bid-gold/30 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-white/70 mb-1.5">Starting bid (₹)</label>
              <input
                type="number"
                value={startBid}
                onChange={(e) => setStartBid(e.target.value)}
                placeholder="1000"
                className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/40 outline-none focus:border-bid-gold focus:ring-2 focus:ring-bid-gold/30 transition font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/70 mb-1.5">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white outline-none focus:border-bid-gold focus:ring-2 focus:ring-bid-gold/30 transition"
              >
                {durationPresets.map((d) => (
                  <option key={d.seconds} value={d.seconds} className="bg-bid-violet">
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button type="submit" variant="primary" disabled={create.isPending} className="mt-2">
            {create.isPending ? "Publishing..." : "Publish auction"}
          </Button>

          {create.isError && <p className="text-red-300 text-sm">Could not create auction. Try again.</p>}
        </form>

        <div className="reveal min-w-0" style={{ animationDelay: "0.16s" }}>
          <p className="text-white/50 text-xs uppercase tracking-wide mb-3">Live preview</p>
          <div className="glass rounded-2xl p-5 sticky top-24">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="h-32 w-full object-cover rounded-xl mb-4" />
            ) : (
              <div className="h-32 rounded-xl bg-linear-to-br from-bid-gold to-bid-orange mb-4" />
            )}

            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-bold text-lg leading-snug">{title || "Your auction title"}</h3>
              <Badge status="upcoming">upcoming</Badge>
            </div>

            <p className="text-white/55 text-xs mb-4">by you</p>

            <div className="flex items-end justify-between">
              <div>
                <div className="text-white/50 text-[11px] uppercase tracking-wide">Starting bid</div>
                <div className="font-mono text-xl font-bold tabular-nums">
                  {formatCurrency(Number(startBid) || 0)}
                </div>
              </div>
              <div className="text-right text-white/50 text-xs">Runs {durationLabel}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
