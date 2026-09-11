import { useEffect } from "react";
import Icon from "./Icon.jsx";
import { useKazify } from "../store/KazifyContext.jsx";

export default function NotificationPopup() {
  const { livePopups, dismissPopup, openNotifFrom } = useKazify();
  if (livePopups.length === 0) return null;

  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 150, display: "flex", flexDirection: "column", gap: 10, width: "min(340px, calc(100vw - 40px))" }}>
      {livePopups.map((n) => (
        <PopupCard
          key={n.key}
          n={n}
          onDismiss={() => dismissPopup(n.key)}
          onOpen={() => {
            openNotifFrom(n);
            dismissPopup(n.key);
          }}
        />
      ))}
    </div>
  );
}

function PopupCard({ n, onDismiss, onOpen }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 6000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      style={{
        display: "flex",
        gap: 12,
        padding: 14,
        width: "100%",
        boxSizing: "border-box",
        textAlign: "left",
        cursor: "pointer",
        background: "var(--kz-bg)",
        borderRadius: 14,
        boxShadow: "0 12px 32px var(--kz-shadow)",
        border: "1px solid var(--kz-border)",
        animation: "kz-rise .22s ease-out",
      }}
    >
      <span style={{ width: 36, height: 36, flex: "none", borderRadius: 10, background: "var(--kz-accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kz-accent-text)" }}>
        <Icon icon={n.icon} size={17} />
      </span>
      <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--kz-text-faint)" }}>{n.tag}</span>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--kz-text)", lineHeight: 1.35 }}>{n.title}</span>
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        style={{ flex: "none", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--kz-text-faint)" }}
      >
        <Icon icon="x" size={13} />
      </button>
    </div>
  );
}
