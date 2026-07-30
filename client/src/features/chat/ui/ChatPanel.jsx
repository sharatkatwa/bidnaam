import { useState } from "react";
import { useSelector } from "react-redux";
import { useChat } from "../hooks/useChat.js";

export default function ChatPanel() {
  const {
    messages,
    pinnedMessage,
    mutedUsers,
    sendMessage,
    deleteMessage,
    togglePin,
    toggleMuteUser,
  } = useChat();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [text, setText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    sendMessage(text);
    setText("");
  }

  return (
    <div className="panel reveal rounded-2xl p-5 flex flex-col" style={{ animationDelay: "0.2s" }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-ink-dim uppercase tracking-wide">Room chat</h3>
        {isAuthenticated && (
          <span className="text-[10px] text-ink-dim/70 uppercase tracking-wide">Moderator tools on</span>
        )}
      </div>

      {pinnedMessage && (
        <div className="flex items-start gap-2 border border-brand/40 rounded-lg px-3 py-2 mb-3 text-sm">
          <span className="text-brand text-xs font-bold uppercase shrink-0">Pinned</span>
          <span className="text-ink-dim font-semibold">{pinnedMessage.user}:</span>
          <span className="text-ink/90 truncate">{pinnedMessage.text}</span>
        </div>
      )}

      <ul className="flex flex-col gap-2 max-h-48 overflow-y-auto mb-3">
        {messages.map((msg) => (
          <li key={msg.id} className="group flex items-start justify-between gap-2 text-sm">
            <p className="min-w-0">
              <span className={msg.user === "You" ? "text-brand font-semibold" : "text-ink-dim font-semibold"}>
                {msg.user}:
              </span>{" "}
              <span className="text-ink/90">{msg.text}</span>
              {msg.id === pinnedMessage?.id && <span className="text-brand text-[10px] uppercase ml-1">pinned</span>}
            </p>

            {isAuthenticated && (
              <span className="hidden group-hover:flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => togglePin(msg.id)}
                  title="Pin message"
                  className="text-ink-dim hover:text-brand text-xs"
                >
                  📌
                </button>
                <button
                  type="button"
                  onClick={() => toggleMuteUser(msg.user)}
                  title={mutedUsers.includes(msg.user) ? "Unmute user" : "Mute user"}
                  className="text-ink-dim hover:text-urgent text-xs"
                >
                  🔇
                </button>
                <button
                  type="button"
                  onClick={() => deleteMessage(msg.id)}
                  title="Delete message"
                  className="text-ink-dim hover:text-urgent text-xs"
                >
                  ✕
                </button>
              </span>
            )}
          </li>
        ))}
      </ul>

      {mutedUsers.length > 0 && (
        <p className="text-[11px] text-ink-dim/70 mb-3">
          Muted: {mutedUsers.join(", ")}
        </p>
      )}

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
