-- MTN MoMo sandbox integration: tracks the async request/poll lifecycle of a
-- real (sandbox) MTN Collections "request to pay" and Disbursements
-- "transfer" call, layered on top of the existing orders.status /
-- orders.escrow_status / payouts state rather than replacing it.
--
-- orders.escrow_status stays 'unfunded' until MTN confirms the collection
-- SUCCESSFUL (see api/momo/collection-status.js) — no more "held" the
-- instant a client clicks Fund. orders.escrow_status only becomes
-- 'released' once the matching payout's disbursement is confirmed
-- SUCCESSFUL (see api/momo/payout-status.js), not at approval time.

alter table orders
  add column momo_collection_reference_id uuid,
  add column momo_collection_status text
      check (momo_collection_status in ('PENDING', 'SUCCESSFUL', 'FAILED')),
  add column momo_collection_requested_at timestamptz,
  add column momo_collection_resolved_at timestamptz,
  add column momo_sandbox_amount numeric(12,2),
  add column momo_sandbox_currency text default 'EUR';

comment on column orders.momo_sandbox_amount is
  'A disposable, non-financial EUR figure sent to MTN''s sandbox (which requires currency=EUR) — never the amount of record. orders.amount/total_amount in UGX remain authoritative.';

alter table payouts
  add column status text not null default 'completed'
      check (status in ('pending', 'completed', 'failed')),
  add column momo_disbursement_reference_id uuid,
  add column momo_disbursement_requested_at timestamptz,
  add column momo_disbursement_resolved_at timestamptz,
  add column momo_sandbox_amount numeric(12,2),
  add column momo_sandbox_currency text default 'EUR';

-- Every historical/seeded payouts row predates this column and was already
-- instant/synchronous — 'completed' is the correct default, not a guess,
-- and needs no backfill. getAvailableBalance's existing unconditional sum
-- stays correct for them; only newly-created 'pending'/'failed' rows change
-- its behavior going forward.

-- The seed data's masked msisdns ('+256 77 •• 4192') can never be sent to a
-- real API call — replace with dialable-looking demo numbers so the seeded
-- demo client can actually be used to test the sandbox flow end to end.
update payout_methods set msisdn = '256770014192' where profile_id = '00000000-0000-0000-0000-000000000001' and provider = 'mtn';
update payout_methods set msisdn = '256700014192' where profile_id = '00000000-0000-0000-0000-000000000001' and provider = 'airtel';
