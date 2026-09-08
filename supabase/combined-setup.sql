-- Kazify core schema, written for Supabase Postgres.
--
-- NOT verified against a real Postgres instance from this session (no local
-- psql/Docker available on this machine) — checked carefully for syntax and
-- consistency, but confirm it applies cleanly when you run it.
--
-- profiles.id is a standalone uuid for now, not yet a foreign key to
-- auth.users — real phone/OTP auth (Supabase Auth) is a later step. Once
-- it's wired, add:
--   alter table profiles
--     add constraint profiles_id_fkey foreign key (id) references auth.users(id) on delete cascade;
-- and switch from 0002's dev-only RLS to rls-production-ready.sql.

create extension if not exists pgcrypto; -- for gen_random_uuid()

-- ---------------------------------------------------------------------
-- profiles: one account per person, hiring + selling are both facets of it
-- ---------------------------------------------------------------------
create table profiles (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  handle                text not null unique,
  city                  text,
  phone                 text,
  bio                   text,
  rating                numeric(2,1),
  photo_url             text,
  escrow_release_window text not null default '7 days'
                        check (escrow_release_window in ('Instant', '3 days', '7 days')),
  auto_release_escrow   boolean not null default true,
  weekly_digest         boolean not null default false,
  seller_onboarded      boolean not null default false,
  kyc_status            text not null default 'none'
                        check (kyc_status in ('none', 'review', 'verified', 'rejected')),
  created_at            timestamptz not null default now()
);

comment on table profiles is 'One account per user. Hiring and selling are facets of the same row, not separate account types.';

-- ---------------------------------------------------------------------
-- payout_methods: mobile money sources a profile can fund/withdraw with
-- ---------------------------------------------------------------------
create table payout_methods (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references profiles(id) on delete cascade,
  provider    text not null check (provider in ('mtn', 'airtel')),
  label       text not null,
  msisdn      text not null,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (profile_id, provider)
);

create index payout_methods_profile_id_idx on payout_methods(profile_id);

-- ---------------------------------------------------------------------
-- categories: fixed marketplace verticals
-- ---------------------------------------------------------------------
create table categories (
  id    uuid primary key default gen_random_uuid(),
  name  text not null unique
);

-- ---------------------------------------------------------------------
-- gigs: a seller's fixed-price service listing (what shows in the swipe deck)
-- ---------------------------------------------------------------------
create table gigs (
  id                      uuid primary key default gen_random_uuid(),
  seller_id               uuid not null references profiles(id) on delete cascade,
  category_id             uuid not null references categories(id),
  title                   text not null,
  price_amount            numeric(12,2) not null check (price_amount > 0),
  currency                text not null default 'UGX',
  delivery_days           smallint not null check (delivery_days > 0),
  video_duration_seconds  smallint,
  video_asset_url         text,
  status                  text not null default 'active'
                          check (status in ('active', 'paused', 'draft')),
  created_at              timestamptz not null default now()
);

create index gigs_seller_id_idx on gigs(seller_id);
create index gigs_category_id_idx on gigs(category_id);
create index gigs_status_idx on gigs(status);

-- ---------------------------------------------------------------------
-- swipes: a client's pass/shortlist decision on a gig (the binder is
-- just swipes where direction = 'right')
-- ---------------------------------------------------------------------
create table swipes (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references profiles(id) on delete cascade,
  gig_id      uuid not null references gigs(id) on delete cascade,
  direction   text not null check (direction in ('left', 'right')),
  created_at  timestamptz not null default now(),
  unique (client_id, gig_id)
);

create index swipes_client_id_idx on swipes(client_id);

