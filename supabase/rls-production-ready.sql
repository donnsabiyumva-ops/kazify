-- Production RLS policies — apply once real Supabase Auth is wired up and
-- profiles.id references auth.users(id) (see the note at the top of
-- migrations/0001_init_schema.sql). Until then, migrations/0002_dev_rls.sql
-- is what's actually active.
--
-- To switch over:
--   1. Confirm profiles.id -> auth.users(id) foreign key is in place.
--   2. drop policy "dev_allow_all_<table>" on <table>; for every table below.
--   3. Run this file.

drop policy if exists "dev_allow_all_profiles" on profiles;
drop policy if exists "dev_allow_all_payout_methods" on payout_methods;
drop policy if exists "dev_allow_all_categories" on categories;
drop policy if exists "dev_allow_all_gigs" on gigs;
drop policy if exists "dev_allow_all_swipes" on swipes;
drop policy if exists "dev_allow_all_orders" on orders;
drop policy if exists "dev_allow_all_reels" on reels;
drop policy if exists "dev_allow_all_messages" on messages;
drop policy if exists "dev_allow_all_notifications" on notifications;
drop policy if exists "dev_allow_all_kyc_submissions" on kyc_submissions;
drop policy if exists "dev_allow_all_payouts" on payouts;

-- profiles: anyone can read (handles/ratings are public); only the owner can write
create policy "profiles_select_all" on profiles for select using (true);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

-- payout_methods: owner only
create policy "payout_methods_owner" on payout_methods for all
  using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- categories: public read, no writes from the client
create policy "categories_select_all" on categories for select using (true);

-- gigs: active gigs are public; a seller manages only their own
create policy "gigs_select_active_or_own" on gigs for select
  using (status = 'active' or auth.uid() = seller_id);
create policy "gigs_owner_write" on gigs for insert with check (auth.uid() = seller_id);
create policy "gigs_owner_update" on gigs for update using (auth.uid() = seller_id);
create policy "gigs_owner_delete" on gigs for delete using (auth.uid() = seller_id);

-- swipes: a client only sees/creates their own
create policy "swipes_owner" on swipes for all
  using (auth.uid() = client_id) with check (auth.uid() = client_id);

-- orders: visible/writable only to the two participants
create policy "orders_participants_select" on orders for select
  using (auth.uid() = client_id or auth.uid() = seller_id);
create policy "orders_client_insert" on orders for insert with check (auth.uid() = client_id);
create policy "orders_participants_update" on orders for update
  using (auth.uid() = client_id or auth.uid() = seller_id);

-- reels: public read (portfolio), owner writes
create policy "reels_select_all" on reels for select using (true);
create policy "reels_owner_write" on reels for insert with check (auth.uid() = seller_id);
create policy "reels_owner_update" on reels for update using (auth.uid() = seller_id);
create policy "reels_owner_delete" on reels for delete using (auth.uid() = seller_id);

-- messages: visible/writable only to sender/recipient
create policy "messages_participants_select" on messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);
create policy "messages_sender_insert" on messages for insert with check (auth.uid() = sender_id);

-- notifications: owner only
create policy "notifications_owner_select" on notifications for select using (auth.uid() = profile_id);
create policy "notifications_owner_update" on notifications for update using (auth.uid() = profile_id);

-- kyc_submissions: owner can read/insert their own; only a service-role
-- key (the verification webhook) can update the verdict, so no client
-- update policy exists here.
create policy "kyc_owner_select" on kyc_submissions for select using (auth.uid() = profile_id);
create policy "kyc_owner_insert" on kyc_submissions for insert with check (auth.uid() = profile_id);

-- payouts: owner only, read-only from the client (writes happen via
-- service-role from escrow-release/withdrawal server logic)
create policy "payouts_owner_select" on payouts for select using (auth.uid() = profile_id);
