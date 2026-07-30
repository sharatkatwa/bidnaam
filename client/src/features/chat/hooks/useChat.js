import { useState } from "react";
import { mockMessages } from "../data/mockMessages.js";

export function useChat() {
  const [messages, setMessages] = useState(mockMessages);
  const [pinnedId, setPinnedId] = useState(null);
  const [mutedUsers, setMutedUsers] = useState([]);

  function sendMessage(text) {
    if (!text.trim()) return;
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
