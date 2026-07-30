import {
  createTimelineDAO,
  getTimelineByAuctionDAO,
} from "../dao/timeline.dao.js";

/**
 * Record a new timeline event for an auction (FR-13)
 * Accepts structured event data and formats human-readable event messages automatically.
 *
 * @param {Object} payload - Structured event payload ({ auctionId, auction, type, message, metadata, bidderId, amount, bidId, sellerId, title })
 * @returns {Promise<Object>} Created timeline document
 */
export async function createTimelineEvent({
  auctionId,
  auction,
  type,
  message,
  metadata = {},
  bidderId,
  amount,
  bidId,
  sellerId,
  title,
}) {
  const targetAuctionId = auctionId || auction;

  let formattedMessage = message;

  if (!formattedMessage) {
    switch (type) {
      case "BID_PLACED":
        formattedMessage = `New highest bid of $${amount} placed`;
        break;
      case "AUCTION_CREATED":
        formattedMessage = `Auction "${title || ""}" was created`;
        break;
      case "AUCTION_STARTED":
        formattedMessage = `Auction bidding started`;
        break;
      case "AUCTION_CLOSED":
        formattedMessage = metadata.winner || metadata.winnerId
          ? `Auction completed. Winner declared for $${metadata.winningBid || amount || 0}`
          : "Auction completed with no bids placed";
        break;
      case "TIME_EXTENDED":
        formattedMessage = `Auction countdown timer extended by ${metadata.extendedSeconds || 30} seconds`;
        break;
      default:
        formattedMessage = `Event ${type} recorded`;
    }
  }

  const combinedMetadata = {
    ...metadata,
    ...(bidderId && { bidder: bidderId }),
    ...(amount !== undefined && { amount }),
    ...(bidId && { bidId }),
    ...(sellerId && { seller: sellerId }),
  };

  return await createTimelineDAO({
    auction: targetAuctionId,
    type,
    message: formattedMessage,
    metadata: combinedMetadata,
  });
}

/**
 * Retrieve the chronological event timeline for an auction
 * @param {string} auctionId - Target auction Mongoose ObjectId
 * @param {number} limit - Maximum number of timeline events to retrieve
 * @returns {Promise<Array>} List of chronological timeline event documents
 */
export async function getAuctionTimeline(auctionId, limit = 100) {
  return await getTimelineByAuctionDAO(auctionId, limit);
}
