import axiosInstance from "../../../api/axiosInstance.js";

export function getRoomState(auctionId) {
  return axiosInstance.get(`/auctions/${auctionId}`).then((res) => res.data);
}

export function submitBid(auctionId, amount) {
  return axiosInstance.post(`/auctions/${auctionId}/bids`, { amount }).then((res) => res.data);
}
