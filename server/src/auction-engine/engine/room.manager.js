import AuctionRoom from "./auction.room.js";

class RoomManager {
    constructor() {
        this.rooms = new Map();
    }

    /**
     * Create a new room if it doesn't already exist.
     * @param {Object} auction - Auction document
     * @returns {AuctionRoom}
     */
    createRoom(auction) {
        const auctionId = auction._id.toString();

        if (this.rooms.has(auctionId)) {
            return this.rooms.get(auctionId);
        }

        const room = new AuctionRoom(auction);
        this.rooms.set(auctionId, room);

        return room;
    }

    /**
     * Get an active room.
     * @param {string} auctionId
     * @returns {AuctionRoom|null}
     */
    getRoom(auctionId) {
        return this.rooms.get(auctionId.toString()) || null;
    }

    /**
     * Check if a room exists.
     * @param {string} auctionId
     * @returns {boolean}
     */
    hasRoom(auctionId) {
        return this.rooms.has(auctionId.toString());
    }

    /**
     * Remove a room after auction ends.
     * @param {string} auctionId
     * @returns {boolean}
     */
    removeRoom(auctionId) {
        return this.rooms.delete(auctionId.toString());
    }

    /**
     * Get all active rooms.
     * @returns {AuctionRoom[]}
     */
    getAllRooms() {
        return [...this.rooms.values()];
    }

    /**
     * Get the number of active rooms.
     * @returns {number}
     */
    getRoomCount() {
        return this.rooms.size;
    }

    /**
     * Remove every room.
     * Useful for tests or graceful shutdown.
     */
    clear() {
        this.rooms.clear();
    }
}

export default RoomManager;