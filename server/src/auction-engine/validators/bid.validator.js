import { ValidationError } from "../../shared/errors/custom-error.js";

/**
 * Validate a bid payload against an in-memory AuctionRoom state
 * @param {Object} room - Active AuctionRoom instance
 * @param {Object} bidData - ({ bidderId, amount })
 */
export function validateBid(room, bidData) {
  const { bidderId, amount } = bidData;
  const numericAmount = Number(amount);

  if (!bidderId || isNaN(numericAmount) || numericAmount <= 0) {
    throw new ValidationError("Valid bidderId and positive bid amount are required.");
  }

  // 1. Check active room status
  if (room.status !== "active") {
    throw new ValidationError(`Bidding rejected: Room status is ${room.status}.`);
  }

  // 2. Check seller self-bidding restriction
  const sellerId = (room.auction.seller._id || room.auction.seller).toString();
  if (sellerId === bidderId.toString()) {
    throw new ValidationError("Sellers cannot bid on their own auctions.");
  }

  // 3. Check current highest bidder restriction (prevent self-outbidding)
  if (room.highestBidder && room.highestBidder.toString() === bidderId.toString()) {
    throw new ValidationError("You are already the highest bidder.");
  }

  // 4. Check minimum bid increment requirement
  const minIncrement = room.auction.minimumIncrement || 1;
  const requiredAmount = room.highestBidder
    ? room.highestBid + minIncrement
    : (room.auction.startPrice || 0);

  if (numericAmount < requiredAmount) {
    throw new ValidationError(
      `Bid rejected: Minimum required bid is $${requiredAmount} (current highest: $${room.highestBid}, increment: $${minIncrement}).`
    );
  }

  return true;
}