-- ---------------------------------------------------------------------
-- orders: an escrow-backed hire (client funds, seller delivers, client approves)
-- ---------------------------------------------------------------------
create table orders (
  id                uuid primary key default gen_random_uuid(),
  gig_id            uuid not null references gigs(id),
  client_id         uuid not null references profiles(id),
  seller_id         uuid not null references profiles(id),
  payout_method_id  uuid references payout_methods(id),
  status            text not null default 'new'
                    check (status in ('new', 'active', 'delivered', 'approved', 'declined', 'disputed')),
  escrow_status     text not null default 'unfunded'
                    check (escrow_status in ('unfunded', 'held', 'released', 'refunded')),
  amount            numeric(12,2) not null,
  fee_amount        numeric(12,2) not null,
  total_amount      numeric(12,2) not null,
  due_at            date,
  created_at        timestamptz not null default now(),
  accepted_at       timestamptz,
  delivered_at      timestamptz,
  approved_at       timestamptz,
  check (client_id <> seller_id)
);

create index orders_client_id_idx on orders(client_id);
create index orders_seller_id_idx on orders(seller_id);
create index orders_status_idx on orders(status);

-- ---------------------------------------------------------------------
-- reels: a seller's portfolio/upload library ("My Services" grid + the
-- creator profile catalogue)
-- ---------------------------------------------------------------------
create table reels (
  id               uuid primary key default gen_random_uuid(),
  seller_id        uuid not null references profiles(id) on delete cascade,
  gig_id           uuid references gigs(id) on delete set null,
  title            text not null,
  media_type       text not null default 'video'
                   check (media_type in ('video', 'slideshow')),
  video_asset_url  text,
  slide_urls       text[],
  views            integer not null default 0,
  saves            integer not null default 0,
  state            text not null default 'draft'
                   check (state in ('live', 'boosted', 'draft')),
  created_at       timestamptz not null default now()
);

create index reels_seller_id_idx on reels(seller_id);

-- ---------------------------------------------------------------------
-- messages: chat between the two parties on an order
-- ---------------------------------------------------------------------
create table messages (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid references orders(id) on delete cascade,
  sender_id     uuid not null references profiles(id),
  recipient_id  uuid not null references profiles(id),
  body          text not null,
  created_at    timestamptz not null default now()
);

create index messages_order_id_idx on messages(order_id);
create index messages_recipient_id_idx on messages(recipient_id);

-- ---------------------------------------------------------------------
-- notifications: the rail bell, role-tagged (hiring vs selling)
-- ---------------------------------------------------------------------
create table notifications (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references profiles(id) on delete cascade,
  role_context  text not null check (role_context in ('hiring', 'selling')),
  kind          text not null,
  title         text not null,
  payload       jsonb not null default '{}'::jsonb,
  read          boolean not null default false,
  created_at    timestamptz not null default now()
);

create index notifications_profile_id_idx on notifications(profile_id);
create index notifications_unread_idx on notifications(profile_id) where not read;

-- ---------------------------------------------------------------------
-- kyc_submissions: seller ID verification
-- ---------------------------------------------------------------------
create table kyc_submissions (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null references profiles(id) on delete cascade,
  vendor          text not null default 'manual',
  job_id          text unique,
  id_type         text not null check (id_type in ('National ID', 'Passport', 'Driver licence')),
  id_number       text not null,
  doc_front_url   text,
  doc_selfie_url  text,
  status          text not null default 'review'
                  check (status in ('review', 'verified', 'rejected')),
  result_code     text,
  result_text     text,
  submitted_at    timestamptz not null default now(),
  reviewed_at     timestamptz
);

create index kyc_submissions_profile_id_idx on kyc_submissions(profile_id);

-- ---------------------------------------------------------------------
-- payouts: the earnings ledger (escrow releases, withdrawals, refunds)
-- ---------------------------------------------------------------------
create table payouts (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references profiles(id) on delete cascade,
  order_id    uuid references orders(id),
  kind        text not null
              check (kind in ('escrow_release', 'withdrawal', 'refund', 'boost_refund', 'adjustment')),
  amount      numeric(12,2) not null,
  channel     text not null,
  created_at  timestamptz not null default now()
);

