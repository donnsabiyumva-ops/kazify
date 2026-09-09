import Icon from "../Icon.jsx";
import { useKazify } from "../../store/KazifyContext.jsx";
import { fmt } from "../../lib/format.js";

export default function SellerEarnings() {
  const { me, payouts, availableBalance, escrowHeldSeller, withdraw, refreshKyc, accent } = useKazify();
  const kycNone = me.kyc_status === "none";
  const kycReview = me.kyc_status === "review";
  const verified = me.kyc_status === "verified";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: "0.12em", color: "var(--kz-text-faint)", textTransform: "uppercase" }}>Available to withdraw</span>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 34, letterSpacing: "-1px", color: "var(--kz-text)" }}>UGX {fmt(availableBalance)}</span>
          <span style={{ fontSize: 11.5, color: "var(--kz-text-muted)" }}>
            UGX {fmt(escrowHeldSeller.total)} still held in escrow across {escrowHeldSeller.count} accepted gigs
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9, alignItems: "flex-end" }}>
          <button
            onClick={withdraw}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "13px 20px",
              background: verified ? accent : "var(--kz-surface-2)",
              borderRadius: 13,
              fontSize: 13,
              fontWeight: 700,
              color: verified ? "#fff" : "var(--kz-text-faint)",
              boxShadow: verified ? "0 6px 16px rgba(5,150,105,0.24)" : "none",
            }}
          >
            <Icon icon={verified ? "arrow-down-to-line" : "lock"} size={16} />
            Withdraw to MoMo
          </button>
          {kycNone && <span style={{ fontSize: 11, color: "var(--kz-text-faint)", maxWidth: 200, textAlign: "right" }}>Tap to verify your ID — takes a minute</span>}
          {kycReview && (
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#92400e" }}>
              Payout unlocks when your ID check clears
              <button onClick={refreshKyc} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "var(--kz-accent-text)" }}>
                <Icon icon="refresh-cw" size={13} />
                Check status
              </button>
            </span>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: "0.12em", color: "var(--kz-text-faint)", textTransform: "uppercase" }}>Recent payouts</span>
        {payouts.length === 0 && <div style={{ padding: "13px 4px", fontSize: 12, color: "var(--kz-text-faint)" }}>No payouts yet.</div>}
        {payouts.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 4px" }}>
            <span style={{ width: 34, height: 34, flex: "none", borderRadius: 10, background: "var(--kz-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kz-text-muted)" }}>
              <Icon icon={p.icon} size={16} />
            </span>
            <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--kz-text)" }}>{p.label}</span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: "var(--kz-text-faint)" }}>
                {p.date} · {p.channel}
              </span>
            </span>
            <span style={{ flex: "none", fontFamily: "'IBM Plex Mono',monospace", fontSize: 12.5, color: p.amount.charAt(0) === "+" ? "var(--kz-accent-text)" : "var(--kz-text-secondary)" }}>{p.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
