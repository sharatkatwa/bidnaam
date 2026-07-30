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

      const targetAuctionId = auctionId.toString();

      // Determine user role and identifier
      const isParticipant = role === "participant" && socket.user;
      const userRole = isParticipant ? "participant" : "spectator";
      const userId = socket.user
        ? (socket.user._id || socket.user.id).toString()
        : `guest_${socket.id}`;

      // Join Socket.io room channel
      socket.join(targetAuctionId);
      socket.currentRoom = targetAuctionId;

      // Register connection in AuctionEngine room (auto-hydrates from DB if needed)
      const { room } = await engine.joinAuction(targetAuctionId, userId, userRole);

      // Fetch recent timeline events for state synchronization
      const timelineEvents = await getAuctionTimeline(targetAuctionId, 50);

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
      emitter.emitUserJoined(targetAuctionId, {
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

      const auctionId = data?.auctionId || socket.currentRoom;
      const amount = data?.amount;

      if (!auctionId || amount === undefined || isNaN(Number(amount))) {
        return emitter.emitError(
          socket,
          "Valid auctionId and bid amount are required."
        );
      }

      const targetAuctionId = auctionId.toString();
      const userId = (socket.user._id || socket.user.id).toString();

      const bidData = {
        bidderId: userId,
        amount: Number(amount),
      };

      // Execute sequential bid processing in AuctionEngine
      const result = await engine.submitBid(targetAuctionId, bidData);

      // Broadcast valid bid update to all clients in the room
      emitter.emitBidUpdated(targetAuctionId, {
        bid: result.bid,
        highestBid: result.highestBid,
        highestBidder: result.highestBidder,
        highestBidderEmail: socket.user.email,
        timestamp: new Date(),
      });
    } catch (error) {
      emitter.emitError(socket, error.message);
    }
  });

  // 3. SEND CHAT Event (FR-17 Dedicated Live Chat)
  socket.on(SOCKET_EVENTS.SEND_CHAT, (data) => {
    try {
      const auctionId = data?.auctionId || socket.currentRoom;
      const message = data?.message;

      if (!auctionId || !message || !message.trim()) {
        return;
      }

      const chatPayload = {
        senderId: socket.user
          ? (socket.user._id || socket.user.id).toString()
          : `guest_${socket.id.slice(0, 4)}`,
        senderEmail: socket.user ? socket.user.email : "Spectator",
        message: message.trim(),
        timestamp: new Date(),
      };

      emitter.emitChatMessage(auctionId.toString(), chatPayload);
    } catch (error) {
      emitter.emitError(socket, error.message);
    }
  });

  // 4. LEAVE ROOM Event
  socket.on(SOCKET_EVENTS.LEAVE_ROOM, async (data) => {
    try {
      const auctionId = data?.auctionId || socket.currentRoom;

      if (auctionId) {
        const targetAuctionId = auctionId.toString();
        const userId = socket.user
          ? (socket.user._id || socket.user.id).toString()
          : `guest_${socket.id}`;

        await engine.leaveAuction(targetAuctionId, userId);
        socket.leave(targetAuctionId);
        socket.currentRoom = null;

        emitter.emitUserLeft(targetAuctionId, {
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
        const auctionId = socket.currentRoom;
        const userId = socket.user
          ? (socket.user._id || socket.user.id).toString()
          : `guest_${socket.id}`;

        await engine.leaveAuction(auctionId, userId);

        emitter.emitUserLeft(auctionId, {
          userId,
        });
      }
    } catch (error) {
      console.warn(`[Socket Disconnect Warning]: ${error.message}`);
    }
  });
}
