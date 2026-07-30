// Mirrors server/src/sockets/socket.events.js — must stay in sync with Domain B.
export const SOCKET_EVENTS = {
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",
  SUBMIT_BID: "submit_bid",
  SEND_CHAT: "send_chat",

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
