import { verifyAccessToken } from "../shared/utils/jwt.util.js";

/**
 * Socket.io Authentication Middleware
 * Extracts JWT token from handshake auth or authorization header,
 * verifies access token, and attaches user payload to socket.user.
 * Allows anonymous connections for spectator mode while flagging guest status.
 */
export function socketAuthMiddleware(socket, next) {
  try {
    const authHeader = socket.handshake.headers?.authorization;
    const token =
      socket.handshake.auth?.token ||
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null);

    if (!token) {
      socket.user = null; // Spectator / Guest Mode
      return next();
    }

    const decoded = verifyAccessToken(token);
    socket.user = {
      _id: (decoded.userId || decoded._id || decoded.id).toString(),
      email: decoded.email,
    };

    return next();
  } catch (error) {
    console.warn(
      `[Socket Auth Warning] Token verification failed for connection ${socket.id}:`,
      error.message
    );
    socket.user = null; // Fallback to guest mode
    return next();
  }
}
