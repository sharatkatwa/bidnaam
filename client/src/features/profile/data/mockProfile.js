export const mockProfile = {
  auctionsCreated: 4,
  auctionsWon: 7,
  totalBids: 42,
  bidHistory: [
    { id: 1, lotTitle: "Vintage Leica M6", amount: 42500, status: "active" },
    { id: 2, lotTitle: "Signed Cricket Bat", amount: 15500, status: "won" },
    { id: 3, lotTitle: "Studio Monitor Pair", amount: 10800, status: "outbid" },
    { id: 4, lotTitle: "Retro Arcade Cabinet", amount: 22000, status: "won" },
  ],
  myAuctions: [
    { id: 1, title: "Handmade Ceramic Set", status: "live", currentBid: 3200 },
    { id: 2, title: "Restored Vinyl Player", status: "completed", currentBid: 9500 },
  ],
};
