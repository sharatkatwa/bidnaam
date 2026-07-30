import { io } from "socket.io-client";
import { store } from "../app/store.js";

const apiUrl = import.meta.env.VITE_API_URL;
const socketUrl = apiUrl ? apiUrl.replace(/\/api\/v1\/?$/, "") : undefined;

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(socketUrl, {
      autoConnect: false,
      auth: (cb) => cb({ token: store.getState().auth.token }),
    });
  }
  return socket;
}
