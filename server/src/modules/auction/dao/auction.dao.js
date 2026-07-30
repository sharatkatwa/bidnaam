import Auction from "../../../models/auction.model.js";

/**
 * Create a new auction listing
 * @param {Object} auctionData - Auction creation parameters
 * @returns {Promise<Object>} Created auction document
 */
export const createAuction = async (auctionData) => {
  return await Auction.create(auctionData);
};

/**
 * Get auction by ID with populated seller & bidder details
 * @param {string} auctionId - Auction Mongoose ObjectId
 * @returns {Promise<Object|null>} Auction document if found
 */
export const getAuctionById = async (auctionId) => {
  return await Auction.findById(auctionId)
    .populate("seller", "email isActive")
    .populate("currentHighestBid.bidder", "email")
    .populate("winner", "email")
    .exec();
};

/**
 * Get all auctions with optional filtering and pagination
 * @param {Object} filters - Query filters (e.g. { status, seller })
 * @param {Object} options - Query options ({ sort, limit, skip })
 * @returns {Promise<Array>} List of matching auction documents
 */
export const getAllAuctions = async (filters = {}, options = {}) => {
  const query = Auction.find(filters);

  if (options.sort) {
    query.sort(options.sort);
  } else {
    query.sort({ createdAt: -1 });
  }

  if (options.skip) query.skip(options.skip);
  if (options.limit) query.limit(options.limit);

  return await query
    .populate("seller", "email")
    .populate("currentHighestBid.bidder", "email")
    .exec();
};

/**
 * Update auction document fields by ID
 * @param {string} auctionId - Auction Mongoose ObjectId
 * @param {Object} updateData - Data fields to update
 * @returns {Promise<Object|null>} Updated auction document
 */
export const updateAuction = async (auctionId, updateData) => {
  return await Auction.findByIdAndUpdate(auctionId, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("seller", "email")
    .populate("currentHighestBid.bidder", "email")
    .populate("winner", "email")
    .exec();
};

/**
 * Delete an auction by ID
 * @param {string} auctionId - Auction Mongoose ObjectId
 * @returns {Promise<Object|null>} Deleted auction document
 */
export const deleteAuction = async (auctionId) => {
  return await Auction.findByIdAndDelete(auctionId).exec();
};

/**
 * Atomically update the highest bid of an active auction
 * Ensures the new bid amount is higher than the recorded highest bid
 * @param {string} auctionId - Auction Mongoose ObjectId
 * @param {Object} bidInfo - Bid payload ({ amount, bidderId, bidId, timestamp })
 * @returns {Promise<Object|null>} Updated auction document if successful, null if outbid race lost
 */
export const updateHighestBid = async (
  auctionId,
  { amount, bidderId, bidId, timestamp = new Date() }
) => {
  return await Auction.findOneAndUpdate(
    {
      _id: auctionId,
      status: "active",
      $or: [
        { "currentHighestBid.amount": { $lt: amount } },
        { "currentHighestBid.bidder": null },
      ],
    },
    {
      $set: {
        currentHighestBid: {
          amount,
          bidder: bidderId,
          bidId,
          timestamp,
        },
      },
    },
    { new: true, runValidators: true }
  )
    .populate("seller", "email")
    .populate("currentHighestBid.bidder", "email")
    .exec();
};
