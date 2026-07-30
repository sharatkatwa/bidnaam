import { NotFoundError, ValidationError } from "../../shared/errors/custom-error.js";
import { createBid } from "../../modules/bidding/services/bid.service.js";
import { processHighestBid, closeAuction } from "../../modules/auction/services/auction.service.js";
import { createTimelineEvent } from "../../modules/timeline/services/timeline.service.js";
import { validateBid } from "../validators/bid.validator.js";
import { recoverActiveAuctions } from "../recovery/recovery.service.js";
import AuctionTimer from "../timer/auction.timer.js";
import RoomManager from "./room.manager.js";

/**
 * Authoritative Auction Engine (Domain B Core Orchestrator)
 * Manages in-memory auction rooms, server-authoritative countdown timers,
 * processes concurrent bid queues deterministically, syncs runtime room state,
 * and orchestrates database persistence & event logging.
 */
class AuctionEngine {
    constructor() {
        this.roomManager = new RoomManager();
    }

    /**
     * Start/Initialize an active in-memory auction room with server-authoritative countdown timer
     * @param {Object} auction - Mongoose Auction document
     * @returns {Promise<AuctionRoom>} Initialized or existing AuctionRoom instance
     */
    async startAuction(auction) {
        if (!auction) {
            throw new NotFoundError("Auction is required.");
        }

        let room = this.roomManager.getRoom(auction._id);

        if (room) {
            return room;
        }

        room = this.roomManager.createRoom(auction);

        room.timer = new AuctionTimer({
            auctionId: auction._id,
            endTime: auction.endTime,
            onExpire: async (auctionId) => {
                await this.endAuction(auctionId);
            },
        });

        room.timer.start();

        return room;
    }

    /**
     * End and finalize an auction room by ID
     * @param {string} auctionId - Target auction ID
     * @returns {Promise<Object>} Finalization result
     */
    async endAuction(auctionId) {
        const room = this.roomManager.getRoom(auctionId);

        if (!room) {
            throw new NotFoundError("Auction room not found.");
        }

        return await this.finalizeAuction(room);
    }

    /**
     * Internal workflow method to finalize, lock, close, and persist auction results (FR-19)
     * Step 1: Lock Auction (status = completed)
     * Step 2: Stop Timer
     * Step 3: Find Winner from room runtime state
     * Step 4: Persist Winner & status in DB via closeAuction service
     * Step 5: Remove Room from RoomManager
     *
     * @param {AuctionRoom} room - Target in-memory room instance
     * @returns {Promise<Object>} Finalized auction state summary
     */
    async finalizeAuction(room) {
        const auctionId = room.auctionId;

        // 1. Lock Auction runtime room state immediately
        room.status = "completed";

        // 2. Stop countdown timer if active
        if (room.timer) {
            room.timer.stop();
        }

        // 3. Find Winner from room runtime state
        const winnerId = room.highestBidder || null;
        const winningBid = room.highestBid || 0;

        // 4. Update Auction status & persist winner in MongoDB (also logs AUCTION_CLOSED timeline event)
        const updatedAuctionDoc = await closeAuction(auctionId, winnerId);

        // 5. Remove Room from active RoomManager
        this.roomManager.removeRoom(auctionId);

        // 6. Return domain state for Socket notification broadcast / API response
        return {
            success: true,
            message: winnerId
                ? `Auction completed. Winner declared for $${winningBid}.`
                : "Auction completed with no winning bids.",
            auctionId,
            winner: winnerId,
            winningBid,
            auction: updatedAuctionDoc,
        };
    }

    /**
     * Join an auction room as a active bidder participant or spectator
     * @param {string} auctionId - Target auction ID
     * @param {string} userId - User Mongoose ObjectId
     * @param {string} role - Role type ("participant" | "spectator")
     * @returns {Promise<Object>} Join operation result
     */
    async joinAuction(auctionId, userId, role = "participant") {
        const room = this.roomManager.getRoom(auctionId);

        if (!room) {
            throw new NotFoundError("Auction room not found.");
        }

        const id = userId.toString();

        if (role === "participant") {
            room.participants.add(id);
        } else {
            room.spectators.add(id);
        }

        return {
            success: true,
            room,
        };
    }

    /**
     * Leave an auction room, removing user from participant & spectator sets
     * @param {string} auctionId - Target auction ID
     * @param {string} userId - User Mongoose ObjectId
     * @returns {Promise<Object>} Status result
     */
    async leaveAuction(auctionId, userId) {
        const room = this.roomManager.getRoom(auctionId);

        if (!room) {
            throw new NotFoundError("Auction room not found.");
        }

        const id = userId.toString();

        room.participants.delete(id);
        room.spectators.delete(id);

        return {
            success: true,
        };
    }

    /**
     * Enqueue and deterministically process a bid submission (FR-9, FR-11, FR-12)
     * Sequential execution guarantees latency-independent order without race conditions.
     * Includes Anti-Sniping dynamic timer extension (SG-1).
     *
     * @param {string} auctionId - Target auction ID
     * @param {Object} bidData - Bid payload ({ bidderId, amount })
     * @returns {Promise<Object>} Domain result containing { bid, highestBid, highestBidder }
     */
    async submitBid(auctionId, bidData) {
        const room = this.roomManager.getRoom(auctionId);

        if (!room) {
            throw new NotFoundError("Auction room not found.");
        }

        return room.bidQueue.enqueue(async () => {
            // 1. Validate bid against room runtime state using BidValidator
            validateBid(room, bidData);

            const { bidderId, amount } = bidData;
            const numericAmount = Number(amount);
            const timestamp = new Date();

            // 2. Persist Bid record in database via BidService
            const bidDoc = await createBid({
                auctionId,
                bidderId,
                amount: numericAmount,
            });

            // 3. Update auction highest bid in database via AuctionService
            const updatedAuction = await processHighestBid(auctionId, {
                amount: numericAmount,
                bidderId,
                bidId: bidDoc._id,
                timestamp,
            });

            if (!updatedAuction) {
                throw new ValidationError("Bid rejected: Outbid by a concurrent bid transaction.");
            }

            // 4. Update in-memory room runtime state
            room.highestBid = numericAmount;
            room.highestBidder = bidderId.toString();

            // Anti-Sniping (SG-1): Extend countdown by 30s if bid arrives in last 30 seconds
            if (room.timer) {
                const remaining = room.timer.getRemainingTime();
                if (remaining > 0 && remaining <= 30_000) {
                    room.timer.extend(30_000);
                    await createTimelineEvent({
                        auctionId,
                        type: "TIME_EXTENDED",
                        metadata: { extendedSeconds: 30 },
                    });
                }
            }

            // 5. Record timeline event via TimelineService
            await createTimelineEvent({
                auctionId,
                type: "BID_PLACED",
                bidderId,
                amount: numericAmount,
                bidId: bidDoc._id,
            });

            // 6. Return pure domain result for Socket broadcast / Controller consumption
            return {
                bid: bidDoc,
                highestBid: room.highestBid,
                highestBidder: room.highestBidder,
            };
        });
    }

    /**
     * Re-hydrate and recover all active auction rooms and timers on server restart (S-15, FR-22)
     * @returns {Promise<number>} Number of recovered live rooms
     */
    async recoverAuction() {
        return await recoverActiveAuctions(this);
    }
}

export default AuctionEngine;