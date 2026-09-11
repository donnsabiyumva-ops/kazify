import { useEffect, useState } from "react";
import Icon from "./Icon.jsx";
import { openLegalDoc } from "./LegalModal.jsx";
import { useKazify } from "../store/KazifyContext.jsx";
import * as api from "../lib/api.js";

const footerInfoLinks = [
  { label: "About", doc: "about" },
  { label: "FAQ", doc: "faq" },
  { label: "Contact", doc: "contact" },
  { label: "Terms of Service", doc: "terms" },
  { label: "Privacy Policy", doc: "privacy" },
];

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com/kazifyafrica", icon: "instagram" },
  { label: "TikTok", href: "https://www.tiktok.com/@kazifyafrica", icon: "tiktok" },
];

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "For creators", href: "#for-creators" },
  { label: "Browse work", href: "#featured" },
  { label: "Safety", href: "#safety" },
];

const steps = [
  { icon: "search", title: "Watch real work", body: "Every listing is a short video of the actual work — not a CV, not a promise. You see the quality before you pay a shilling." },
  { icon: "hand-coins", title: "Hire through escrow", body: "Your money is held safely the moment you hire. The creator knows the job is funded; you know nothing moves without your say-so." },
  { icon: "badge-check", title: "Approve, then release", body: "Happy with the delivery? Release the funds straight to their Mobile Money. Not happy? It stays protected until it's sorted." },
];

const creatorPoints = [
  { icon: "video", title: "Your portfolio is the pitch", body: "Post a clip of what you can do. No degree, no connections, no cover letter." },
  { icon: "wallet", title: "Paid to Mobile Money", body: "Set your own price and delivery window. Earnings land on MTN or Airtel." },
  { icon: "shield-check", title: "Verified when it counts", body: "Start posting immediately. ID verification only comes up when you cash out." },
];

const pill = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  borderRadius: 999,
  fontWeight: 800,
  border: "none",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

