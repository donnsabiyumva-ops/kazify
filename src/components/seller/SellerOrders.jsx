import Icon from "../Icon.jsx";
import { useKazify } from "../../store/KazifyContext.jsx";
import { fmt } from "../../lib/format.js";

const pillStyle = {
  new: { background: "#fef3c7", color: "#92400e" },
  active: { background: "var(--kz-accent-soft)", color: "var(--kz-accent-text)" },
  delivered: { background: "var(--kz-surface-2)", color: "var(--kz-text-secondary)" },
  approved: { background: "var(--kz-accent-soft)", color: "var(--kz-accent-text)" },
  disputed: { background: "#fee2e2", color: "#b91c1c" },
};
const statusLabel = { new: "New request", active: "In progress", delivered: "Delivered", approved: "Approved · paid", disputed: "Disputed" };

export default function SellerOrders() {
  const { setState, queue, acceptOrder, declineOrder, deliverOrder, accent } = useKazify();
  const queueCount = queue.filter((o) => o.status === "new").length;
  const queueTotal = queue.reduce((a, o) => a + o.amount, 0);

  const acceptStyle = {
    flex: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 34,
    padding: "0 18px",
    background: accent,
    borderRadius: 9,
    fontSize: 12,
    fontWeight: 700,
    color: "#fff",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: "0.12em", color: "var(--kz-text-faint)", textTransform: "uppercase" }}>
          {queueCount} new · queue value UGX {fmt(queueTotal)}
        </span>
        <button onClick={() => setState({ sellerTab: "Dashboard" })} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 700, color: "var(--kz-accent-text)" }}>
          <Icon icon="layout-dashboard" size={14} />
          Dashboard
        </button>
      </div>

      {queue.map((o) => (
        <div key={o.id} style={{ display: "flex", flexDirection: "column", gap: 9, padding: "15px 16px", background: "var(--kz-surface)", borderRadius: 14, animation: "kz-rise .24s ease-out" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>{o.buyer}</span>
            <span style={{ flex: "none", padding: "5px 10px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.02em", ...pillStyle[o.status] }}>{statusLabel[o.status]}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: "var(--kz-text-faint)" }}>
              <Icon icon="clock" size={12} />
              {o.due}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12.5, color: "var(--kz-text-muted)", lineHeight: 1.4, flex: 1, minWidth: 180 }}>{o.title}</span>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, color: "var(--kz-text)" }}>UGX {o.price}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
            {o.status === "new" && (
              <>
                <button
                  onClick={() => declineOrder(o.id)}
                  style={{ flex: "none", padding: "0 16px", height: 34, background: "var(--kz-surface-2)", borderRadius: 9, fontSize: 12, fontWeight: 700, color: "var(--kz-text-secondary)" }}
                >
                  Decline
                </button>
                <button onClick={() => acceptOrder(o.id)} style={acceptStyle}>
                  <Icon icon="check" size={14} />
                  Accept order
                </button>
              </>
            )}
            {o.status === "active" && (
              <button onClick={() => deliverOrder(o.id)} style={acceptStyle}>
                <Icon icon="send" size={14} />
                Deliver work
              </button>
            )}
            {o.status === "delivered" && (
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--kz-accent-text)" }}>
                <Icon icon="badge-check" size={15} />
                Awaiting client approval
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
