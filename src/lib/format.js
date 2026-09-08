export function fmt(n) {
  return Number(n).toLocaleString("en-US");
}

export function fmtCompact(n) {
  const v = Number(n) || 0;
  if (v >= 1000) return (v / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(v);
}

export function fmtDue(dueAt) {
  if (!dueAt) return "—";
  const due = new Date(dueAt);
  const today = new Date();
  const diffDays = Math.round((due.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) / 86400000);
  if (diffDays <= 0) return "today";
  return diffDays + "d";
}

export function fmtRelative(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return mins + " min ago";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + " h ago";
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  return days + "d ago";
}

export function fmtShortDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}
