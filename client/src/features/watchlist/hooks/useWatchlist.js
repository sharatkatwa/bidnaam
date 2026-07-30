import { useSelector } from "react-redux";
import { useAuctions } from "../../auction-discovery/hooks/useAuctions.js";

export function useWatchlist() {
  const watchedIds = useSelector((state) => state.watchlist.ids);
  const { auctions, isLoading } = useAuctions();

  const watched = auctions.filter((a) => watchedIds.includes(a.id));
  const endingSoon = watched.filter((a) => a.status === "live" && a.endsInSec <= 300);

  return { watched, endingSoon, isLoading };
}
