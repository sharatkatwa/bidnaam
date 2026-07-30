import { useState, useEffect } from "react";
import { getSocket } from "../../../api/socket.js";
import { SOCKET_EVENTS } from "../../../shared/data/socketEvents.js";
import { mockMessages } from "../data/mockMessages.js";

export function useChat(auctionId) {
  const [messages, setMessages] = useState(mockMessages);
  const [pinnedId, setPinnedId] = useState(null);
  const [mutedUsers, setMutedUsers] = useState([]);

  useEffect(() => {
    if (!auctionId) return;
    const socket = getSocket();
    socket.connect();

    function onChatMessage(payload) {
      const user = payload.senderEmail?.includes("@")
        ? payload.senderEmail.split("@")[0]
        : payload.senderEmail;
      setMessages((prev) =>
        [...prev, { id: `${Date.now()}-${Math.random()}`, user, text: payload.message }].slice(-30)
      );
    }

    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, onChatMessage);
    return () => socket.off(SOCKET_EVENTS.CHAT_MESSAGE, onChatMessage);
  }, [auctionId]);

  function sendMessage(text) {
    if (!text.trim()) return;

    if (auctionId) {
      getSocket().emit(SOCKET_EVENTS.SEND_CHAT, { auctionId, message: text });
      return;
    }

    setMessages((prev) => [...prev, { id: Date.now(), user: "You", text }].slice(-30));
  }

  function deleteMessage(id) {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
    setPinnedId((prev) => (prev === id ? null : prev));
  }

  function togglePin(id) {
    setPinnedId((prev) => (prev === id ? null : id));
  }

  function toggleMuteUser(user) {
    setMutedUsers((prev) =>
      prev.includes(user) ? prev.filter((u) => u !== user) : [...prev, user]
    );
  }

  const visibleMessages = messages.filter((msg) => !mutedUsers.includes(msg.user));
  const pinnedMessage = visibleMessages.find((msg) => msg.id === pinnedId) ?? null;

  return {
    messages: visibleMessages,
    pinnedMessage,
    mutedUsers,
    sendMessage,
    deleteMessage,
    togglePin,
    toggleMuteUser,
  };
}
