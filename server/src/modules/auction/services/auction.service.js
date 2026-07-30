import {
  createAuction as createAuctionDAO,
  getAuctionById as getAuctionByIdDAO,
  getAllAuctions as getAllAuctionsDAO,
  updateAuction as updateAuctionDAO,
  deleteAuction as deleteAuctionDAO,
  updateHighestBid as updateHighestBidDAO,
} from "../dao/auction.dao.js";
import Bid from "../../../models/bid.model.js";
import Timeline from "../../../models/timeline.model.js";
import {
  NotFoundError,
  ValidationError,
} from "../../../shared/errors/custom-error.js";

/**
 * Service to create a new auction listing
 * @param {Object} data - Auction payload
 * @returns {Promise<Object>} Created auction document
 */
export async function createAuction(data) {
  return await createAuctionDAO(data);
}

/**
 * Service to retrieve single auction details by ID
 * @param {string} id - Auction Mongoose ObjectId
 * @returns {Promise<Object>} Auction document
 */
export async function getAuction(id) {
  const auction = await getAuctionByIdDAO(id);
  if (!auction) {
    throw new NotFoundError("Auction not found");
  }
  return auction;
}

/**
 * Service to list auctions with optional filters and pagination
 * @param {Object} filters - Query filters
 * @param {Object} options - Pagination and sorting options
 * @returns {Promise<Array>} List of matching auction documents
 */
export async function listAuctions(filters = {}, options = {}) {
  return await getAllAuctionsDAO(filters, options);
}

/**
 * Service to update auction details by ID
 * @param {string} id - Auction Mongoose ObjectId
 * @param {Object} data - Update data fields
 * @returns {Promise<Object>} Updated auction document
 */
export async function updateAuction(id, data) {
  const auction = await getAuctionByIdDAO(id);
  if (!auction) {
    throw new NotFoundError("Auction not found");
  }
  return await updateAuctionDAO(id, data);
}

/**
 * Service to delete an auction by ID
 * @param {string} id - Auction Mongoose ObjectId
 * @returns {Promise<Object|null>} Deleted auction document
 */
export async function deleteAuction(id) {
  const auction = await getAuctionByIdDAO(id);
  if (!auction) {
    throw new NotFoundError("Auction not found");
  }
  return await deleteAuctionDAO(id);
}

/**
 * Service to validate, record a new bid document, update highest bid on the auction,
 * and record a timeline event. Designed for consumption by the Real-Time Auction Engine.
 *
 * @param {string} auctionId - Target auction ID
 * @param {number|Object} bid - Bid amount or bid details object ({ amount, bidId })
 * @param {string} bidderId - User ID submitting the bid
 * @returns {Promise<Object>} Object containing updated auction and recorded bid document
 */
export async function updateHighestBid(auctionId, bid, bidderId) {
  const amount = typeof bid === "number" ? bid : bid.amount;
  const timestamp = new Date();

  // 1. Create Bid record in database
  const bidDoc = await Bid.create({
    auction: auctionId,
    bidder: bidderId,
    amount,
  });

  // 2. Atomically update Auction highest bid in database via DAO
  const updatedAuction = await updateHighestBidDAO(auctionId, {
    amount,
    bidderId,
    bidId: bidDoc._id,
    timestamp,
  });

  if (!updatedAuction) {
    throw new ValidationError(
      "Bid rejected: Amount is lower than current highest bid or auction closed"
    );
  }

  // 3. Log Timeline event
  await Timeline.create({
    auction: auctionId,
    type: "BID_PLACED",
    message: `New highest bid of $${amount} placed`,
    metadata: {
      bidder: bidderId,
      amount,
      bidId: bidDoc._id,
    },
  });

  return {
    auction: updatedAuction,
    bid: bidDoc,
  };
}

/**
 * Service to complete/close an auction when countdown timer reaches zero
 * @param {string} auctionId - Target auction ID
 * @param {string|null} winnerId - Optional winner user ID
 * @returns {Promise<Object>} Completed auction document
 */
export async function closeAuction(auctionId, winnerId = null) {
  const auction = await getAuctionByIdDAO(auctionId);
  if (!auction) {
    throw new NotFoundError("Auction not found");
  }

  const winner = winnerId || auction.currentHighestBid?.bidder;
  const hasWinner = Boolean(winner);

  const updatedAuction = await updateAuctionDAO(auctionId, {
    status: "completed",
    winner: winner || null,
    paymentStatus: hasWinner ? "pending" : "none",
  });

  await Timeline.create({
    auction: auctionId,
    type: "AUCTION_CLOSED",
    message: hasWinner
      ? `Auction completed. Winner declared for $${auction.currentHighestBid?.amount}`
      : "Auction completed with no bids placed",
    metadata: {
      winner: winner || null,
      winningBid: auction.currentHighestBid?.amount || 0,
    },
  });

  return updatedAuction;
}
