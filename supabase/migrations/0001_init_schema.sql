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
