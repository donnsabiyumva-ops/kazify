import Icon from "./Icon.jsx";
import PayoutMethodPicker from "./PayoutMethodPicker.jsx";
import { useKazify } from "../store/KazifyContext.jsx";
import { fmt } from "../lib/format.js";

export default function CheckoutModal() {
  const { state, setState, gigs, fund, accent } = useKazify();
  const co = state.checkoutId ? gigs.find((g) => g.id === state.checkoutId) : null;
  if (!co) return null;

  const fee = Math.round(co.amount * 0.05);
  const total = Math.round(co.amount * 1.05);
  const close = () => setState({ checkoutId: null, funded: false });

  return (
    <div
      onClick={close}
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 80, animation: "kz-fade .18s ease-out" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 412, background: "#ffffff", borderRadius: 18, boxShadow: "0 24px 60px rgba(15,23,42,0.28)", overflow: "hidden", animation: "kz-rise .22s ease-out" }}
      >
        <div style={{ padding: "20px 22px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: "0.12em", color: "#059669", textTransform: "uppercase" }}>Escrow checkout</div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.3px" }}>Hire {co.handle}</div>
          </div>
          <button onClick={close} style={{ flex: "none", width: 30, height: 30, border: "none", background: "#f1f5f9", borderRadius: 8, color: "#64748b" }}>
            <Icon icon="x" size={15} />
          </button>
        </div>

        <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.4, color: "#334155", textWrap: "pretty" }}>{co.title}</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: "0.12em", color: "#94a3b8", textTransform: "uppercase" }}>Mobile money source</div>
            <PayoutMethodPicker selected={state.method} onSelect={(key) => setState({ method: key })} accent={accent} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#64748b" }}>
              <span>Gig amount</span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", color: "#0f172a" }}>UGX {co.price}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#64748b" }}>
              <span>Escrow fee (5%)</span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", color: "#0f172a" }}>UGX {fmt(fee)}</span>
            </div>
            <div style={{ height: 1, background: "#f1f5f9", margin: "3px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 12.5, fontWeight: 700 }}>Total to fund</span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 15, color: "#059669" }}>UGX {fmt(total)}</span>
            </div>
          </div>
        </div>

        <div style={{ padding: "0 22px 22px", display: "flex", flexDirection: "column", gap: 9 }}>
          <button
            onClick={fund}
            disabled={state.funded}
            style={{ width: "100%", padding: 13, background: accent, border: 0, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 13.5, fontWeight: 700, color: "#ffffff", boxShadow: "0 6px 16px rgba(5,150,105,0.26)", opacity: state.funded ? 0.7 : 1, cursor: state.funded ? "default" : "pointer" }}
          >
            <Icon icon={state.funded ? "check" : "zap"} size={15} />
            {state.funded ? "Escrow funded" : "Fund escrow & hire"}
          </button>
          <div style={{ textAlign: "center", fontSize: 10, color: "#94a3b8" }}>Released on your approval · 7-day dispute window</div>
        </div>
      </div>
    </div>
  );
}
