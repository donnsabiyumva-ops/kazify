import { useMemo, useState } from "react";
import Icon from "../Icon.jsx";
import ReelPlayer from "../ReelPlayer.jsx";
import { useKazify } from "../../store/KazifyContext.jsx";
import { reelActionsSeed } from "../../data/seed.js";

export default function SellerReels() {
  const { reels, say, upload, accent } = useKazify();
  const [openReel, setOpenReel] = useState(null);

  const myReels = useMemo(
    () =>
      reels.map((r, i) => ({
        ...r,
        gradient: `repeating-linear-gradient(${104 + i * 11}deg,#0f172a 0 12px,#151f36 12px 24px)`,
        poster: r.mediaType === "slideshow" ? r.slideUrls?.[0] : null,
        pillBg: r.state === "Draft" ? "rgba(15,23,42,0.6)" : "rgba(5,150,105,0.85)",
      })),
    [reels]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <button
        onClick={upload}
        style={{ display: "flex", alignItems: "center", gap: 14, padding: 18, background: "var(--kz-surface)", borderRadius: 16, width: "100%", textAlign: "left" }}
      >
        <span style={{ width: 46, height: 46, flex: "none", borderRadius: 14, background: accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
          <Icon icon="plus" size={22} />
        </span>
        <span style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--kz-text)" }}>Upload a new service</span>
          <span style={{ fontSize: 11.5, color: "var(--kz-text-muted)" }}>Drop a 9:16 clip up to 90s · add a caption, gig price and delivery window</span>
        </span>
        <span style={{ display: "flex", color: "var(--kz-text-faint)" }}>
          <Icon icon="chevron-right" size={18} />
        </span>
      </button>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {reelActionsSeed.map((a) => (
          <button
            key={a.label}
            onClick={() => say(a.msg)}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", background: "var(--kz-surface-2)", borderRadius: 10, fontSize: 12, fontWeight: 700, color: "var(--kz-text-secondary)" }}
          >
            <Icon icon={a.icon} size={15} />
            {a.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(148px,1fr))", gap: 12 }}>
        {myReels.map((r) => (
          <div key={r.id} onClick={() => setOpenReel(r)} style={{ position: "relative", aspectRatio: "9 / 16", borderRadius: 14, overflow: "hidden", cursor: "pointer", background: r.gradient }}>
            {r.mediaType === "video" && r.videoUrl && (
              <video src={r.videoUrl} muted loop autoPlay playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            )}
            {r.poster && <img src={r.poster} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
            <div
              style={{
                position: "absolute",
                left: 10,
                top: 10,
                padding: "4px 8px",
                borderRadius: 6,
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 9,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#fff",
                background: r.pillBg,
              }}
            >
              {r.state}
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "36px 11px 11px", background: "linear-gradient(180deg,rgba(8,13,25,0) 0%,rgba(8,13,25,0.88) 100%)", display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: "#ffffff", lineHeight: 1.3 }}>{r.title}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.82)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Icon icon="play" size={11} />
                  {r.views}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Icon icon="bookmark" size={11} />
                  {r.saves}
                </span>
              </span>
            </div>
          </div>
        ))}
        <button
          onClick={upload}
          style={{ aspectRatio: "9 / 16", borderRadius: 14, background: "var(--kz-surface-2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--kz-text-muted)" }}
        >
          <Icon icon="video" size={22} />
          <span style={{ fontSize: 11.5, fontWeight: 700 }}>New service</span>
        </button>
      </div>
      <ReelPlayer reel={openReel} onClose={() => setOpenReel(null)} />
    </div>
  );
}
