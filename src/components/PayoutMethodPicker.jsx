import { methodDefs } from "../data/seed.js";

export default function PayoutMethodPicker({ selected, onSelect, accent }) {
  return (
    <>
      {methodDefs.map((m) => {
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
