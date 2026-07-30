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
    <div className="panel reveal rounded-2xl p-5 flex flex-col" style={{ animationDelay: "0.2s" }}>
      <h3 className="text-sm font-bold text-ink-dim uppercase tracking-wide mb-3">Room chat</h3>

      <ul className="flex flex-col gap-2 max-h-48 overflow-y-auto mb-3">
        {messages.map((msg) => (
          <li key={msg.id} className="text-sm">
            <span className={msg.user === "You" ? "text-brand font-semibold" : "text-ink-dim font-semibold"}>
              {msg.user}:
            </span>{" "}
            <span className="text-ink/90">{msg.text}</span>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Say something..."
          className="flex-1 bg-white/5 border border-line-strong rounded-lg px-3 py-2 text-sm text-ink placeholder-ink-dim/50 outline-none focus:border-brand transition"
        />
        <button
          type="submit"
          className="panel px-4 py-2 rounded-lg text-sm font-semibold text-ink-dim hover:text-ink transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}
