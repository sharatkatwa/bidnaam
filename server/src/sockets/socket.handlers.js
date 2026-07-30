import { SOCKET_EVENTS } from "./socket.events.js";
import { getAuctionTimeline } from "../modules/timeline/services/timeline.service.js";

/**
 * Register all Socket.io event listeners for a client socket connection
 *
 * @param {Object} io - Socket.io Server instance
 * @param {Object} socket - Client Socket instance
 * @param {AuctionEngine} engine - Active AuctionEngine instance
 * @param {AuctionEmitter} emitter - AuctionEmitter helper instance
 */
export function registerSocketHandlers(io, socket, engine, emitter) {
  // Track active room per socket session
  socket.currentRoom = null;

  // 1. JOIN ROOM Event (FR-7 Join as Bidder / FR-8 Spectator Mode)
  socket.on(SOCKET_EVENTS.JOIN_ROOM, async (data) => {
    try {
      const { auctionId, role = "participant" } = data || {};

      if (!auctionId) {
        return emitter.emitError(socket, "auctionId is required to join a room.");
      }

      // Determine user role and identifier
      const isParticipant = role === "participant" && socket.user;
      const userRole = isParticipant ? "participant" : "spectator";
      const userId = socket.user ? socket.user._id : `guest_${socket.id}`;

      // Join Socket.io room channel
      socket.join(auctionId.toString());
      socket.currentRoom = auctionId.toString();

      // Register connection in AuctionEngine room
      const { room } = await engine.joinAuction(auctionId, userId, userRole);

      // Fetch recent timeline events for state synchronization
      const timelineEvents = await getAuctionTimeline(auctionId, 50);

      // Build authoritative initial room state payload
      const initialRoomState = {
        auctionId: room.auctionId,
        status: room.status,
        highestBid: room.highestBid,
        highestBidder: room.highestBidder,
        participantsCount: room.participants.size,
        spectatorsCount: room.spectators.size,
        timeRemaining: room.timer ? room.timer.getRemainingTime() : 0,
        timeline: timelineEvents,
      };

      // Emit room state back to joining socket
      emitter.emitRoomState(socket, initialRoomState);

      // Broadcast user join update to room
      emitter.emitUserJoined(auctionId, {
        userId,
        role: userRole,
        participantsCount: room.participants.size,
        spectatorsCount: room.spectators.size,
      });
    } catch (error) {
      emitter.emitError(socket, error.message);
    }
  });

  // 2. SUBMIT BID Event (FR-9 Bid Submission)
  socket.on(SOCKET_EVENTS.SUBMIT_BID, async (data) => {
    try {
      if (!socket.user) {
        return emitter.emitError(
          socket,
          "Authentication required to submit a bid.",
          "UNAUTHORIZED"
        );
      }

      const { auctionId, amount } = data || {};

      if (!auctionId || amount === undefined) {
        return emitter.emitError(socket, "auctionId and amount are required.");
      }

      const bidData = {
        bidderId: socket.user._id,
        amount: Number(amount),
      };

      // Execute sequential bid processing in AuctionEngine
      const result = await engine.submitBid(auctionId, bidData);

      // Broadcast valid bid update to all clients in the room
      emitter.emitBidUpdated(auctionId, {
        bid: result.bid,
        highestBid: result.highestBid,
        highestBidder: result.highestBidder,
        timestamp: new Date(),
      });
    } catch (error) {
      emitter.emitError(socket, error.message);
    }
  });

  // 3. SEND CHAT Event (FR-17 Dedicated Live Chat)
  socket.on(SOCKET_EVENTS.SEND_CHAT, (data) => {
    try {
      const { auctionId, message } = data || {};

      if (!auctionId || !message || !message.trim()) {
        return;
      }

      const chatPayload = {
        senderId: socket.user ? socket.user._id : `guest_${socket.id.slice(0, 4)}`,
        senderEmail: socket.user ? socket.user.email : "Spectator",
        message: message.trim(),
        timestamp: new Date(),
      };

      emitter.emitChatMessage(auctionId, chatPayload);
    } catch (error) {
      emitter.emitError(socket, error.message);
    }
  });

  // 4. LEAVE ROOM Event
  socket.on(SOCKET_EVENTS.LEAVE_ROOM, async (data) => {
    try {
      const auctionId = data?.auctionId || socket.currentRoom;

      if (auctionId) {
        const userId = socket.user ? socket.user._id : `guest_${socket.id}`;
        await engine.leaveAuction(auctionId, userId);
        socket.leave(auctionId.toString());
        socket.currentRoom = null;

        emitter.emitUserLeft(auctionId, {
          userId,
        });
      }
    } catch (error) {
      console.warn(`[Socket Leave Warning]: ${error.message}`);
    }
  });

  // 5. DISCONNECT Event
  socket.on("disconnect", async () => {
    try {
      if (socket.currentRoom) {
        const userId = socket.user ? socket.user._id : `guest_${socket.id}`;
        await engine.leaveAuction(socket.currentRoom, userId);
        emitter.emitUserLeft(socket.currentRoom, { userId });
      }
    } catch (error) {
      console.warn(`[Socket Disconnect Warning]: ${error.message}`);
    }
  });
}
