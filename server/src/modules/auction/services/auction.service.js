import {
  createAuction as createAuctionDAO,
  getAuctionById as getAuctionByIdDAO,
  getAllAuctions as getAllAuctionsDAO,
  updateAuction as updateAuctionDAO,
  deleteAuction as deleteAuctionDAO,
  updateHighestBid as updateHighestBidDAO,
} from "../dao/auction.dao.js";
import Timeline from "../../../models/timeline.model.js";
import {
  NotFoundError,
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
 * Service to persist the highest bid update for an active auction document in the database
 * @param {string} auctionId - Target auction ID
 * @param {Object} bidPayload - ({ amount, bidderId, bidId, timestamp })
 * @returns {Promise<Object|null>} Updated auction document or null if race condition failed
 */
export async function processHighestBid(
  auctionId,
  { amount, bidderId, bidId, timestamp = new Date() }
) {
  return await updateHighestBidDAO(auctionId, {
    amount,
    bidderId,
    bidId,
    timestamp,
  });
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
