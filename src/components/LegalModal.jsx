import Icon from "./Icon.jsx";

const SECTION = { display: "flex", flexDirection: "column", gap: 8 };
const H = { fontSize: 14, fontWeight: 800, color: "var(--kz-text)" };
const P = { fontSize: 12.5, color: "var(--kz-text-muted)", lineHeight: 1.6 };

const docs = {
  terms: {
    title: "Terms of Service",
    body: (
      <>
        <div style={SECTION}>
          <span style={H}>1. What Kazify is</span>
          <span style={P}>
            Kazify is a marketplace connecting Ugandan clients with skilled young creators, where every service is shown through a short video of real work rather than a written pitch.
            Hiring runs through escrow: a client's payment is held by Kazify and only released to the creator once the client approves the delivered work.
          </span>
        </div>
        <div style={SECTION}>
          <span style={H}>2. Accounts</span>
          <span style={P}>
            One account per person, usable for both hiring and selling. You're responsible for the accuracy of the information on your profile and for keeping access to your account secure.
            Accounts are for individuals old enough to enter a binding contract under Ugandan law.
          </span>
        </div>
        <div style={SECTION}>
          <span style={H}>3. Escrow &amp; fees</span>
          <span style={P}>
            When a client funds an order, that amount is held in escrow — it is not paid to the creator until the client approves the delivery, or until it auto-releases under the client's own
            escrow preference. Kazify charges a service fee (currently 5%) on top of the listed price, shown at checkout before payment. Payouts to creators are sent to a Mobile Money number
            (MTN or Airtel) they provide.
          </span>
        </div>
        <div style={SECTION}>
          <span style={H}>4. Seller verification</span>
          <span style={P}>
            Creators can post services and accept orders immediately. Before a creator can withdraw earnings, Kazify requires a one-time identity check. Kazify may decline or reverse a payout
            where verification cannot be completed or fraud is suspected.
          </span>
        </div>
        <div style={SECTION}>
          <span style={H}>5. Disputes</span>
          <span style={P}>
            If a client isn't satisfied with a delivery, they can mark the order disputed instead of approving it — escrow stays held rather than releasing automatically. Kazify may step in to
            help both sides reach an outcome, but is not a party to the underlying service agreement and does not guarantee the quality of any listed work.
          </span>
        </div>
        <div style={SECTION}>
          <span style={H}>6. Acceptable use</span>
          <span style={P}>
            Don't use Kazify to misrepresent your work, infringe someone else's intellectual property, move payment for a hire outside of escrow, or attempt to defraud another user. Kazify may
            suspend or remove accounts that violate these terms.
          </span>
        </div>
        <div style={SECTION}>
          <span style={H}>7. Content</span>
          <span style={P}>
            Creators retain ownership of the videos, photos, and other content they upload. By posting a service, a creator grants Kazify a license to display that content on the platform for
            the purpose of the marketplace.
          </span>
        </div>
        <div style={SECTION}>
          <span style={H}>8. Liability &amp; changes</span>
          <span style={P}>
            Kazify is provided "as is," without guarantees beyond what's stated here. These terms are governed by the laws of Uganda and may be updated as the platform evolves — continued use
            after a change means you accept the update.
          </span>
        </div>
      </>
    ),
  },
  privacy: {
    title: "Privacy Policy",
    body: (
      <>
        <div style={SECTION}>
          <span style={H}>1. What we collect</span>
          <span style={P}>
            Your name, handle, city, email, and (when relevant) Mobile Money number; any profile photo or service video/photos you upload; messages you send through the platform; identity
            documents submitted for seller verification; and basic usage data needed to run the app.
          </span>
        </div>
        <div style={SECTION}>
          <span style={H}>2. How we use it</span>
          <span style={P}>
            To operate your account, process escrow payments and payouts, verify seller identity before a withdrawal, deliver notifications and transactional email (like sign-in codes), and
            keep the marketplace safe from fraud.
          </span>
        </div>
        <div style={SECTION}>
          <span style={H}>3. Who we share it with</span>
          <span style={P}>
            Kazify runs on Supabase (database, authentication, and file storage) and Resend (transactional email). Mobile Money transfers are processed through MTN and Airtel. We don't sell
            your personal data to third parties.
          </span>
        </div>
        <div style={SECTION}>
          <span style={H}>4. Your rights</span>
          <span style={P}>
            Under Uganda's Data Protection and Privacy Act, 2019, you can request access to, correction of, or deletion of your personal data. Identity documents submitted for verification are
            used only for that check and are not shown to other users.
          </span>
        </div>
        <div style={SECTION}>
          <span style={H}>5. Storage on your device</span>
          <span style={P}>
            Kazify stores a small amount of data in your browser (like your light/dark theme preference) to make the app work the way you left it. This never leaves your device.
          </span>
        </div>
        <div style={SECTION}>
          <span style={H}>6. Changes</span>
          <span style={P}>
            If this policy changes in a way that affects how your data is used, we'll update this page — check back occasionally.
          </span>
        </div>
      </>
    ),
  },
  about: {
    title: "About Kazify",
    body: (
      <>
        <div style={SECTION}>
          <span style={H}>Why Kazify exists</span>
          <span style={P}>
            There's no shortage of talent in Uganda — only a shortage of ways to be found. Editors, photographers, designers, MCs and developers finish school with real skill and no way to
            prove it to anyone hiring. Kazify replaces the CV with the work itself: a short video, a fixed price, a delivery date. Clients see exactly what they're paying for, and young people
            get paid for what they can already do.
          </span>
        </div>
        <div style={SECTION}>
          <span style={H}>How it's different</span>
          <span style={P}>
            No agencies, no cold outreach, no unpaid "trial work." A creator posts a service, a client hires it through escrow, and payment only moves once the client approves what was
            delivered. Verification is required to withdraw earnings, not to start selling — so getting listed is never the bottleneck.
          </span>
        </div>
        <div style={SECTION}>
          <span style={H}>Where we're at</span>
          <span style={P}>
            Kazify is early — built and run out of Uganda, growing one creator and one hire at a time. If you're building something and want to see how it works, the fastest way is to sign up
            and swipe the deck.
          </span>
        </div>
      </>
    ),
  },
  faq: {
    title: "Frequently Asked Questions",
    body: (
      <>
        <div style={SECTION}>
          <span style={H}>How does escrow actually work?</span>
          <span style={P}>
            When you hire someone, your payment moves into escrow immediately — the creator doesn't get paid yet, but they can see the order is funded. Once they deliver and you approve, the
            funds release to their Mobile Money. If you never approve, the money stays held rather than going anywhere.
          </span>
        </div>
        <div style={SECTION}>
          <span style={H}>What if I'm not happy with the delivery?</span>
          <span style={P}>
            Mark the order disputed instead of approving it. Escrow stays protected — nothing releases until it's sorted out.
          </span>
        </div>
        <div style={SECTION}>
          <span style={H}>Do I have to talk to a creator before hiring them?</span>
          <span style={P}>
            Yes — hiring happens inside a chat with the creator. The Hire Now button only unlocks once they've actually replied, so you're never checking out cold.
          </span>
        </div>
        <div style={SECTION}>
          <span style={H}>How do creators get paid?</span>
          <span style={P}>
            Straight to MTN or Airtel Mobile Money once an order's escrow is released. A creator can post services and take orders right away — ID verification is only required before their
            first withdrawal.
          </span>
        </div>
        <div style={SECTION}>
          <span style={H}>Is my ID document safe?</span>
          <span style={P}>
            It's used only to verify you for payouts and is never shown to clients or other creators.
          </span>
        </div>
      </>
    ),
  },
  contact: {
    title: "Contact",
    body: (
      <div style={SECTION}>
        <span style={P}>
          Kazify doesn't have a support inbox set up yet — for now, the fastest way to reach us is Instagram or TikTok, both{" "}
          <strong style={{ color: "var(--kz-text)" }}>@kazifyafrica</strong>. Send a DM and we'll get back to you.
        </span>
      </div>
    ),
  },
};

