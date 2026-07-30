import { Server } from "socket.io";
import { socketAuthMiddleware } from "./socket.middleware.js";
import { AuctionEmitter } from "./emitters/auction.emitter.js";
import { registerSocketHandlers } from "./socket.handlers.js";

/**
 * Initialize Socket.io Server
 * Attaches real-time Socket.io server to Node.js HTTP Server instance,
 * configures CORS, applies JWT authentication middleware, and binds event handlers.
 *
 * @param {Object} httpServer - Node.js http.Server instance
 * @param {AuctionEngine} engine - Active AuctionEngine instance
 * @returns {Object} Object containing { io, emitter }
 */
export function initSocketServer(httpServer, engine) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 30000,
    pingInterval: 10000,
  });

  const emitter = new AuctionEmitter(io);

  // Apply JWT authentication middleware to handshakes
  io.use(socketAuthMiddleware);

  // Register connection event listener
  io.on("connection", (socket) => {
    console.log(
      `[Socket Connected] ID: ${socket.id} | User: ${
        socket.user ? socket.user.email : "Guest/Spectator"
      }`
    );

    registerSocketHandlers(io, socket, engine, emitter);
  });

  return {
    io,
    emitter,
  };
}
