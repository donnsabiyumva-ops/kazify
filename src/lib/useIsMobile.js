import { useEffect, useState } from "react";

// Below this, Rail + Binder's desktop three-column layout physically
// doesn't fit (Binder alone needs a 272px minimum) — used to switch both
// over to touch-appropriate patterns (a bottom sheet, a tap-toggle drawer)
// instead of shrinking a layout that was never designed to shrink that far.
const QUERY = "(max-width: 860px)";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = (e) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
