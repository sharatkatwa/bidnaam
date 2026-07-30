import BidQueue from "../queue/bid.queue.js";

class AuctionRoom {
    constructor(auction) {
        this.auctionId = auction._id.toString();
        this.auction = auction;

        this.status = auction.status;

        this.highestBid = auction.currentHighestBid?.amount || auction.startPrice;
        this.highestBidder =
            auction.currentHighestBid?.bidder?.toString() || null;

        this.participants = new Set();
        this.spectators = new Set();

        this.bidQueue = new BidQueue();
        this.processing = false;

        this.timer = null;
    }
}

export default AuctionRoom;