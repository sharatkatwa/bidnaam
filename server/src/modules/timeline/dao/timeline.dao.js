import Timeline from "../../../models/timeline.model.js";

/**
 * Create a new timeline event document in database
 * @param {Object} timelineData - ({ auction, type, message, metadata })
 * @returns {Promise<Object>} Created timeline document
 */
export const createTimelineDAO = async (timelineData) => {
  return await Timeline.create(timelineData);
};

/**
 * Get chronological timeline events for a specific auction
 * @param {string} auctionId - Auction Mongoose ObjectId
 * @param {number} limit - Maximum number of events to retrieve
 * @returns {Promise<Array>} List of timeline event documents
 */
export const getTimelineByAuctionDAO = async (auctionId, limit = 100) => {
  return await Timeline.find({ auction: auctionId })
    .sort({ createdAt: 1 })
    .limit(limit)
    .exec();
};
