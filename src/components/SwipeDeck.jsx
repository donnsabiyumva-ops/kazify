import { useState } from "react";
import Icon from "./Icon.jsx";
import { useKazify } from "../store/KazifyContext.jsx";
import { STACK_DEPTH } from "../data/seed.js";

export default function SwipeDeck() {
  const { state, setState, visible, swipe, accent } = useKazify();
  const [muted, setMuted] = useState(true);

  const cards = visible
    .slice(0, STACK_DEPTH)
    .map((g, i) => {
      const dir = i === 0 ? state.exit : null;
      const sign = dir === "right" ? 1 : -1;
      const transform = dir
        ? `translateX(${sign * 130}%) translateY(-30px) rotate(${sign * 20}deg)`
        : `translateY(${i * -12}px) scale(${1 - i * 0.035}) rotate(${i === 0 ? 0 : i % 2 ? 1.4 : -1.4}deg)`;
      return { ...g, i, dir, transform };
    })
    .reverse();

  const deckEmpty = visible.length === 0;

  return (
    <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: "28px 24px", background: "var(--kz-bg)" }}>
      <div style={{ position: "relative", width: "100%", maxWidth: 352, height: "min(72vh,600px)", minHeight: 240 }}>
        {cards.map((c) => (
          <article
            key={c.id}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 20,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              background: "#0f172a",
              boxShadow: c.i === 0 ? "0 18px 44px rgba(15,23,42,0.2)" : "0 10px 24px rgba(15,23,42,0.09)",
              transform: c.transform,
              opacity: c.dir ? 0 : 1,
              zIndex: 20 - c.i,
              transition: "transform .38s cubic-bezier(.22,.85,.24,1), opacity .34s ease-in",
              pointerEvents: c.i === 0 ? "auto" : "none",
            }}
          >
            {c.videoUrl ? (
              <video
                src={c.videoUrl}
                muted={muted}
                loop
                autoPlay
                playsInline
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", background: "#0f172a" }}
              />
            ) : c.poster ? (
              <img src={c.poster} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(115deg,#0f172a 0 14px,#131d33 14px 28px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.45)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <Icon icon="play" size={15} />
                </div>
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>service clip 9:16</div>
              </div>
            )}

            <div style={{ position: "absolute", top: 14, left: 14, right: 14, display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 2 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: "0.12em", color: "#ffffff", background: "rgba(15,23,42,0.55)", padding: "5px 8px", borderRadius: 6, textTransform: "uppercase" }}>{c.category}</span>
                {c.isDemo && (
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: "0.12em", color: "#ffffff", background: "rgba(5,150,105,0.75)", padding: "5px 8px", borderRadius: 6, textTransform: "uppercase" }}>Featured</span>
                )}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {c.videoUrl && (
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "#ffffff", background: "rgba(15,23,42,0.55)", padding: "5px 8px", borderRadius: 6 }}>{c.duration}</span>
                )}
                {c.videoUrl && (
                  <button
                    onClick={() => setMuted((m) => !m)}
                    style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.55)", borderRadius: 6, color: "#ffffff" }}
                  >
                    <Icon icon={muted ? "volume-x" : "volume-2"} size={13} />
                  </button>
                )}
              </span>
            </div>

            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                padding: "56px 16px 16px",
                background: "linear-gradient(180deg,rgba(8,13,25,0) 0%,rgba(8,13,25,0.62) 42%,rgba(8,13,25,0.9) 100%)",
                backdropFilter: "blur(2px)",
                display: "flex",
                flexDirection: "column",
                gap: 9,
                zIndex: 2,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <button
                  onClick={() => setState({ profileId: c.id })}
                  title="View profile"
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: 0, fontSize: 13, fontWeight: 700, color: "#ffffff", minWidth: 0 }}
                >
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.handle}</span>
                  <span style={{ display: "flex", opacity: 0.7 }}>
                    <Icon icon="chevron-right" size={13} />
                  </span>
                </button>
                <span style={{ flex: "none", display: "flex", alignItems: "center", gap: 4, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#ffffff" }}>
                  <Icon icon="material-symbols:star-rounded" size={15} style={{ color: "#fbbf24" }} />
                  {c.rating}
                </span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.35, letterSpacing: "-0.2px", color: "#ffffff", textWrap: "pretty" }}>{c.title}</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                <span style={{ padding: "5px 9px", background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.28)", borderRadius: 8, fontSize: 11, fontWeight: 600, color: "#ffffff" }}>UGX {c.price}</span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "5px 9px",
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#fff",
                    background: "rgba(5,150,105,0.28)",
                    border: "1.5px solid " + accent,
                  }}
                >
                  <Icon icon="clock" size={12} />
                  <span>{c.delivery}-day max</span>
                </span>
              </div>
            </div>

            <div
              style={{
                position: "absolute",
                top: 22,
                left: c.dir === "right" ? 20 : "auto",
                right: c.dir === "left" ? 20 : "auto",
                padding: "7px 13px",
                borderRadius: 10,
                fontSize: 12.5,
                fontWeight: 800,
                letterSpacing: "0.08em",
                color: "#fff",
                background: c.dir === "right" ? accent : "#ef4444",
                transform: `rotate(${c.dir === "right" ? -10 : 10}deg)`,
                opacity: c.dir && c.i === 0 ? 1 : 0,
                transition: "opacity .12s",
              }}
            >
              {c.dir === "right" ? "SHORTLISTED" : "PASSED"}
            </div>
          </article>
        ))}

        {deckEmpty && (
          <div style={{ position: "absolute", inset: 0, borderRadius: 20, background: "var(--kz-surface)", animation: "kz-fade 1.4s ease-in-out infinite alternate" }} />
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button
          onClick={() => swipe("left")}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 26px", background: "var(--kz-surface-2)", border: "none", borderRadius: 14, fontSize: 13.5, fontWeight: 700, color: "var(--kz-text-secondary)" }}
        >
          <Icon icon="x" size={16} />
          Pass
        </button>
        <button
          onClick={() => swipe("right")}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 30px", background: accent, border: 0, borderRadius: 14, fontSize: 13.5, fontWeight: 700, color: "#ffffff", boxShadow: "0 6px 16px rgba(5,150,105,0.26)" }}
        >
          <Icon icon="check" size={16} />
          Shortlist
        </button>
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: "0.1em", color: "var(--kz-text-faint)", textTransform: "uppercase" }}>{visible.length} services left</div>
    </main>
  );
}
