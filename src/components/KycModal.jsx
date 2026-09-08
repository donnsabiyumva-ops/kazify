import { useState } from "react";
import Icon from "./Icon.jsx";
import { useKazify } from "../store/KazifyContext.jsx";
import { idTypeDefs, idDocDefs } from "../data/seed.js";

export default function KycModal() {
  const { state, setState, submitKycNow, accent } = useKazify();
  const [idType, setIdType] = useState(null);
  const [idNumber, setIdNumber] = useState("");
  const [docFront, setDocFront] = useState(false);
  const [docBack, setDocBack] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!state.kycOpen) return null;

  const close = () => setState((prev) => ({ ...prev, kycOpen: false }));
  const valid = !!idType && idNumber.trim().length >= 6 && docFront && docBack;

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    await submitKycNow({ idType, idNumber });
    setBusy(false);
  };

  return (
    <div
      onClick={close}
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 88, animation: "kz-fade .18s ease-out" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 420, maxHeight: "88vh", overflowY: "auto", background: "#ffffff", borderRadius: 18, boxShadow: "0 24px 60px rgba(15,23,42,0.28)", animation: "kz-rise .22s ease-out" }}
      >
        <div style={{ padding: "20px 22px 4px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: "0.12em", color: "#059669", textTransform: "uppercase" }}>Verify to withdraw</div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.3px" }}>Verify your ID</div>
          </div>
          <button onClick={close} style={{ flex: "none", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", borderRadius: 8, color: "#64748b" }}>
            <Icon icon="x" size={15} />
          </button>
        </div>

        <div style={{ padding: "10px 22px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
          <span style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.5 }}>
            A one-time ID check so clients can trust escrow releases. Your payout unlocks once it clears — usually within minutes.
          </span>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {idTypeDefs.map((t) => {
              const active = idType === t;
              return (
                <button
                  key={t}
                  onClick={() => setIdType(t)}
                  style={{ padding: "9px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, background: active ? "#ecfdf5" : "#f1f5f9", color: active ? "#047857" : "#475569", boxShadow: active ? "inset 0 0 0 1.5px " + accent : "none" }}
                >
                  {t}
                </button>
              );
            })}
          </div>

          <input
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value.toUpperCase())}
            placeholder="ID number (e.g. CM90210…)"
            style={{ width: "100%", boxSizing: "border-box", padding: "0 14px", height: 48, fontFamily: "'IBM Plex Mono',monospace", fontSize: 13.5, letterSpacing: "0.06em", color: "#0f172a", background: "#f1f5f9", border: "none", borderRadius: 12, outline: "none" }}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {idDocDefs.map((d) => {
              const done = d.key === "docFront" ? docFront : docBack;
              const toggle = d.key === "docFront" ? () => setDocFront((v) => !v) : () => setDocBack((v) => !v);
              return (
                <button
                  key={d.key}
                  onClick={toggle}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "18px 12px", borderRadius: 14, background: done ? "#ecfdf5" : "#f8fafc", boxShadow: done ? "inset 0 0 0 1.5px " + accent : "none" }}
                >
                  <span style={{ width: 38, height: 38, borderRadius: 12, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", color: done ? accent : "#64748b" }}>
                    <Icon icon={done ? "check" : d.icon} size={20} />
                  </span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a" }}>{d.label}</span>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: "#94a3b8" }}>{done ? "attached" : "tap to attach"}</span>
                </button>
              );
            })}
          </div>

          <span style={{ display: "flex", gap: 8, fontSize: 11, lineHeight: 1.5, color: "#94a3b8" }}>
            <Icon icon="shield-check" size={15} style={{ flex: "none" }} />
            Your ID is never shown to clients — only the verified badge is.
          </span>

          <button
            onClick={submit}
            disabled={!valid || busy}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              height: 50,
              borderRadius: 13,
              fontSize: 14,
              fontWeight: 700,
              background: valid ? accent : "#e2e8f0",
              color: valid ? "#fff" : "#94a3b8",
              boxShadow: valid ? "0 8px 20px rgba(5,150,105,0.24)" : "none",
              opacity: busy ? 0.7 : 1,
              cursor: busy ? "wait" : "pointer",
            }}
          >
            {busy ? "Submitting…" : "Submit for verification"}
          </button>
        </div>
      </div>
    </div>
  );
}
