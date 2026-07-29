import { useState } from "react";
import { useChat } from "../hooks/useChat.js";

export default function ChatPanel() {
  const { messages, sendMessage } = useChat();
  const [text, setText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(text);
    setText("");
  }

  return (
    <div className="glass reveal rounded-2xl p-5 flex flex-col" style={{ animationDelay: "0.2s" }}>
      <h3 className="text-sm font-bold text-white/70 uppercase tracking-wide mb-3">Room chat</h3>

      <ul className="flex flex-col gap-2 max-h-48 overflow-y-auto mb-3">
        {messages.map((msg) => (
          <li key={msg.id} className="text-sm">
            <span className={msg.user === "You" ? "text-bid-gold font-semibold" : "text-white/60 font-semibold"}>
              {msg.user}:
            </span>{" "}
            <span className="text-white/85">{msg.text}</span>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Say something..."
          className="flex-1 bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-bid-gold transition"
        />
        <button
          type="submit"
          className="glass px-4 py-2 rounded-lg text-sm font-semibold text-white/80 hover:text-white transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}