create index payouts_profile_id_idx on payouts(profile_id);

insert into categories (name) values
  ('Video Clips'),
  ('Front-End UI'),
  ('Thumbnails'),
  ('UGC');

-- DEV-ONLY row level security.
--
-- RLS is ON for every table (so nothing is ever silently unprotected), but
-- the policies here allow full access to anyone holding the anon key.
-- That's only acceptable because there is no real login yet (phone/OTP auth
-- is still mocked in the frontend) and this project has no real user data
-- in it.
--
-- This file MUST be replaced before real users sign in. Once Supabase Auth
-- is wired up and profiles.id references auth.users(id), drop these
-- policies and apply ../rls-production-ready.sql instead.

alter table profiles          enable row level security;
alter table payout_methods    enable row level security;
alter table categories        enable row level security;
alter table gigs              enable row level security;
alter table swipes            enable row level security;
alter table orders            enable row level security;
alter table reels             enable row level security;
alter table messages          enable row level security;
alter table notifications     enable row level security;
alter table kyc_submissions   enable row level security;
alter table payouts           enable row level security;

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'profiles', 'payout_methods', 'categories', 'gigs', 'swipes',
      'orders', 'reels', 'messages', 'notifications', 'kyc_submissions', 'payouts'
    ])
  loop
    execute format(
      'create policy "dev_allow_all_%1$s" on %1$s for all using (true) with check (true);',
      t
    );
  end loop;
end $$;

-- Demo data mirroring the frontend's current mock data (src/data/seed.js)
-- exactly, so switching the app over to Supabase doesn't change what's on
-- screen for the account used to build/demo it. Not verified against a
-- real Postgres instance from this session (no local psql/Docker
-- available) — reviewed carefully for syntax and FK consistency.

-- ---------------------------------------------------------------------
-- profiles: the demo client + 8 sellers (one per gig) + 4 order-buyer
-- accounts referenced by the seeded orders
-- ---------------------------------------------------------------------
insert into profiles (id, name, handle, city, phone, bio, rating, kyc_status, seller_onboarded) values
  ('00000000-0000-0000-0000-000000000001', 'Nakato Kirabo',   '@nakato_k',      'Kampala, UG', '+256 77 001 4192', null, null, 'verified', false),
  ('00000000-0000-0000-0000-000000000002', 'Omari Media',     '@Omari_Media',   'Kampala, UG', '+256 77 002 1000', 'Thumbnails specialist · 7-day max delivery.',   4.9, 'verified', true),
  ('00000000-0000-0000-0000-000000000003', 'Zawadi Cuts',     '@Zawadi_Cuts',   'Jinja, UG',   '+256 77 003 1000', 'Video Clips specialist · 4-day max delivery.',  4.8, 'verified', true),
  ('00000000-0000-0000-0000-000000000004', 'Bwana Dev',       '@Bwana_Dev',     'Kampala, UG', '+256 77 004 1000', 'Front-End UI specialist · 6-day max delivery.', 5.0, 'verified', true),
  ('00000000-0000-0000-0000-000000000005', 'Achen Studio',    '@Achen_Studio',  'Mbarara, UG', '+256 77 005 1000', 'UGC specialist · 5-day max delivery.',          4.7, 'verified', true),
  ('00000000-0000-0000-0000-000000000006', 'Mutebi Frames',   '@Mutebi_Frames', 'Kampala, UG', '+256 77 006 1000', 'Video Clips specialist · 3-day max delivery.',  4.9, 'verified', true),
  ('00000000-0000-0000-0000-000000000007', 'Nabirye UI',      '@Nabirye_UI',    'Kampala, UG', '+256 77 007 1000', 'Front-End UI specialist · 7-day max delivery.', 4.8, 'verified', true),
  ('00000000-0000-0000-0000-000000000008', 'Kato Thumbs',     '@Kato_Thumbs',   'Gulu, UG',    '+256 77 008 1000', 'Thumbnails specialist · 2-day max delivery.',   4.6, 'verified', true),
  ('00000000-0000-0000-0000-000000000009', 'Sanyu Creates',   '@Sanyu_Creates', 'Kampala, UG', '+256 77 009 1000', 'UGC specialist · 6-day max delivery.',          4.9, 'verified', true),
  ('00000000-0000-0000-0000-000000000010', 'Tumusiime TV',    '@tumusiime_tv',  'Kampala, UG', '+256 77 010 1000', null, null, 'none', false),
  ('00000000-0000-0000-0000-000000000011', 'Brightpath UG',   '@brightpath_ug', 'Entebbe, UG', '+256 77 011 1000', null, null, 'none', false),
  ('00000000-0000-0000-0000-000000000012', 'Safiri App',      '@safiri_app',    'Kampala, UG', '+256 77 012 1000', null, null, 'none', false),
  ('00000000-0000-0000-0000-000000000013', 'Kikubo Market',   '@kikubo_market', 'Kampala, UG', '+256 77 013 1000', null, null, 'none', false);

