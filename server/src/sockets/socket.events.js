/**
 * Socket.io Event Constants
 * Single source of truth for event names across real-time socket communication.
 */
export const SOCKET_EVENTS = {
  // Client -> Server Events
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",
  SUBMIT_BID: "submit_bid",
  SEND_CHAT: "send_chat",

  // Server -> Client Events
  ROOM_STATE: "room_state",
  BID_UPDATED: "bid_updated",
  TIMER_TICK: "timer_tick",
  TIME_EXTENDED: "time_extended",
  AUCTION_ENDED: "auction_ended",
  CHAT_MESSAGE: "chat_message",
  USER_JOINED: "user_joined",
  USER_LEFT: "user_left",
  ERROR: "error",
};
