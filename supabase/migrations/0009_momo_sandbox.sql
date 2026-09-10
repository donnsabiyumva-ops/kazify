-- MTN MoMo sandbox integration — Disbursements only (Collections access
-- wasn't available on the developer portal; escrow funding stays on the
-- existing simulated instant-success flow until that changes). Tracks the
-- async transfer/poll lifecycle of a real (sandbox) MTN Disbursements
-- "transfer" call, layered on top of the existing payouts state rather
-- than replacing it.
--
-- orders.escrow_status only becomes 'released' once the matching payout's
-- disbursement is confirmed SUCCESSFUL (see api/momo/payout-status.js),
-- not at approval time — approving and actually being paid are no longer
-- the same instant.

alter table payouts
  add column status text not null default 'completed'
      check (status in ('pending', 'completed', 'failed')),
  add column momo_disbursement_reference_id uuid,
  add column momo_disbursement_requested_at timestamptz,
  add column momo_disbursement_resolved_at timestamptz,
  add column momo_sandbox_amount numeric(12,2),
  add column momo_sandbox_currency text default 'EUR';

comment on column payouts.momo_sandbox_amount is
  'A disposable, non-financial EUR figure sent to MTN''s sandbox (which requires currency=EUR) — never the amount of record. payouts.amount in UGX remains authoritative.';

-- Every historical/seeded payouts row predates this column and was already
-- instant/synchronous — 'completed' is the correct default, not a guess,
-- and needs no backfill. getAvailableBalance's existing unconditional sum
-- stays correct for them; only newly-created 'pending'/'failed' rows change
-- its behavior going forward.

-- The seed data's masked msisdns ('+256 77 •• 4192') can never be sent to a
-- real API call — replace with dialable-looking demo numbers.
update payout_methods set msisdn = '256770014192' where profile_id = '00000000-0000-0000-0000-000000000001' and provider = 'mtn';
update payout_methods set msisdn = '256700014192' where profile_id = '00000000-0000-0000-0000-000000000001' and provider = 'airtel';

-- The seed demo seller (Bwana Dev, 0004 — the one with seeded earnings/
-- payouts) never had a payout_methods row at all, so release-escrow/
-- withdraw would have nothing to pay out to. Give them a dialable MTN
-- number so the seeded seller can actually be used to test disbursements.
insert into payout_methods (profile_id, provider, label, msisdn, is_default)
values ('00000000-0000-0000-0000-000000000004', 'mtn', 'MTN Mobile Money', '256770014193', true)
on conflict (profile_id, provider) do update set msisdn = excluded.msisdn;
