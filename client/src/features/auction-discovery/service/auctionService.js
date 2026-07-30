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
  const sellerName = auction.seller?.email?.split("@")[0] ?? "seller";
  const bidderName = auction.currentHighestBid?.bidder?.email?.split("@")[0];

  return {
    id: auction._id,
    title: auction.title,
    description: auction.description ?? "",
    image: auction.images?.[0] ?? null,
    seller: sellerName,
    currentBid: auction.currentHighestBid?.amount ?? auction.startPrice ?? 0,
    currentBidder: bidderName ?? sellerName,
    bidCount: auction.bidCount ?? 0,
    status: STATUS_MAP[auction.status] ?? "upcoming",
    endsInSec: endTime ? Math.max(0, Math.round((endTime - now) / 1000)) : 0,
    startsInSec: startTime ? Math.max(0, Math.round((startTime - now) / 1000)) : 0,
    reservePrice: null,
    activeBidders: 0,
    spectators: 0,
  };
}

export function getAuctions() {
  return axiosInstance
    .get("/auctions")
    .then((res) => res.data.data.auctions.map(normalizeAuction));
}

export function getAuctionById(id) {
  return axiosInstance
    .get(`/auctions/${id}`)
    .then((res) => normalizeAuction(res.data.data.auction));
}
