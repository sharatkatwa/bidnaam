import RoomManager from "./room.manager.js";

class AuctionEngine {
    constructor() {
        this.roomManager = new RoomManager();
    }

    async startAuction() { }

    async endAuction() { }

    async joinAuction() { }

    async leaveAuction() { }

    async submitBid() { }

    async recoverAuction() { }

}

export default AuctionEngine