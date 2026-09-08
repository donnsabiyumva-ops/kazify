import Icon from "./Icon.jsx";
import { useKazify } from "../store/KazifyContext.jsx";
import { fmt } from "../lib/format.js";

export default function Binder() {
  const { setState, binder, chat, accent } = useKazify();
  const total = binder.reduce((a, g) => a + g.amount, 0);

  return (
    <aside style={{ width: "26%", minWidth: 272, maxWidth: 340, background: "#ffffff", display: "flex", flexDirection: "column", flex: "none" }}>
      <div style={{ padding: "22px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 14.5, fontWeight: 800, letterSpacing: "-0.3px" }}>Shortlist Binder</div>
        <div style={{ minWidth: 24, height: 24, padding: "0 8px", borderRadius: 8, background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#047857" }}>
          {binder.length}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 14px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
        {binder.length === 0 && (
          <div style={{ margin: "20px 6px", padding: "20px 16px", background: "#f8fafc", borderRadius: 14, textAlign: "center", fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>
            Shortlist a service and the creator lands here, ready to hire.
          </div>
        )}
        {binder.map((b) => (
          <div key={b.id} style={{ display: "flex", gap: 11, padding: 11, background: "#fff", borderRadius: 12, animation: "kz-rise .26s ease-out" }}>
            <div style={{ width: 42, height: 62, borderRadius: 9, flex: "none", overflow: "hidden", background: "repeating-linear-gradient(115deg,#0f172a 0 7px,#1e293b 7px 14px)" }}>
              {b.videoUrl && <video src={b.videoUrl} muted loop autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <button
                  onClick={() => setState({ profileId: b.id })}
                  title="View profile"
                  style={{ padding: 0, fontSize: 12.5, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textAlign: "left", minWidth: 0 }}
                >
                  {b.handle}
                </button>
                <span style={{ flex: "none", display: "flex", alignItems: "center", gap: 4, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "#64748b" }}>
                  <Icon icon="material-symbols:star-rounded" size={14} style={{ color: "#f59e0b" }} />
                  {b.rating}
                </span>
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#0f172a" }}>UGX {b.price}</div>
              {b.isDemo ? (
                <span style={{ alignSelf: "flex-start", marginTop: 4, padding: "4px 9px", background: "#f1f5f9", borderRadius: 999, fontSize: 10.5, fontWeight: 700, color: "#64748b" }}>Featured</span>
              ) : (
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  <button
                    onClick={() => chat(b.handle)}
                    title="Message creator"
                    style={{ flex: "none", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", border: "none", borderRadius: 8, color: "#475569" }}
                  >
                    <Icon icon="message-circle" size={15} />
                  </button>
                  <button
                    onClick={() => setState({ checkoutId: b.id, funded: false })}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, height: 30, background: accent, border: 0, borderRadius: 8, fontSize: 11.5, fontWeight: 700, color: "#ffffff" }}
                  >
                    <Icon icon="zap" size={13} />
                    Hire Now
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "14px 20px 18px", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "#64748b" }}>Binder total</span>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, color: "#0f172a" }}>UGX {fmt(total)}</span>
      </div>
    </aside>
  );
}
