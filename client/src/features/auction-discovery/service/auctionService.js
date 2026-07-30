import axiosInstance from "../../../api/axiosInstance.js";

const STATUS_MAP = {
  active: "live",
  upcoming: "upcoming",
  completed: "completed",
  cancelled: "completed",
};

function normalizeAuction(auction) {
  const now = Date.now();
  const endTime = auction.endTime ? new Date(auction.endTime).getTime() : null;
  const startTime = auction.startTime ? new Date(auction.startTime).getTime() : null;

  return {
    id: auction._id,
    title: auction.title,
    seller: auction.seller?.email?.split("@")[0] ?? "seller",
    currentBid: auction.currentHighestBid?.amount ?? auction.startPrice ?? 0,
    bidCount: auction.bidCount ?? 0,
    status: STATUS_MAP[auction.status] ?? "upcoming",
    endsInSec: endTime ? Math.max(0, Math.round((endTime - now) / 1000)) : 0,
    startsInSec: startTime ? Math.max(0, Math.round((startTime - now) / 1000)) : 0,
  };
}

export function getAuctions() {
  return axiosInstance
    .get("/auctions")
    .then((res) => res.data.data.auctions.map(normalizeAuction));
}
