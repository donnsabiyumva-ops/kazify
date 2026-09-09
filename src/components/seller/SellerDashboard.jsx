import Icon from "../Icon.jsx";
import { useKazify } from "../../store/KazifyContext.jsx";

export default function SellerDashboard() {
  const { me, availableBalance, escrowHeldSeller, queueCount, fmt } = useKazify();
  const kycVerified = me.kyc_status === "verified";
  const kycReview = me.kyc_status === "review";

  const sellerStats = [
    { icon: "wallet", value: "UGX " + fmt(availableBalance), label: "Available balance" },
    { icon: "lock", value: "UGX " + fmt(escrowHeldSeller.total), label: "Escrow held" },
    { icon: "star", value: me.rating != null ? Number(me.rating).toFixed(1) : "—", label: "Seller rating" },
    { icon: "inbox", value: String(queueCount), label: "Orders in queue" },
  ];

  const accountInitials = me.name
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ position: "relative", overflow: "hidden", width: 82, height: 82, borderRadius: "50%", flex: "none", background: "repeating-linear-gradient(135deg,#d1fae5 0 6px,#a7f3d0 6px 12px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, fontWeight: 800, color: "#047857" }}>
          {accountInitials}
          {me.photo_url && <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${me.photo_url})`, backgroundSize: "cover", backgroundPosition: "center" }} />}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7, flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.6px" }}>{me.name}</span>
            {kycVerified && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", background: "var(--kz-accent-soft)", borderRadius: 999, fontSize: 11, fontWeight: 700, color: "var(--kz-accent-text)" }}>
                <Icon icon="badge-check" size={13} />
                Verified seller
              </span>
            )}
            {kycReview && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", background: "#fef3c7", borderRadius: 999, fontSize: 11, fontWeight: 700, color: "#92400e" }}>
                <Icon icon="clock" size={13} />
                ID in review
              </span>
            )}
          </div>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11.5, color: "var(--kz-text-muted)" }}>
            {me.handle} · {me.city}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--kz-text-muted)" }}>
            <Icon icon="material-symbols:star-rounded" size={15} style={{ color: "#f59e0b" }} />
            {me.rating != null ? Number(me.rating).toFixed(1) : "No rating yet"}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12 }}>
        {sellerStats.map((st) => (
          <div key={st.label} style={{ padding: 16, background: "var(--kz-surface)", borderRadius: 14, display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ display: "flex", color: "var(--kz-text-faint)" }}>
              <Icon icon={st.icon} size={16} />
            </span>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 17, color: "var(--kz-text)" }}>{st.value}</span>
            <span style={{ fontSize: 10.5, letterSpacing: "0.05em", color: "var(--kz-text-faint)", textTransform: "uppercase" }}>{st.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
