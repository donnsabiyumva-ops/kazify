import Icon from "./Icon.jsx";
import PayoutMethodPicker from "./PayoutMethodPicker.jsx";
import { useKazify } from "../store/KazifyContext.jsx";
import { prefDefs, facetsDefs } from "../data/seed.js";

const OPEN_ORDER_STATUSES = ["new", "active", "delivered", "disputed"];

const toneStyle = {
  amber: { background: "#fef3c7", color: "#92400e" },
  emerald: { background: "var(--kz-accent-soft)", color: "var(--kz-accent-text)" },
  slate: { background: "var(--kz-surface-2)", color: "var(--kz-text-secondary)" },
};

export default function AccountOverlay() {
  const {
    state,
    setState,
    me,
    binder,
    ordersClient,
    escrowInFlightClient,
    availableBalance,
    escrowHeldSeller,
    queueCount,
    togglePref,
    becomeSeller,
    approveOrder,
    disputeOrder,
    fmt,
    accent,
    signOut,
  } = useKazify();
  if (!state.userOpen) return null;

  const sellerOn = me.seller_onboarded;
  const kycVerified = sellerOn && me.kyc_status === "verified";
  const kycReview = sellerOn && me.kyc_status === "review";

  const accountInitials = me.name
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const userStats = [
    { icon: "wallet", value: "UGX " + fmt(escrowInFlightClient), label: "In escrow" },
    { icon: "file-check", value: String(ordersClient.filter((o) => OPEN_ORDER_STATUSES.includes(o.rawStatus)).length), label: "Active contracts" },
    { icon: "bookmark", value: String(binder.length), label: "Shortlisted" },
    { icon: "receipt", value: String(ordersClient.length), label: "Gigs commissioned" },
  ];

  const sellerStats = [
    { icon: "wallet", value: "UGX " + fmt(availableBalance), label: "Available balance" },
    { icon: "lock", value: "UGX " + fmt(escrowHeldSeller.total), label: "Escrow held" },
    { icon: "star", value: me.rating != null ? Number(me.rating).toFixed(1) : "—", label: "Seller rating" },
    { icon: "inbox", value: String(queueCount), label: "Orders in queue" },
  ];

  const goSelling = () => setState({ role: "freelancer", userOpen: false, sellerTab: "Dashboard" });

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--kz-bg)", zIndex: 72, overflowY: "auto", animation: "kz-fade .18s ease-out" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "26px 32px 48px", display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setState({ userOpen: false })} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--kz-surface-2)", borderRadius: 10, color: "var(--kz-text-secondary)" }}>
            <Icon icon="chevron-left" size={17} />
          </button>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: "0.12em", color: "var(--kz-text-faint)", textTransform: "uppercase" }}>Your account</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ position: "relative", overflow: "hidden", width: 82, height: 82, borderRadius: "50%", flex: "none", background: "repeating-linear-gradient(135deg,#d1fae5 0 6px,#a7f3d0 6px 12px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, fontWeight: 800, color: "#047857" }}>
            {accountInitials}
            {me.photo_url && <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${me.photo_url})`, backgroundSize: "cover", backgroundPosition: "center" }} />}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
              <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.6px" }}>{me.name}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", background: "var(--kz-accent-soft)", borderRadius: 999, fontSize: 11, fontWeight: 700, color: "var(--kz-accent-text)" }}>
                <Icon icon="badge-check" size={13} />
                Verified client
              </span>
              {kycVerified && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 9px", background: "var(--kz-surface-2)", borderRadius: 999, fontSize: 11, fontWeight: 700, color: "var(--kz-text-secondary)" }}>
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
              {me.handle} · {me.city} · {me.escrow_release_window} release window
            </div>
          </div>
          <button
            onClick={signOut}
            style={{ padding: "11px 16px", background: "var(--kz-surface-2)", borderRadius: 12, fontSize: 12.5, fontWeight: 700, color: "var(--kz-text-secondary)", display: "flex", alignItems: "center", gap: 7 }}
          >
            <Icon icon="log-out" size={15} />
            Sign out
          </button>
          <SettingsButton />
        </div>

        <div style={{ display: "flex", gap: 4, padding: 3, background: "var(--kz-surface-2)", borderRadius: 12, alignSelf: "flex-start" }}>
          {facetsDefs.map((fc) => (
            <button
              key={fc.key}
              onClick={() => setState({ facet: fc.key })}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 16px",
                borderRadius: 10,
                fontSize: 12.5,
                fontWeight: 700,
                background: state.facet === fc.key ? "var(--kz-bg)" : "transparent",
                color: state.facet === fc.key ? "var(--kz-text)" : "var(--kz-text-faint)",
                boxShadow: state.facet === fc.key ? "0 1px 3px var(--kz-shadow)" : "none",
              }}
            >
              <Icon icon={fc.icon} size={15} />
              {fc.label}
            </button>
          ))}
        </div>

        {state.facet === "hiring" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12 }}>
              {userStats.map((st) => (
                <div key={st.label} style={{ padding: 16, background: "var(--kz-surface)", borderRadius: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ display: "flex", color: "var(--kz-text-faint)" }}>
                    <Icon icon={st.icon} size={16} />
                  </span>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 17, color: "var(--kz-text)" }}>{st.value}</span>
                  <span style={{ fontSize: 10.5, letterSpacing: "0.05em", color: "var(--kz-text-faint)", textTransform: "uppercase" }}>{st.label}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: "0.12em", color: "var(--kz-text-faint)", textTransform: "uppercase" }}>Active contracts</div>
              {ordersClient.length === 0 && (
                <div style={{ padding: "12px 4px", fontSize: 12, color: "var(--kz-text-faint)" }}>No hires yet — shortlist a service and hire to see it here.</div>
              )}
              {ordersClient.map((ct) => (
                <div key={ct.id} style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 38, height: 52, borderRadius: 9, flex: "none", background: "repeating-linear-gradient(115deg,#0f172a 0 7px,#1e293b 7px 14px)" }} />
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 700 }}>{ct.handle}</span>
                      <span style={{ fontSize: 11.5, color: "var(--kz-text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ct.title}</span>
                    </div>
                    <span style={{ flex: "none", padding: "5px 10px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.02em", ...toneStyle[ct.tone] }}>{ct.status}</span>
                    <span style={{ flex: "none", fontFamily: "'IBM Plex Mono',monospace", fontSize: 11.5, color: "var(--kz-text)" }}>UGX {ct.price}</span>
                  </div>
                  {ct.rawStatus === "delivered" && (
                    <div style={{ display: "flex", gap: 8, paddingLeft: 52 }}>
                      <button
                        onClick={() => disputeOrder(ct.id)}
                        style={{ flex: "none", padding: "0 14px", height: 32, background: "var(--kz-surface-2)", borderRadius: 9, fontSize: 11.5, fontWeight: 700, color: "var(--kz-text-secondary)" }}
                      >
                        Dispute
                      </button>
                      <button
                        onClick={() => approveOrder(ct.id)}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flex: "none", padding: "0 16px", height: 32, background: accent, borderRadius: 9, fontSize: 11.5, fontWeight: 700, color: "#fff" }}
                      >
                        <Icon icon="badge-check" size={13} />
                        Approve & release
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: "0.12em", color: "var(--kz-text-faint)", textTransform: "uppercase" }}>Payout sources</div>
              <PayoutMethodPicker selected={state.method} onSelect={(key) => setState({ method: key })} accent={accent} />
            </div>

            <PrefsList prefs={{ autoRelease: me.auto_release_escrow, digest: me.weekly_digest }} onToggle={togglePref} />
          </>
        )}

        {state.facet === "selling" && sellerOn && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
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
            <button
              onClick={goSelling}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: 12, background: accent, borderRadius: 12, fontSize: 13, fontWeight: 700, color: "#fff", boxShadow: "0 6px 16px rgba(5,150,105,0.24)" }}
            >
              <Icon icon="briefcase" size={15} />
              Open selling workspace
            </button>
          </div>
        )}

        {state.facet === "selling" && !sellerOn && (
          <div style={{ padding: 26, background: "var(--kz-surface)", borderRadius: 16, display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
            <span style={{ width: 44, height: 44, borderRadius: 14, background: "var(--kz-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kz-accent-text)" }}>
              <Icon icon="briefcase" size={21} />
            </span>
            <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.3px" }}>Start selling on Kazify</span>
            <span style={{ fontSize: 12.5, color: "var(--kz-text-muted)", lineHeight: 1.5, maxWidth: 420, textWrap: "pretty" }}>
              Same account, same handle. Post your first 9:16 service right away — ID verification only comes up later, when you withdraw.
            </span>
            <button
              onClick={becomeSeller}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: 12, background: accent, borderRadius: 12, fontSize: 13, fontWeight: 700, color: "#fff", boxShadow: "0 6px 16px rgba(5,150,105,0.24)" }}
            >
              <Icon icon="arrow-right" size={15} />
              Start selling
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsButton() {
  const { openSettings } = useKazify();
  return (
    <button onClick={openSettings} style={{ padding: "11px 18px", background: "var(--kz-surface-2)", borderRadius: 12, fontSize: 12.5, fontWeight: 700, color: "var(--kz-text-secondary)", display: "flex", alignItems: "center", gap: 7 }}>
      <Icon icon="settings" size={15} />
      Settings
    </button>
  );
}

function PrefsList({ prefs, onToggle }) {
  const { accent } = useKazify();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: "0.12em", color: "var(--kz-text-faint)", textTransform: "uppercase", marginBottom: 6 }}>Preferences</div>
      {prefDefs.map((p) => {
        const on = !!prefs[p.key];
        return (
          <button key={p.key} onClick={() => onToggle(p.key)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "12px 4px", width: "100%", textAlign: "left" }}>
            <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--kz-text)" }}>{p.label}</span>
              <span style={{ fontSize: 11, color: "var(--kz-text-muted)" }}>{p.hint}</span>
            </span>
            <span style={{ flex: "none", width: 40, height: 23, borderRadius: 999, padding: 2, display: "flex", justifyContent: on ? "flex-end" : "flex-start", background: on ? accent : "var(--kz-border)" }}>
              <span style={{ width: 19, height: 19, borderRadius: "50%", background: "#fff" }} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
