import { useEffect, useState } from "react";
import Icon from "./Icon.jsx";
import ReelPlayer from "./ReelPlayer.jsx";
import { useKazify } from "../store/KazifyContext.jsx";
import * as api from "../lib/api.js";

function seedFromId(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 8;
}

export default function CreatorProfileOverlay() {
  const { state, setState, gigs, accent, chat } = useKazify();
  const pg = state.profileId ? gigs.find((g) => g.id === state.profileId) : null;
  const [reels, setReels] = useState([]);
  const [openReel, setOpenReel] = useState(null);

  useEffect(() => {
    if (!pg) return;
    let cancelled = false;
    api.getReelsForSeller(pg.sellerId).then((rows) => {
      if (!cancelled) setReels(rows);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pg?.sellerId]);

  if (!pg) return null;

  const seed = seedFromId(pg.id);
  const profile = {
    handle: pg.handle,
    rating: pg.rating,
    initials: pg.handle.replace("@", "").slice(0, 2).toUpperCase(),
    bio: pg.category + " specialist · " + pg.delivery + "-day max delivery · Kampala time zone. Fixed-price gigs, escrow protected.",
    orders: 40 + seed * 17,
    onTime: (96 + (seed % 4)) + "%",
  };

  const catalogue = reels.map((r, i) => ({
    id: r.id,
    mediaType: r.mediaType,
    videoUrl: r.mediaType === "video" ? r.videoUrl : null,
    slideUrls: r.slideUrls,
    poster: r.mediaType === "slideshow" ? r.slideUrls?.[0] : null,
    views: r.views,
    title: r.title,
    gradient: `repeating-linear-gradient(${100 + i * 9}deg,#0f172a 0 12px,#151f36 12px 24px)`,
  }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--kz-bg)", zIndex: 70, overflowY: "auto", animation: "kz-fade .18s ease-out" }}>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "26px 32px 48px", display: "flex", flexDirection: "column", gap: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setState({ profileId: null })}
            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--kz-surface-2)", borderRadius: 10, color: "var(--kz-text-secondary)" }}
          >
            <Icon icon="chevron-left" size={17} />
          </button>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: "0.12em", color: "var(--kz-text-faint)", textTransform: "uppercase" }}>Creator profile</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ width: 88, height: 88, borderRadius: "50%", flex: "none", background: "repeating-linear-gradient(135deg,#d1fae5 0 6px,#a7f3d0 6px 12px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#047857" }}>
            {profile.initials}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
              <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.6px" }}>{profile.handle}</span>
              <span style={{ padding: "4px 9px", background: "var(--kz-accent-soft)", borderRadius: 999, fontSize: 11, fontWeight: 700, color: "var(--kz-accent-text)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Icon icon="material-symbols:star-rounded" size={15} style={{ color: "#f59e0b" }} />
                {profile.rating} trusted
              </span>
              {pg.isDemo && (
                <span style={{ padding: "4px 9px", background: "var(--kz-surface-2)", borderRadius: 999, fontSize: 11, fontWeight: 700, color: "var(--kz-text-muted)" }}>Featured</span>
              )}
            </div>
            <div style={{ fontSize: 13, color: "var(--kz-text-muted)", lineHeight: 1.5, maxWidth: 520, textWrap: "pretty" }}>{profile.bio}</div>
            <div style={{ display: "flex", gap: 26, marginTop: 4, flexWrap: "wrap" }}>
              {[
                [catalogue.length, "SERVICES"],
                [profile.orders, "ORDERS DONE"],
                [profile.onTime, "ON TIME"],
              ].map(([value, label]) => (
                <span key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 15, color: "var(--kz-text)" }}>{value}</span>
                  <span style={{ fontSize: 10, letterSpacing: "0.06em", color: "var(--kz-text-faint)" }}>{label}</span>
                </span>
              ))}
            </div>
          </div>
          {!pg.isDemo && (
            <div style={{ display: "flex", gap: 10, flex: "none" }}>
              <button
                onClick={() => chat(pg.handle)}
                style={{ padding: "12px 20px", background: "var(--kz-surface-2)", borderRadius: 12, fontSize: 13, fontWeight: 700, color: "var(--kz-text-secondary)", display: "flex", alignItems: "center", gap: 7 }}
              >
                <Icon icon="message-circle" size={15} />
                Chat
              </button>
              <button
                onClick={() => setState({ checkoutId: pg.id, profileId: null, funded: false })}
                style={{ padding: "12px 22px", background: accent, borderRadius: 12, display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, color: "#fff", boxShadow: "0 6px 16px rgba(5,150,105,0.24)" }}
              >
                <Icon icon="zap" size={15} />
                Hire Now
              </button>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: "0.12em", color: "var(--kz-text-faint)", textTransform: "uppercase" }}>Catalogue · {catalogue.length} services</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12 }}>
            {catalogue.map((r) => (
              <div key={r.id} onClick={() => setOpenReel(r)} style={{ position: "relative", aspectRatio: "9 / 16", borderRadius: 14, overflow: "hidden", cursor: "pointer", background: r.gradient }}>
                {r.videoUrl && <video src={r.videoUrl} muted loop autoPlay playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
                {r.poster && <img src={r.poster} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "34px 11px 11px", background: "linear-gradient(180deg,rgba(8,13,25,0) 0%,rgba(8,13,25,0.85) 100%)", display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: "#ffffff", lineHeight: 1.3 }}>{r.title}</span>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 5 }}>
                    <Icon icon="play" size={11} />
                    {r.views}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ReelPlayer reel={openReel} onClose={() => setOpenReel(null)} />
    </div>
  );
}
