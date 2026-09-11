import { useMemo } from "react";
import Icon from "./Icon.jsx";
import { useKazify } from "../store/KazifyContext.jsx";
import { intentDefs } from "../data/seed.js";

const authCopy = (a) => ({
  email:
    a.mode === "login"
      ? { title: "Welcome back", sub: "Enter the email tied to your Kazify account.", cta: "Send login code", switchLabel: "Create an account" }
      : { title: "Create your Kazify account", sub: "One account for hiring and selling. We'll email you a code — no password needed.", cta: "Send code", switchLabel: "I already have an account" },
  otp: { title: "Enter the code", sub: `Sent by email to ${a.email || "your email"}.`, cta: "Verify code" },
  profile: { title: "Who are we hiring for?", sub: "This is the name and handle creators will see.", cta: "Continue" },
  intent: {
    title: "What brings you to Kazify?",
    sub: "You can switch modes any time. Sellers can start posting right away — ID verification only comes up when you withdraw.",
    cta: "Enter workspace",
  },
});

const authSteps = ["email", "otp", "profile", "intent"];

export default function AuthFlow() {
  const { state, editAuth, closeAuth, signInWithGoogle, sendEmailCode, verifyEmailStep, resolveProfile, finishAuth, say, accent } = useKazify();
  const a = state.auth;
  const busy = state.authBusy;

  const auth = a ? { ...authCopy(a)[a.step], step: a.step } : null;

  const authValid = useMemo(() => {
    if (!a) return false;
    if (a.step === "email") return /\S+@\S+\.\S+/.test(a.email.trim());
    if (a.step === "otp") return a.otp.replace(/\D/g, "").length >= 6;
    if (a.step === "profile") return a.name.trim().length > 1 && a.handle.trim().length > 1;
    return !!a.intent;
  }, [a]);

  if (!a || !auth) return null;

  const authNext = () => {
    if (busy) return;
    if (!authValid) {
      say("Fill this step to continue");
      return;
    }
    if (a.step === "email") return sendEmailCode(a);
    if (a.step === "otp") return verifyEmailStep(a);
    if (a.step === "profile") return resolveProfile(a);
    finishAuth(a, a.intent);
  };

  const authBack = () => (a.step === "email" ? closeAuth() : editAuth("step", authSteps[Math.max(0, authSteps.indexOf(a.step) - 1)]));

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--kz-bg)", zIndex: 95, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto" }}>
      <div style={{ width: "100%", maxWidth: 396, display: "flex", flexDirection: "column", gap: 26, animation: "kz-rise .24s ease-out" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15 }}>K</div>
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.4px" }}>Kazify</span>
          <span style={{ marginLeft: "auto", display: "flex", gap: 5 }}>
            {authSteps.map((st) => (
              <span
                key={st}
                style={{
                  width: a.step === st ? 16 : 6,
                  height: 6,
                  borderRadius: 999,
                  background: authSteps.indexOf(a.step) >= authSteps.indexOf(st) ? accent : "var(--kz-border)",
                  transition: "width .2s ease, background .2s ease",
                }}
              />
            ))}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <span style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.7px", lineHeight: 1.2, textWrap: "pretty" }}>{auth.title}</span>
          <span style={{ fontSize: 13, color: "var(--kz-text-muted)", lineHeight: 1.5, textWrap: "pretty" }}>{auth.sub}</span>
        </div>

        {a.step === "email" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <button
              onClick={signInWithGoogle}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", height: 48, borderRadius: 12, fontSize: 13.5, fontWeight: 700, color: "var(--kz-text)", background: "var(--kz-surface-2)" }}
            >
              <Icon icon="google" size={17} />
              Continue with Google
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, height: 1, background: "var(--kz-border)" }} />
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", color: "var(--kz-text-faint)", textTransform: "uppercase" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "var(--kz-border)" }} />
            </div>
            <input
              type="email"
              value={a.email}
              onChange={(e) => editAuth("email", e.target.value)}
              placeholder="you@example.com"
              style={{ width: "100%", boxSizing: "border-box", padding: "0 14px", height: 48, fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, color: "var(--kz-text)", background: "var(--kz-surface-2)", border: "none", borderRadius: 12, outline: "none" }}
            />
            <span style={{ fontSize: 11.5, color: "var(--kz-text-faint)", lineHeight: 1.5 }}>Your Mobile Money number is only needed later, when you fund or receive an escrow payment.</span>
          </div>
        )}

        {a.step === "otp" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              value={a.otp}
              onChange={(e) => editAuth("otp", e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="••••••••"
              style={{ width: "100%", boxSizing: "border-box", padding: "0 18px", height: 56, fontFamily: "'IBM Plex Mono',monospace", fontSize: 22, letterSpacing: "0.3em", color: "var(--kz-text)", background: "var(--kz-surface-2)", border: "none", borderRadius: 12, outline: "none" }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
              <button onClick={() => sendEmailCode(a, { resend: true })} style={{ fontSize: 11.5, fontWeight: 700, color: "var(--kz-text-faint)" }}>
                Resend code
              </button>
            </div>
          </div>
        )}

        {a.step === "profile" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input value={a.name} onChange={(e) => editAuth("name", e.target.value)} placeholder="Full name" style={fieldStyle} />
            <input value={a.handle} onChange={(e) => editAuth("handle", e.target.value)} placeholder="@handle" style={{ ...fieldStyle, fontFamily: "'IBM Plex Mono',monospace", fontSize: 13.5 }} />
            <input value={a.city} onChange={(e) => editAuth("city", e.target.value)} placeholder="City" style={fieldStyle} />
          </div>
        )}

        {a.step === "intent" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {intentDefs.map((it) => {
              const active = a.intent === it.key;
              return (
                <button
                  key={it.key}
                  onClick={() => editAuth("intent", it.key)}
                  style={{ display: "flex", alignItems: "center", gap: 13, padding: 14, width: "100%", borderRadius: 14, background: active ? "var(--kz-accent-soft)" : "var(--kz-surface)", boxShadow: active ? "inset 0 0 0 1.5px " + accent : "none" }}
                >
                  <span style={{ width: 38, height: 38, flex: "none", borderRadius: 12, background: "var(--kz-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: active ? accent : "var(--kz-text-muted)" }}>
                    <Icon icon={it.icon} size={18} />
                  </span>
                  <span style={{ display: "flex", flexDirection: "column", gap: 3, textAlign: "left", flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--kz-text)" }}>{it.label}</span>
                    <span style={{ fontSize: 11.5, color: "var(--kz-text-muted)", lineHeight: 1.4 }}>{it.hint}</span>
                  </span>
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      flex: "none",
                      background: active ? accent : "var(--kz-bg)",
                      boxShadow: active ? "inset 0 0 0 3px #fff, 0 0 0 1.5px " + accent : "0 0 0 1.5px var(--kz-border-2)",
                    }}
                  />
                </button>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={authNext}
            disabled={busy}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              height: 50,
              borderRadius: 13,
              fontSize: 14,
              fontWeight: 700,
              background: authValid ? accent : "var(--kz-border)",
              color: authValid ? "#fff" : "var(--kz-text-faint)",
              boxShadow: authValid ? "0 8px 20px rgba(5,150,105,0.24)" : "none",
              opacity: busy ? 0.7 : 1,
              cursor: busy ? "wait" : "pointer",
            }}
          >
            {busy ? "Just a moment…" : auth.cta}
            {!busy && <Icon icon="arrow-right" size={16} />}
          </button>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <button onClick={authBack} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "var(--kz-text-faint)" }}>
              <Icon icon="chevron-left" size={14} />
              Back
            </button>
            {a.step === "email" && (
              <button onClick={() => editAuth("mode", a.mode === "login" ? "signup" : "login")} style={{ fontSize: 12, fontWeight: 700, color: "var(--kz-accent-text)" }}>
                {auth.switchLabel}
              </button>
            )}
          </div>
          <span style={{ fontSize: 10.5, color: "var(--kz-text-faint)", lineHeight: 1.5 }}>By continuing you accept the Kazify escrow terms. Funds are only released when a client approves delivery.</span>
        </div>
      </div>
    </div>
  );
}

const fieldStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "0 14px",
  height: 48,
  fontSize: 14,
  color: "var(--kz-text)",
  background: "var(--kz-surface-2)",
  border: "none",
  borderRadius: 12,
  outline: "none",
};
