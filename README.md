# Kazify

A video-first freelance marketplace for Uganda: swipe through short-form service pitches, shortlist creators, hire through escrow, and — on the flip side — post services, take orders, and get paid out to Mobile Money.

Built from the Kazify Claude Design project, React + Vite, Supabase backend.

## Production readiness roadmap

1. **Real backend & database** (done) — Supabase: profiles, gigs, swipes, orders/escrow, reels, payouts, notifications, KYC.
2. **Real auth** (done) — email OTP sign-in via Supabase Auth (a 6-digit code sent by email, no password, no third-party SMS provider). Phone/MoMo numbers are deliberately *not* collected at signup — they're requested later, at checkout, when a client actually funds an escrow (not built yet — see "still mocked").
3. **KYC verification** — a real vendor (e.g. Smile Identity), replacing the local status toggle. The *flow* is done (see below): verification is decoupled from signup and only prompted the first time a seller tries to withdraw, so new sellers can post services immediately.
4. **Real payments** — Mobile Money (MTN/Airtel) integration for escrow funding and payout, replacing ledger-only entries. This is also where phone number collection/verification belongs.
5. Hosting, error handling, and a security pass before real users touch it.

## What's real vs. still mocked

Real (reads/writes a live Postgres database via Supabase):
- **Auth.** Real Supabase Auth session via email OTP — `profiles.id` is the Supabase Auth user id (`profiles_id_fkey`, added `not valid` so the old dev-seed rows don't block it). Session persistence/refresh is handled by `supabase-js`, not us.
- Swipe deck feed, shortlist binder, search/category filters
- Escrow checkout → creates a real `orders` row and notifies the seller
- Seller order queue (accept / decline / deliver) → notifies the client back
- Reels grid, payouts ledger, withdraw, available balance, escrow held, active contracts
- "Post a service" (seller upload) — video/photos go to Supabase Storage, creates a real `gigs` row (shows in the swipe deck) and a linked `reels` row (shows in the seller's catalogue)
- Settings edits, profile photo (uploaded to Supabase Storage, resized client-side first)
- "Start selling" (upgrading an existing hiring-only account) and the withdrawal-time KYC submission

Still mocked (see the roadmap above):
- **Phone / MoMo number.** Not collected at signup by design — there's no UI yet for collecting or verifying it at checkout either (step 4).
- **KYC.** Signup no longer requires it — sellers can post services right away, and are only prompted to verify (via a modal on their first withdrawal attempt) when they actually try to cash out. The submission itself still isn't checked against a real vendor: it records the attempt as `review`, and "Check status" just re-reads the current value. Flipping a submission to `verified` currently has to be done by hand (Table Editor) until step 3's real vendor is wired up.
- **Payments.** No real Mobile Money integration — escrow funding/withdrawal update the ledger but move no real money.
- **Video processing.** Uploads go straight to Supabase Storage as-is — no transcoding, thumbnail generation, or 9:16/90s enforcement.
- **Chat.** "Message drafted to X" is a toast, not a real conversation.

## Setup

```bash
npm install
cp .env.example .env   # fill in your Supabase project's URL + anon key
```

Then apply the schema to your Supabase project (SQL editor, or `supabase db push` from `supabase/`), in order:
1. `supabase/migrations/0001_init_schema.sql`
2. `supabase/migrations/0002_dev_rls.sql` (temporary — wide-open RLS; tightening this to per-user policies is part of step 5)
3. `supabase/migrations/0005_email_auth.sql` (real auth — `profiles.email` + the `auth.users` foreign key)
4. Optionally `supabase/seed/seed.sql` for demo data matching what the UI shows

In your Supabase dashboard, **Authentication → Providers → Email** should have "Enable Email provider" on (it is by default) — no other configuration is needed for OTP codes to work. Note: Supabase's built-in email sending is rate-limited (a handful of emails/hour) until you configure custom SMTP (Authentication → Settings → SMTP Settings) with a provider like Resend or Postmark — fine for now, required before real signups at any volume.

```bash
npm run dev
```

Verified against the live Supabase project from this machine (direct REST queries after applying the schema, plus running the app).

## Structure

- `src/store/KazifyContext.jsx` — app state: local UI state plus the server-backed data (feed, binder, orders, reels, payouts, notifications) and the actions that mutate them.
- `src/lib/api.js` — the data-access layer; every Supabase query the app makes lives here.
- `src/lib/supabaseClient.js` — the Supabase client, configured from `.env`.
- `src/components/` — presentational components, one per screen/overlay, all consuming `useKazify()`.
- `src/data/seed.js` — static UI copy/config only (category icons, nav labels, form option lists) — no mock data.
- `supabase/` — schema, dev-mode RLS, production RLS (for once real auth is wired), and seed data.
