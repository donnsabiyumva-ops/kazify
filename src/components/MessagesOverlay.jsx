import { useEffect, useRef, useState } from "react";
import Icon from "./Icon.jsx";
import { useKazify } from "../store/KazifyContext.jsx";
import * as api from "../lib/api.js";

function initialsOf(handle) {
  return (handle || "@").replace("@", "").slice(0, 2).toUpperCase();
}

function fmtClock(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function MessagesOverlay() {
  const { state, setState, me, chat, closeChat, closeInbox, openInbox, conversations, thread, threadBusy, sendChatMessage, cacheGigs, accent } = useKazify();
  const [draft, setDraft] = useState("");
  const [sellerGigs, setSellerGigs] = useState([]);
  const [hirePickerOpen, setHirePickerOpen] = useState(false);
  const bottomRef = useRef(null);

  const open = state.inboxOpen || !!state.chatWith;
  const showingThread = !!state.chatWith;
  const knownGigId = state.chatWith?.gigId;

  useEffect(() => {
    if (showingThread) bottomRef.current?.scrollIntoView({ block: "end" });
  }, [thread, showingThread]);

  // The chat wasn't opened from a specific gig (e.g. from the inbox) — look
  // up the seller's active gigs so "Hire Now" still knows what to offer.
  useEffect(() => {
    setHirePickerOpen(false);
    if (!showingThread || knownGigId) {
      setSellerGigs([]);
      return;
    }
    let cancelled = false;
    api.getGigsBySeller(state.chatWith.id).then((rows) => {
      if (cancelled) return;
      setSellerGigs(rows);
      cacheGigs(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [showingThread, knownGigId, state.chatWith?.id, cacheGigs]);

  if (!open) return null;

  const back = () => {
    if (showingThread && state.inboxOpen) openInbox();
    else if (showingThread) closeChat();
    else closeInbox();
  };

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    sendChatMessage(text);
    setDraft("");
  };

  const hireNow = (gigId) => setState({ checkoutId: gigId, chatWith: null, inboxOpen: false, fundStatus: "idle" });

  const hireGigId = knownGigId || (sellerGigs.length === 1 ? sellerGigs[0].id : null);
  const canHire = !!hireGigId || sellerGigs.length > 1;
  // Hiring is gated on an actual reply, not just the buyer talking into the
  // void — a real back-and-forth before money moves, not an instant checkout.
  const sellerHasReplied = showingThread && thread.some((m) => m.senderId === state.chatWith.id);

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--kz-bg)", zIndex: 74, display: "flex", flexDirection: "column", animation: "kz-fade .18s ease-out" }}>
      <div style={{ maxWidth: 620, width: "100%", margin: "0 auto", padding: "26px 24px 0", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 18, flex: "none" }}>
          <button onClick={back} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--kz-surface-2)", borderRadius: 10, color: "var(--kz-text-secondary)" }}>
            <Icon icon="chevron-left" size={17} />
          </button>
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.3px", flex: 1, minWidth: 0 }}>{showingThread ? state.chatWith.handle : "Messages"}</span>

          {showingThread && canHire && !sellerHasReplied && (
            <span style={{ flex: "none", maxWidth: 140, fontSize: 10.5, color: "var(--kz-text-faint)", lineHeight: 1.35, textAlign: "right" }}>
              Hire Now unlocks once {state.chatWith.handle} replies
            </span>
          )}

          {showingThread && sellerHasReplied && hireGigId && (
            <button
              onClick={() => hireNow(hireGigId)}
              style={{ flex: "none", display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", background: accent, borderRadius: 11, fontSize: 12.5, fontWeight: 700, color: "#fff", boxShadow: "0 6px 16px rgba(5,150,105,0.24)" }}
            >
              <Icon icon="zap" size={14} />
              Hire Now
            </button>
          )}

          {showingThread && sellerHasReplied && !hireGigId && sellerGigs.length > 1 && (
            <div style={{ position: "relative", flex: "none" }}>
              <button
                onClick={() => setHirePickerOpen((o) => !o)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", background: accent, borderRadius: 11, fontSize: 12.5, fontWeight: 700, color: "#fff", boxShadow: "0 6px 16px rgba(5,150,105,0.24)" }}
              >
                <Icon icon="zap" size={14} />
                Hire Now
              </button>
              {hirePickerOpen && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 240, background: "var(--kz-bg)", borderRadius: 14, boxShadow: "0 16px 40px var(--kz-shadow)", padding: 6, display: "flex", flexDirection: "column", gap: 2, zIndex: 1 }}>
                  <div style={{ padding: "8px 10px 4px", fontSize: 10, letterSpacing: "0.06em", color: "var(--kz-text-faint)", textTransform: "uppercase" }}>Which service?</div>
                  {sellerGigs.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => hireNow(g.id)}
                      style={{ display: "flex", flexDirection: "column", gap: 2, padding: "9px 10px", width: "100%", textAlign: "left", borderRadius: 9 }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--kz-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.title}</span>
                      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "var(--kz-text-muted)" }}>UGX {g.price}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {!showingThread && (
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4, paddingBottom: 24 }}>
            {conversations.length === 0 && (
              <div style={{ margin: "20px 6px", padding: "20px 16px", background: "var(--kz-surface)", borderRadius: 14, textAlign: "center", fontSize: 12, color: "var(--kz-text-muted)", lineHeight: 1.5 }}>
                No conversations yet — message a creator from their profile to start one.
              </div>
            )}
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => chat(c.id, c.handle)}
                style={{ display: "flex", alignItems: "center", gap: 13, padding: 12, width: "100%", textAlign: "left", borderRadius: 12 }}
              >
                <div style={{ position: "relative", overflow: "hidden", width: 44, height: 44, flex: "none", borderRadius: "50%", background: "repeating-linear-gradient(135deg,#d1fae5 0 6px,#a7f3d0 6px 12px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#047857" }}>
                  {initialsOf(c.handle)}
                  {c.photoUrl && <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${c.photoUrl})`, backgroundSize: "cover", backgroundPosition: "center" }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--kz-text)" }}>{c.handle}</span>
                  <span style={{ fontSize: 12, color: "var(--kz-text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.mine ? "You: " : ""}
                    {c.lastMessage}
                  </span>
                </div>
                <span style={{ flex: "none", fontSize: 10.5, color: "var(--kz-text-faint)" }}>{c.lastAt}</span>
              </button>
            ))}
          </div>
        )}

        {showingThread && (
          <>
            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingBottom: 16 }}>
              {threadBusy && thread.length === 0 && <div style={{ padding: 20, textAlign: "center", fontSize: 12, color: "var(--kz-text-faint)" }}>Loading…</div>}
              {!threadBusy && thread.length === 0 && (
                <div style={{ margin: "20px 6px", padding: "20px 16px", background: "var(--kz-surface)", borderRadius: 14, textAlign: "center", fontSize: 12, color: "var(--kz-text-muted)", lineHeight: 1.5 }}>
                  Say hello to {state.chatWith.handle} — messages are visible to both of you.
                </div>
              )}
              {thread.map((m) => {
                const mine = m.senderId === me.id;
                return (
                  <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: "78%", alignItems: mine ? "flex-end" : "flex-start" }}>
                      <div
                        style={{
                          padding: "10px 13px",
                          borderRadius: mine ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                          background: mine ? accent : "var(--kz-surface)",
                          color: mine ? "#fff" : "var(--kz-text)",
                          fontSize: 13,
                          lineHeight: 1.4,
                          textWrap: "pretty",
                        }}
                      >
                        {m.body}
                      </div>
                      <span style={{ fontSize: 9.5, color: "var(--kz-text-faint)", padding: "0 3px" }}>{fmtClock(m.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div style={{ flex: "none", padding: "0 0 22px", display: "flex", gap: 10 }}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={`Message ${state.chatWith.handle}`}
                style={{ flex: 1, boxSizing: "border-box", padding: "0 15px", height: 46, fontSize: 13, color: "var(--kz-text)", background: "var(--kz-surface-2)", border: "none", borderRadius: 12, outline: "none" }}
              />
              <button
                onClick={send}
                disabled={!draft.trim()}
                style={{ flex: "none", width: 46, height: 46, display: "flex", alignItems: "center", justifyContent: "center", background: draft.trim() ? accent : "var(--kz-border)", borderRadius: 12, color: draft.trim() ? "#fff" : "var(--kz-text-faint)" }}
              >
                <Icon icon="send" size={17} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
