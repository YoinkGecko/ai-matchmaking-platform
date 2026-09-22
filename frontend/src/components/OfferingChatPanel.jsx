import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatDate, pick } from "../utils/format";

function ChatBubble({ message, isMine }) {
  return (
    <div
      className={`chat-bubble ${isMine ? "chat-bubble--mine" : "chat-bubble--theirs"}`}
    >
      <p className="chat-bubble__body">{message.body}</p>
      <time className="chat-bubble__time" dateTime={message.created_at}>
        {formatDate(message.created_at)}
      </time>
    </div>
  );
}

export default function OfferingChatPanel({
  offeringId,
  conversationId: initialConversationId,
  productTitle,
  counterpartyName,
  onClose,
}) {
  const { user } = useAuth();
  const role = user?.role;
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  const conversationId =
    pick(conversation, "id", "id") || initialConversationId;

  const loadThread = useCallback(async () => {
    setError("");
    try {
      if (offeringId && role === "CLIENT") {
        const res = await api.getOfferingChat(offeringId);
        setConversation(res.conversation);
        setMessages(res.messages || []);
      } else if (conversationId) {
        const res = await api.getChatConversation(conversationId);
        setConversation(res.conversation);
        setMessages(res.messages || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [offeringId, conversationId, role]);

  useEffect(() => {
    loadThread();
    const interval = setInterval(loadThread, 8000);
    return () => clearInterval(interval);
  }, [loadThread]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setSending(true);
    setError("");
    try {
      if (offeringId && role === "CLIENT") {
        await api.sendOfferingChatMessage(offeringId, body);
      } else if (conversationId) {
        await api.sendChatMessage(conversationId, body);
      }
      setText("");
      await loadThread();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const title =
    productTitle ||
    pick(conversation, "productOffered", "product_offered") ||
    "Offering chat";
  const party =
    counterpartyName ||
    (role === "CLIENT"
      ? pick(conversation, "supplierName", "supplier_name")
      : pick(conversation, "companyName", "company_name"));

  return (
    <div className="chat-panel" role="dialog" aria-modal="true" aria-labelledby="chat-title">
      <div className="chat-panel__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="chat-panel__sheet">
        <header className="chat-panel__header">
          <div>
            <p className="chat-panel__kicker">Negotiate</p>
            <h2 id="chat-title">{title}</h2>
            <p className="card__meta">with {party}</p>
          </div>
          <button type="button" className="chat-panel__close" onClick={onClose}>
            ×
          </button>
        </header>

        <p className="chat-panel__notice card__meta">
          Messages are emailed to both parties. Use this thread to discuss price, MOQ, and delivery.
        </p>

        {error && <div className="alert alert--error">{error}</div>}

        <div className="chat-panel__messages" ref={scrollRef}>
          {loading && messages.length === 0 ? (
            <p className="card__meta">Loading conversation…</p>
          ) : messages.length === 0 ? (
            <p className="card__meta">
              No messages yet. Say hello and start negotiating.
            </p>
          ) : (
            messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                isMine={msg.sender_role === role}
              />
            ))
          )}
        </div>

        <form className="chat-panel__composer" onSubmit={handleSend}>
          <textarea
            rows={2}
            placeholder="Type your message…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={sending}
          />
          <button type="submit" className="btn btn--accent" disabled={sending || !text.trim()}>
            {sending ? "Sending…" : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
