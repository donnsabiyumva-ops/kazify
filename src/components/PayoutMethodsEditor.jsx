import { useState } from "react";
import Icon from "./Icon.jsx";
import { useKazify } from "../store/KazifyContext.jsx";

const PROVIDERS = [
  { key: "mtn", short: "MTN", label: "MTN Mobile Money" },
  { key: "airtel", short: "AIR", label: "Airtel Money" },
];

// Real MoMo numbers for both checkout (paying in) and payouts (paying
// out) — without this, the MTN sandbox endpoints have no MSISDN to call.
export default function PayoutMethodsEditor() {
  const { payoutMethods, savePayoutMethod } = useKazify();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {PROVIDERS.map((p) => (
        <ProviderRow key={p.key} provider={p} existing={payoutMethods.find((m) => m.provider === p.key)} onSave={savePayoutMethod} />
      ))}
    </div>
  );
}

function ProviderRow({ provider, existing, onSave }) {
  const [msisdn, setMsisdn] = useState(existing?.msisdn || "");
  const [busy, setBusy] = useState(false);
  const dirty = msisdn.trim() && msisdn.trim() !== (existing?.msisdn || "");

  const save = async () => {
    if (!dirty || busy) return;
    setBusy(true);
    await onSave({ provider: provider.key, label: provider.label, msisdn: msisdn.trim(), isDefault: provider.key === "mtn" });
    setBusy(false);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 10, background: "var(--kz-surface)", borderRadius: 10 }}>
      <span
        style={{
          width: 34,
          height: 24,
          flex: "none",
          borderRadius: 6,
          background: "var(--kz-surface-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'IBM Plex Mono',monospace",
          fontSize: 9,
          fontWeight: 600,
          color: "var(--kz-text-secondary)",
        }}
      >
        {provider.short}
      </span>
      <input
        value={msisdn}
        onChange={(e) => setMsisdn(e.target.value)}
        placeholder="256770000000"
        style={{ flex: 1, minWidth: 0, boxSizing: "border-box", padding: "8px 10px", fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: "var(--kz-text)", background: "var(--kz-surface-2)", border: "none", borderRadius: 8, outline: "none" }}
      />
      <button
        onClick={save}
        disabled={!dirty || busy}
        style={{
          flex: "none",
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: dirty ? "var(--kz-accent-soft)" : "var(--kz-surface-2)",
          borderRadius: 8,
          color: dirty ? "var(--kz-accent-text)" : "var(--kz-text-faint)",
        }}
      >
        <Icon icon="check" size={14} />
      </button>
    </div>
  );
}
