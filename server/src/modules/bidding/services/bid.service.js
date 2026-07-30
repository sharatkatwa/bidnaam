import {
  createBidDAO,
  getHighestBidDAO,
  getBidsByAuctionDAO,
  getBidsByUserDAO,
} from "../dao/bid.dao.js";

/**
 * Persist a new bid record in the database
 * @param {Object} payload - ({ auctionId, bidderId, amount })
 * @returns {Promise<Object>} Created bid document
 */
export async function createBid({ auctionId, bidderId, amount }) {
  return await createBidDAO({
    auction: auctionId,
    bidder: bidderId,
    amount: Number(amount),
  });
}

/**
 * Retrieve the highest bid record for a specific auction
 * @param {string} auctionId - Auction Mongoose ObjectId
 * @returns {Promise<Object|null>} Highest bid document if found
 */
export async function getHighestBidForAuction(auctionId) {
  return await getHighestBidDAO(auctionId);
}

/**
 * Retrieve bid history for a specific auction sorted chronologically
 * @param {string} auctionId - Auction Mongoose ObjectId
 * @param {number} limit - Maximum number of bid records to fetch
 * @returns {Promise<Array>} List of bid documents
 */
export async function getBidHistory(auctionId, limit = 50) {
  return await getBidsByAuctionDAO(auctionId, limit);
}

/**
 * Retrieve bid history for a specific user
 * @param {string} userId - User Mongoose ObjectId
 * @param {number} limit - Maximum number of bid records to fetch
 * @returns {Promise<Array>} List of bid documents
 */
export async function getBidsByUser(userId, limit = 50) {
  return await getBidsByUserDAO(userId, limit);
}
