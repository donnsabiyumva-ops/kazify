import Icon from "./Icon.jsx";
import { useKazify } from "../store/KazifyContext.jsx";
import { windowDefs, prefDefs } from "../data/seed.js";

export default function SettingsModal() {
  const { state, me, editDraft, closeSettings, saveSettings, pickPhoto, removePhoto, togglePref, accent } = useKazify();
  const d = state.draft;
  if (!d) return null;

  const initials = d.name
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const saveStyle = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: 12,
    background: accent,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 700,
    color: "#fff",
    boxShadow: "0 6px 16px rgba(5,150,105,0.24)",
  };

  return (
    <div
      onClick={closeSettings}
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 85, animation: "kz-fade .18s ease-out" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 440, maxHeight: "88vh", overflowY: "auto", background: "#ffffff", borderRadius: 18, boxShadow: "0 24px 60px rgba(15,23,42,0.28)", animation: "kz-rise .22s ease-out" }}
      >
        <div style={{ padding: "20px 22px 14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: "0.12em", color: "#059669", textTransform: "uppercase" }}>Account settings</div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.3px" }}>Edit your profile</div>
          </div>
          <button onClick={closeSettings} style={{ flex: "none", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", borderRadius: 8, color: "#64748b" }}>
            <Icon icon="x" size={15} />
          </button>
        </div>

        <div style={{ padding: "6px 22px 4px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: 14, background: "#f8fafc", borderRadius: 14 }}>
            <div style={{ position: "relative", overflow: "hidden", width: 64, height: 64, flex: "none", borderRadius: "50%", background: "repeating-linear-gradient(135deg,#d1fae5 0 6px,#a7f3d0 6px 12px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, color: "#047857" }}>
              {initials}
              {d.photo_url && <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${d.photo_url})`, backgroundSize: "cover", backgroundPosition: "center" }} />}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a" }}>Profile picture</span>
              <span style={{ fontSize: 11, color: "#64748b", lineHeight: 1.45 }}>Square JPG or PNG, at least 400×400. Shown on your services and in chats.</span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 2 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", background: "#ffffff", borderRadius: 10, fontSize: 11.5, fontWeight: 700, color: "#0f172a", cursor: "pointer", boxShadow: "inset 0 0 0 1px #e2e8f0" }}>
                  <Icon icon="image-up" size={15} />
                  {d.photo_url ? "Replace photo" : "Upload photo"}
                  <input type="file" accept="image/*" onChange={(e) => pickPhoto(e.target.files && e.target.files[0])} style={{ display: "none" }} />
                </label>
                {d.photo_url && (
                  <button onClick={removePhoto} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", background: "#ffffff", borderRadius: 10, fontSize: 11.5, fontWeight: 700, color: "#b91c1c", boxShadow: "inset 0 0 0 1px #fecaca" }}>
                    <Icon icon="trash-2" size={15} />
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>Display name</span>
            <input value={d.name} onChange={(e) => editDraft("name", e.target.value)} style={fieldStyle} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>Handle</span>
            <input value={d.handle} onChange={(e) => editDraft("handle", e.target.value)} style={{ ...fieldStyle, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12.5 }} />
          </label>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label style={{ flex: 1, minWidth: 150, display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>City</span>
              <input value={d.city} onChange={(e) => editDraft("city", e.target.value)} style={fieldStyle} />
            </label>
            <label style={{ flex: 1, minWidth: 150, display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>Mobile money number</span>
              <input value={d.phone || ""} onChange={(e) => editDraft("phone", e.target.value)} placeholder="+256 77 000 0000" style={{ ...fieldStyle, fontFamily: "'IBM Plex Mono',monospace", fontSize: 12.5 }} />
            </label>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>Escrow release window</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {windowDefs.map((w) => {
                const active = d.window === w;
                return (
                  <button
                    key={w}
                    onClick={() => editDraft("window", w)}
                    style={{ padding: "9px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, background: active ? "#ecfdf5" : "#f1f5f9", color: active ? "#047857" : "#475569", boxShadow: active ? "inset 0 0 0 1.5px " + accent : "none" }}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 2 }}>
            {prefDefs.map((p) => {
              const field = p.key === "autoRelease" ? "auto_release_escrow" : "weekly_digest";
              const on = !!me[field];
              return (
                <button key={p.key} onClick={() => togglePref(p.key)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "11px 2px", width: "100%", textAlign: "left" }}>
                  <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a" }}>{p.label}</span>
                    <span style={{ fontSize: 11, color: "#64748b" }}>{p.hint}</span>
                  </span>
                  <span style={{ flex: "none", width: 40, height: 23, borderRadius: 999, padding: 2, display: "flex", justifyContent: on ? "flex-end" : "flex-start", background: on ? accent : "#e2e8f0" }}>
                    <span style={{ width: 19, height: 19, borderRadius: "50%", background: "#fff" }} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ padding: "16px 22px 22px", display: "flex", gap: 10 }}>
          <button onClick={closeSettings} style={{ flex: "none", padding: "12px 18px", background: "#f1f5f9", borderRadius: 12, fontSize: 13, fontWeight: 700, color: "#475569" }}>
            Cancel
          </button>
          <button onClick={saveSettings} style={saveStyle}>
            <Icon icon="check" size={15} />
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

const fieldStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  fontSize: 13,
  color: "#0f172a",
  background: "#f1f5f9",
  border: "none",
  borderRadius: 10,
  outline: "none",
};
