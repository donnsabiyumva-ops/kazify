import Icon from "./Icon.jsx";
import PayoutMethodPicker from "./PayoutMethodPicker.jsx";
import { useKazify } from "../store/KazifyContext.jsx";
import { fmt } from "../lib/format.js";

const BUTTON_COPY = {
  idle: { label: "Fund escrow & hire", icon: "zap" },
  submitting: { label: "Submitting to MTN…", icon: "zap" },
  pending: { label: "Confirming payment…", icon: "zap" },
  success: { label: "Escrow funded", icon: "check" },
  failed: { label: "Payment failed — retry", icon: "zap" },
};

export default function CheckoutModal() {
  const { state, setState, gigs, payoutMethods, fund, accent } = useKazify();
  const co = state.checkoutId ? gigs.find((g) => g.id === state.checkoutId) : null;
  if (!co) return null;

  const fee = Math.round(co.amount * 0.05);
  const total = Math.round(co.amount * 1.05);
  const close = () => setState({ checkoutId: null, fundStatus: "idle" });
  const busy = state.fundStatus === "submitting" || state.fundStatus === "pending";
  const done = state.fundStatus === "success";
  const copy = BUTTON_COPY[state.fundStatus] || BUTTON_COPY.idle;

  return (
    <div
      onClick={close}
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 80, animation: "kz-fade .18s ease-out" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 412, background: "var(--kz-bg)", borderRadius: 18, boxShadow: "0 24px 60px var(--kz-shadow)", overflow: "hidden", animation: "kz-rise .22s ease-out" }}
      >
        <div style={{ padding: "20px 22px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: "0.12em", color: "#059669", textTransform: "uppercase" }}>Escrow checkout</div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.3px" }}>Hire {co.handle}</div>
          </div>
          <button onClick={close} style={{ flex: "none", width: 30, height: 30, border: "none", background: "var(--kz-surface-2)", borderRadius: 8, color: "var(--kz-text-muted)" }}>
            <Icon icon="x" size={15} />
          </button>
        </div>

        <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.4, color: "var(--kz-text-secondary)", textWrap: "pretty" }}>{co.title}</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: "0.12em", color: "var(--kz-text-faint)", textTransform: "uppercase" }}>Mobile money source</div>
            <PayoutMethodPicker methods={payoutMethods} selected={state.method} onSelect={(key) => setState({ method: key })} accent={accent} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--kz-text-muted)" }}>
              <span>Gig amount</span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", color: "var(--kz-text)" }}>UGX {co.price}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--kz-text-muted)" }}>
              <span>Escrow fee (5%)</span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", color: "var(--kz-text)" }}>UGX {fmt(fee)}</span>
            </div>
            <div style={{ height: 1, background: "var(--kz-border)", margin: "3px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 12.5, fontWeight: 700 }}>Total to fund</span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 15, color: "#059669" }}>UGX {fmt(total)}</span>
            </div>
          </div>
        </div>

        <div style={{ padding: "0 22px 22px", display: "flex", flexDirection: "column", gap: 9 }}>
          <button
            onClick={fund}
            disabled={busy || done}
            style={{
              width: "100%",
              padding: 13,
              background: accent,
              border: 0,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              fontSize: 13.5,
              fontWeight: 700,
              color: "#ffffff",
              boxShadow: "0 6px 16px rgba(5,150,105,0.26)",
              opacity: busy || done ? 0.7 : 1,
              cursor: busy || done ? "default" : "pointer",
            }}
          >
            <Icon icon={copy.icon} size={15} />
            {copy.label}
          </button>
          <div style={{ textAlign: "center", fontSize: 10, color: "var(--kz-text-faint)" }}>Released on your approval · 7-day dispute window</div>
        </div>
      </div>
    </div>
  );
}
