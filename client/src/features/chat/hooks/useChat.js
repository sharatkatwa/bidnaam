import { useState } from "react";
import { mockMessages } from "../data/mockMessages.js";

export function useChat() {
  const [messages, setMessages] = useState(mockMessages);

  function sendMessage(text) {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), user: "You", text }].slice(-30));
  }

  return { messages, sendMessage };
}