export default function LandingPage() {
  const { startAuth, accent } = useKazify();
  const [featured, setFeatured] = useState([]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .getFeaturedGigs(4)
      .then((rows) => {
        if (!cancelled) setFeatured(rows);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Only listings with real media get shown publicly — a gig whose media
  // lives on its reel (a photo slideshow) has no video on the gig row and
  // would render as an empty placeholder here.
  const showcase = featured.filter((g) => g.videoUrl);
  const reels = showcase.slice(0, 4);

  return (
    <div style={{ background: "var(--kz-bg)", color: "var(--kz-text)", scrollBehavior: "smooth" }}>
      {/* ---------------------------------------------------------------- */}
      {/* sticky header                                                     */}
      {/* ---------------------------------------------------------------- */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: scrolled ? "var(--kz-header-bg)" : "transparent",
          backdropFilter: scrolled ? "saturate(180%) blur(12px)" : "none",
          boxShadow: scrolled ? "0 1px 0 var(--kz-border)" : "none",
          transition: "background .2s ease, box-shadow .2s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, padding: "18px 32px", maxWidth: 1240, margin: "0 auto" }}>
          <span style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-1px", flex: "none" }}>
            Kazi<span style={{ color: accent }}>fy</span>
          </span>

          <nav style={{ display: "flex", alignItems: "center", gap: 30, flexWrap: "wrap", justifyContent: "center" }}>
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="kz-link" style={{ fontSize: 14, fontWeight: 700, color: "var(--kz-text-secondary)" }}>
                {l.label}
              </a>
            ))}
          </nav>

          <button onClick={() => startAuth("login")} className="kz-pill" style={{ ...pill, flex: "none", padding: "11px 24px", background: accent, color: "#fff", fontSize: 14 }}>
            Log in
          </button>
        </div>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section style={{ position: "relative", minHeight: "calc(100vh - 74px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 0", overflow: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26, textAlign: "center", maxWidth: 940, zIndex: 1 }}>
          <h1 style={{ margin: 0, fontSize: "clamp(44px,9vw,104px)", fontWeight: 900, letterSpacing: "-3px", lineHeight: 0.94, textWrap: "balance" }}>
            Skilled. Seen. <span style={{ color: accent }}>Hired.</span>
          </h1>
          <p style={{ margin: 0, fontSize: "clamp(15px,1.6vw,19px)", color: "var(--kz-text-secondary)", lineHeight: 1.55, maxWidth: 600, textWrap: "pretty" }}>
            Uganda's video-first marketplace for skilled young people. Show the work you can actually do — and get hired for it, with payment held safely until you deliver.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 6 }}>
            <button onClick={() => startAuth("signup")} className="kz-pill" style={{ ...pill, padding: "16px 34px", background: "var(--kz-surface-2)", color: "var(--kz-text)", fontSize: 15.5 }}>
              I'm hiring
            </button>
            <button onClick={() => startAuth("signup")} className="kz-pill" style={{ ...pill, padding: "16px 34px", background: accent, color: "#fff", fontSize: 15.5, boxShadow: "0 12px 28px rgba(5,150,105,0.3)" }}>
              Post your work
            </button>
          </div>
          <a href="#featured" className="kz-link" style={{ fontSize: 13.5, color: "var(--kz-text-muted)", lineHeight: 1.7, marginTop: 4 }}>
            Real young creators are posting on Kazify today.
            <br />
            See their work ↓
          </a>
        </div>

        {/* video collage, cropped by the fold */}
        {reels.length > 0 && (
          <div style={{ width: "100%", maxWidth: 1100, marginTop: 48, display: "flex", gap: 16, justifyContent: "center", alignItems: "flex-end" }}>
            {reels.map((g, i) => (
              <button
                key={g.id}
                onClick={() => startAuth("signup")}
                className="kz-tile"
                style={{
                  position: "relative",
                  flex: "1 1 0",
                  minWidth: 0,
                  maxWidth: 230,
                  aspectRatio: "9 / 16",
                  borderRadius: "20px 20px 0 0",
                  overflow: "hidden",
                  background: "#0f172a",
                  cursor: "pointer",
                  transform: `translateY(${i % 2 ? 26 : 0}px)`,
                  boxShadow: "0 -8px 40px rgba(15,23,42,0.12)",
                }}
              >
                <video src={g.videoUrl} muted loop autoPlay playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "40px 12px 14px", background: "linear-gradient(180deg,rgba(8,13,25,0) 0%,rgba(8,13,25,0.85) 100%)", display: "flex", flexDirection: "column", gap: 3, textAlign: "left" }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#fff" }}>{g.handle}</span>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.82)" }}>{g.category}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* mission band                                                      */}
      {/* ---------------------------------------------------------------- */}
      <section style={{ background: "#0f172a", color: "#ffffff", padding: "clamp(64px,9vw,120px) 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 26 }}>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: "0.14em", color: "#6ee7b7", textTransform: "uppercase" }}>Why Kazify exists</span>
          <h2 style={{ margin: 0, fontSize: "clamp(28px,4.6vw,54px)", fontWeight: 900, letterSpacing: "-1.6px", lineHeight: 1.06, textWrap: "balance" }}>
            There is no shortage of talent here. Only a shortage of ways to be found.
          </h2>
          <p style={{ margin: 0, fontSize: "clamp(14.5px,1.5vw,17px)", color: "rgba(255,255,255,0.72)", lineHeight: 1.65, maxWidth: 680, textWrap: "pretty" }}>
            Editors, photographers, designers, MCs and developers finish school with real skill and no way to prove it to anyone who's hiring. Kazify replaces the CV with the work itself: a short clip, a fixed price, a delivery date. Clients see exactly what they're buying, and young people get paid for what they can already do.
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* how it works                                                      */}
      {/* ---------------------------------------------------------------- */}
      <section id="how-it-works" style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(64px,9vw,110px) 24px" }}>
        <h2 style={{ margin: "0 0 8px", fontSize: "clamp(28px,4.4vw,50px)", fontWeight: 900, letterSpacing: "-1.6px", lineHeight: 1.05, textWrap: "balance" }}>How hiring works</h2>
        <p style={{ margin: "0 0 44px", fontSize: 15.5, color: "var(--kz-text-muted)", maxWidth: 520, lineHeight: 1.6 }}>Three steps, no agencies, no upfront risk.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
          {steps.map((s, i) => (
            <div key={s.title} style={{ padding: 28, background: "var(--kz-surface)", borderRadius: 22, display: "flex", flexDirection: "column", gap: 12 }}>
              <span style={{ width: 46, height: 46, borderRadius: 15, background: "var(--kz-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>
                <Icon icon={s.icon} size={21} />
              </span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: "0.1em", color: "var(--kz-text-faint)" }}>0{i + 1}</span>
              <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.5px" }}>{s.title}</span>
              <span style={{ fontSize: 13.5, color: "var(--kz-text-muted)", lineHeight: 1.6 }}>{s.body}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* featured work                                                     */}
      {/* ---------------------------------------------------------------- */}
      {showcase.length > 0 && (
        <section id="featured" style={{ padding: "clamp(48px,7vw,90px) 0", background: "var(--kz-surface)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 32px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: "0 0 8px", fontSize: "clamp(26px,4vw,44px)", fontWeight: 900, letterSpacing: "-1.4px", lineHeight: 1.05 }}>On Kazify right now</h2>
              <p style={{ margin: 0, fontSize: 15, color: "var(--kz-text-muted)", lineHeight: 1.6 }}>Real listings from real creators. Sign up to swipe the full deck.</p>
            </div>
            <button onClick={() => startAuth("signup")} className="kz-pill" style={{ ...pill, padding: "13px 26px", background: "var(--kz-text)", color: "var(--kz-bg)", fontSize: 14 }}>
              Browse everything
              <Icon icon="arrow-right" size={15} />
            </button>
          </div>

          <div className="kz-scroll-x" style={{ display: "flex", gap: 16, overflowX: "auto", padding: "4px 24px 8px", scrollSnapType: "x mandatory" }}>
            {showcase.map((g) => (
              <button
                key={g.id}
                onClick={() => startAuth("signup")}
                className="kz-tile"
                style={{ position: "relative", flex: "none", width: 186, aspectRatio: "9 / 16", borderRadius: 18, overflow: "hidden", background: "#0f172a", cursor: "pointer", scrollSnapAlign: "start" }}
              >
                <video src={g.videoUrl} muted loop autoPlay playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                <span style={{ position: "absolute", top: 12, left: 12, fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff", background: "rgba(15,23,42,0.55)", padding: "5px 8px", borderRadius: 6 }}>
                  {g.category}
                </span>
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "44px 12px 13px", background: "linear-gradient(180deg,rgba(8,13,25,0) 0%,rgba(8,13,25,0.9) 100%)", display: "flex", flexDirection: "column", gap: 5, textAlign: "left" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{g.title}</span>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "rgba(255,255,255,0.85)" }}>
                    <span>UGX {g.price}</span>
                    <span>{g.delivery}d</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* for creators                                                      */}
      {/* ---------------------------------------------------------------- */}
      <section id="for-creators" style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(64px,9vw,110px) 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 40, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: "0.14em", color: accent, textTransform: "uppercase" }}>For creators</span>
            <h2 style={{ margin: 0, fontSize: "clamp(28px,4.4vw,50px)", fontWeight: 900, letterSpacing: "-1.6px", lineHeight: 1.05, textWrap: "balance" }}>
              You already have the skill. Put it where people can hire it.
            </h2>
            <p style={{ margin: 0, fontSize: 15.5, color: "var(--kz-text-muted)", lineHeight: 1.65, maxWidth: 460, textWrap: "pretty" }}>
              Posting takes a few minutes: upload a clip of your work, set your price and delivery window, and you're live in the deck alongside everyone else.
            </p>
            <button onClick={() => startAuth("signup")} className="kz-pill" style={{ ...pill, alignSelf: "flex-start", padding: "16px 32px", background: accent, color: "#fff", fontSize: 15.5, boxShadow: "0 12px 28px rgba(5,150,105,0.3)" }}>
              Post your work free
              <Icon icon="arrow-right" size={16} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {creatorPoints.map((c) => (
              <div key={c.title} style={{ display: "flex", gap: 16, padding: 20, background: "var(--kz-surface)", borderRadius: 18 }}>
                <span style={{ width: 42, height: 42, flex: "none", borderRadius: 14, background: "var(--kz-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>
                  <Icon icon={c.icon} size={19} />
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 800, letterSpacing: "-0.2px" }}>{c.title}</span>
                  <span style={{ fontSize: 13, color: "var(--kz-text-muted)", lineHeight: 1.55 }}>{c.body}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* safety                                                            */}
      {/* ---------------------------------------------------------------- */}
      <section id="safety" style={{ background: "var(--kz-accent-soft)", padding: "clamp(56px,8vw,96px) 24px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center" }}>
          <span style={{ width: 54, height: 54, borderRadius: 18, background: "var(--kz-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>
            <Icon icon="shield-check" size={25} />
          </span>
          <h2 style={{ margin: 0, fontSize: "clamp(26px,4vw,44px)", fontWeight: 900, letterSpacing: "-1.4px", lineHeight: 1.06, textWrap: "balance" }}>Nobody gets burned</h2>
          <p style={{ margin: 0, fontSize: 15.5, color: "var(--kz-accent-text)", lineHeight: 1.65, maxWidth: 560, textWrap: "pretty" }}>
            Every hire runs through escrow. Clients never pay for work they haven't approved, and creators never deliver without knowing the money is already there. Sellers are ID-verified before their first payout.
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* closing CTA                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section style={{ maxWidth: 780, margin: "0 auto", padding: "clamp(64px,9vw,110px) 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
        <h2 style={{ margin: 0, fontSize: "clamp(30px,5vw,60px)", fontWeight: 900, letterSpacing: "-2px", lineHeight: 1.02, textWrap: "balance" }}>
          Start where your work speaks first.
        </h2>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={() => startAuth("signup")} className="kz-pill" style={{ ...pill, padding: "16px 34px", background: accent, color: "#fff", fontSize: 15.5, boxShadow: "0 12px 28px rgba(5,150,105,0.3)" }}>
            Create account
          </button>
          <button onClick={() => startAuth("login")} className="kz-pill" style={{ ...pill, padding: "16px 34px", background: "var(--kz-surface-2)", color: "var(--kz-text)", fontSize: 15.5 }}>
            Log in
          </button>
        </div>
        <span style={{ fontSize: 12.5, color: "var(--kz-text-faint)" }}>One account for hiring and selling. No password — we email you a code.</span>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* footer                                                            */}
      {/* ---------------------------------------------------------------- */}
      <footer style={{ borderTop: "1px solid var(--kz-border)", padding: "40px 24px 28px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 28, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.8px" }}>
              Kazi<span style={{ color: accent }}>fy</span>
            </span>
            <span style={{ fontSize: 12.5, color: "var(--kz-text-faint)" }}>Skilled young Uganda, hired on merit.</span>
          </div>
          <nav style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="kz-link" style={{ fontSize: 13, fontWeight: 600, color: "var(--kz-text-muted)" }}>
                {l.label}
              </a>
            ))}
          </nav>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "var(--kz-text-faint)" }}>© {new Date().getFullYear()} Kazify</span>
        </div>
        <div
          style={{
            maxWidth: 1100,
            margin: "24px auto 0",
            paddingTop: 20,
            borderTop: "1px solid var(--kz-border)",
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <nav style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {footerInfoLinks.map((l) => (
              <button key={l.doc} onClick={() => openLegalDoc(l.doc)} className="kz-link" style={{ fontSize: 12, fontWeight: 600, color: "var(--kz-text-faint)" }}>
                {l.label}
              </button>
            ))}
          </nav>
          <div style={{ display: "flex", gap: 14 }}>
            {socialLinks.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                title={`${s.label} · @kazifyafrica`}
                className="kz-link"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 9, background: "var(--kz-surface-2)", color: "var(--kz-text-secondary)" }}
              >
                <Icon icon={s.icon} size={15} />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
