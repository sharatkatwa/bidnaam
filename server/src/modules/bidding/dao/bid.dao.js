import Bid from "../../../models/bid.model.js";

/**
 * Create a new bid document in database
 * @param {Object} bidData - ({ auction, bidder, amount })
 * @returns {Promise<Object>} Created bid document
 */
export const createBidDAO = async (bidData) => {
  return await Bid.create(bidData);
};

/**
 * Get highest bid document for a specific auction
 * @param {string} auctionId - Auction Mongoose ObjectId
 * @returns {Promise<Object|null>} Highest bid document if found
 */
export const getHighestBidDAO = async (auctionId) => {
  return await Bid.findOne({ auction: auctionId })
    .sort({ amount: -1, createdAt: -1 })
    .populate("bidder", "email")
    .exec();
};

/**
 * Get bid history for a specific auction sorted chronologically
 * @param {string} auctionId - Auction Mongoose ObjectId
 * @param {number} limit - Maximum number of bids to retrieve
 * @returns {Promise<Array>} List of bid documents
 */
export const getBidsByAuctionDAO = async (auctionId, limit = 50) => {
  return await Bid.find({ auction: auctionId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("bidder", "email")
    .exec();
};

/**
 * Get bid history for a specific user
 * @param {string} userId - User Mongoose ObjectId
 * @param {number} limit - Maximum number of bids to retrieve
 * @returns {Promise<Array>} List of bid documents
 */
export const getBidsByUserDAO = async (userId, limit = 50) => {
  return await Bid.find({ bidder: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("auction", "title status currentHighestBid")
    .exec();
};
