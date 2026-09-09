import { useState } from "react";
import Icon from "./Icon.jsx";
import { useKazify } from "../store/KazifyContext.jsx";
import { cats, catIcons, sellerNav, rolesDefs } from "../data/seed.js";

export default function Rail() {
  const { state, setState, me, notifs, openNotifFrom, escrowInFlightClient, fmt, accent } = useKazify();
  const [hover, setHover] = useState(false);
  const open = state.railPinned || hover;
  const seller = state.role === "freelancer";
  const sellerOn = me.seller_onboarded;

  const accountInitials = me.name
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const navItems = seller
    ? sellerNav.map((n) => ({
        key: n.name,
        icon: n.icon,
        label: n.name,
        count: "",
        active: state.sellerTab === n.name,
        onClick: () => setState({ sellerTab: n.name }),
      }))
    : cats.map((name) => ({
        key: name,
        icon: catIcons[name] || "circle-dot",
        label: name,
        count: null,
        active: state.cats.indexOf(name) > -1,
        onClick: () =>
          setState((p) => ({
            cats: p.cats.indexOf(name) > -1 ? p.cats.filter((c) => c !== name) : p.cats.concat(name),
          })),
      }));

  const selectRole = (key) => {
    if (key === "freelancer" && !sellerOn) {
      setState({ userOpen: true, facet: "selling" });
    } else {
      setState({ role: key });
    }
  };

  return (
    <div style={{ width: 72, flex: "none", position: "relative", zIndex: 50 }}>
      <aside
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: open ? 254 : 72,
          overflowX: "hidden",
          overflowY: "auto",
          background: "var(--kz-bg)",
          display: "flex",
          flexDirection: "column",
          boxShadow: open && !state.railPinned ? "18px 0 40px rgba(15,23,42,0.10)" : "none",
          transition: "width .24s cubic-bezier(.22,.85,.24,1), box-shadow .24s ease",
        }}
      >
        <div
          style={{
            padding: open ? "20px 16px 18px 20px" : "20px 0 18px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            justifyContent: open ? "flex-start" : "center",
            position: "relative",
          }}
        >
          <div style={{ width: 30, height: 30, borderRadius: 9, background: accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14, flex: "none" }}>K</div>
          <div style={{ display: open ? "flex" : "none", flex: 1, minWidth: 0, alignItems: "center" }}>
            <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.4px", whiteSpace: "nowrap" }}>Kazify</span>
          </div>
          <button
            onClick={() => setState((p) => ({ notifOpen: !p.notifOpen, railPinned: true }))}
            title="Notifications"
            style={{
              position: "relative",
              flex: "none",
              width: 26,
              height: 26,
              borderRadius: 8,
              display: open ? "flex" : "none",
              alignItems: "center",
              justifyContent: "center",
              background: state.notifOpen ? "var(--kz-accent-soft)" : "var(--kz-surface-2)",
              color: state.notifOpen ? "var(--kz-accent-text)" : "var(--kz-text-muted)",
            }}
          >
            <Icon icon="bell" size={17} />
            {notifs.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  minWidth: 16,
                  height: 16,
                  padding: "0 4px",
                  borderRadius: 999,
                  background: accent,
                  color: "#fff",
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 9.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 0 2px var(--kz-bg)",
                }}
              >
                {notifs.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setState((p) => ({ railPinned: !p.railPinned }))}
            title={state.railPinned ? "Unpin panel" : "Keep panel open"}
            style={{
              display: open ? "flex" : "none",
              width: 26,
              height: 26,
              flex: "none",
              alignItems: "center",
              justifyContent: "center",
              background: state.railPinned ? "var(--kz-accent-soft)" : "var(--kz-surface-2)",
              border: "none",
              borderRadius: 8,
              fontSize: 11,
              color: state.railPinned ? "var(--kz-accent-text)" : "var(--kz-text-faint)",
            }}
          >
            <Icon icon={state.railPinned ? "pin-off" : "pin"} size={13} />
          </button>
        </div>

        {state.notifOpen && (
          <div style={{ margin: "0 12px 14px", padding: 8, background: "var(--kz-surface)", borderRadius: 14, display: "flex", flexDirection: "column", gap: 4 }}>
            {notifs.map((n, i) => (
              <button
                key={i}
                onClick={() => openNotifFrom(n)}
                style={{ display: "flex", gap: 10, padding: 9, width: "100%", textAlign: "left", borderRadius: 10, background: "var(--kz-bg)" }}
              >
                <span
                  style={{
                    width: 30,
                    height: 30,
                    flex: "none",
                    borderRadius: 9,
                    background: "var(--kz-surface)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--kz-text-muted)",
                  }}
                >
                  <Icon icon={n.icon} size={15} />
                </span>
                <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
                  <span
                    style={{
                      alignSelf: "flex-start",
                      padding: "2px 7px",
                      borderRadius: 999,
                      background: n.role === "freelancer" ? "var(--kz-accent-soft)" : "var(--kz-surface-2)",
                      fontFamily: "'IBM Plex Mono',monospace",
                      fontSize: 8.5,
                      fontWeight: 500,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: n.role === "freelancer" ? "var(--kz-accent-text)" : "var(--kz-text-secondary)",
                    }}
                  >
                    {n.tag}
                  </span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--kz-text)", lineHeight: 1.35 }}>{n.title}</span>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: "var(--kz-text-faint)" }}>{n.when}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {!seller && (
          <div style={{ padding: open ? "0 16px 18px" : "18px 0 18px", display: "flex", justifyContent: "center" }}>
            {open ? (
              <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
                <span style={{ position: "absolute", left: 11, display: "flex", color: "var(--kz-text-faint)" }}>
                  <Icon icon="search" size={14} />
                </span>
                <input
                  value={state.query}
                  onChange={(e) => setState({ query: e.target.value })}
                  placeholder="Search gigs"
                  style={{ width: "100%", boxSizing: "border-box", padding: "9px 11px 9px 28px", fontSize: 12.5, color: "var(--kz-text)", background: "var(--kz-surface-2)", border: "none", borderRadius: 10, outline: "none" }}
                />
              </div>
            ) : (
              <button
                onClick={() => setState({ railPinned: true })}
                title="Search gigs"
                style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--kz-surface-2)", border: "none", borderRadius: 11, color: "var(--kz-text-muted)" }}
              >
                <Icon icon="search" size={16} />
              </button>
            )}
          </div>
        )}

        <div style={{ margin: "0 16px 14px", padding: 3, background: "var(--kz-surface-2)", borderRadius: 12, display: "flex", flexDirection: open ? "row" : "column", gap: 3 }}>
          {rolesDefs.map((r) => (
            <button
              key={r.key}
              onClick={() => selectRole(r.key)}
              title={r.label}
              style={{
                flex: open ? 1 : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                padding: open ? "8px 6px" : "9px 0",
                width: open ? "auto" : "100%",
                borderRadius: 9,
                fontSize: 11.5,
                fontWeight: 700,
                background: state.role === r.key ? "var(--kz-bg)" : "transparent",
                color: state.role === r.key ? "var(--kz-text)" : "var(--kz-text-faint)",
                boxShadow: state.role === r.key ? "0 1px 3px rgba(15,23,42,0.12)" : "none",
              }}
            >
              <Icon icon={r.icon} size={15} />
              <span style={{ display: open ? "inline" : "none" }}>{r.label}</span>
            </button>
          ))}
        </div>

        <div style={{ padding: open ? "0 12px" : "0 16px", display: "flex", flexDirection: "column", gap: 3 }}>
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={item.onClick}
              title={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                justifyContent: open ? "flex-start" : "center",
                padding: open ? "9px 11px" : "9px 0",
                border: "none",
                background: item.active ? "var(--kz-accent-soft)" : "transparent",
                borderRadius: 10,
                color: item.active ? "var(--kz-accent-text)" : "var(--kz-text)",
                width: "100%",
                textAlign: "left",
              }}
            >
              <span style={{ width: 22, height: 22, borderRadius: 7, flex: "none", display: "flex", alignItems: "center", justifyContent: "center", color: item.active ? "var(--kz-text)" : "var(--kz-text-faint)" }}>
                <Icon icon={item.icon} size={17} />
              </span>
              <span style={{ display: open ? "flex" : "none", flex: 1, minWidth: 0, alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>{item.label}</span>
              </span>
            </button>
          ))}
        </div>

        <div
          onClick={() => setState({ userOpen: true })}
          title="Your account"
          style={{ marginTop: "auto", padding: open ? 16 : "16px 0", display: "flex", alignItems: "center", gap: 10, justifyContent: open ? "flex-start" : "center", cursor: "pointer", borderRadius: 12 }}
        >
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "repeating-linear-gradient(135deg,#d1fae5 0 4px,#a7f3d0 4px 8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10.5,
              fontWeight: 700,
              color: "#047857",
              flex: "none",
            }}
          >
            {accountInitials}
            {me.photo_url && (
              <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${me.photo_url})`, backgroundSize: "cover", backgroundPosition: "center" }} />
            )}
          </div>
          <div style={{ display: open ? "flex" : "none", flex: 1, minWidth: 0, alignItems: "center" }}>
            <span style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>{me.name}</span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: "var(--kz-text-faint)", whiteSpace: "nowrap" }}>Escrow · UGX {fmt(escrowInFlightClient)}</span>
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
