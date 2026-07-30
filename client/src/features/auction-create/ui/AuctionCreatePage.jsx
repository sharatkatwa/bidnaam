import { useState } from "react";
import { useCreateAuction } from "../hooks/useCreateAuction.js";
import { durationPresets } from "../data/durationPresets.js";
import Button from "../../../shared/components/Button.jsx";
import Badge from "../../../shared/components/Badge.jsx";
import { formatCurrency } from "../../../shared/utils/formatTime.js";

const fieldClass =
  "w-full bg-white/5 border border-line-strong rounded-xl px-4 py-3 text-ink placeholder-ink-dim/50 outline-none focus:border-brand focus:ring-2 focus:ring-brand/25 transition";

export default function AuctionCreatePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [startBid, setStartBid] = useState("");
  const [reservePrice, setReservePrice] = useState("");
  const [duration, setDuration] = useState(durationPresets[2].seconds);
  const create = useCreateAuction();

  function handleSubmit(e) {
    e.preventDefault();
    create.mutate({
      title,
      description,
      imageUrl,
      startBid: Number(startBid),
      reservePrice: reservePrice ? Number(reservePrice) : null,
      durationSec: duration,
    });
  }

  const durationLabel = durationPresets.find((d) => d.seconds === duration)?.label;

  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <div className="reveal mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink-dim">
        List an item
      </div>
      <h1 className="reveal font-display font-black text-[clamp(30px,4vw,44px)]" style={{ animationDelay: "0.06s" }}>
        Start a new <span className="text-brand">auction.</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 mt-8">
        <form onSubmit={handleSubmit} className="panel reveal rounded-2xl p-6 flex flex-col gap-4 min-w-0" style={{ animationDelay: "0.1s" }}>
          <div>
            <label className="block text-xs font-bold text-ink-dim mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Vintage Leica M6"
              className={fieldClass}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-dim mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Condition, included accessories, provenance..."
              rows={4}
              className={`${fieldClass} resize-none`}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-dim mb-1.5">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink-dim mb-1.5">Starting bid (₹)</label>
              <input
                type="number"
                value={startBid}
                onChange={(e) => setStartBid(e.target.value)}
                placeholder="1000"
                className={`${fieldClass} font-mono`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink-dim mb-1.5">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className={fieldClass}
              >
                {durationPresets.map((d) => (
                  <option key={d.seconds} value={d.seconds} className="bg-bg-raised">
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink-dim mb-1.5">Reserve price (optional)</label>
            <input
              type="number"
              value={reservePrice}
              onChange={(e) => setReservePrice(e.target.value)}
              placeholder="Minimum price to sell — leave blank for none"
              className={`${fieldClass} font-mono`}
            />
            <p className="text-ink-dim/70 text-[11px] mt-1.5">
              If the highest bid doesn't reach this, the auction closes with no sale.
            </p>
          </div>

          <Button type="submit" variant="primary" disabled={create.isPending} className="mt-2">
            {create.isPending ? "Publishing..." : "Publish auction"}
          </Button>

          {create.isError && <p className="text-urgent text-sm">Could not create auction. Try again.</p>}
        </form>

        <div className="reveal min-w-0" style={{ animationDelay: "0.16s" }}>
          <p className="text-ink-dim text-xs uppercase tracking-wide mb-3">Live preview</p>
          <div className="panel rounded-2xl p-5 sticky top-24">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="h-32 w-full object-cover rounded-xl mb-4" />
            ) : (
              <div className="lot-swatch h-32 rounded-xl bg-swatch-clay mb-4" />
            )}

            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-bold text-lg leading-snug">{title || "Your auction title"}</h3>
              <Badge status="upcoming">upcoming</Badge>
            </div>

            <p className="text-ink-dim text-xs mb-4">by you</p>

            <div className="flex items-end justify-between">
              <div>
                <div className="text-ink-dim text-[11px] uppercase tracking-wide">Starting bid</div>
                <div className="font-mono text-xl font-bold tabular-nums">
                  {formatCurrency(Number(startBid) || 0)}
                </div>
              </div>
              <div className="text-right text-ink-dim text-xs">Runs {durationLabel}</div>
            </div>

            {reservePrice && (
              <div className="text-ink-dim/70 text-[11px] mt-3 pt-3 border-t border-line">
                Reserve: {formatCurrency(Number(reservePrice))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
