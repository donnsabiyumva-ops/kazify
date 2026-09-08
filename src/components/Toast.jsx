import Icon from "./Icon.jsx";
import { useKazify } from "../store/KazifyContext.jsx";

export default function Toast() {
  const { state } = useKazify();
  if (!state.toast) return null;
  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: 26,
        transform: "translateX(-50%)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "11px 16px",
        background: "#0f172a",
        borderRadius: 12,
        fontSize: 12.5,
        fontWeight: 600,
        color: "#ffffff",
        boxShadow: "0 12px 30px rgba(15,23,42,0.28)",
        animation: "kz-rise .2s ease-out",
      }}
    >
      <Icon icon="check" size={15} style={{ color: "#34d399" }} />
      {state.toast}
    </div>
  );
}
