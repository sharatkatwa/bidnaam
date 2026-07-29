import { useQuery } from "@tanstack/react-query";
import { getAuctions } from "../service/auctionService.js";
import { mockAuctions } from "../data/mockAuctions.js";

export function useAuctions() {
  const query = useQuery({
    queryKey: ["auctions"],
    queryFn: getAuctions,
    retry: false,
  });

  return {
    ...query,
    auctions: query.data ?? mockAuctions,
  };
}
