import { SOCKET_EVENTS } from "../socket.events.js";

/**
 * Auction Socket Emitter Class
 * Encapsulates all outgoing Socket.io room broadcasts and direct socket events.
 */
export class AuctionEmitter {
  /**
   * @param {Object} io - Socket.io Server instance
   */
  constructor(io) {
    this.io = io;
  }

  /**
   * Emit authoritative room state payload to a specific socket connection
   */
  emitRoomState(socket, roomState) {
    socket.emit(SOCKET_EVENTS.ROOM_STATE, roomState);
  }

  /**
   * Broadcast valid bid update to all clients in an auction room channel
   */
  emitBidUpdated(auctionId, bidPayload) {
    this.io.to(auctionId.toString()).emit(SOCKET_EVENTS.BID_UPDATED, bidPayload);
  }

  /**
   * Broadcast anti-sniping dynamic timer extension to all clients in a room
   */
  emitTimeExtended(auctionId, extensionPayload) {
    this.io.to(auctionId.toString()).emit(SOCKET_EVENTS.TIME_EXTENDED, extensionPayload);
  }

  /**
   * Broadcast auction completion & winner declaration to all clients in a room
   */
  emitAuctionEnded(auctionId, completionPayload) {
    this.io.to(auctionId.toString()).emit(SOCKET_EVENTS.AUCTION_ENDED, completionPayload);
  }

  /**
   * Broadcast non-blocking live chat message to all room participants/spectators
   */
  emitChatMessage(auctionId, chatPayload) {
    this.io.to(auctionId.toString()).emit(SOCKET_EVENTS.CHAT_MESSAGE, chatPayload);
  }

  /**
   * Broadcast user join event to room channel
   */
  emitUserJoined(auctionId, joinPayload) {
    this.io.to(auctionId.toString()).emit(SOCKET_EVENTS.USER_JOINED, joinPayload);
  }

  /**
   * Broadcast user disconnect/leave event to room channel
   */
  emitUserLeft(auctionId, leavePayload) {
    this.io.to(auctionId.toString()).emit(SOCKET_EVENTS.USER_LEFT, leavePayload);
  }

  /**
   * Emit error message directly to a single socket connection
   */
  emitError(socket, errorMessage, code = "SOCKET_ERROR") {
    socket.emit(SOCKET_EVENTS.ERROR, {
      success: false,
      error: errorMessage,
      code,
    });
  }
}
