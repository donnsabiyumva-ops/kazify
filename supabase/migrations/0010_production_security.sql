-- CRITICAL: switches off the dev-only "anyone can read/write anything"
-- policies now that real users are on the platform. Confirmed empirically
-- (via the public anon key, no auth session) before writing this: every
-- real user's email/phone, every private message between any two users,
-- and the media storage bucket (upload/overwrite/delete any file) were all
-- world-readable/writable. This must be run as soon as possible.
--
-- profiles.id -> auth.users(id) is already in place (0005_email_auth.sql),
-- so auth.uid() = id correctly identifies each real user's own row.

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
drop policy if exists "dev_allow_all_reviews" on reviews;

-- profiles: handles/ratings/photos must stay publicly readable — the feed,
-- binder, and creator-profile pages all embed seller info via a foreign-key
-- join (seller:profiles!gigs_seller_id_fkey(handle, rating, is_demo)),
-- which only works if the base table itself is row-readable. That's fine:
-- the app never selects email/phone for anyone but the signed-in user
-- themself, and the column grant below makes that the only way it *can*.
create policy "profiles_select_all" on profiles for select using (true);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

-- email is never read by the client anywhere (confirmed: Supabase Auth
-- tracks the session's own email separately; public.profiles.email is
-- write-once at signup) — safe to revoke entirely, zero functional impact.
revoke select (email) on profiles from anon, authenticated;

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

-- messages: visible/writable only to sender/recipient — this is the one
-- that had real private DMs between real users sitting fully exposed.
create policy "messages_participants_select" on messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);
create policy "messages_sender_insert" on messages for insert with check (auth.uid() = sender_id);

-- notifications: owner only
create policy "notifications_owner_select" on notifications for select using (auth.uid() = profile_id);
create policy "notifications_owner_update" on notifications for update using (auth.uid() = profile_id);

-- kyc_submissions: owner can read/insert their own; only a service-role
-- key (server-side) can update the verdict
create policy "kyc_owner_select" on kyc_submissions for select using (auth.uid() = profile_id);
create policy "kyc_owner_insert" on kyc_submissions for insert with check (auth.uid() = profile_id);

-- payouts: owner only, read-only from the client
create policy "payouts_owner_select" on payouts for select using (auth.uid() = profile_id);

-- reviews: public read (that's what a seller rating is built from); only
-- the order's client can leave one
create policy "reviews_select_all" on reviews for select using (true);
create policy "reviews_client_insert" on reviews for insert with check (auth.uid() = client_id);

-- ---------------------------------------------------------------------
-- storage: the media bucket allowed ANYONE, with no auth at all, to
-- upload, overwrite, or delete any file (confirmed empirically). Scopes
-- writes to the uploader's own uid, matching the existing path convention
-- (profile-photos/{uid}-timestamp.jpg, service-media/{uid}-timestamp-
-- rand.ext) — no client-side upload path changes needed.
-- ---------------------------------------------------------------------

drop policy if exists "dev_allow_all_media" on storage.objects;

create policy "media_select_all" on storage.objects for select
  using (bucket_id = 'media');

create policy "media_insert_own" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'media'
    and (name like 'profile-photos/' || auth.uid()::text || '-%' or name like 'service-media/' || auth.uid()::text || '-%')
  );

create policy "media_update_own" on storage.objects for update to authenticated
  using (
    bucket_id = 'media'
    and (name like 'profile-photos/' || auth.uid()::text || '-%' or name like 'service-media/' || auth.uid()::text || '-%')
  );

create policy "media_delete_own" on storage.objects for delete to authenticated
  using (
    bucket_id = 'media'
    and (name like 'profile-photos/' || auth.uid()::text || '-%' or name like 'service-media/' || auth.uid()::text || '-%')
  );
