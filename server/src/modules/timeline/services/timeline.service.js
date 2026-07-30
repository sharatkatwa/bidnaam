import {
  createTimelineDAO,
  getTimelineByAuctionDAO,
} from "../dao/timeline.dao.js";

/**
 * Record a new timeline event for an auction (FR-13)
 * Called by AuctionEngine and controllers to append chronological event logs.
 *
 * @param {Object} payload - ({ auction, type, message, metadata })
 * @returns {Promise<Object>} Created timeline document
 */
export async function createTimelineEvent({ auction, type, message, metadata = {} }) {
  return await createTimelineDAO({
    auction,
    type,
    message,
    metadata,
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