const LEGAL_DOCS = new Set(["terms", "privacy"]);

export default function LegalModal({ doc, onClose }) {
  const d = doc ? docs[doc] : null;
  if (!d) return null;

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 90, animation: "kz-fade .18s ease-out" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 560, maxHeight: "82vh", overflowY: "auto", background: "var(--kz-bg)", borderRadius: 18, boxShadow: "0 24px 60px var(--kz-shadow)", animation: "kz-rise .22s ease-out" }}
      >
        <div style={{ position: "sticky", top: 0, background: "var(--kz-bg)", padding: "20px 22px 14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: "0.12em", color: "#059669", textTransform: "uppercase" }}>Kazify</div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.3px" }}>{d.title}</div>
          </div>
          <button onClick={onClose} style={{ flex: "none", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--kz-surface-2)", borderRadius: 8, color: "var(--kz-text-muted)" }}>
            <Icon icon="x" size={15} />
          </button>
        </div>

        <div style={{ padding: "4px 22px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
          {LEGAL_DOCS.has(doc) && (
            <div style={{ display: "flex", gap: 8, padding: "10px 12px", background: "#fef3c7", borderRadius: 10, fontSize: 11, color: "#92400e", lineHeight: 1.5 }}>
              <Icon icon="shield-alert" size={14} style={{ flex: "none", marginTop: 1 }} />
              <span>Draft template for a platform still in development — not reviewed by a lawyer. Have this checked before real users transact real money on Kazify.</span>
            </div>
          )}
          {d.body}
        </div>
      </div>
    </div>
  );
}
