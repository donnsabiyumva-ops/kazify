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
-- gigs (category lookup by name, since categories were seeded in 0001) —
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
-- orders: matching seedOrders (4 seller-side queue items) plus the demo
-- client's own outgoing order shown in the account overlay's contracts list
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
-- reels: Bwana Dev's portfolio (matches src/data/seed.js's myReelsSeed,
-- which the current UI shows for whichever seller is logged in — real
-- data is scoped per-seller once wired)
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
  ('00000000-0000-0000-0000-000000000004', 'selling', 'order_new',      '@brightpath_ug ordered a 60s vertical video',                          jsonb_build_object('order_id', '00000000-0000-0000-0000-000000000b02')),
  ('00000000-0000-0000-0000-000000000001', 'hiring',  'delivery_ready', '@Omari_Media delivered 3 thumbnails — approve to release escrow',      jsonb_build_object('order_id', '00000000-0000-0000-0000-000000000b01')),
  ('00000000-0000-0000-0000-000000000004', 'selling', 'order_new',      '@tumusiime_tv ordered a thumbnail pack',                               jsonb_build_object('order_id', '00000000-0000-0000-0000-000000000b01')),
  ('00000000-0000-0000-0000-000000000001', 'hiring',  'message',        '@Zawadi_Cuts replied to your brief',                                    '{}'::jsonb);
