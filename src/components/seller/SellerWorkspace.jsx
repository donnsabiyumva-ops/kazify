import Icon from "../Icon.jsx";
import { useKazify } from "../../store/KazifyContext.jsx";
import SellerDashboard from "./SellerDashboard.jsx";
import SellerReels from "./SellerReels.jsx";
import SellerEarnings from "./SellerEarnings.jsx";
import SellerOrders from "./SellerOrders.jsx";

export default function SellerWorkspace() {
  const { state, setState, me, queue, refreshKyc } = useKazify();
  const kycReview = me.seller_onboarded && me.kyc_status === "review";
  const queueCount = queue.filter((o) => o.status === "new").length;

  return (
    <main style={{ flex: 1, minWidth: 0, overflowY: "auto", background: "var(--kz-bg)" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "26px 32px 44px", display: "flex", flexDirection: "column", gap: 26 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.4px" }}>{state.sellerTab}</span>
          <button
            onClick={() => setState({ sellerTab: "Orders" })}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", background: "var(--kz-surface-2)", borderRadius: 11, fontSize: 12, fontWeight: 700, color: "var(--kz-text-secondary)" }}
          >
            <Icon icon="inbox" size={15} />
            {queueCount} new orders
          </button>
        </div>

        {kycReview && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "#fffbeb", borderRadius: 14 }}>
            <span style={{ width: 34, height: 34, flex: "none", borderRadius: 11, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", color: "#92400e" }}>
              <Icon icon="shield-alert" size={17} />
            </span>
            <span style={{ flex: 1, minWidth: 0, fontSize: 12, color: "#92400e", lineHeight: 1.45 }}>
              ID in review — post services and accept orders as normal. Escrow payouts unlock once the check clears (usually minutes).
            </span>
            <button onClick={refreshKyc} style={{ flex: "none", padding: "8px 13px", background: "#ffffff", borderRadius: 10, fontSize: 11.5, fontWeight: 700, color: "#92400e" }}>
              Check status
            </button>
          </div>
        )}

        {state.sellerTab === "Dashboard" && <SellerDashboard />}
        {state.sellerTab === "My Services" && <SellerReels />}
        {state.sellerTab === "Orders" && <SellerOrders />}
        {state.sellerTab === "Earnings" && <SellerEarnings />}
      </div>
    </main>
  );
}
