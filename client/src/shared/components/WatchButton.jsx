import { useSelector, useDispatch } from "react-redux";
import { toggleWatch } from "../store/watchlistSlice.js";

export default function WatchButton({ auctionId, className = "" }) {
  const dispatch = useDispatch();
  const watched = useSelector((state) => state.watchlist.ids.includes(auctionId));

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWatch(auctionId));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={watched ? "Remove from watchlist" : "Add to watchlist"}
      aria-pressed={watched}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition ${
        watched ? "bg-brand text-[#1A0F04]" : "panel text-ink-dim hover:text-ink"
      } ${className}`}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill={watched ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M12 21s-6.7-4.35-9.3-8.1C.8 9.9 1.7 6.2 5 5.1c2-.67 3.9.1 5 1.8 1.1-1.7 3-2.47 5-1.8 3.3 1.1 4.2 4.8 2.3 7.8-2.6 3.75-9.3 8.1-9.3 8.1z" />
      </svg>
    </button>
  );
}
