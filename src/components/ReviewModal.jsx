import { useState } from "react";
import Icon from "./Icon.jsx";
import { useKazify } from "../store/KazifyContext.jsx";

export default function ReviewModal() {
  const { state, closeReviewPrompt, submitReview, accent } = useKazify();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const prompt = state.reviewPrompt;
  if (!prompt) return null;

  const close = () => {
    setRating(0);
    setHoverRating(0);
    setComment("");
    closeReviewPrompt();
  };

  const submit = async () => {
    if (!rating || busy) return;
    setBusy(true);
    await submitReview({ orderId: prompt.orderId, sellerId: prompt.sellerId, rating, comment });
    setBusy(false);
    setRating(0);
    setComment("");
  };

  const shown = hoverRating || rating;

  return (
    <div
      onClick={close}
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 88, animation: "kz-fade .18s ease-out" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 400, background: "var(--kz-bg)", borderRadius: 18, boxShadow: "0 24px 60px var(--kz-shadow)", animation: "kz-rise .22s ease-out" }}
      >
        <div style={{ padding: "22px 22px 4px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: "0.12em", color: "#059669", textTransform: "uppercase" }}>Order approved</div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.3px" }}>How was {prompt.gigTitle || "the delivery"}?</div>
          </div>
          <button onClick={close} style={{ flex: "none", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--kz-surface-2)", borderRadius: 8, color: "var(--kz-text-muted)" }}>
            <Icon icon="x" size={15} />
          </button>
        </div>

        <div style={{ padding: "12px 22px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
          <span style={{ fontSize: 12.5, color: "var(--kz-text-muted)", lineHeight: 1.5 }}>Your rating is public and factors into the seller's overall rating.</span>

          <div style={{ display: "flex", gap: 6, justifyContent: "center", padding: "6px 0" }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                style={{ padding: 4, color: n <= shown ? "#f59e0b" : "var(--kz-border-2)" }}
              >
                <Icon icon="material-symbols:star-rounded" size={34} />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment (optional)"
            rows={3}
            style={{ width: "100%", boxSizing: "border-box", padding: 14, fontFamily: "inherit", fontSize: 13, color: "var(--kz-text)", background: "var(--kz-surface-2)", border: "none", borderRadius: 12, outline: "none", resize: "none" }}
          />

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={close} style={{ flex: "none", padding: "0 18px", height: 48, background: "var(--kz-surface-2)", borderRadius: 12, fontSize: 13, fontWeight: 700, color: "var(--kz-text-secondary)" }}>
              Skip
            </button>
            <button
              onClick={submit}
              disabled={!rating || busy}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                height: 48,
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                background: rating ? accent : "var(--kz-border)",
                color: rating ? "#fff" : "var(--kz-text-faint)",
                boxShadow: rating ? "0 8px 20px rgba(5,150,105,0.24)" : "none",
                opacity: busy ? 0.7 : 1,
                cursor: busy ? "wait" : "pointer",
              }}
            >
              {busy ? "Submitting…" : "Submit review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