-- ---------------------------------------------------------------------
-- payout_methods (the demo client's two MoMo sources, matching the app's
-- hardcoded methodDefs)
-- ---------------------------------------------------------------------
insert into payout_methods (profile_id, provider, label, msisdn, is_default) values
  ('00000000-0000-0000-0000-000000000001', 'mtn',    'MTN Mobile Money', '+256 77 •• 4192', true),
  ('00000000-0000-0000-0000-000000000001', 'airtel', 'Airtel Money',     '+256 70 •• 8630', false);

-- ---------------------------------------------------------------------
-- gigs (category lookup by name, since categories were seeded above) —
-- ids/prices/delivery/duration match src/data/seed.js's gigs array exactly
-- ---------------------------------------------------------------------
insert into gigs (id, seller_id, category_id, title, price_amount, delivery_days, video_duration_seconds, status) values
  ('00000000-0000-0000-0000-000000000a01', '00000000-0000-0000-0000-000000000002', (select id from categories where name = 'Thumbnails'),   'I will design 3 high-click YouTube thumbnails.',    150000, 7, 14, 'active'),
  ('00000000-0000-0000-0000-000000000a02', '00000000-0000-0000-0000-000000000003', (select id from categories where name = 'Video Clips'),   'I will edit a 60s vertical video with captions.',   220000, 4, 22, 'active'),
  ('00000000-0000-0000-0000-000000000a03', '00000000-0000-0000-0000-000000000004', (select id from categories where name = 'Front-End UI'),  'I will build a responsive React dashboard screen.', 480000, 6, 31, 'active'),
  ('00000000-0000-0000-0000-000000000a04', '00000000-0000-0000-0000-000000000005', (select id from categories where name = 'UGC'),           'I will film an authentic UGC unboxing.',            190000, 5, 18, 'active'),
  ('00000000-0000-0000-0000-000000000a05', '00000000-0000-0000-0000-000000000006', (select id from categories where name = 'Video Clips'),   'I will cut 10 shorts from your long podcast.',      260000, 3, 11, 'active'),
  ('00000000-0000-0000-0000-000000000a06', '00000000-0000-0000-0000-000000000007', (select id from categories where name = 'Front-End UI'),  'I will convert your Figma flow into components.',   410000, 7, 26, 'active'),
  ('00000000-0000-0000-0000-000000000a07', '00000000-0000-0000-0000-000000000008', (select id from categories where name = 'Thumbnails'),    'I will A/B test 6 thumbnail concepts.',             130000, 2, 9,  'active'),
  ('00000000-0000-0000-0000-000000000a08', '00000000-0000-0000-0000-000000000009', (select id from categories where name = 'UGC'),           'I will shoot 3 UGC testimonial hooks.',             340000, 6, 20, 'active');

