import Icon from "./Icon.jsx";
import { useKazify } from "../store/KazifyContext.jsx";

export default function PayoutMethodPicker({ methods, selected, onSelect, accent }) {
  const { openSettings } = useKazify();

  if (!methods || methods.length === 0) {
    return (
      <button
        onClick={openSettings}
        style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", width: "100%", borderRadius: 12, background: "var(--kz-surface)", textAlign: "left" }}
      >
        <span style={{ width: 34, height: 24, borderRadius: 6, background: "var(--kz-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kz-text-muted)", flex: "none" }}>
          <Icon icon="plus" size={14} />
        </span>
        <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--kz-text)" }}>Add a MoMo number</span>
          <span style={{ fontSize: 10.5, color: "var(--kz-text-muted)" }}>Needed to pay with Mobile Money — opens Settings</span>
        </span>
      </button>
    );
  }

  return (
    <>
      {methods.map((m) => {
        const active = selected === m.key;
        return (
          <button
            key={m.key}
            onClick={() => onSelect(m.key)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "11px 12px",
              width: "100%",
              borderRadius: 12,
              border: "1.5px solid " + (active ? accent : "transparent"),
              background: active ? "var(--kz-accent-soft)" : "var(--kz-surface)",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <span
                style={{
                  width: 34,
                  height: 24,
                  borderRadius: 6,
                  background: "var(--kz-surface-2)",
                  color: "var(--kz-text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 9,
                  fontWeight: 600,
                  flex: "none",
                }}
              >
                {m.short}
              </span>
              <span style={{ display: "flex", flexDirection: "column", gap: 2, textAlign: "left" }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--kz-text)" }}>{m.name}</span>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "var(--kz-text-muted)" }}>{m.msisdn}</span>
              </span>
            </span>
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                flex: "none",
                border: "1.5px solid " + (active ? accent : "var(--kz-border-2)"),
                background: active ? accent : "var(--kz-bg)",
                boxShadow: active ? "inset 0 0 0 3px #fff" : "none",
              }}
            />
          </button>
        );
      })}
    </>
  );
}