-- ---------------------------------------------------------------------
-- orders: matching seedOrders (4 seller-side queue items)
-- ---------------------------------------------------------------------
insert into orders (id, gig_id, client_id, seller_id, status, escrow_status, amount, fee_amount, total_amount, due_at, accepted_at, delivered_at) values
  ('00000000-0000-0000-0000-000000000b01', '00000000-0000-0000-0000-000000000a01', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000002', 'new',       'unfunded', 150000, 7500,  157500, current_date + 7, null, null),
  ('00000000-0000-0000-0000-000000000b02', '00000000-0000-0000-0000-000000000a02', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000003', 'new',       'unfunded', 220000, 11000, 231000, current_date + 4, null, null),
  ('00000000-0000-0000-0000-000000000b03', '00000000-0000-0000-0000-000000000a05', '00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000006', 'active',    'held',     260000, 13000, 273000, current_date + 2, now() - interval '1 day', null),
  ('00000000-0000-0000-0000-000000000b04', '00000000-0000-0000-0000-000000000a04', '00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000005', 'delivered', 'held',     190000, 9500,  199500, current_date,     now() - interval '3 days', now() - interval '1 hour');

-- ---------------------------------------------------------------------
-- swipes: the demo client has shortlisted two gigs, passed on one
-- ---------------------------------------------------------------------
insert into swipes (client_id, gig_id, direction) values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000a01', 'right'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000a02', 'right'),
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000a07', 'left');

-- ---------------------------------------------------------------------
-- reels: Bwana Dev's portfolio (matches src/data/seed.js's myReelsSeed)
-- ---------------------------------------------------------------------
insert into reels (seller_id, gig_id, title, views, saves, state) values
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000a03', 'Thumbnail pack — gaming',    18400, 612,  'live'),
  ('00000000-0000-0000-0000-000000000004', null,                                    'Podcast shorts sampler',     9700,  288,  'live'),
  ('00000000-0000-0000-0000-000000000004', null,                                    'UGC hook, skincare',         31200, 1400, 'boosted'),
  ('00000000-0000-0000-0000-000000000004', null,                                    'Before / after retouch',     4100,  96,   'draft');

-- ---------------------------------------------------------------------
-- payouts: Bwana Dev's earnings ledger (matches payoutsSeed)
-- ---------------------------------------------------------------------
insert into payouts (profile_id, order_id, kind, amount, channel) values
  ('00000000-0000-0000-0000-000000000004', null, 'escrow_release', 260000,  'MTN MoMo'),
  ('00000000-0000-0000-0000-000000000004', null, 'withdrawal',     -900000, 'MTN MoMo'),
  ('00000000-0000-0000-0000-000000000004', null, 'escrow_release', 190000,  'Airtel Money'),
  ('00000000-0000-0000-0000-000000000004', null, 'boost_refund',   35000,   'Kazify credit');

-- ---------------------------------------------------------------------
-- notifications: matching notifSrcSeed
-- ---------------------------------------------------------------------
insert into notifications (profile_id, role_context, kind, title, payload) values
  ('00000000-0000-0000-0000-000000000004', 'selling', 'order_new',      '@brightpath_ug ordered a 60s vertical video',                     jsonb_build_object('order_id', '00000000-0000-0000-0000-000000000b02')),
  ('00000000-0000-0000-0000-000000000001', 'hiring',  'delivery_ready', '@Omari_Media delivered 3 thumbnails — approve to release escrow', jsonb_build_object('order_id', '00000000-0000-0000-0000-000000000b01')),
  ('00000000-0000-0000-0000-000000000004', 'selling', 'order_new',      '@tumusiime_tv ordered a thumbnail pack',                          jsonb_build_object('order_id', '00000000-0000-0000-0000-000000000b01')),
  ('00000000-0000-0000-0000-000000000001', 'hiring',  'message',        '@Zawadi_Cuts replied to your brief',                              '{}'::jsonb);
